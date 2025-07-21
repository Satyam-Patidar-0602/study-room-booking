import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Calendar, 
  Armchair, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  BarChart3,
  UserPlus,
  BookOpen,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { sendBookingIdCardPDF } from '../utils/sendBookingIdCard';

const AdminDashboard = () => {
  // State for different sections
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  
  // Data states
  const [students, setStudents] = useState([])
  const [bookings, setBookings] = useState([])
  const [seats, setSeats] = useState([])
  
  // Form states
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [showAddBooking, setShowAddBooking] = useState(false)
  const [showSeatAssignment, setShowSeatAssignment] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  
  // Form data
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    phone: ''
  })
  
  const [bookingForm, setBookingForm] = useState({
    studentId: '',
    seatId: '',
    startDate: '',
    duration: '4',
    subscriptionPeriod: '1',
    totalAmount: '',
    paymentStatus: 'pending'
  })

  const [seatAssignmentForm, setSeatAssignmentForm] = useState({
    studentId: '',
    seatId: '',
    assignmentType: 'morning', // morning, evening, fulltime
    startDate: '',
    subscriptionPeriod: '1',
    totalAmount: ''
  })

  const [seatFilter, setSeatFilter] = useState('booked');

  // Add step state
  const [assignmentStep, setAssignmentStep] = useState(1);

  const adminNames = [
    'Sunil Mukhdham',
    'Jayesh Mukhdham',
    'Rakesh Bhoot',
    'Jayesh Bhoot',
    'Satyam Patidar'
  ]
  const [expenses, setExpenses] = useState([])
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    description: '',
    admin: adminNames[0]
  })

  // Pagination state for bookings
  const [bookingPage, setBookingPage] = useState(1)
  const BOOKINGS_PER_PAGE = 10
  const [showPastBookings, setShowPastBookings] = useState(false)


  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData()
  }, [])

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAllData()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [])

  // Reset seat selection when date changes
  useEffect(() => {
    setBookingForm(prev => ({ ...prev, seatId: '' }))
  }, [bookingForm.startDate])

  // Lock background scroll when any modal is open
  useEffect(() => {
    if (showAddStudent || showAddBooking || showSeatAssignment || editingItem) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showAddStudent, showAddBooking, showSeatAssignment, editingItem]);

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [studentsRes, bookingsRes, seatsRes] = await Promise.all([
        api.get('/admin/students'),
        api.get('/admin/bookings'),
        api.get('/admin/seats')
      ])
      
      setStudents(studentsRes.data.students || [])
      setBookings(bookingsRes.data.bookings || [])
      setSeats(seatsRes.data.seats || [])
    } catch (error) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  // Add new student
  const handleAddStudent = async (e) => {
    e.preventDefault()
    try {
      const response = await api.post('/admin/students', studentForm)
      setStudents(prev => [...prev, response.data.student])
      setStudentForm({ name: '', email: '', phone: '' })
      setShowAddStudent(false)
      toast.success('Student added successfully')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add student')
    }
  }

  // Add new booking
  const handleAddBooking = async (e) => {
    e.preventDefault()
    try {
      // Calculate end date based on subscription period
      const startDate = new Date(bookingForm.startDate);
      const endDate = new Date(startDate);
      
      if (bookingForm.subscriptionPeriod === '0.5') {
        endDate.setDate(startDate.getDate() + 14); // 15 days total (inclusive)
      } else if (bookingForm.subscriptionPeriod === '1') {
        endDate.setMonth(startDate.getMonth() + 1);
        endDate.setDate(endDate.getDate() - 1); // 1 month (inclusive)
      }
      
      const bookingData = {
        ...bookingForm,
        endDate: endDate.toISOString().split('T')[0]
      };
      
      const response = await api.post('/admin/bookings', bookingData)
      setBookings(prev => [...prev, response.data.booking])
      setBookingForm({
        studentId: '',
        seatId: '',
        startDate: '',
        duration: '4',
        subscriptionPeriod: '1',
        totalAmount: '',
        paymentStatus: 'pending'
      })
      // Send beautiful ID card PDF to student
      const student = students.find(s => String(s.id) === String(bookingForm.studentId));
      if (!student || !student.email) {
        toast.error('Student not found or missing email');
        return;
      }
      const seat = seats.find(s => s.id === bookingForm.seatId)
      await sendBookingIdCardPDF({
        bookingDetails: {
          name: student.name,
          email: student.email,
          phone: student.phone,
          seats: seat ? `Seat ${seat.seat_number}` : '',
          totalAmount: bookingForm.totalAmount,
          date: bookingForm.startDate,
          duration: bookingForm.duration,
          subscriptionPeriod: bookingForm.subscriptionPeriod,
        },
        email: student.email,
        onComplete: () => toast.success('ID Card emailed to student!'),
      });
      setShowAddBooking(false)
      toast.success('Booking added successfully')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add booking')
    }
  }

  // Assign seat to student
  const handleSeatAssignment = async (e) => {
    e.preventDefault()
    try {
      // Determine start time based on assignment type
      let startTime = '09:00';
      let durationType = '4hours';
      
      if (seatAssignmentForm.assignmentType === 'morning') {
        startTime = '09:00';
        durationType = '4hours';
      } else if (seatAssignmentForm.assignmentType === 'evening') {
        startTime = '14:00';
        durationType = '4hours';
      } else if (seatAssignmentForm.assignmentType === 'fulltime') {
        startTime = '09:00';
        durationType = 'fulltime';
      }

      const bookingData = {
        studentId: seatAssignmentForm.studentId,
        seatId: seatAssignmentForm.seatId,
        startDate: seatAssignmentForm.startDate,
        startTime: startTime,
        durationType: durationType,
        subscriptionPeriod: seatAssignmentForm.subscriptionPeriod,
        totalAmount: seatAssignmentForm.totalAmount,
        paymentStatus: 'completed'
      };

      const response = await api.post('/admin/assign-seat', bookingData)
      setBookings(prev => [...prev, response.data.booking])
      setSeatAssignmentForm({
        studentId: '',
        seatId: '',
        assignmentType: '4hours',
        startDate: '',
        subscriptionPeriod: '1',
        totalAmount: ''
      })
      setAssignmentStep(1)
      setShowSeatAssignment(false)
      toast.success('Seat assigned successfully! Email notification sent to student.')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to assign seat')
    }
  }



  // Update item
  const handleUpdate = async (type, id, data) => {
    try {
      const response = await api.put(`/admin/${type}/${id}`, data)
      
      if (type === 'students') {
        setStudents(prev => prev.map(item => 
          item.id === id ? response.data.student : item
        ))
      } else if (type === 'bookings') {
        setBookings(prev => prev.map(item => 
          item.id === id ? response.data.booking : item
        ))
      } else if (type === 'seats') {
        setSeats(prev => prev.map(item => 
          item.id === id ? response.data.seat : item
        ))
      }
      
      setEditingItem(null)
      toast.success(`${type.slice(0, -1)} updated successfully`)
    } catch (error) {
      toast.error(error.response?.data?.error || `Failed to update ${type.slice(0, -1)}`)
    }
  }

  // Delete item
  const handleDelete = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type.slice(0, -1)}?`)) {
      return
    }
    
    try {
      await api.delete(`/admin/${type}/${id}`)
      
      if (type === 'students') {
        setStudents(prev => prev.filter(item => item.id !== id))
      } else if (type === 'bookings') {
        setBookings(prev => prev.filter(item => item.id !== id))
      } else if (type === 'seats') {
        setSeats(prev => prev.filter(item => item.id !== id))
      }
      
      toast.success(`${type.slice(0, -1)} deleted successfully`)
    } catch (error) {
      toast.error(error.response?.data?.error || `Failed to delete ${type.slice(0, -1)}`)
    }
  }

  // Filter data
  const filteredStudents = students.filter(student =>
    student &&
    typeof student.name === 'string' &&
    (
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (student.phone && student.phone.includes(searchTerm))
    )
  )

  // Filtered bookings for table
  const filteredBookings = bookings.filter(booking => {
    if (!booking) return false;
    if (!showPastBookings && booking.status !== 'active') return false;
    const matchesSearch = 
      (booking.user_name && booking.user_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.seat_number && booking.seat_number.toString().includes(searchTerm))
    const matchesFilter = filterStatus === 'all' || booking.payment_status === filterStatus
    return matchesSearch && matchesFilter
  })
  // Defensive: filter out undefined/null before paginating
  const paginatedBookings = filteredBookings.filter(Boolean).slice((bookingPage-1)*BOOKINGS_PER_PAGE, bookingPage*BOOKINGS_PER_PAGE)
  const totalBookingPages = Math.ceil(filteredBookings.length / BOOKINGS_PER_PAGE)

  // Calculate statistics
  const stats = {
    totalStudents: students.length,
    totalBookings: bookings.filter(b => b).length,
    activeBookings: bookings.filter(b => b && b.payment_status === 'paid').length,
    totalRevenue: bookings
      .filter(b => b && b.payment_status === 'paid')
      .reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0),
    availableSeats: seats.filter(s => s && s.status === 'available').length,
    occupiedSeats: seats.filter(s => s && s.status === 'booked').length
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'students', name: 'Students', icon: Users },
    { id: 'bookings', name: 'Bookings', icon: Calendar },
    { id: 'seats', name: 'Seats', icon: Armchair },
    { id: 'expenses', name: 'Expenses', icon: DollarSign },
    { id: 'settings', name: 'Settings', icon: Settings }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  function handleCleanBookings() { toast.error('Not implemented yet'); }
  function handleCleanUsers() { toast.error('Not implemented yet'); }
  function handleCleanExpenses() { toast.error('Not implemented yet'); }

  const CLEANUP_PASSWORD = 'cleanup'; // Replace with env/secure method in production

  async function handleCleanSeats() {
    const pwd = document.getElementById('cleanup-password')?.value || '';
    if (!pwd) {
      toast.error('Please enter the admin password below to clean all seat bookings.');
      return;
    }
    if (pwd !== CLEANUP_PASSWORD) {
      toast.error('Incorrect password. Cleanup cancelled.');
      return;
    }
    toast('Cleaning all seat bookings...', { icon: '🧹' });
    try {
      const res = await api.post('/admin/cleanup-seats');
      toast.success(res.data.message || 'All seat bookings deleted.');
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to clean seat bookings');
    }
  }

  async function handleCleanBookings() {
    const pwd = document.getElementById('cleanup-password')?.value || '';
    if (!pwd) {
      toast.error('Please enter the admin password below to clean all bookings.');
      return;
    }
    if (pwd !== CLEANUP_PASSWORD) {
      toast.error('Incorrect password. Cleanup cancelled.');
      return;
    }
    toast('Cleaning all bookings...', { icon: '🧹' });
    try {
      const res = await api.post('/admin/cleanup-bookings');
      toast.success(res.data.message || 'All bookings deleted.');
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to clean bookings');
    }
  }

  async function handleCleanUsers() {
    const pwd = document.getElementById('cleanup-password')?.value || '';
    if (!pwd) {
      toast.error('Please enter the admin password below to clean all users.');
      return;
    }
    if (pwd !== CLEANUP_PASSWORD) {
      toast.error('Incorrect password. Cleanup cancelled.');
      return;
    }
    toast('Cleaning all users...', { icon: '🧹' });
    try {
      const res = await api.post('/admin/cleanup-users');
      toast.success(res.data.message || 'All users deleted.');
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to clean users');
    }
  }

  async function handleCleanExpenses() {
    const pwd = document.getElementById('cleanup-password')?.value || '';
    if (!pwd) {
      toast.error('Please enter the admin password below to clean all expenses.');
      return;
    }
    if (pwd !== CLEANUP_PASSWORD) {
      toast.error('Incorrect password. Cleanup cancelled.');
      return;
    }
    toast('Cleaning all expenses...', { icon: '🧹' });
    try {
      const res = await api.post('/admin/cleanup-expenses');
      toast.success(res.data.message || 'All expenses deleted.');
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to clean expenses');
    }
  }

  // Utility to get today's date in YYYY-MM-DD format
  const getToday = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Utility to get expiry date from start_date and subscription_period
  const getExpiryDate = (startDate, subscriptionPeriod) => {
    if (!startDate || !subscriptionPeriod) return '-';
    const start = new Date(startDate);
    if (subscriptionPeriod === '0.5') {
      start.setDate(start.getDate() + 14);
    } else if (subscriptionPeriod === '1') {
      start.setMonth(start.getMonth() + 1);
      start.setDate(start.getDate() - 1);
    }
    return start.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage students, bookings, and seats</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => fetchAllData()}
                className="btn-secondary"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Sections */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeBookings}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Armchair className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Available Seats</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.availableSeats}/22</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Bookings</h3>
              </div>
              <div className="p-6">
                {bookings.filter(booking => booking).slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">{booking.user_name || 'Unknown User'}</p>
                      <p className="text-sm text-gray-600">Seat {booking.seat_number || 'N/A'} • {getToday()}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        booking.payment_status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : booking.payment_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {booking.payment_status}
                      </span>
                      <span className="text-sm font-medium text-gray-900">₹{booking.total_amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
        {activeTab === 'students' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                onClick={() => setShowAddStudent(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Student</span>
              </button>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.map((student) => (
                      <tr key={student.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">ID: {student.id}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{student.email}</div>
                          <div className="text-sm text-gray-500">{student.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(student.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingItem({ type: 'students', data: student })}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete('students', student.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
        {activeTab === 'bookings' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search bookings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid Cash</option>
                </select>
                <button
                  onClick={() => setShowPastBookings(v => !v)}
                  className={`px-4 py-2 rounded-lg font-medium border ${showPastBookings ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'} transition-all`}
                >
                  {showPastBookings ? 'Hide Past Bookings' : 'Show Past Bookings'}
                </button>
              </div>
              <button
                onClick={() => setShowAddBooking(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Booking</span>
              </button>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seat</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedBookings.filter(Boolean).map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{booking.user_name}</div>
                          <div className="text-sm text-gray-500">{booking.user_email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {booking.user_phone || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Seat {booking.seat_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {booking.start_date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {booking.end_date || booking.expiry_date || getExpiryDate(booking.start_date, booking.subscription_period) || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {booking.status || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{booking.duration_type === 'fulltime' ? 'Full Time' : '4 Hours'}</div>
                          <div className="text-sm text-gray-500">{booking.subscription_period} month</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{booking.total_amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            booking.payment_status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : booking.payment_status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {booking.payment_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingItem({ type: 'bookings', data: booking })}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete('bookings', booking.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-600">
                Page {bookingPage} of {totalBookingPages}
              </span>
              <div className="space-x-2">
                <button
                  onClick={() => setBookingPage(p => Math.max(1, p-1))}
                  disabled={bookingPage === 1}
                  className="px-3 py-1 rounded border bg-gray-100 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setBookingPage(p => Math.min(totalBookingPages, p+1))}
                  disabled={bookingPage === totalBookingPages}
                  className="px-3 py-1 rounded border bg-gray-100 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </motion.div>
        )}
        {activeTab === 'seats' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">All Seats Status</h2>
              <div className="flex items-center space-x-4">
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={seatFilter}
                  onChange={e => setSeatFilter(e.target.value)}
                >
                  <option value="booked">Currently Booked</option>
                  <option value="4hours">4 Hours Booked</option>
                  <option value="fulltime">Full Time Booked</option>
                </select>
                <button
                  onClick={() => setShowSeatAssignment(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Assign Seat</span>
                </button>
              </div>
            </div>

            {/* Overall Seat Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Armchair className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Seats</p>
                    <p className="text-2xl font-semibold text-gray-900">{seats.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Available</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {seats.filter(seat => {
                        const currentBooking = bookings.find(booking => 
                          booking.seat_id === seat.id && 
                          booking.status === 'active'
                        );
                        return !currentBooking;
                      }).length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Armchair className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">4 Hours Booked</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {bookings.filter(booking => 
                        booking.status === 'active' && 
                        booking.duration_type === '4hours'
                      ).length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Armchair className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Full Time Booked</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {bookings.filter(booking => 
                        booking.status === 'active' && 
                        booking.duration_type === 'fulltime'
                      ).length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {bookings.filter(booking => booking.status === 'active').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Seats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {seats.map(seat => {
                  // Check for 4 hours booking (any active booking)
                  const booking4h = bookings.find(b => 
                    b && b.seat_id === seat.id && 
                    b.status === 'active' && 
                    b.duration_type === '4hours'
                  );
                  
                  // Check for full time booking (any active booking)
                  const bookingFt = bookings.find(b => 
                    b && b.seat_id === seat.id && 
                    b.status === 'active' && 
                    b.duration_type === 'fulltime'
                  );
                  
                  // Determine status based on filter
                  let status = 'available';
                  let statusColor = 'bg-green-100 text-green-800';
                  let statusText = 'Available';
                  
                  if (seatFilter === '4hours') {
                    if (booking4h) {
                      status = 'booked_4h';
                      statusColor = 'bg-red-100 text-red-800';
                      statusText = '4H Booked';
                    } else {
                      status = 'available_4h';
                      statusColor = 'bg-green-100 text-green-800';
                      statusText = '4H Available';
                    }
                  } else if (seatFilter === 'fulltime') {
                    if (bookingFt) {
                      status = 'booked_ft';
                      statusColor = 'bg-red-100 text-red-800';
                      statusText = 'FT Booked';
                    } else {
                      status = 'available_ft';
                      statusColor = 'bg-green-100 text-green-800';
                      statusText = 'FT Available';
                    }
                  } else {
                    // Show all bookings
                    if (booking4h && bookingFt) {
                      status = 'booked_both';
                      statusColor = 'bg-purple-100 text-purple-800';
                      statusText = 'Both Booked';
                    } else if (booking4h) {
                      status = 'booked_4h';
                      statusColor = 'bg-orange-100 text-orange-800';
                      statusText = '4H Booked';
                    } else if (bookingFt) {
                      status = 'booked_ft';
                      statusColor = 'bg-blue-100 text-blue-800';
                      statusText = 'FT Booked';
                    } else {
                      status = 'available';
                      statusColor = 'bg-green-100 text-green-800';
                      statusText = 'Available';
                    }
                  }
                  
                  return (
                <div key={seat.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Seat {seat.seat_number}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${statusColor}`}>{statusText}</span>
                  </div>
                  <div className="space-y-2">
                        <p className="text-sm text-gray-600">Column: {seat.column_number}</p>
                        
                        {/* Show 4 Hours Booking */}
                        {booking4h && (
                          <div className="mt-3 p-3 bg-orange-50 rounded border-l-4 border-orange-500">
                            <p className="text-xs font-medium text-orange-700 mb-2">4 Hours Booking:</p>
                            <div className="space-y-1">
                              <p className="text-xs text-gray-600"><span className="font-medium">Student:</span> {booking4h.user_name || 'Unknown'}</p>
                              <p className="text-xs text-gray-600"><span className="font-medium">Date:</span> {booking4h.start_date}</p>
                              <p className="text-xs text-gray-600"><span className="font-medium">Time:</span> {booking4h.start_time || '09:00'}</p>
                              <p className="text-xs text-gray-600"><span className="font-medium">Period:</span> {booking4h.subscription_period} month(s)</p>
                              <p className="text-xs text-gray-600"><span className="font-medium">Payment:</span> <span className={`ml-1 px-1 py-0.5 rounded text-xs ${booking4h.payment_status === 'paid' ? 'bg-green-100 text-green-800' : booking4h.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{booking4h.payment_status}</span></p>
                  </div>
                          </div>
                        )}
                        
                        {/* Show Full Time Booking */}
                        {bookingFt && (
                          <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                            <p className="text-xs font-medium text-blue-700 mb-2">Full Time Booking:</p>
                            <div className="space-y-1">
                              <p className="text-xs text-gray-600"><span className="font-medium">Student:</span> {bookingFt.user_name || 'Unknown'}</p>
                              <p className="text-xs text-gray-600"><span className="font-medium">Date:</span> {bookingFt.start_date}</p>
                              <p className="text-xs text-gray-600"><span className="font-medium">Time:</span> {bookingFt.start_time || '09:00'}</p>
                              <p className="text-xs text-gray-600"><span className="font-medium">Period:</span> {bookingFt.subscription_period} month(s)</p>
                              <p className="text-xs text-gray-600"><span className="font-medium">Payment:</span> <span className={`ml-1 px-1 py-0.5 rounded text-xs ${bookingFt.payment_status === 'paid' ? 'bg-green-100 text-green-800' : bookingFt.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{bookingFt.payment_status}</span></p>
                            </div>
                          </div>
                        )}
                        </div>
                        {/* Show Available Status */}
                        {!booking4h && !bookingFt && (
                          <div className="mt-3 p-3 bg-green-50 rounded border-l-4 border-green-500">
                            <p className="text-xs font-medium text-green-700">Available for both types</p>
                            <p className="text-xs text-green-600">No bookings for today</p>
                          </div>
                        )}
                      </div>
                  )
                })}
            </div>
          </motion.div>
        )}
        {activeTab === 'expenses' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="bg-white rounded-lg shadow p-6 max-w-lg mx-auto">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                Add Expense
              </h2>
              <form
                onSubmit={e => {
                  e.preventDefault()
                  if (!expenseForm.amount || !expenseForm.description) {
                    toast.error('Please fill all fields')
                    return
                  }
                  setExpenses(prev => [
                    { ...expenseForm, amount: parseFloat(expenseForm.amount), date: new Date().toLocaleString() },
                    ...prev
                  ])
                  setExpenseForm({ amount: '', description: '', admin: adminNames[0] })
                  toast.success('Expense added!')
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                    value={expenseForm.amount}
                    onChange={e => setExpenseForm(f => ({ ...f, amount: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                    value={expenseForm.description}
                    onChange={e => setExpenseForm(f => ({ ...f, description: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Admin</label>
                  <select
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                    value={expenseForm.admin}
                    onChange={e => setExpenseForm(f => ({ ...f, admin: e.target.value }))}
                  >
                    {adminNames.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
                    <button
                  type="submit"
                  className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold"
                    >
                  Add Expense
                    </button>
              </form>
                  </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                Expenses List
              </h2>
              {expenses.length === 0 ? (
                <p className="text-gray-500">No expenses added yet.</p>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {expenses.map((exp, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{exp.date}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-green-700 font-bold">₹{exp.amount}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{exp.description}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{exp.admin}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        )}
        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6 max-w-lg mx-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Database Management</h3>
              <input
                id="cleanup-password"
                type="password"
                placeholder="Admin password"
                className="mb-4 px-3 py-2 border rounded w-full"
                autoComplete="current-password"
              />
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleCleanBookings}
                  className="btn-secondary"
                >
                  Clean Bookings
                </button>
                <button
                  onClick={handleCleanUsers}
                  className="btn-secondary"
                >
                  Clean Users
                </button>
                <button
                  onClick={handleCleanSeats}
                  className="btn-secondary"
                >
                  Clean Seats
                </button>
                <button
                  onClick={handleCleanExpenses}
                  className="btn-secondary"
                >
                  Clean Expenses
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Add Student Modal */}
      {showAddStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add New Student</h3>
              <button 
                onClick={() => setShowAddStudent(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={studentForm.name}
                  onChange={(e) => setStudentForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter student name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={studentForm.email}
                  onChange={(e) => setStudentForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={studentForm.phone}
                  onChange={(e) => setStudentForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="submit" className="btn-primary flex-1">Add Student</button>
                <button type="button" onClick={() => setShowAddStudent(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Booking Modal */}
      {showAddBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add New Booking</h3>
              <button 
                onClick={() => setShowAddBooking(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
                <select
                  required
                  value={bookingForm.studentId}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, studentId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select Student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>{student.name} ({student.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date *</label>
                <input
                  type="date"
                  required
                  value={bookingForm.startDate}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration</label>
                  <select
                    required
                    value={bookingForm.duration}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, duration: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="4">4 Hours</option>
                    <option value="full">Full Time</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Period</label>
                  <select
                    required
                    value={bookingForm.subscriptionPeriod}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, subscriptionPeriod: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="1">1 Month</option>
                    <option value="0.5">15 Days</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="number"
                  required
                  value={bookingForm.totalAmount}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, totalAmount: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Status</label>
                <select
                  required
                  value={bookingForm.paymentStatus}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, paymentStatus: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Seat *</label>
                <select
                  required
                  value={bookingForm.seatId}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, seatId: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white shadow-sm"
                >
                  <option value="">Select Seat</option>
                  {(() => {
                    const selectedDate = bookingForm.startDate;
                    const duration = bookingForm.duration;
                    const period = bookingForm.subscriptionPeriod;
                    
                    if (!selectedDate || !duration || !period) {
                      return <option value="" disabled>Please select date, duration, and period first</option>;
                    }
                    
                    // Calculate requested period
                    const start = new Date(selectedDate);
                    const end = new Date(start);
                    if (period === '0.5') {
                      end.setDate(start.getDate() + 14); // 15 days total (inclusive)
                    } else if (period === '1') {
                      end.setMonth(start.getMonth() + 1);
                      end.setDate(end.getDate() - 1); // 1 month (inclusive)
                    }
                    
                    // For each seat, check if any booking of the SAME TYPE overlaps with requested period
                    const availableSeats = seats.filter(seat => {
                      const durationType = bookingForm.duration === 'full' ? 'fulltime' : '4hours';
                      
                      // For 4 hours: check only 4 hours bookings (ignore full time)
                      // For full time: check only full time bookings (ignore 4 hours)
                      const bookingsForSeat = bookings.filter(b => 
                        b.seat_id === seat.id && 
                        b.duration_type === durationType &&
                        b.status === 'active'
                      );
                      
                      for (const b of bookingsForSeat) {
                        const bStart = new Date(b.start_date);
                        let bEnd = new Date(bStart);
                        if (b.subscription_period === '0.5') {
                          bEnd.setDate(bStart.getDate() + 14);
                        } else if (b.subscription_period === '1') {
                          bEnd.setMonth(bStart.getMonth() + 1);
                          bEnd.setDate(bEnd.getDate() - 1);
                        }
                        if (!(end < bStart || start > bEnd)) {
                          return false;
                        }
                      }
                      return true;
                    });
                    
                    if (availableSeats.length === 0) {
                      return <option value="" disabled>No seats available for the selected period</option>;
                    } else {
                      return availableSeats.map(seat => (
                        <option key={seat.id} value={seat.id} className="py-2">
                          Seat {seat.seat_number} (Column {seat.column_number})
                        </option>
                      ));
                    }
                  })()}
                </select>
                
                {/* Status Messages */}
                {(() => {
                  const selectedDate = bookingForm.startDate;
                  const duration = bookingForm.duration;
                  const period = bookingForm.subscriptionPeriod;
                  
                  if (!selectedDate || !duration || !period) {
                    return (
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-700">
                          <span className="font-medium">Step 1:</span> Select start date
                        </p>
                        <p className="text-sm text-blue-600 mt-1">
                          <span className="font-medium">Step 2:</span> Choose duration (4 hours or full time)
                        </p>
                        <p className="text-sm text-blue-600">
                          <span className="font-medium">Step 3:</span> Select subscription period (15 days or 1 month)
                        </p>
              </div>
                    );
                  }
                  
                  // Calculate available seats
                  const start = new Date(selectedDate);
                  const end = new Date(start);
                  if (period === '0.5') {
                    end.setDate(start.getDate() + 14);
                  } else if (period === '1') {
                    end.setMonth(start.getMonth() + 1);
                    end.setDate(end.getDate() - 1);
                  }
                  
                  const availableSeats = seats.filter(seat => {
                    const durationType = duration === 'full' ? 'fulltime' : '4hours';
                    
                    // For 4 hours: check only 4 hours bookings (ignore full time)
                    // For full time: check only full time bookings (ignore 4 hours)
                    const bookingsForSeat = bookings.filter(b => 
                      b.seat_id === seat.id && 
                      b.duration_type === durationType &&
                      b.status === 'active'
                    );
                    
                    for (const b of bookingsForSeat) {
                      const bStart = new Date(b.start_date);
                      let bEnd = new Date(bStart);
                      if (b.subscription_period === '0.5') {
                        bEnd.setDate(bStart.getDate() + 14);
                      } else if (b.subscription_period === '1') {
                        bEnd.setMonth(bStart.getMonth() + 1);
                        bEnd.setDate(bEnd.getDate() - 1);
                      }
                      if (!(end < bStart || start > bEnd)) {
                        return false;
                      }
                    }
                    return true;
                  });
                  
                  if (availableSeats.length === 0) {
                    return (
                      <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm text-red-700 font-medium">No seats available</p>
                        <p className="text-sm text-red-600 mt-1">
                          All seats are booked for {duration === 'full' ? 'full time' : '4 hours'} from {new Date(selectedDate).toLocaleDateString()} to {end.toLocaleDateString()}
                        </p>
                      </div>
                    );
                  } else {
                    return (
                      <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-700 font-medium">{availableSeats.length} seat(s) available</p>
                        <p className="text-sm text-green-600 mt-1">
                          Period: {new Date(selectedDate).toLocaleDateString()} to {end.toLocaleDateString()}
                        </p>
                      </div>
                    );
                  }
                })()}
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="btn-primary flex-1">Add Booking</button>
                <button type="button" onClick={() => setShowAddBooking(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Seat Assignment Modal */}
      {showSeatAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Assign Seat to Student</h3>
              <button 
                onClick={() => setShowSeatAssignment(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSeatAssignment} className="space-y-4">
              {/* Step 1: Student Selection */}
              {assignmentStep === 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
                  <select
                    required
                    value={seatAssignmentForm.studentId}
                    onChange={(e) => setSeatAssignmentForm(prev => ({ ...prev, studentId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select Student</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>{student.name} ({student.email})</option>
                    ))}
                  </select>
                  <div className="flex space-x-3 pt-4">
                    <button 
                      type="button" 
                      onClick={() => setAssignmentStep(2)}
                      disabled={!seatAssignmentForm.studentId}
                      className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next: Select Date
                    </button>
                    <button type="button" onClick={() => setShowSeatAssignment(false)} className="btn-secondary flex-1">Cancel</button>
                  </div>
                </div>
              )}

              {/* Step 2: Date Selection */}
              {assignmentStep === 2 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={seatAssignmentForm.startDate}
                    onChange={(e) => setSeatAssignmentForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <div className="flex space-x-3 pt-4">
                    <button type="button" onClick={() => setAssignmentStep(1)} className="btn-secondary flex-1">Back</button>
                    <button 
                      type="button" 
                      onClick={() => setAssignmentStep(3)}
                      disabled={!seatAssignmentForm.startDate}
                      className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next: Select Type
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Assignment Type */}
              {assignmentStep === 3 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Type *</label>
                  <select
                    required
                    value={seatAssignmentForm.assignmentType}
                    onChange={(e) => setSeatAssignmentForm(prev => ({ ...prev, assignmentType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select Assignment Type</option>
                    <option value="4hours">Morning/Evening (4 Hours)</option>
                    <option value="fulltime">Full Time</option>
                  </select>
                  <div className="flex space-x-3 pt-4">
                    <button type="button" onClick={() => setAssignmentStep(2)} className="btn-secondary flex-1">Back</button>
                    <button 
                      type="button" 
                      onClick={() => setAssignmentStep(4)}
                      disabled={!seatAssignmentForm.assignmentType}
                      className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next: Select Seat
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Subscription Duration */}
              {assignmentStep === 4 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Period *</label>
                  <select
                    required
                    value={seatAssignmentForm.subscriptionPeriod}
                    onChange={(e) => setSeatAssignmentForm(prev => ({ ...prev, subscriptionPeriod: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select Subscription Period</option>
                    <option value="0.5">15 Days</option>
                    <option value="1">1 Month</option>
                  </select>
                  <div className="flex space-x-3 pt-4">
                    <button type="button" onClick={() => setAssignmentStep(3)} className="btn-secondary flex-1">Back</button>
                    <button 
                      type="button" 
                      onClick={() => setAssignmentStep(5)}
                      disabled={!seatAssignmentForm.subscriptionPeriod}
                      className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next: Select Seat
                    </button>
                  </div>
                </div>
              )}

              {/* Step 5: Seat Selection */}
              {assignmentStep === 5 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seat *</label>
                  <select
                    required
                    value={seatAssignmentForm.seatId}
                    onChange={(e) => setSeatAssignmentForm(prev => ({ ...prev, seatId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select Seat</option>
                    {(() => {
                      const selectedDate = seatAssignmentForm.startDate;
                      const type = seatAssignmentForm.assignmentType;
                      const period = seatAssignmentForm.subscriptionPeriod;
                      if (!selectedDate || !type || !period) {
                        return null;
                      }
                      // Calculate requested period
                      const start = new Date(selectedDate);
                      const end = new Date(start);
                      if (period === '0.5') {
                        end.setDate(start.getDate() + 14); // 15 days total (inclusive)
                      } else if (period === '1') {
                        end.setMonth(start.getMonth() + 1);
                        end.setDate(end.getDate() - 1); // 1 month (inclusive)
                      }
                      // For each seat, check if any booking of the SAME TYPE overlaps with requested period
                      const availableSeats = seats.filter(seat => {
                        // For 4 hours: check only 4 hours bookings (ignore full time)
                        // For full time: check only full time bookings (ignore 4 hours)
                        const bookingsForSeatAndType = bookings.filter(b => 
                          b.seat_id === seat.id && 
                          b.duration_type === type && 
                          b.status === 'active'
                        );
                        
                        // Check for overlap with same type bookings only
                        for (const b of bookingsForSeatAndType) {
                          const bStart = new Date(b.start_date);
                          let bEnd = new Date(bStart);
                          if (b.subscription_period === '0.5') {
                            bEnd.setDate(bStart.getDate() + 14);
                          } else if (b.subscription_period === '1') {
                            bEnd.setMonth(bStart.getMonth() + 1);
                            bEnd.setDate(bEnd.getDate() - 1);
                          }
                          // If periods overlap, seat is not available for this type
                          if (!(end < bStart || start > bEnd)) {
                            return false;
                          }
                        }
                        return true;
                      });
                      if (availableSeats.length === 0) {
                        return <option value="" disabled>No seats available for {type === 'fulltime' ? 'Full Time' : '4 Hours'} for the selected period</option>;
                      } else {
                        return availableSeats.map(seat => (
                          <option key={seat.id} value={seat.id}>
                            Seat {seat.seat_number} (Column {seat.column_number})
                          </option>
                        ));
                      }
                    })()}
                  </select>
                  <div className="flex space-x-3 pt-4">
                    <button type="button" onClick={() => setAssignmentStep(4)} className="btn-secondary flex-1">Back</button>
                    <button 
                      type="button" 
                      onClick={() => setAssignmentStep(6)}
                      disabled={!seatAssignmentForm.seatId}
                      className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next: Amount
                    </button>
                  </div>
                </div>
              )}

              {/* Step 6: Amount */}
              {assignmentStep === 6 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount *</label>
                  <input
                    type="number"
                    required
                    value={seatAssignmentForm.totalAmount}
                    onChange={(e) => setSeatAssignmentForm(prev => ({ ...prev, totalAmount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter amount"
                  />
                  <div className="flex space-x-3 pt-4">
                    <button type="button" onClick={() => setAssignmentStep(5)} className="btn-secondary flex-1">Back</button>
                    <button type="submit" className="btn-primary flex-1">Assign Seat</button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard 