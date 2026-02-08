// Central mapping of Owner Email -> Parking Lot ID
// This ensures consistency across middleware, layouts, and pages

export const OWNER_PARKING_MAPPING: Record<string, string> = {
    "owner@gmail.com": "CHENNAI_CENTRAL",
    "owner1@gmail.com": "ANNA_NAGAR",
    "owner2@gmail.com": "T_NAGAR",
    "owner3@gmail.com": "VELACHERY",
    "owner4@gmail.com": "OMR",
    "owner5@gmail.com": "ADYAR",
    "owner6@gmail.com": "GUINDY",
    "owner7@gmail.com": "PORUR"
};

export const PARKING_LOT_DETAILS: Record<string, { name: string; totalSlots: number; location?: string; price?: number }> = {
    "CHENNAI_CENTRAL": {
        name: "Chennai Central Premium Parking",
        totalSlots: 120,
        location: "Park Town, Chennai",
        price: 80
    },
    "ANNA_NAGAR": {
        name: "Anna Nagar Metro Parking",
        totalSlots: 80,
        location: "Anna Nagar, Chennai",
        price: 60
    },
    "T_NAGAR": {
        name: "T Nagar Shopping District",
        totalSlots: 90,
        location: "T. Nagar, Chennai",
        price: 100
    },
    "VELACHERY": {
        name: "Velachery IT Corridor",
        totalSlots: 100,
        location: "Velachery, Chennai",
        price: 50
    },
    "OMR": {
        name: "OMR Tech Park Parking",
        totalSlots: 150,
        location: "Old Mahabalipuram Rd, Chennai",
        price: 45
    },
    "ADYAR": {
        name: "Adyar Beachside Parking",
        totalSlots: 50,
        location: "Adyar, Chennai",
        price: 70
    },
    "GUINDY": {
        name: "Guindy Industrial Parking",
        totalSlots: 70,
        location: "Guindy, Chennai",
        price: 40
    },
    "PORUR": {
        name: "Porur Residential Parking",
        totalSlots: 60,
        location: "Porur, Chennai",
        price: 35
    }
};

export function getLotIdForOwner(email: string | null | undefined): string | null {
    if (!email) return null;
    return OWNER_PARKING_MAPPING[email.toLowerCase()] || null;
}
