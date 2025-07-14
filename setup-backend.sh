#!/bin/bash

echo "🚀 Setting up Study Room Booking Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Navigate to backend directory
cd backend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "🔧 Creating .env file..."
    cp env.example .env
    echo "✅ .env file created from template"
    echo "📝 Please edit .env file with your configuration"
else
    echo "✅ .env file already exists"
fi

# Initialize database
echo "🗄️  Initializing database..."
npm run init-db

if [ $? -ne 0 ]; then
    echo "❌ Failed to initialize database"
    exit 1
fi

echo "✅ Database initialized successfully"

# Check if database file was created
if [ -f database.sqlite ]; then
    echo "✅ Database file created: database.sqlite"
else
    echo "❌ Database file was not created"
    exit 1
fi

echo ""
echo "🎉 Backend setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit backend/.env file with your configuration"
echo "2. Start the backend server: cd backend && npm run dev"
echo "3. The API will be available at: http://localhost:5000"
echo "4. Health check: http://localhost:5000/health"
echo ""
echo "🔗 API Documentation:"
echo "- GET /api/bookings - Get all bookings"
echo "- POST /api/bookings - Create new booking"
echo "- GET /api/bookings/booked-seats/:date - Get booked seats"
echo "- GET /api/bookings/stats - Get booking statistics"
echo ""
echo "📚 For more information, see backend/README.md" 