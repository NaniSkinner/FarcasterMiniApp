#!/bin/bash

echo "🔍 Testing ChainCal Farcaster Manifest Setup"
echo "=============================================="

# Check if frame service is running
echo "1. Checking frame service..."
if curl -s -f http://localhost:3002 > /dev/null; then
    echo "✅ Frame service is running on port 3002"
else
    echo "❌ Frame service is not running. Please start it with:"
    echo "   cd services/frame && pnpm run dev"
    exit 1
fi

# Test manifest endpoint
echo ""
echo "2. Testing manifest endpoint..."
MANIFEST_RESPONSE=$(curl -s -f http://localhost:3002/.well-known/farcaster.json)
if [ $? -eq 0 ]; then
    echo "✅ Manifest endpoint is accessible"
    
    # Check if response is valid JSON
    if echo "$MANIFEST_RESPONSE" | jq . > /dev/null 2>&1; then
        echo "✅ Manifest returns valid JSON"
    else
        echo "❌ Manifest does not return valid JSON"
        exit 1
    fi
else
    echo "❌ Manifest endpoint is not accessible"
    exit 1
fi

# Test required properties
echo ""
echo "3. Checking required properties..."

# Check frame properties
FRAME_VERSION=$(echo "$MANIFEST_RESPONSE" | jq -r '.frame.version')
FRAME_NAME=$(echo "$MANIFEST_RESPONSE" | jq -r '.frame.name')
FRAME_ICON=$(echo "$MANIFEST_RESPONSE" | jq -r '.frame.iconUrl')
FRAME_HOME=$(echo "$MANIFEST_RESPONSE" | jq -r '.frame.homeUrl')

if [ "$FRAME_VERSION" = "1" ]; then
    echo "✅ Frame version is correct"
else
    echo "❌ Frame version is missing or incorrect"
fi

if [ "$FRAME_NAME" != "null" ] && [ "$FRAME_NAME" != "" ]; then
    echo "✅ Frame name is present: $FRAME_NAME"
else
    echo "❌ Frame name is missing"
fi

if [ "$FRAME_ICON" != "null" ] && [ "$FRAME_ICON" != "" ]; then
    echo "✅ Frame icon URL is present"
else
    echo "❌ Frame icon URL is missing"
fi

if [ "$FRAME_HOME" != "null" ] && [ "$FRAME_HOME" != "" ]; then
    echo "✅ Frame home URL is present"
else
    echo "❌ Frame home URL is missing"
fi

# Check account association
echo ""
echo "4. Checking account association..."
ACCOUNT_HEADER=$(echo "$MANIFEST_RESPONSE" | jq -r '.accountAssociation.header')
ACCOUNT_PAYLOAD=$(echo "$MANIFEST_RESPONSE" | jq -r '.accountAssociation.payload')
ACCOUNT_SIGNATURE=$(echo "$MANIFEST_RESPONSE" | jq -r '.accountAssociation.signature')

if [ "$ACCOUNT_HEADER" = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9" ]; then
    echo "⚠️  Account association header is placeholder - needs to be generated"
else
    echo "✅ Account association header is set"
fi

if [ "$ACCOUNT_PAYLOAD" = "eyJkb21haW4iOiJleGFtcGxlLmNvbSIsImZpZCI6MSwidGltZXN0YW1wIjoxNzM2MTIzNDU2fQ" ]; then
    echo "⚠️  Account association payload is placeholder - needs to be generated"
else
    echo "✅ Account association payload is set"
fi

if [ "$ACCOUNT_SIGNATURE" = "signature_here" ]; then
    echo "⚠️  Account association signature is placeholder - needs to be generated"
else
    echo "✅ Account association signature is set"
fi

# Test image assets
echo ""
echo "5. Testing image assets..."

for image in icon.svg feed.svg splash.svg; do
    if curl -s -f http://localhost:3002/images/$image > /dev/null; then
        echo "✅ Image $image is accessible"
    else
        echo "❌ Image $image is not accessible"
    fi
done

echo ""
echo "🎉 Testing complete!"
echo ""
echo "📋 Next steps:"
echo "1. Generate account association using Warpcast mobile app"
echo "2. Deploy to production with custom domain"
echo "3. Test production manifest endpoint"
echo "4. Submit to Farcaster for review"
echo ""
echo "📖 See FARCASTER_MANIFEST_SETUP.md for detailed instructions" 