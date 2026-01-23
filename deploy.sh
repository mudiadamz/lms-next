#!/bin/bash

# Script untuk deploy ke Vercel
# Usage: ./deploy.sh [--prod]

set -e

echo "🚀 Starting Vercel deployment..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo "⚠️  Not logged in to Vercel. Please login..."
    vercel login
fi

# Build first to check for errors
echo "📦 Building project..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist folder not found"
    exit 1
fi

echo "✅ Build successful!"

# Deploy
if [ "$1" == "--prod" ]; then
    echo "🚀 Deploying to production..."
    vercel --prod
else
    echo "🚀 Deploying preview..."
    vercel
fi

echo "✅ Deployment complete!"
echo ""
echo "📝 Don't forget to set environment variables in Vercel Dashboard:"
echo "   - VITE_API_BASE_URL=https://your-backend-url.com/api"
