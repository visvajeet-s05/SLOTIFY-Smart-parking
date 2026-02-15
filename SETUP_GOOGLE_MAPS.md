# Google Maps API Setup Guide

## Overview
This guide will help you set up Google Maps JavaScript API for the Smart Parking application with real-time, production-ready configuration.

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: `Smart-Parking-System`
4. Click **"Create"**

## Step 2: Enable Required APIs

1. Navigate to **APIs & Services** → **Library**
2. Search for and enable the following APIs:
   - ✅ **Maps JavaScript API** (Required)
   - ✅ **Places API** (Optional, for autocomplete)
   - ✅ **Geocoding API** (Optional, for address lookup)
   - ✅ **Directions API** (Optional, for navigation)

## Step 3: Create API Key

1. Go to **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"** → **"API key"**
3. Copy the generated API key
4. Click **"RESTRICT KEY"** (Recommended for security)

## Step 4: Configure API Key Restrictions

### Application Restrictions
Choose one based on your deployment:

#### For Development (HTTP Referrers):
```
HTTP referrers (web sites)
- http://localhost:3000/*
- http://localhost:*
```

#### For Production (HTTP Referrers):
```
HTTP referrers (web sites)
- https://yourdomain.com/*
- https://*.yourdomain.com/*
```

### API Restrictions
Select **"Restrict key"** and choose:
- Maps JavaScript API
- Places API (if using autocomplete)
- Geocoding API (if using address lookup)

## Step 5: Enable Billing (Required for Production)

⚠️ **Important**: Google Maps requires billing to be enabled, but includes:
- **$200 free monthly credit**
- **28,500 free map loads per month**
- **100,000 free geocoding requests per month**

### Enable Billing:
1. Go to **Billing** in Google Cloud Console
2. Click **"Link a billing account"**
3. Add payment method (credit/debit card)
4. You won't be charged unless you exceed free tier limits

## Step 6: Configure Environment Variable

Add your API key to `.env.local`:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Replace** `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your actual API key.

## Step 7: Restart Development Server

```bash
# Stop the current dev server (Ctrl+C)
npm run dev
```

## Verification

Once configured, your maps should load without errors. You'll see:
- ✅ Real Google Maps tiles
- ✅ Interactive controls (zoom, pan, street view)
- ✅ Custom markers and overlays
- ✅ Heatmap visualization

## Troubleshooting

### Error: ApiProjectMapError
**Cause**: API key is missing or invalid
**Solution**: 
1. Verify API key is correctly set in `.env.local`
2. Ensure Maps JavaScript API is enabled
3. Check API key restrictions allow your domain

### Error: RefererNotAllowedMapError
**Cause**: Your domain is not in the allowed referrers list
**Solution**: Add your domain to HTTP referrer restrictions

### Error: BillingNotEnabledMapError
**Cause**: Billing is not enabled on your Google Cloud project
**Solution**: Enable billing (you get $200 free credit monthly)

### Maps Not Loading (Simulation Mode Active)
**Cause**: API key not configured or API failed to load
**Solution**: 
1. Check browser console for specific error
2. Verify `.env.local` has `NEXT_PUBLIC_GOOGLE_MAPS_KEY`
3. Restart dev server after adding environment variable

## Features Enabled

Once properly configured, you'll have access to:

### 1. **Real-Time Interactive Maps**
- Pan, zoom, rotate controls
- Street view integration
- Satellite/terrain views

### 2. **Custom Styling**
- Dark mode map theme
- Custom marker designs
- Branded color schemes

### 3. **Advanced Features**
- Heatmap visualization
- Clustering for multiple markers
- Custom overlays
- Info windows with rich content

### 4. **Performance Optimizations**
- Lazy loading of map tiles
- Marker clustering for large datasets
- Efficient re-rendering

## Cost Estimation

### Free Tier (Monthly):
- **Map Loads**: 28,500 free
- **Geocoding**: 100,000 free
- **Directions**: 40,000 free
- **Places**: 100,000 free

### Typical Usage for Smart Parking:
- **Expected monthly map loads**: ~5,000-10,000
- **Cost**: $0 (well within free tier)

## Security Best Practices

1. ✅ **Never commit API keys to Git**
   - Use `.env.local` (already in `.gitignore`)
   
2. ✅ **Restrict API key usage**
   - Set HTTP referrer restrictions
   - Limit to specific APIs
   
3. ✅ **Monitor usage**
   - Set up budget alerts in Google Cloud
   - Review API usage monthly

4. ✅ **Rotate keys periodically**
   - Generate new keys every 6-12 months
   - Delete old unused keys

## Alternative: Simulation Mode

If you prefer not to use Google Maps API (no billing setup), the application automatically falls back to **Simulation Mode**:

- ✨ Fully functional parking lot visualization
- ✨ Real-time data display
- ✨ Interactive markers
- ✨ No external API required
- ⚠️ No actual map tiles (abstract grid background)

To use Simulation Mode, simply leave `NEXT_PUBLIC_GOOGLE_MAPS_KEY` empty or invalid.

## Support

For issues with Google Maps API:
- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Google Maps Platform Support](https://developers.google.com/maps/support)
- [Stack Overflow - google-maps](https://stackoverflow.com/questions/tagged/google-maps)

---

**Ready to go live?** Once you've completed these steps, your Smart Parking application will have a fully functional, production-ready Google Maps integration! 🚀
