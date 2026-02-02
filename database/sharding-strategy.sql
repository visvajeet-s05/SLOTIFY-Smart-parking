-- Multi-Region Database Sharding Strategy for Slotify
-- This SQL script demonstrates the database sharding approach

-- 1. Regional Schema with Region ID
CREATE TABLE IF NOT EXISTS parking_lots (
    id UUID PRIMARY KEY,
    region_id VARCHAR(10) NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    location GEOGRAPHY(POINT, 4326),
    status VARCHAR(20) DEFAULT 'DRAFT',
    base_price DECIMAL(10,2) DEFAULT 10.00,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Indexes for performance
    INDEX idx_region_status (region_id, status),
    INDEX idx_region_location (region_id, location)
);

CREATE TABLE IF NOT EXISTS parking_slots (
    id UUID PRIMARY KEY,
    parking_lot_id UUID REFERENCES parking_lots(id),
    region_id VARCHAR(10) NOT NULL,
    slot_number VARCHAR(20) NOT NULL,
    type VARCHAR(20) DEFAULT 'REGULAR',
    is_available BOOLEAN DEFAULT true,
    base_price DECIMAL(10,2) DEFAULT 10.00,
    current_price DECIMAL(10,2),
    price_updated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Indexes for performance
    INDEX idx_region_lot (region_id, parking_lot_id),
    INDEX idx_region_availability (region_id, is_available),
    INDEX idx_region_type (region_id, type)
);

CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY,
    region_id VARCHAR(10) NOT NULL,
    customer_id UUID NOT NULL,
    parking_lot_id UUID REFERENCES parking_lots(id),
    parking_slot_id UUID REFERENCES parking_slots(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    vehicle_type VARCHAR(20),
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'UPCOMING',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Indexes for performance
    INDEX idx_region_customer (region_id, customer_id),
    INDEX idx_region_lot_time (region_id, parking_lot_id, start_time),
    INDEX idx_region_status (region_id, status),
    INDEX idx_region_slot_time (region_id, parking_slot_id, start_time)
);

