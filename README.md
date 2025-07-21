# StudySpace - Study Room Booking System

A modern, dynamic web application for booking study room seats online. Built with React, Vite, and Tailwind CSS.

## 🚀 Features

- **Interactive Seat Selection**: Visual seat map with 22 seats
- **Real-time Booking**: Date and time selection with availability checking
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Modern UI/UX**: Beautiful animations and smooth interactions
- **Booking Management**: Complete booking flow with confirmation
- **Contact Form**: Integrated contact page with FAQ section
- **Toast Notifications**: User-friendly feedback system

## 🛠️ Tech Stack

- **Frontend**: React 18 with Vite
- **Backend**: Node.js with Express
- **Database**: SQLite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Date Handling**: date-fns
- **Notifications**: React Hot Toast
- **HTTP Client**: Axios

## 📋 Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

## 🚀 Installation & Setup

### Frontend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd study-room-booking
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Start the frontend development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Backend Setup

1. **Set up the backend (choose one method):**

   **Option A: Automated Setup**
   ```bash
   chmod +x setup-backend.sh
   ./setup-backend.sh
   ```

   **Option B: Manual Setup**
   ```bash
   cd backend
   npm install
   cp env.example .env
   npm run init-db
   ```

2. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

3. **Verify backend is running**
   - Health check: `http://localhost:3001/health`
- API base: `http://localhost:3001/api`

## 📁 Project Structure

```
study-room-booking/
├── backend/                    # Backend API server
│   ├── routes/
│   │   └── bookings.js        # Booking API routes
│   ├── database.js            # Database connection & helpers
│   ├── init-db.js             # Database initialization
│   ├── server.js              # Express server
│   ├── package.json           # Backend dependencies
│   ├── env.example            # Environment variables template
│   └── README.md              # Backend documentation
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Booking.jsx
│   │   ├── Contact.jsx
│   │   └── BookingSuccess.jsx
│   ├── services/
│   │   └── api.js             # API service functions
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── package.json               # Frontend dependencies
├── setup-backend.sh           # Backend setup script
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🎯 Key Features Explained

### 1. Home Page
- Hero section with call-to-action
- Features showcase
- Statistics display
- Customer testimonials
- Responsive design

### 2. Booking System
- **Step 1**: Date, time, and seat selection
- **Step 2**: Personal details and confirmation
- Real-time seat availability from database
- Interactive seat map with live data
- Booking summary sidebar
- Database persistence for all bookings

### 3. Contact Page
- Contact form with validation
- Contact information cards
- FAQ section
- Map placeholder
- Call-to-action section

### 4. Booking Success
- Confirmation details
- Receipt generation
- Important information
- Quick actions

## 🎨 Customization

### Colors
The color scheme can be customized in `tailwind.config.js`:

```javascript
colors: {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    // ... more shades
  }
}
```

### Seat Configuration
To change the number of seats, modify the seat generation in `Booking.jsx`:

```javascript
{Array.from({ length: 22 }, (_, i) => {
  // Change 22 to your desired number of seats
})}
```

### Operating Hours
Update the time slots in `Booking.jsx`:

```javascript
// Generate time slots from 6:30 AM to 11 PM
for (let hour = 6; hour <= 22; hour++) {
  const time = hour === 6 ? '06:30' : `${hour.toString().padStart(2, '0')}:00`
  timeSlots.push(time)
}
```

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full-featured experience
- **Tablet**: Optimized layout
- **Mobile**: Touch-friendly interface

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## 🌟 Features in Detail

### Interactive Seat Selection
- Visual representation of all 22 seats
- Color-coded status (available, selected, booked)
- Real-time availability checking from database
- Multiple seat selection support
- Automatic seat allocation for 4-hour bookings

### Booking Flow
1. **Date Selection**: Choose from available dates
2. **Time Selection**: Pick from 6:30 AM to 11 PM slots
3. **Seat Selection**: Interactive seat map
4. **Personal Details**: Name, email, phone, duration
5. **Confirmation**: Booking summary and payment
6. **Success Page**: Confirmation with receipt

### User Experience
- Smooth animations and transitions
- Toast notifications for user feedback
- Form validation and error handling
- Loading states and progress indicators
- Mobile-first responsive design

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

### Deploy to Netlify
1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Configure build settings if needed

## 🔮 Future Enhancements

- [x] Database integration with SQLite
- [x] RESTful API backend
- [x] Real-time seat availability from database
- [x] User management system
- [ ] User authentication system
- [ ] Booking history and management
- [ ] Payment gateway integration
- [ ] Admin dashboard
- [ ] Email notifications
- [ ] Real-time seat availability updates
- [ ] Multiple study room support
- [ ] Analytics and reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support or questions:
- Email: info@studyspace.com
- Phone: +91 7089290615

---

**StudySpace** - Your perfect study environment, just a click away! 📚✨ 