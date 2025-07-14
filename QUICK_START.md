# 🚀 Quick Start Guide

Get your Study Room Booking System up and running in minutes!

## Prerequisites

- Node.js (version 16 or higher)
- npm package manager

## Quick Setup (5 minutes)

### 1. Frontend Setup
```bash
# Install frontend dependencies
npm install

# Start frontend (will run on http://localhost:5173)
npm run dev
```

### 2. Backend Setup
```bash
# Run the automated setup script
./setup-backend.sh

# Start backend server (will run on http://localhost:3001)
cd backend
npm run dev
```

### 3. Verify Everything is Working

1. **Frontend**: Open http://localhost:5173
2. **Backend Health**: Open http://localhost:3001/health
3. **API Test**: Open http://localhost:3001/api/bookings

## What's Included

### Database Features
- ✅ SQLite database with 22 seats
- ✅ Sample booking data
- ✅ Real-time seat availability
- ✅ User management
- ✅ Booking persistence

### API Endpoints
- `GET /api/bookings` - All bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/booked-seats/:date` - Seat availability
- `GET /api/bookings/stats` - Booking statistics

### Frontend Features
- ✅ Interactive seat selection
- ✅ Real-time availability checking
- ✅ Booking form with validation
- ✅ Success confirmation page
- ✅ Responsive design

## Test the System

1. **Go to Booking Page**: Click "Book Now" on the homepage
2. **Select Date**: Choose any future date
3. **Choose Duration**: Select 4 Hours or Full Time
4. **Select Seats**: For full-time, choose specific seats
5. **Fill Details**: Enter your information
6. **Submit Booking**: Complete the booking process

## Troubleshooting

### Common Issues

**Backend won't start:**
```bash
cd backend
npm install
npm run init-db
npm run dev
```

**Database errors:**
```bash
cd backend
rm database.sqlite
npm run init-db
```

**CORS errors:**
- Check that backend is running on port 5000
- Verify frontend is on port 5173

**Port already in use:**
- Change PORT in backend/.env file
- Update VITE_API_URL in frontend if needed

### Check Logs

**Backend logs:**
```bash
cd backend
npm run dev
# Watch console output for errors
```

**Frontend logs:**
- Open browser developer tools
- Check Console tab for errors

## Next Steps

1. **Customize**: Edit colors, text, and branding
2. **Deploy**: Use Vercel, Netlify, or your preferred hosting
3. **Enhance**: Add authentication, payments, admin panel
4. **Scale**: Migrate to PostgreSQL/MySQL for production

## Support

- 📚 Full Documentation: See README.md
- 🐛 Issues: Check troubleshooting section
- 💡 Ideas: Review future enhancements in README.md

---

**Ready to go!** Your study room booking system is now fully functional with database persistence! 🎉 