-- 2. Global Ledger for Payments (Synchronous Replication)
CREATE TABLE IF NOT EXISTS global_payments (
    id UUID PRIMARY KEY,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    region_id VARCHAR(10) NOT NULL,
    booking_id UUID REFERENCES bookings(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(20),
    status VARCHAR(20) DEFAULT 'PENDING',
    processed_at TIMESTAMP,
    global_consistency_hash VARCHAR(64),
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Indexes for performance
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_region_status (region_id, status),
    INDEX idx_region_processed (region_id, processed_at)
);

-- 3. Event Store for Cross-Region Synchronization
CREATE TABLE IF NOT EXISTS event_store (
    id UUID PRIMARY KEY,
    region_id VARCHAR(10) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    event_data JSONB NOT NULL,
    correlation_id UUID,
    causation_id UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_region_type (region_id, event_type),
    INDEX idx_region_entity (region_id, entity_type, entity_id),
    INDEX idx_correlation (correlation_id),
    INDEX idx_created_at (created_at)
);

-- 4. Cross-Region Replication Tracking
CREATE TABLE IF NOT EXISTS replication_status (
    id UUID PRIMARY KEY,
    source_region VARCHAR(10) NOT NULL,
    target_region VARCHAR(10) NOT NULL,
    last_event_id UUID,
    last_processed_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE KEY uk_source_target (source_region, target_region),
    INDEX idx_status (status),
    INDEX idx_updated_at (updated_at)
);

-- 5. Data Consistency Checks
CREATE TABLE IF NOT EXISTS consistency_checks (
    id UUID PRIMARY KEY,
    region_id VARCHAR(10) NOT NULL,
    check_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    source_hash VARCHAR(64),
    target_hash VARCHAR(64),
    is_consistent BOOLEAN,
    checked_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_region_type (region_id, check_type),
    INDEX idx_region_consistent (region_id, is_consistent),
    INDEX idx_checked_at (checked_at)
);

-- 6. Functions for Data Consistency
CREATE OR REPLACE FUNCTION calculate_entity_hash(
    entity_type VARCHAR,
    entity_data JSONB
) RETURNS VARCHAR AS $$
BEGIN
    RETURN md5(entity_type || ':' || entity_data::text);
END;
$$ LANGUAGE plpgsql;

-- 7. Triggers for Event Capture
CREATE OR REPLACE FUNCTION capture_parking_lot_events()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO event_store (
        id, region_id, event_type, entity_type, entity_id, event_data, created_at
    ) VALUES (
        gen_random_uuid(),
        NEW.region_id,
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'PARKING_LOT_CREATED'
            WHEN TG_OP = 'UPDATE' THEN 'PARKING_LOT_UPDATED'
            WHEN TG_OP = 'DELETE' THEN 'PARKING_LOT_DELETED'
        END,
        'PARKING_LOT',
        COALESCE(NEW.id, OLD.id),
        CASE 
            WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)
            ELSE row_to_json(NEW)
        END,
        NOW()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_parking_lots_events
    AFTER INSERT OR UPDATE OR DELETE ON parking_lots
    FOR EACH ROW EXECUTE FUNCTION capture_parking_lot_events();

-- 8. Functions for Cross-Region Data Sync
CREATE OR REPLACE FUNCTION sync_parking_lot_to_region(
    source_region VARCHAR,
    target_region VARCHAR,
    parking_lot_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    source_data JSONB;
    target_exists BOOLEAN;
BEGIN
    -- Get source data
    SELECT row_to_json(p) INTO source_data
    FROM parking_lots p
    WHERE p.id = parking_lot_id AND p.region_id = source_region;
    
    IF source_data IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if target exists
    SELECT EXISTS(
        SELECT 1 FROM parking_lots 
        WHERE id = parking_lot_id AND region_id = target_region
    ) INTO target_exists;
    
    IF target_exists THEN
        -- Update existing record
        UPDATE parking_lots 
        SET 
            name = (source_data->>'name')::VARCHAR,
            address = (source_data->>'address')::TEXT,
            location = (source_data->>'location')::GEOGRAPHY,
            status = (source_data->>'status')::VARCHAR,
            base_price = (source_data->>'base_price')::DECIMAL,
            updated_at = NOW()
        WHERE id = parking_lot_id AND region_id = target_region;
    ELSE
        -- Insert new record
        INSERT INTO parking_lots (
            id, region_id, name, address, location, status, base_price, created_at, updated_at
        ) VALUES (
            (source_data->>'id')::UUID,
            target_region,
            (source_data->>'name')::VARCHAR,
            (source_data->>'address')::TEXT,
            (source_data->>'location')::GEOGRAPHY,
            (source_data->>'status')::VARCHAR,
            (source_data->>'base_price')::DECIMAL,
            (source_data->>'created_at')::TIMESTAMP,
            (source_data->>'updated_at')::TIMESTAMP
        );
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 9. Views for Monitoring
CREATE VIEW regional_metrics AS
SELECT 
    region_id,
    COUNT(*) as total_parking_lots,
    COUNT(*) FILTER (WHERE status = 'ACTIVE') as active_parking_lots,
    COUNT(*) FILTER (WHERE status = 'DRAFT') as draft_parking_lots,
    COUNT(*) FILTER (WHERE status = 'INACTIVE') as inactive_parking_lots,
    NOW() as last_updated
FROM parking_lots
GROUP BY region_id;

CREATE VIEW booking_metrics AS
SELECT 
    region_id,
    COUNT(*) as total_bookings,
    COUNT(*) FILTER (WHERE status = 'UPCOMING') as upcoming_bookings,
    COUNT(*) FILTER (WHERE status = 'ACTIVE') as active_bookings,
    COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed_bookings,
    COUNT(*) FILTER (WHERE status = 'CANCELLED') as cancelled_bookings,
    AVG(amount) as avg_booking_amount,
    SUM(amount) as total_revenue,
    NOW() as last_updated
FROM bookings
GROUP BY region_id;

-- 10. Partitioning for Large Tables (PostgreSQL 10+)
-- Note: This would be implemented per region for optimal performance

-- Example partitioning for bookings table
-- This would be created in each regional database
/*
CREATE TABLE bookings_partitioned (
    LIKE bookings INCLUDING ALL
) PARTITION BY RANGE (created_at);

CREATE TABLE bookings_2024_q1 PARTITION OF bookings_partitioned
    FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');

CREATE TABLE bookings_2024_q2 PARTITION OF bookings_partitioned
    FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');

CREATE TABLE bookings_2024_q3 PARTITION OF bookings_partitioned
    FOR VALUES FROM ('2024-07-01') TO ('2024-10-01');

CREATE TABLE bookings_2024_q4 PARTITION OF bookings_partitioned
    FOR VALUES FROM ('2024-10-01') TO ('2025-01-01');
*/

-- 11. Data Archival Strategy
CREATE TABLE IF NOT EXISTS archived_bookings (
    LIKE bookings INCLUDING ALL
);

CREATE OR REPLACE FUNCTION archive_old_bookings(
    region_id VARCHAR,
    cutoff_date TIMESTAMP
) RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    -- Move old bookings to archive table
    INSERT INTO archived_bookings
    SELECT * FROM bookings
    WHERE region_id = archive_old_bookings.region_id
    AND created_at < cutoff_date;
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    
    -- Delete from main table
    DELETE FROM bookings
    WHERE region_id = archive_old_bookings.region_id
    AND created_at < cutoff_date;
    
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- 12. Cleanup Functions
CREATE OR REPLACE FUNCTION cleanup_old_events(
    region_id VARCHAR,
    retention_days INTEGER DEFAULT 30
) RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM event_store
    WHERE region_id = cleanup_old_events.region_id
    AND created_at < NOW() - INTERVAL '1 day' * retention_days;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;