# Farcaster Manifest Setup Guide

## Overview

Your ChainCal Farcaster miniapp manifest is already configured and ready for deployment. This guide will help you complete the final steps to make it work with Farcaster.

## Current Status ✅

- ✅ Manifest route: `/.well-known/farcaster.json`
- ✅ All required images: `icon.svg`, `feed.svg`, `splash.svg`
- ✅ Complete frame metadata
- ✅ Mini app configuration
- ✅ Proper HTTP headers and caching

## What You Need to Complete

### 1. Generate Account Association (REQUIRED)

The `accountAssociation` in your manifest needs to be generated using Warpcast mobile app:

**Steps:**

1. Open Warpcast mobile app
2. Go to **Settings** → **Developer** → **Domains**
   - If you don't see "Developer", enable Developer Mode first
3. Input your domain (e.g., `chaincal.yourdomain.com`)
4. Click **"Generate domain manifest"**
5. Copy the generated JSON output

**Update the manifest:**
Replace the placeholder values in `services/frame/src/app/.well-known/farcaster.json/route.ts`:

```typescript
accountAssociation: {
  header: 'PASTE_HEADER_HERE',
  payload: 'PASTE_PAYLOAD_HERE',
  signature: 'PASTE_SIGNATURE_HERE',
},
```

### 2. Deploy to Production

Your manifest must be publicly accessible at:

```
https://your-domain.com/.well-known/farcaster.json
```

**Deployment Options:**

- **Vercel**: Deploy the frame service and set custom domain
- **Netlify**: Deploy with custom domain
- **Railway**: Deploy with custom domain
- **Self-hosted**: Deploy on your own server

### 3. Set Environment Variables

When deploying, set:

```bash
NEXT_PUBLIC_URL=https://your-domain.com
```

### 4. Test Your Manifest

Before submission, test your manifest:

1. **Check accessibility:**

   ```bash
   curl https://your-domain.com/.well-known/farcaster.json
   ```

2. **Validate JSON structure:**

   ```bash
   curl -s https://your-domain.com/.well-known/farcaster.json | jq '.'
   ```

3. **Use Farcaster's validator:**
   - Visit the Developer Manifest tool on farcaster.xyz
   - Click "Check domain status"
   - Enter your domain to validate

### 5. Submit to Farcaster

Once your manifest is live and validated:

1. Visit Farcaster's miniapp submission page
2. Enter your domain
3. Submit for review

## Local Testing

To test locally:

1. Start the frame service:

   ```bash
   cd services/frame
   pnpm run dev
   ```

2. Test the manifest endpoint:
   ```bash
   curl http://localhost:3002/.well-known/farcaster.json
   ```

## Troubleshooting

### Common Issues:

1. **404 Error**: Ensure the route is at exactly `/.well-known/farcaster.json`
2. **CORS Issues**: Add proper CORS headers if needed
3. **Invalid Account Association**: Regenerate using Warpcast mobile
4. **Wrong Content-Type**: Ensure `application/json` is returned
5. **Redirects**: Manifest must be accessible without redirects

### Validation Checklist:

- [ ] URL is publicly accessible
- [ ] Returns valid JSON
- [ ] Contains both `frame` and `accountAssociation` objects
- [ ] All required frame properties are present
- [ ] Account association signature is valid
- [ ] No HTTP errors or redirects
- [ ] Content-Type is `application/json`

## Required Frame Properties

Your manifest already includes all required properties:

- ✅ `version`: "1"
- ✅ `name`: "ChainCal - On-Chain Calendar"
- ✅ `iconUrl`: Link to your icon
- ✅ `homeUrl`: Link to your miniapp
- ✅ `imageUrl`: Link to your feed image
- ✅ `buttonTitle`: "Open ChainCal"
- ✅ `splashImageUrl`: Link to splash screen
- ✅ `tags`: Relevant tags for discovery

## Next Steps

1. **Generate account association** using Warpcast mobile
2. **Deploy to production** with custom domain
3. **Test the manifest** endpoint
4. **Validate using Farcaster tools**
5. **Submit for review**

Once completed, your ChainCal miniapp will be discoverable and usable within Farcaster!
