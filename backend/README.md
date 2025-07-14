# Study Room Booking Backend

A Node.js/Express backend API for the Study Room Booking System with SQLite database.

## Features

- **RESTful API** for booking management
- **SQLite Database** for data persistence
- **User Management** with automatic user creation
- **Seat Availability** checking
- **Booking Statistics** and reporting
- **Security** with rate limiting and CORS
- **Error Handling** with comprehensive logging

## Database Schema

### Users Table
- `id` - Primary key
- `name` - User's full name
- `email` - Unique email address
- `phone` - Phone number
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

### Seats Table
- `id` - Primary key
- `seat_number` - Unique seat number (1-22)
- `column_number` - Column number (1 or 2)
- `is_active` - Seat availability status
- `created_at` - Creation timestamp

### Bookings Table
- `id` - Primary key
- `user_id` - Foreign key to users table
- `seat_id` - Foreign key to seats table (nullable for 4-hour bookings)
- `start_date` - Booking start date
- `start_time` - Booking start time
- `duration_type` - '4hours' or 'fulltime'
- `subscription_period` - '0.5' (15 days) or '1' (1 month)
- `total_amount` - Booking cost
- `status` - 'active', 'cancelled', or 'completed'
- `payment_status` - 'pending', 'paid', or 'failed'
- `created_at` - Booking creation timestamp
- `updated_at` - Last update timestamp

## API Endpoints

### Bookings

- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/date/:date` - Get bookings for specific date
- `GET /api/bookings/booked-seats/:date` - Get booked seats for date
- `GET /api/bookings/check-availability/:seatId/:date` - Check seat availability
- `POST /api/bookings` - Create new booking
- `PATCH /api/bookings/:id/status` - Update booking status
- `PATCH /api/bookings/:id/payment` - Update payment status
- `GET /api/bookings/stats` - Get booking statistics

### Health Check

- `GET /health` - Server health status

## Installation

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Initialize Database**
   ```bash
   npm run init-db
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Start Production Server**
   ```bash
   npm start
   ```

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Database Configuration
DB_PATH=./database.sqlite

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
SESSION_SECRET=your-session-secret-key-change-this-in-production

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## API Usage Examples

### Create a Booking

```javascript
const bookingData = {
  name: "John Doe",
  email: "john@example.com",
  phone: "1234567890",
  startDate: "2024-01-15",
  startTime: "09:00",
  durationType: "4hours", // or "fulltime"
  subscriptionPeriod: "1", // or "0.5"
  selectedSeats: [1, 2], // Required for fulltime bookings
  totalAmount: 600
};

const response = await fetch('http://localhost:3001/api/bookings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(bookingData)
});
```

### Check Seat Availability

```javascript
const response = await fetch('http://localhost:3001/api/bookings/check-availability/1/2024-01-15');
const data = await response.json();
console.log(data.data.isAvailable); // true or false
```

### Get Booked Seats for Date

```javascript
const response = await fetch('http://localhost:3001/api/bookings/booked-seats/2024-01-15');
const data = await response.json();
console.log(data.data); // Array of booked seats
```

## Database Management

### Reset Database
```bash
rm database.sqlite
npm run init-db
```

### View Database (SQLite CLI)
```bash
sqlite3 database.sqlite
.tables
SELECT * FROM bookings;
.quit
```

## Security Features

- **Helmet.js** - Security headers
- **Rate Limiting** - Prevent abuse
- **CORS** - Cross-origin resource sharing
- **Input Validation** - Data sanitization
- **Error Handling** - Secure error messages

## Development

### Project Structure
```
backend/
├── server.js          # Main server file
├── database.js        # Database connection and helpers
├── init-db.js         # Database initialization
├── routes/
│   └── bookings.js    # Booking API routes
├── package.json       # Dependencies
├── env.example        # Environment variables template
└── README.md          # This file
```

### Adding New Routes

1. Create route file in `routes/` directory
2. Import and use in `server.js`
3. Add appropriate middleware and validation

### Database Migrations

For schema changes, create migration scripts or manually update the database schema in `init-db.js`.

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a production database (PostgreSQL, MySQL)
3. Set up proper environment variables
4. Use PM2 or similar process manager
5. Set up reverse proxy (Nginx)
6. Configure SSL certificates

## Troubleshooting

### Common Issues

1. **Database locked**: Ensure no other processes are using the database
2. **CORS errors**: Check FRONTEND_URL in .env
3. **Port already in use**: Change PORT in .env
4. **Permission denied**: Check file permissions for database.sqlite

### Logs

Check console output for detailed error messages and API request logs.

## Contributing

1. Follow existing code style
2. Add proper error handling
3. Include API documentation
4. Test thoroughly before submitting

## License

MIT License - see main project LICENSE file. 