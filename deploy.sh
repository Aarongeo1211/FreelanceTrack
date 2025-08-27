#!/bin/bash

# FreelanceTrack Deployment Script
# This script helps deploy the FreelanceTrack application

set -e

echo "🚀 FreelanceTrack Deployment Script"
echo "==================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Creating from template..."
    cp .env.example .env
    echo "✅ .env file created. Please update it with your production values."
    echo "   Don't forget to change NEXTAUTH_SECRET to a secure random string!"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Create/update database
echo "🗄️  Setting up database..."
npx prisma db push

# Build the application
echo "🏗️  Building application..."
npm run build

# Check if production database needs seeding
echo "🌱 Checking if database needs initial setup..."
# You can add database seeding logic here if needed

echo "✅ Deployment completed successfully!"
echo ""
echo "🎉 Your FreelanceTrack application is ready!"
echo "   Start with: npm run start"
echo "   Or use PM2: pm2 start npm --name 'freelancetrack' -- start"
echo ""
echo "📊 Next steps:"
echo "   1. Set up SSL certificate for HTTPS"
echo "   2. Configure reverse proxy (nginx/apache)"
echo "   3. Set up regular database backups"
echo "   4. Monitor application logs"
echo ""
echo "🔗 Access your application at: $NEXTAUTH_URL"