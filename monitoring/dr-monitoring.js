const AWS = require('aws-sdk');
const axios = require('axios');

class DRMonitoring {
  constructor() {
    this.cloudwatch = new AWS.CloudWatch();
    this.route53 = new AWS.Route53();
    this.sns = new AWS.SNS();
    this.ec2 = new AWS.EC2();
    this.rds = new AWS.RDS();
    
    this.primaryRegion = process.env.PRIMARY_REGION || 'us-east-1';
    this.drRegions = process.env.DR_REGIONS ? process.env.DR_REGIONS.split(',') : ['us-west-2', 'eu-west-1'];
    this.monitoringInterval = process.env.MONITORING_INTERVAL || 60000; // 1 minute
    this.healthCheckUrl = process.env.HEALTH_CHECK_URL || 'https://api.slotify.com/api/health';
    
    this.metrics = {
      primary: { lastCheck: null, status: 'UNKNOWN', responseTime: 0 },
      dr: {}
    };
    
    this.alertThresholds = {
      responseTime: 5000, // 5 seconds
      consecutiveFailures: 3,
      failureRate: 0.2 // 20%
    };
  }

  async startMonitoring() {
    console.log('🚀 Starting DR Monitoring...\n');
    
    // Initialize DR region metrics
    this.drRegions.forEach(region => {
      this.metrics.dr[region] = {
        lastCheck: null,
        status: 'UNKNOWN',
        responseTime: 0,
        consecutiveFailures: 0,
        failureRate: 0
      };
    });

    // Start monitoring loops
    this.startHealthCheckLoop();
    this.startMetricsCollectionLoop();
    this.startAlertingLoop();
    
    console.log('✅ DR Monitoring started successfully!');
  }

  startHealthCheckLoop() {
    setInterval(async () => {
      try {
        // Check primary region
        const primaryHealth = await this.checkRegionHealth(this.primaryRegion, 'primary');
        this.metrics.primary = {
          ...primaryHealth,
          lastCheck: new Date().toISOString()
        };

        // Check DR regions
        for (const region of this.drRegions) {
          const drHealth = await this.checkRegionHealth(region, 'dr');
          this.metrics.dr[region] = {
            ...drHealth,
            lastCheck: new Date().toISOString()
          };
        }

        // Log current status
        this.logStatus();

      } catch (error) {
        console.error('Health check failed:', error);
      }
    }, this.monitoringInterval);
  }

  startMetricsCollectionLoop() {
    setInterval(async () => {
      try {
        // Collect CloudWatch metrics
        await this.collectCloudWatchMetrics();
        
        // Collect custom metrics
        await this.collectCustomMetrics();

      } catch (error) {
        console.error('Metrics collection failed:', error);
      }
    }, this.monitoringInterval * 5); // Every 5 minutes
  }

  startAlertingLoop() {
    setInterval(async () => {
      try {
        await this.checkAlerts();
      } catch (error) {
        console.error('Alerting check failed:', error);
      }
    }, this.monitoringInterval * 2); // Every 2 minutes
  }

  async checkRegionHealth(region, type) {
    const startTime = Date.now();
    
    try {
      // Check EC2 instances
      const ec2Health = await this.checkEC2Health(region);
      
      // Check RDS instances
      const rdsHealth = await this.checkRDSHealth(region);
      
      // Check Load Balancers
      const lbHealth = await this.checkLBHealth(region);
      
      // Check Application Health
      const appHealth = await this.checkApplicationHealth(region);
      
      const responseTime = Date.now() - startTime;
      const isHealthy = ec2Health && rdsHealth && lbHealth && appHealth;
      
      return {
        status: isHealthy ? 'HEALTHY' : 'UNHEALTHY',
        responseTime,
        details: {
          ec2: ec2Health,
          rds: rdsHealth,
          lb: lbHealth,
          app: appHealth
        }
      };

    } catch (error) {
      return {
        status: 'ERROR',
        responseTime: Date.now() - startTime,
        error: error.message
      };
    }
  }

