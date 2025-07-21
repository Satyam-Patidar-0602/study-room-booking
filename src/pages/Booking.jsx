import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { format, addDays, startOfDay } from 'date-fns'
import { 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  ArrowLeft, 
  ArrowRight,
  CheckCircle,
  X,
  Star,
  Zap,
  Wifi,
  Users,
  BookOpen,
  Eye,
  EyeOff,
  Info,
  AlertCircle,
  Heart,
  MapPin,
  Timer,
  DollarSign,
  Shield,
  TrendingUp
} from 'lucide-react'
import toast from 'react-hot-toast'
import { bookingAPI, apiUtils } from '../services/api'
import { load as loadCashfree } from '@cashfreepayments/cashfree-js';

// Remove loadCashfreeScript and window.Cashfree usage

const Booking = () => {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedSeats, setSelectedSeats] = useState([])
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    duration: '4', // 4 hours default
    subscriptionPeriod: '1' // 1 month default
  })
  const [currentStep, setCurrentStep] = useState(1)
  const [bookedSeats, setBookedSeats] = useState([])
  const [hoveredSeat, setHoveredSeat] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [currentFeature, setCurrentFeature] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Subscription periods
  const subscriptionPeriods = [
    { value: '1', label: '1 Month', price: 600 },
    { value: '0.5', label: '15 Days', price: 300 }
  ]

  // Duration options
  const durationOptions = [
    { value: '4', label: '4 Hours (Morning/Evening)', price: 300, icon: <Clock className="w-5 h-5" />, color: 'from-blue-500 to-blue-600', seatAllocation: 'owner' },
    { value: 'full', label: 'Full Time', price: 600, icon: <Timer className="w-5 h-5" />, color: 'from-purple-500 to-purple-600', seatAllocation: 'user' }
  ]

  // Features showcase
  const features = [
    {
      icon: <Wifi className="w-6 h-6" />,
      title: "High-Speed WiFi",
      description: "Lightning-fast internet for seamless online learning",
      color: "from-blue-500 to-blue-600"
    },
      {
    icon: <Shield className="w-6 h-6" />,
    title: "Safe Environment",
    description: "Secure and well-lit study spaces for your peace of mind",
    color: "from-orange-500 to-orange-600"
  },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Study Community",
      description: "Join a community of dedicated learners",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Safe Environment",
      description: "Secure and well-lit study spaces",
      color: "from-red-500 to-red-600"
    }
  ]

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [features.length])

  // Fetch booked seats for the next three days (aaj, kal, parso) only once on mount
  useEffect(() => {
    const fetchBookedSeats = async () => {
      try {
        const response = await fetch('/api/bookings/booked-seats-next-three');
        const data = await response.json();
        if (data.success) {
          // Transform as before
          const transformedBookings = data.data.map(booking => ({
            seatId: booking.seat_number,
            start_date: booking.start_date,
            subscription_period: booking.subscription_period,
            time: booking.start_time,
            expiry_date: booking.expiry_date,
            duration_type: booking.duration_type
          }));
          setBookedSeats(transformedBookings);
        }
      } catch (error) {
        console.error('Error fetching booked seats:', error);
        toast.error('Failed to load seat availability');
      }
    };
    fetchBookedSeats();
  }, []); // No selectedDate dependency!

  // Helper to get the next three dates (today, tomorrow, day after tomorrow)
  const getNextThreeDates = () => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const dates = [new Date(today)];
    for (let i = 1; i <= 2; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d);
    }
    return dates;
  };
  const nextThreeDates = getNextThreeDates();
  const minDate = format(nextThreeDates[0], 'yyyy-MM-dd');
  const maxDate = format(nextThreeDates[2], 'yyyy-MM-dd');

  // Helper to check if a date is one of the next three days
  const isAllowedBookingDate = (date) => {
    const d = new Date(date);
    d.setHours(0,0,0,0);
    return nextThreeDates.some(nd => nd.getTime() === d.getTime());
  };

  // Disable seat for all three days if its fulltime booking starts on aaj, kal, or parso
  const isFullTimeSeatBooked = (seatId) => {
    // Get all start_dates for fulltime bookings for this seat
    const startDates = bookedSeats
      .filter(booking => booking.seatId === seatId && booking.duration_type === 'fulltime')
      .map(booking => booking.start_date);

    // Get all next three dates as yyyy-MM-dd
    const nextThree = [0, 1, 2].map(i => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return format(d, 'yyyy-MM-dd');
    });

    // If any start_date matches aaj, kal, parso, disable seat for all three days
    return startDates.some(date => nextThree.includes(date));
  };

  // Helper: For a given seat, check if it is booked for the selected date (from start to expiry)
  const isSeatBooked = (seatId) => {
    return bookedSeats.some(booking => {
      if (booking.seatId !== seatId) return false;
      const start = new Date(booking.start_date);
      start.setHours(0,0,0,0);
      const expiry = new Date(booking.expiry_date);
      expiry.setHours(0,0,0,0);
      const selected = new Date(selectedDate);
      selected.setHours(0,0,0,0);
      return selected >= start && selected <= expiry;
    });
  };

  // Calendar UI: allow selection of any date (except past), but visually highlight today, tomorrow, and day after tomorrow
  const today = new Date();
  today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const dayAfterTomorrow = new Date(today); dayAfterTomorrow.setDate(today.getDate() + 2);
  const isHighlightedDate = (date) => {
    const d = new Date(date); d.setHours(0,0,0,0);
    return (
      d.getTime() === today.getTime() ||
      d.getTime() === tomorrow.getTime() ||
      d.getTime() === dayAfterTomorrow.getTime()
    );
  };

  const getBookedSeatInfo = (seatId) => {
    return bookedSeats.find(
      booking => booking.seatId === seatId
    )
  }

  const getBookingEndDate = (startDate, duration) => {
    const start = new Date(startDate)
    const endDate = addDays(start, duration === '0.5' ? 15 : 30) // 15 days for 0.5 month, 30 days for 1 month
    return format(endDate, 'MMM dd')
  }

  const handleSeatClick = (seatId) => {
    if (isSeatBooked(seatId)) {
      toast.error('This seat is already booked for the selected time')
      return
    }

    setSelectedSeats([seatId]) // Only allow one seat selection
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (!selectedDate) {
        toast.error('Please select start date')
        return
      }
      
      // For full-time bookings, require seat selection
      if (durationOptions.find(d => d.value === bookingData.duration)?.seatAllocation === 'user' && selectedSeats.length === 0) {
        toast.error('Please select at least one seat')
        return
      }
      
      setCurrentStep(2)
    } else if (currentStep === 2) {
      if (!bookingData.name || !bookingData.email || !bookingData.phone) {
        toast.error('Please fill in all required fields')
        return
      }
      await handleBooking()
    }
  }

  const handlePayment = async () => {
    // Log booking data before sending
    // Validate duration and subscriptionPeriod
    if (!bookingData.duration || !['full', '4'].includes(bookingData.duration)) {
      toast.error('Please select a valid duration.');
      return;
    }
    if (!bookingData.subscriptionPeriod || !['1', '0.5'].includes(bookingData.subscriptionPeriod)) {
      toast.error('Please select a valid subscription period.');
      return;
    }

    // 1. Create order on backend
    const orderPayload = {
      customerName: bookingData.name,
      customerEmail: bookingData.email,
      customerPhone: bookingData.phone,
      duration: bookingData.duration,
      subscriptionPeriod: bookingData.subscriptionPeriod,
      selectedSeats: bookingData.duration === 'full' ? selectedSeats : []
    };
            const response = await fetch('/api/cashfree/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });
    const data = await response.json();
    if (!data.success) {
      toast.error('Failed to create payment order');
      return;
    }
    // Use the official Cashfree JS SDK
    try {
      const cashfree = await loadCashfree({ mode: 'sandbox' }); // or 'production' for live
      cashfree.checkout({
        paymentSessionId: data.order.payment_session_id,
        redirectTarget: '_modal',
      }).then((result) => {
        if (result.error) {
          toast.error('Error during checkout: ' + result.error.message);
          // Optionally, navigate to a failure page:
          // navigate('/booking-failure', { state: { error: result.error } });
        } else if (result.paymentDetails) {
          toast.success('Payment completed!');
          // Save booking in DB
          const bookingDataForAPI = {
            name: bookingData.name,
            email: bookingData.email,
            phone: bookingData.phone,
            startDate: apiUtils.formatDateForAPI(selectedDate),
            startTime: selectedTime || '09:00',
            durationType: bookingData.duration === '4' ? '4hours' : 'fulltime',
            subscriptionPeriod: bookingData.subscriptionPeriod,
            selectedSeats: bookingData.duration === 'full' ? selectedSeats : [],
            totalAmount: calculateTotal()
          };
          bookingAPI.createBooking(bookingDataForAPI);
          // Now navigate to success page
          navigate('/booking-success', {
            state: {
              bookingDetails: {
                name: bookingData.name,
                email: bookingData.email,
                phone: bookingData.phone,
                seats: selectedSeats,
                date: selectedDate,
                duration: bookingData.duration,
                subscriptionPeriod: bookingData.subscriptionPeriod,
                totalAmount: calculateTotal(),
                paymentDetails: result.paymentDetails
              }
            }
          });
        }
      });
    } catch (err) {
      toast.error('Failed to load Cashfree SDK');
      // Optionally, navigate to a failure page:
      // navigate('/booking-failure', { state: { error: err } });
    }
  };

  const handleBooking = async () => {
    setIsLoading(true)
    
    try {
      // Validate booking data
      const validationErrors = apiUtils.validateBookingData({
        ...bookingData,
        startDate: apiUtils.formatDateForAPI(selectedDate),
        startTime: selectedTime,
        durationType: bookingData.duration === '4' ? '4hours' : 'fulltime',
        subscriptionPeriod: bookingData.subscriptionPeriod,
        selectedSeats
      })

      if (validationErrors.length > 0) {
        toast.error(validationErrors[0])
        setIsLoading(false)
        return
      }

      // Prepare booking data for API
      const bookingDataForAPI = {
        name: bookingData.name,
        email: bookingData.email,
        phone: bookingData.phone,
        startDate: apiUtils.formatDateForAPI(selectedDate),
        startTime: selectedTime || '09:00', // Default time if not selected
        durationType: bookingData.duration === '4' ? '4hours' : 'fulltime',
        subscriptionPeriod: bookingData.subscriptionPeriod,
        selectedSeats: bookingData.duration === 'full' ? selectedSeats : [],
        totalAmount: calculateTotal()
      }

      // Create booking via API
      const response = await bookingAPI.createBooking(bookingDataForAPI)
      
      if (response.success) {
        toast.success('Booking successful! Redirecting to confirmation...')
        
        // Navigate to success page after a short delay
        setTimeout(() => {
          const bookingDetailsForSuccess = {
            name: bookingData.name,
            email: bookingData.email,
            phone: bookingData.phone,
            seats: selectedSeats,
            date: selectedDate,
            duration: bookingData.duration,
            subscriptionPeriod: bookingData.subscriptionPeriod,
            totalAmount: calculateTotal(),
            paymentDetails: response?.data?.paymentDetails || null
          };
          
          navigate('/booking-success', {
            state: {
              bookingDetails: bookingDetailsForSuccess
            }
          })
        }, 1500)
      } else {
        toast.error(response.error || 'Booking failed')
      }
    } catch (error) {
      const errorInfo = apiUtils.handleError(error)
      toast.error(errorInfo.message)
    } finally {
      setIsLoading(false)
    }
  }

  const getSeatStatus = (seatId) => {
    if (isSeatBooked(seatId)) return 'booked'
    if (selectedSeats.includes(seatId)) return 'selected'
    return 'available'
  }

  const calculateTotal = () => {
    const selectedPeriod = subscriptionPeriods.find(p => p.value === bookingData.subscriptionPeriod)
    const selectedDuration = durationOptions.find(d => d.value === bookingData.duration)
    const pricePerSeat = selectedDuration ? selectedDuration.price : 600
    return selectedSeats.length * pricePerSeat
  }

  const getSeatPosition = (seatId) => {
    if (seatId <= 11) return 'Column 1'
    return 'Column 2'
  }

  // Prevent booking for past dates
  const isDateInPast = (date) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    return date < today;
  }

  // Helper to get expiry date for a seat
  const getSeatExpiryDate = (seatId) => {
    const booking = getBookedSeatInfo(seatId)
    return booking?.expiry_date || null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4"
          >
            <Zap className="w-4 h-4 mr-2" />
            Book Your Perfect Study Space
          </motion.div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Book Your Study Seat
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Choose your preferred date, time, and seat from our comfortable study spaces. Established on July 10th, 2023 - The first library in Jiran.
            Experience the perfect environment for productive learning.
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div 
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${currentStep >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
              <motion.div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  currentStep >= 1 ? 'bg-primary-600 border-primary-600 text-white' : 'border-gray-300'
                }`}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                {currentStep > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
              </motion.div>
              <span className="ml-3 font-medium">Select Subscription</span>
            </div>
            <div className="w-8 h-1 bg-gray-300"></div>
            <div className={`flex items-center ${currentStep >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
              <motion.div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  currentStep >= 2 ? 'bg-primary-600 border-primary-600 text-white' : 'border-gray-300'
                }`}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                2
              </motion.div>
              <span className="ml-3 font-medium">Details</span>
            </div>
          </div>
        </motion.div>

        {/* Move the Booking Policy note above the main card, before Step 1 heading */}
        {/* Remove the Booking Policy note from above the main card */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 1 ? (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200"
              >
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <BookOpen className="w-6 h-6 mr-2 text-primary-600" />
                  Step 1: Select Start Date, Subscription & Seats
                </h2>
                
                {/* Date and Subscription Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                  {/* Replace the date input with a dropdown for date selection */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Start Date
                    </label>
                    <select
                      value={format(selectedDate, 'yyyy-MM-dd')}
                      onChange={e => {
                        const newDate = new Date(e.target.value);
                        setSelectedDate(newDate);
                      }}
                      className="input-field focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                    >
                      <option value={format(nextThreeDates[0], 'yyyy-MM-dd')}>
                        {format(nextThreeDates[0], 'MMM dd')} (Today)
                      </option>
                      <option value={format(nextThreeDates[1], 'yyyy-MM-dd')}>
                        {format(nextThreeDates[1], 'MMM dd')} (Tomorrow)
                      </option>
                      <option value={format(nextThreeDates[2], 'yyyy-MM-dd')}>
                        {format(nextThreeDates[2], 'MMM dd')} (Day After)
                      </option>
                    </select>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Subscription Period
                    </label>
                    <select
                      value={bookingData.subscriptionPeriod}
                      onChange={(e) => setBookingData(prev => ({ ...prev, subscriptionPeriod: e.target.value }))}
                      className="input-field focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                    >
                      {subscriptionPeriods.map(period => (
                        <option key={period.value} value={period.value}>
                          {period.label}{period.price && bookingData.duration !== '4' ? ` - ₹${period.price}` : ''}
                        </option>
                      ))}
                    </select>
                  </motion.div>
                </div>

                {/* Duration Options */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Timer className="w-5 h-5 mr-2 text-primary-600" />
                    Choose Your Duration
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {durationOptions.map((option, idx) => (
                      <motion.div
                        key={option.value}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative cursor-pointer rounded-xl p-4 border-2 transition-all duration-200 ${
                          bookingData.duration === option.value
                            ? 'border-primary-500 bg-primary-50 shadow-lg'
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                        onClick={() => setBookingData(prev => ({ ...prev, duration: option.value }))}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${option.color} flex items-center justify-center text-white`}>
                              {option.icon}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{option.label}</h4>
                              <p className="text-sm text-gray-600">₹{option.price} per seat</p>
                            </div>
                          </div>
                          {bookingData.duration === option.value && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center"
                            >
                              <CheckCircle className="w-4 h-4 text-white" />
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Seat Selection */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-primary-600" />
                    {durationOptions.find(d => d.value === bookingData.duration)?.seatAllocation === 'owner' 
                      ? 'Seat Allocation Information' 
                      : 'Select Your Seat(s)'}
                  </h3>
                  {durationOptions.find(d => d.value === bookingData.duration)?.seatAllocation === 'owner' ? (
                    // Owner allocation message for 4-hour bookings
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-blue-900 mb-2">
                            Seat Allocation by Owner
                          </h4>
                          <p className="text-blue-800 mb-3">
                            For 4 Hours (Morning/Evening) bookings, seats are allocated by the owner when you arrive. 
                            You don't need to select a specific seat now.
                          </p>
                          <div className="bg-white p-4 rounded-lg border border-blue-200">
                            <h5 className="font-medium text-blue-900 mb-2">What to expect:</h5>
                            <ul className="text-sm text-blue-800 space-y-1">
                              <li>• Arrive at your selected date and time</li>
                              <li>• Owner will assign you the best available seat</li>
                              <li>• Seats are allocated based on availability and preferences</li>
                              <li>• No need to worry about seat selection</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    // User seat selection for full-time bookings
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                      {/* Left Column - Seats 1-11 */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3 text-center bg-gray-100 py-2 rounded-lg">
                          Column 1 - Seats 1-11
                        </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {Array.from({ length: 11 }, (_, i) => {
                          const seatId = i + 1
                          // const status = getSeatStatus(seatId) // Remove status for fulltime disable logic
                          return (
                            <motion.button
                              key={seatId}
                              onClick={() => handleSeatClick(seatId)}
                              disabled={isFullTimeSeatBooked(seatId)}
                              onHoverStart={() => setHoveredSeat(seatId)}
                              onHoverEnd={() => setHoveredSeat(null)}
                              whileHover={!isFullTimeSeatBooked(seatId) ? { scale: 1.02, y: -2 } : {}}
                              whileTap={!isFullTimeSeatBooked(seatId) ? { scale: 0.98 } : {}}
                              className={`seat w-full h-14 relative rounded-lg transition-all duration-200 ${
                                selectedSeats.includes(seatId) ? 'ring-2 ring-primary-500 ring-offset-2 shadow-lg' : ''
                              } ${
                                isFullTimeSeatBooked(seatId) ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:shadow-md'
                              }`}
                            >
                              <div className="flex items-center justify-between px-4">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">Seat {seatId}</span>
                                  {isFullTimeSeatBooked(seatId) && (
                                    <div className="flex items-center space-x-1">
                                      <X className="w-4 h-4 text-red-500" />
                                      <span className="text-xs text-red-600 font-medium">BOOKED</span>
                                      {getSeatExpiryDate(seatId) && (
                                        <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded ml-2">
                                          Until {format(new Date(getSeatExpiryDate(seatId)), 'MMM dd')}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  {selectedSeats.includes(seatId) && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center"
                                    >
                                      <CheckCircle className="w-4 h-4 text-white" />
                                    </motion.div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Hover tooltip */}
                              {hoveredSeat === seatId && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10"
                                >
                                  {isFullTimeSeatBooked(seatId) ? 'Already Booked' : 'Click to Select'}
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                </motion.div>
                              )}
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>
                    
                    {/* Right Column - Seats 12-22 */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3 text-center bg-gray-100 py-2 rounded-lg">
                        Column 2 - Seats 12-22
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {Array.from({ length: 11 }, (_, i) => {
                          const seatId = i + 12
                          // const status = getSeatStatus(seatId) // Remove status for fulltime disable logic
                          return (
                            <motion.button
                              key={seatId}
                              onClick={() => handleSeatClick(seatId)}
                              disabled={isFullTimeSeatBooked(seatId)}
                              onHoverStart={() => setHoveredSeat(seatId)}
                              onHoverEnd={() => setHoveredSeat(null)}
                              whileHover={!isFullTimeSeatBooked(seatId) ? { scale: 1.02, y: -2 } : {}}
                              whileTap={!isFullTimeSeatBooked(seatId) ? { scale: 0.98 } : {}}
                              className={`seat w-full h-14 relative rounded-lg transition-all duration-200 ${
                                selectedSeats.includes(seatId) ? 'ring-2 ring-primary-500 ring-offset-2 shadow-lg' : ''
                              } ${
                                isFullTimeSeatBooked(seatId) ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:shadow-md'
                              }`}
                            >
                              <div className="flex items-center justify-between px-4">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">Seat {seatId}</span>
                                  {isFullTimeSeatBooked(seatId) && (
                                    <div className="flex items-center space-x-1">
                                      <X className="w-4 h-4 text-red-500" />
                                      <span className="text-xs text-red-600 font-medium">BOOKED</span>
                                      {getSeatExpiryDate(seatId) && (
                                        <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded ml-2">
                                          Until {format(new Date(getSeatExpiryDate(seatId)), 'MMM dd')}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  {selectedSeats.includes(seatId) && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center"
                                    >
                                      <CheckCircle className="w-4 h-4 text-white" />
                                    </motion.div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Hover tooltip */}
                              {hoveredSeat === seatId && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10"
                                >
                                  {isFullTimeSeatBooked(seatId) ? 'Already Booked' : 'Click to Select'}
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                </motion.div>
                              )}
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                  )}
                  
                  {durationOptions.find(d => d.value === bookingData.duration)?.seatAllocation === 'user' && (
                    <>
                      {/* Selected Seat Indicator */}
                      {selectedSeats.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-lg"
                        >
                          <h4 className="font-semibold text-primary-900 mb-2 flex items-center">
                            <Heart className="w-4 h-4 mr-2" />
                            Selected Seat
                          </h4>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                              <span className="text-white font-medium text-sm">{selectedSeats[0]}</span>
                            </div>
                            <div>
                              <p className="font-medium text-primary-900">Seat {selectedSeats[0]} - {getSeatPosition(selectedSeats[0])}</p>
                              <p className="text-sm text-primary-700">Click another seat to change selection</p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Legend */}
                      <div className="flex flex-wrap gap-4 text-sm mt-6 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-green-50 border border-green-300 rounded"></div>
                          <span>Available</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-primary-100 border border-primary-500 rounded"></div>
                          <span>Selected</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-red-50 border border-red-300 rounded"></div>
                          <span>Booked</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200"
              >
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <User className="w-6 h-6 mr-2 text-primary-600" />
                  Step 2: Personal Details
                </h2>
                
                {/* Add a single compact blue info note (Booking Policy) above the form fields */}
                <div className="flex items-start bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs text-blue-900 mb-4">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0 text-blue-500 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                  <div>
                    <span className="font-semibold">Booking Policy:</span> <br/>
                    You can only book for <span className="font-medium text-blue-700">today, tomorrow, or the day after tomorrow</span>.<br/>
                    This prevents advance blocking and keeps seat availability fair for everyone.<br/>
                    <span className="font-medium text-blue-700">1 Month</span> is best for regulars, <span className="font-medium text-blue-700">15 Days</span> is great for short-term needs.<br/>
                    Choose the option that fits your study plans!
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={bookingData.name}
                      onChange={handleInputChange}
                      className="input-field focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                      placeholder="Enter your full name"
                      required
                    />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email Address 
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={bookingData.email}
                      onChange={handleInputChange}
                      className="input-field focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                      placeholder="Enter your email"
                      required
                    />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={bookingData.phone}
                      onChange={handleInputChange}
                      className="input-field focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                      placeholder="Enter your phone number"
                      required
                    />
                  </motion.div>

                </div>

                {/* Security Notice */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">Secure Booking</h4>
                      <p className="text-sm text-blue-800">
                        Your personal information is protected with industry-standard encryption. 
                        We never share your data with third parties.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card sticky top-24 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200"
            >
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-primary-600" />
                Booking Summary
              </h3>
              
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Date:
                    </span>
                    <span className="font-medium">
                      {selectedDate ? format(selectedDate, 'MMM dd, yyyy') : 'Not selected'}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start space-x-2 mb-2">
                      <Timer className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Duration:</span>
                    </div>
                    <span className="font-medium text-sm leading-tight block">
                      {durationOptions.find(d => d.value === bookingData.duration)?.label || 'Not selected'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {durationOptions.find(d => d.value === bookingData.duration)?.seatAllocation === 'owner' ? 'Seat Allocation:' : 'Seats:'}
                    </span>
                    <span className="font-medium">
                      {durationOptions.find(d => d.value === bookingData.duration)?.seatAllocation === 'owner' 
                        ? 'By Owner' 
                        : (selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Total Seats:
                    </span>
                    <span className="font-medium">{selectedSeats.length}</span>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Date:
                    </span>
                    <span className="font-medium">{format(selectedDate, 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start space-x-2 mb-2">
                      <Timer className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">Duration:</span>
                    </div>
                    <span className="font-medium text-sm leading-tight block">{durationOptions.find(d => d.value === bookingData.duration)?.label}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Seats:
                    </span>
                    <span className="font-medium">{selectedSeats.join(', ')}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 flex items-center">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Price per seat:
                    </span>
                    <span className="font-medium">₹{durationOptions.find(d => d.value === bookingData.duration)?.price}</span>
                  </div>
                  <div className="border-t-2 border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total:</span>
                      <span className="text-primary-600">₹{calculateTotal()}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="mt-6 space-y-3">
                {currentStep > 1 && (
                  <motion.button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="w-full btn-secondary flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </motion.button>
                )}
                {currentStep === 1 && (
                  <motion.button
                    onClick={handleNextStep}
                    disabled={isLoading}
                    className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                )}
                {currentStep === 2 && (
                  <motion.button
                    onClick={handlePayment}
                    disabled={isLoading || (durationOptions.find(d => d.value === bookingData.duration)?.seatAllocation === 'user' && selectedSeats.length === 0)}
                    className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Pay Now</span>
                      </>
                    )}
                  </motion.button>
                )}
              </div>

              {/* Features Showcase */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Star className="w-4 h-4 mr-2 text-yellow-500" />
                  Why Choose Us?
                </h4>
                <div className="relative h-24 overflow-hidden rounded-lg">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentFeature}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.5 }}
                      className={`absolute inset-0 bg-gradient-to-br ${features[currentFeature].color} text-white p-4 flex items-center`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          {features[currentFeature].icon}
                        </div>
                        <div>
                          <h5 className="font-semibold text-sm">
                            {features[currentFeature].title}
                          </h5>
                          <p className="text-white/90 text-xs">
                            {features[currentFeature].description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                  
                  {/* Feature indicators */}
                  <div className="absolute bottom-2 right-2 flex space-x-1">
                    {features.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentFeature(idx)}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          idx === currentFeature ? 'bg-white' : 'bg-white/30'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                  <Info className="w-4 h-4 mr-2" />
                  Booking Policy
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 4 Hours (Morning/Evening): ₹300 per seat</li>
                  <li>• Full Time: ₹600 per seat</li>
                  <li>• Payment required at booking</li>
                  <li>• We only allow booking for today, tomorrow, or the day after tomorrow to prevent advance blocking and ensure fair seat availability for all students.</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      {/* Policy Links Bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 border-t border-gray-200 pt-6">
          <a href="/terms" className="hover:text-primary-600 underline">Terms & Conditions</a>
          <span>|</span>
          <a href="/refund-policy" className="hover:text-primary-600 underline">Refund Policy</a>
          <span>|</span>
          <a href="/contact-us" className="hover:text-primary-600 underline">Contact Us</a>
        </div>
      </div>
    </div>
  )
}

export default Booking 