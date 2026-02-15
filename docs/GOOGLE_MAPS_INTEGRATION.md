# 🗺️ Google Maps Integration

## Overview

The Smart Parking application features a **production-ready, real-time Google Maps integration** with:

- ✨ **Real-time parking availability** visualization
- 🎨 **Custom dark theme** matching the app aesthetic
- 📍 **User location tracking** with distance calculations
- 🎯 **Interactive markers** with status-based colors
- 💫 **Smooth animations** and transitions
- 🔄 **Live updates** every 5 seconds
- 🛡️ **Comprehensive error handling** with fallback UI
- 📱 **Fully responsive** design

## Quick Start

### 1. Get Your API Key

```bash
# Visit Google Cloud Console
https://console.cloud.google.com/google/maps-apis

# Follow the setup guide
cat SETUP_GOOGLE_MAPS.md
```

### 2. Configure Environment

```bash
# Add to .env.local
NEXT_PUBLIC_GOOGLE_MAPS_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 3. Verify Configuration

```bash
npm run check-maps
```

### 4. Restart Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

## Components

### EnhancedMap (Recommended)

The **production-ready** map component with all features:

```tsx
import EnhancedMap from "@/components/map/EnhancedMap"

<EnhancedMap
  parkingLots={parkingLots}
  onSelectLot={(lotId) => console.log(lotId)}
  selectedLotId={selectedLotId}
  showUserLocation={true}
  enableRealTimeUpdates={true}
  className="h-[600px]"
/>
```

**Features:**
- ✅ Real-time updates
- ✅ User location with "My Location" button
- ✅ Distance calculations
- ✅ Custom markers with status colors
- ✅ Info windows with booking CTA
- ✅ Error handling with helpful messages
- ✅ Automatic fallback UI

### ParkingMap (Legacy)

The existing map component with simulation mode:

```tsx
import ParkingMap from "@/components/map/parking-map"

<ParkingMap
  parkingAreas={parkingAreas}
  selectedId={selectedId}
  onSelectParkingArea={handleSelect}
/>
```

**Features:**
- ✅ Heatmap visualization
- ✅ Simulation mode fallback
- ✅ Custom overlay markers
- ✅ Dark theme styling

### UserMap (Simple)

Basic map for user dashboard:

```tsx
import UserMap from "@/components/map/UserMap"

<UserMap
  lat={userLat}
  lng={userLng}
  parkings={nearbyParkings}
/>
```

## Configuration

### Map Styles

```ts
import { DARK_MAP_STYLE, CYBERPUNK_MAP_STYLE } from "@/lib/google-maps-config"

// Use in map options
options={{
  styles: DARK_MAP_STYLE, // or CYBERPUNK_MAP_STYLE
}}
```

### Custom Markers

```ts
import { createCustomMarkerIcon } from "@/lib/google-maps-config"

const icon = createCustomMarkerIcon("available", 40) // size in pixels
```

### Distance Calculations

```ts
import { calculateDistance, formatDistance } from "@/lib/google-maps-config"

const km = calculateDistance(lat1, lng1, lat2, lng2)
const formatted = formatDistance(km) // "2.5km away"
```

## Error Handling

The integration includes comprehensive error handling:

### API Key Missing
```
❌ Error: ApiProjectMapError
✅ Solution: Add NEXT_PUBLIC_GOOGLE_MAPS_KEY to .env.local
```

### Billing Not Enabled
```
❌ Error: BillingNotEnabledMapError
✅ Solution: Enable billing in Google Cloud Console
💡 Note: Includes $200 free monthly credit
```

### Referer Not Allowed
```
❌ Error: RefererNotAllowedMapError
✅ Solution: Add your domain to API key restrictions
```

### Automatic Fallback

When Google Maps fails to load, the app automatically shows:
- 🎨 Simulated map view with abstract grid
- 📍 All parking lot markers (positioned correctly)
- ℹ️ Full functionality (click, select, view details)
- 💡 Helpful error messages with setup instructions

## Real-Time Features

### Live Updates

```ts
// Automatically enabled in EnhancedMap
enableRealTimeUpdates={true}

