# ChainCal Deployment Guide

## Quick Deploy Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI:**

   ```bash
   npm i -g vercel
   ```

2. **Deploy frame service:**

   ```bash
   cd services/frame
   vercel --prod
   ```

3. **Set custom domain:**
   - Go to Vercel dashboard
   - Add your custom domain
   - Update DNS records

4. **Set environment variables:**
   ```bash
   vercel env add NEXT_PUBLIC_URL
   # Enter: https://your-domain.com
   ```

### Option 2: Railway

1. **Install Railway CLI:**

   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy:**

   ```bash
   cd services/frame
   railway deploy
   ```

3. **Set custom domain in Railway dashboard**

### Option 3: Netlify

1. **Build the frame service:**

   ```bash
   cd services/frame
   npm run build
   ```

2. **Deploy to Netlify:**
   - Drag the `out` folder to Netlify
   - Or use CLI: `netlify deploy --prod --dir=out`

## Environment Variables

Set these in your deployment platform:

```bash
NEXT_PUBLIC_URL=https://your-domain.com
DATABASE_URL=your_postgres_connection_string
REDIS_URL=your_redis_connection_string
```

## Domain Configuration

Your manifest will be accessible at:

```
https://your-domain.com/.well-known/farcaster.json
```

## Post-Deployment Checklist

- [ ] Manifest is accessible at the correct URL
- [ ] All images load properly
- [ ] Account association is generated and added
- [ ] Environment variables are set
- [ ] Custom domain is configured
- [ ] HTTPS is enabled

## Testing Production Deployment

```bash
# Test manifest
curl https://your-domain.com/.well-known/farcaster.json

# Test miniapp
curl https://your-domain.com/miniapp

# Test images
curl https://your-domain.com/images/icon.svg
```

## Farcaster Submission

Once deployed:

1. Generate account association using Warpcast mobile
2. Update the manifest with the generated values
3. Test the manifest endpoint
4. Submit to Farcaster for review