  async checkEC2Health(region) {
    try {
      const instances = await this.ec2.describeInstances({
        Filters: [
          { Name: 'tag:Environment', Values: ['production'] },
          { Name: 'tag:Region', Values: [region] },
          { Name: 'instance-state-name', Values: ['running'] }
        ]
      }).promise();

      return instances.Reservations.length > 0;
    } catch (error) {
      console.error(`EC2 health check failed for ${region}:`, error);
      return false;
    }
  }

  async checkRDSHealth(region) {
    try {
      const instances = await this.rds.describeDBInstances({
        Filters: [
          { Name: 'tag-key', Values: ['Environment'] },
          { Name: 'tag-value', Values: ['production'] }
        ]
      }).promise();

      return instances.DBInstances.some(instance => 
        instance.DBInstanceStatus === 'available' && 
        instance.AvailabilityZone.startsWith(region)
      );
    } catch (error) {
      console.error(`RDS health check failed for ${region}:`, error);
      return false;
    }
  }

  async checkLBHealth(region) {
    try {
      const loadBalancers = await this.elbv2.describeLoadBalancers({
        Names: [`slotify-alb-${region}`]
      }).promise();

      return loadBalancers.LoadBalancers.some(lb => 
        lb.State.Code === 'active'
      );
    } catch (error) {
      console.error(`LB health check failed for ${region}:`, error);
      return false;
    }
  }

  async checkApplicationHealth(region) {
    try {
      const url = this.getRegionHealthCheckUrl(region);
      const response = await axios.get(url, { 
        timeout: 10000,
        headers: {
          'X-Region': region
        }
      });
      
      return response.status === 200;
    } catch (error) {
      console.error(`Application health check failed for ${region}:`, error);
      return false;
    }
  }

  getRegionHealthCheckUrl(region) {
    if (region === this.primaryRegion) {
      return this.healthCheckUrl;
    }
    return this.healthCheckUrl.replace('api.', `api-${region}.`);
  }

  async collectCloudWatchMetrics() {
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 300000); // 5 minutes ago

    // Collect RDS metrics
    for (const region of [this.primaryRegion, ...this.drRegions]) {
      try {
        const rdsMetrics = await this.cloudwatch.getMetricStatistics({
          Namespace: 'AWS/RDS',
          MetricName: 'CPUUtilization',
          Dimensions: [
            {
              Name: 'DBInstanceIdentifier',
              Value: `slotify-rds-${region}`
            }
          ],
          StartTime: startTime,
          EndTime: endTime,
          Period: 300,
          Statistics: ['Average', 'Maximum']
        }).promise();

        // Store metrics
        console.log(`RDS CPU metrics for ${region}:`, rdsMetrics.Datapoints);

      } catch (error) {
        console.error(`Failed to collect RDS metrics for ${region}:`, error);
      }
    }