// Updates every 5 seconds (configurable)
GOOGLE_MAPS_CONFIG.realtimeUpdateInterval = 5000
```

### WebSocket Integration

The map can integrate with your WebSocket server for real-time slot updates:

```ts
// In your component
useEffect(() => {
  const ws = new WebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_URL!)
  
  ws.onmessage = (event) => {
    const update = JSON.parse(event.data)
    // Update parking lots state
    setParkingLots(prevLots => 
      prevLots.map(lot => 
        lot.id === update.lotId 
          ? { ...lot, availableSlots: update.availableSlots }
          : lot
      )
    )
  }
  
  return () => ws.close()
}, [])
```

## Performance Optimization

### Marker Clustering

For large datasets (>100 markers), use clustering:

```ts
import { MarkerClusterer } from "@googlemaps/markerclusterer"

// Automatically enabled when markers > threshold
GOOGLE_MAPS_CONFIG.clusteringThreshold = 10
```

### Lazy Loading

Maps are lazy-loaded using `useJsApiLoader`:

```ts
const { isLoaded } = useJsApiLoader({
  id: "google-map-script",
  googleMapsApiKey: GOOGLE_MAPS_CONFIG.apiKey,
  libraries: ["places", "visualization"],
})
```

### Memoization

Use React.memo for marker components:

```tsx
const ParkingMarker = React.memo(({ lot, onClick }) => (
  <MarkerF
    position={{ lat: lot.latitude, lng: lot.longitude }}
    onClick={() => onClick(lot)}
  />
))
```

## Customization

### Change Default Center

```ts
// lib/google-maps-config.ts
export const GOOGLE_MAPS_CONFIG = {
  defaultCenter: {
    lat: YOUR_LATITUDE,
    lng: YOUR_LONGITUDE,
  },
}
```

### Adjust Zoom Levels

```ts
export const GOOGLE_MAPS_CONFIG = {
  defaultZoom: 13,
  minZoom: 3,
  maxZoom: 20,
}
```

### Custom Marker Colors

```ts
// lib/google-maps-config.ts
export function getMarkerColor(status: string) {
  switch (status) {
    case "available":
      return { primary: "#10b981", glow: "0 0 20px rgba(16, 185, 129, 0.6)" }
    // Add custom statuses
  }
}
```

## Testing

### Check Configuration

```bash
npm run check-maps
```

### Test in Browser

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for Google Maps errors
4. Check Network tab for API requests

### Common Issues

**Map not loading:**
- Check console for errors
- Verify API key in .env.local
- Ensure dev server was restarted
- Check API key restrictions

**Markers not showing:**
- Verify parking lot coordinates are valid
- Check lat/lng are numbers, not strings
- Ensure parkingLots array is not empty

**User location not working:**
- Enable location services in browser
- Use HTTPS in production (required for geolocation)
- Check browser permissions

## Production Deployment

### Environment Variables

```bash
# Vercel/Netlify
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_production_key

# Add to deployment platform's environment variables
```

### API Key Restrictions

**Production Referrers:**
```
https://yourdomain.com/*
https://*.yourdomain.com/*
```

**API Restrictions:**
```
✅ Maps JavaScript API
✅ Places API (if using autocomplete)
✅ Geocoding API (if using address lookup)
```

### Monitoring

Set up monitoring in Google Cloud Console:
- 📊 API usage dashboard
- 💰 Budget alerts
- 🚨 Error notifications

## Cost Management

### Free Tier Limits (Monthly)

- **Map Loads**: 28,500 free
- **Geocoding**: 100,000 free
- **Directions**: 40,000 free
- **Places**: 100,000 free

### Optimization Tips

1. **Cache geocoding results** in database
2. **Use marker clustering** for large datasets
3. **Lazy load maps** on user interaction
4. **Implement request throttling**
5. **Monitor usage** regularly

### Budget Alerts

Set up alerts in Google Cloud Console:
```
Threshold: $50
Alert: Email notification
Action: Review usage
```

## Support

### Documentation
- [Google Maps Platform Docs](https://developers.google.com/maps/documentation)
- [React Google Maps API](https://react-google-maps-api-docs.netlify.app/)

### Troubleshooting
- Check `SETUP_GOOGLE_MAPS.md` for detailed setup
- Run `npm run check-maps` for configuration status
- Review browser console for specific errors

### Community
- [Stack Overflow - google-maps](https://stackoverflow.com/questions/tagged/google-maps)
- [Google Maps Platform Support](https://developers.google.com/maps/support)

---

**Ready to launch?** 🚀 Follow the setup guide and you'll have a production-ready, real-time Google Maps integration in minutes!
