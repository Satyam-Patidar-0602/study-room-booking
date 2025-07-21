import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Booking API functions
export const bookingAPI = {
  // Get all bookings
  getAllBookings: async () => {
    const response = await api.get('/bookings');
    return response.data;
  },

  // Get bookings for a specific date
  getBookingsByDate: async (date) => {
    const response = await api.get(`/bookings/date/${date}`);
    return response.data;
  },

  // Get booked seats for a specific date
  getBookedSeats: async (date) => {
    const response = await api.get(`/bookings/booked-seats/${date}`);
    return response.data;
  },

  // Check seat availability
  checkSeatAvailability: async (seatId, date) => {
    const response = await api.get(`/bookings/check-availability/${seatId}/${date}`);
    return response.data;
  },

  // Create a new booking
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  // Update booking status
  updateBookingStatus: async (bookingId, status) => {
    const response = await api.patch(`/bookings/${bookingId}/status`, { status });
    return response.data;
  },

  // Update payment status
  updatePaymentStatus: async (bookingId, paymentStatus) => {
    const response = await api.patch(`/bookings/${bookingId}/payment`, { paymentStatus });
    return response.data;
  },

  // Get booking statistics
  getBookingStats: async () => {
    const response = await api.get('/bookings/stats');
    return response.data;
  },
};

// Utility functions
export const apiUtils = {
  // Format date for API
  formatDateForAPI: (date) => {
    return date.toISOString().split('T')[0];
  },

  // Parse API date
  parseAPIDate: (dateString) => {
    return new Date(dateString);
  },

  // Handle API errors
  handleError: (error) => {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.error || 'An error occurred',
        status: error.response.status,
        details: error.response.data?.details
      };
    } else if (error.request) {
      // Network error
      return {
        message: 'Network error. Please check your connection.',
        status: 0
      };
    } else {
      // Other error
      return {
        message: error.message || 'An unexpected error occurred',
        status: 0
      };
    }
  },

  // Validate booking data
  validateBookingData: (data) => {
    const errors = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Name is required');
    }

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Valid email is required');
    }

    if (!data.phone || data.phone.trim().length === 0) {
      errors.push('Phone number is required');
    }

    if (!data.startDate) {
      errors.push('Start date is required');
    }

    if (!data.durationType) {
      errors.push('Duration type is required');
    }

    if (!data.subscriptionPeriod) {
      errors.push('Subscription period is required');
    }

    if (data.durationType === 'fulltime' && (!data.selectedSeats || data.selectedSeats.length === 0)) {
      errors.push('Seat selection is required for full-time bookings');
    }

    return errors;
  }
};

export default api; 