    // Collect ELB metrics
    for (const region of [this.primaryRegion, ...this.drRegions]) {
      try {
        const elbMetrics = await this.cloudwatch.getMetricStatistics({
          Namespace: 'AWS/ApplicationELB',
          MetricName: 'RequestCount',
          Dimensions: [
            {
              Name: 'LoadBalancer',
              Value: `slotify-alb-${region}`
            }
          ],
          StartTime: startTime,
          EndTime: endTime,
          Period: 300,
          Statistics: ['Sum', 'Average']
        }).promise();

        // Store metrics
        console.log(`ELB Request metrics for ${region}:`, elbMetrics.Datapoints);

      } catch (error) {
        console.error(`Failed to collect ELB metrics for ${region}:`, error);
      }
    }
  }

  async collectCustomMetrics() {
    // Custom response time metrics
    const responseTimeMetrics = [];
    
    for (const region of [this.primaryRegion, ...this.drRegions]) {
      responseTimeMetrics.push({
        MetricName: 'ResponseTime',
        Dimensions: [
          {
            Name: 'Region',
            Value: region
          }
        ],
        Unit: 'Milliseconds',
        Value: this.metrics.dr[region]?.responseTime || this.metrics.primary.responseTime
      });
    }

    try {
      await this.cloudwatch.putMetricData({
        Namespace: 'Slotify/DR',
        MetricData: responseTimeMetrics
      }).promise();

      console.log('Custom metrics collected successfully');

    } catch (error) {
      console.error('Failed to collect custom metrics:', error);
    }
  }

  async checkAlerts() {
    const alerts = [];

    // Check primary region health
    if (this.metrics.primary.status !== 'HEALTHY') {
      alerts.push({
        type: 'PRIMARY_REGION_DOWN',
        severity: 'CRITICAL',
        message: `Primary region ${this.primaryRegion} is unhealthy`,
        timestamp: new Date().toISOString()
      });
    }

    // Check DR region health
    for (const region of this.drRegions) {
      if (this.metrics.dr[region].status !== 'HEALTHY') {
        alerts.push({
          type: 'DR_REGION_DOWN',
          severity: 'HIGH',
          message: `DR region ${region} is unhealthy`,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Check response times
    if (this.metrics.primary.responseTime > this.alertThresholds.responseTime) {
      alerts.push({
        type: 'HIGH_RESPONSE_TIME',
        severity: 'MEDIUM',
        message: `Primary region response time is high: ${this.metrics.primary.responseTime}ms`,
        timestamp: new Date().toISOString()
      });
    }

    // Check consecutive failures
    for (const region of this.drRegions) {
      if (this.metrics.dr[region].consecutiveFailures >= this.alertThresholds.consecutiveFailures) {
        alerts.push({
          type: 'CONSECUTIVE_FAILURES',
          severity: 'HIGH',
          message: `DR region ${region} has ${this.metrics.dr[region].consecutiveFailures} consecutive failures`,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Send alerts
    if (alerts.length > 0) {
      await this.sendAlerts(alerts);
    }
  }

  async sendAlerts(alerts) {
    try {
      const message = {
        timestamp: new Date().toISOString(),
        alerts: alerts,
        metrics: this.metrics,
        summary: {
          primaryStatus: this.metrics.primary.status,
          drStatuses: Object.keys(this.metrics.dr).map(region => ({
            region,
            status: this.metrics.dr[region].status
          }))
        }
      };

      await this.sns.publish({
        TopicArn: process.env.DR_ALERTS_TOPIC_ARN,
        Message: JSON.stringify(message, null, 2),
        Subject: 'DR Monitoring Alert'
      }).promise();

      console.log(`🚨 ${alerts.length} alerts sent to DR alerts topic`);

    } catch (error) {
      console.error('Failed to send alerts:', error);
    }
  }

  logStatus() {
    console.log('\n📊 DR Status Report:');
    console.log(`Primary Region (${this.primaryRegion}): ${this.metrics.primary.status} (${this.metrics.primary.responseTime}ms)`);
    
    this.drRegions.forEach(region => {
      const drMetric = this.metrics.dr[region];
      console.log(`DR Region (${region}): ${drMetric.status} (${drMetric.responseTime}ms)`);
    });
    console.log('');
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      primaryRegion: this.primaryRegion,
      drRegions: this.drRegions,
      metrics: this.metrics,
      summary: {
        primaryStatus: this.metrics.primary.status,
        drStatuses: Object.keys(this.metrics.dr).map(region => ({
          region,
          status: this.metrics.dr[region].status,
          responseTime: this.metrics.dr[region].responseTime
        }))
      }
    };

    // Save report
    const fs = require('fs');
    const reportPath = `dr-monitoring-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`📋 DR Monitoring Report saved to: ${reportPath}`);
    return report;
  }

  async stopMonitoring() {
    console.log('🛑 Stopping DR Monitoring...');
    
    // Generate final report
    await this.generateReport();
    
    console.log('✅ DR Monitoring stopped successfully!');
  }
}

// CLI interface
if (require.main === module) {
  const drMonitoring = new DRMonitoring();
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nReceived SIGINT, stopping monitoring...');
    await drMonitoring.stopMonitoring();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\nReceived SIGTERM, stopping monitoring...');
    await drMonitoring.stopMonitoring();
    process.exit(0);
  });

  // Start monitoring
  drMonitoring.startMonitoring().catch(error => {
    console.error('DR Monitoring failed to start:', error);
    process.exit(1);
  });
}

module.exports = DRMonitoring;