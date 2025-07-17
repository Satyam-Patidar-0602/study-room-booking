import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isAfter, isBefore, isEqual, parseISO, addMonths, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TABS = ['Bookings', 'Seats', 'Expenses', 'Students'];
const OWNERS = ['Owner 1', 'Owner 2', 'Owner 3', 'Owner 4', 'Owner 5'];
const BOOKINGS_PER_PAGE = 10;

const DURATION_FILTERS = [
  { label: 'Full Time', value: 'fulltime' },
  { label: 'Morning/Evening', value: '4hours' },
];

const SEAT_NUMBERS = Array.from({ length: 22 }, (_, i) => i + 1);
const SUBSCRIPTION_LABELS = {
  '1': '1 Month',
  '0.5': '15 Days',
  'full': 'Full',
  '4': '4 Hours',
};

const AdminDashboard = () => {
  const [tab, setTab] = useState('Bookings');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);
  const [expenses, setExpenses] = useState([]);
  const [expenseForm, setExpenseForm] = useState({ amount: '', bill: null, description: '', owner: OWNERS[0] });
  const [expenseError, setExpenseError] = useState('');
  const navigate = useNavigate();
  const [seatsFilter, setSeatsFilter] = useState('fulltime');

  useEffect(() => {
    if (localStorage.getItem('admin_logged_in') !== 'true') {
      navigate('/admin');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/bookings');
        const data = await res.json();
        if (data.success) {
          setBookings(data.data);
        } else {
          setError(data.error || 'Failed to fetch bookings');
        }
      } catch (err) {
        setError('Failed to fetch bookings');
      }
      setLoading(false);
    };
    fetchBookings();
  }, []);

  // Helper to get expiry date
  function getExpiryDate(startDate, subscriptionPeriod) {
    if (!startDate) return null;
    const date = parseISO(startDate);
    if (subscriptionPeriod === '1') return addMonths(date, 1);
    if (subscriptionPeriod === '0.5') return addDays(date, 15);
    return date; // fallback
  }

  // Today's date in yyyy-MM-dd
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  // A booking is current if start_date <= today <= expiry_date
  const currentBookings = bookings
    .filter(b => {
      const start = parseISO(b.start_date);
      const expiry = getExpiryDate(b.start_date, b.subscription_period);
      return (isBefore(start, today) || isEqual(start, today)) && (isAfter(expiry, today) || isEqual(expiry, today));
    })
    .sort((a, b) => a.id - b.id);
  const pastBookings = bookings
    .filter(b => {
      const expiry = getExpiryDate(b.start_date, b.subscription_period);
      return isBefore(expiry, today);
    })
    .sort((a, b) => a.id - b.id);

  // Pagination logic for current and past bookings
  const totalCurrentPages = Math.ceil(currentBookings.length / BOOKINGS_PER_PAGE);
  const totalPastPages = Math.ceil(pastBookings.length / BOOKINGS_PER_PAGE);
  const paginatedCurrentBookings = currentBookings.slice((currentPage - 1) * BOOKINGS_PER_PAGE, currentPage * BOOKINGS_PER_PAGE);
  const paginatedPastBookings = pastBookings.slice((pastPage - 1) * BOOKINGS_PER_PAGE, pastPage * BOOKINGS_PER_PAGE);

  // Unique students from bookings
  const students = Array.from(
    bookings.reduce((acc, b) => {
      acc.set(b.user_email, {
        name: b.user_name,
        email: b.user_email,
        phone: b.user_phone,
      });
      return acc;
    }, new Map()).values()
  );

  // Bookings for today (for seat allocation): any booking where today is in [start_date, expiry_date]
  const todaysBookings = bookings.filter(b => {
    const start = parseISO(b.start_date);
    const expiry = getExpiryDate(b.start_date, b.subscription_period);
    return (isBefore(start, today) || isEqual(start, today)) && (isAfter(expiry, today) || isEqual(expiry, today));
  });
  // Filtered bookings for seats tab
  const filteredSeatsBookings = todaysBookings.filter(b =>
    seatsFilter === 'fulltime' ? b.duration_type !== '4hours' : b.duration_type === '4hours'
  );
  // Map seat number to booking info for today
  const seatMap = SEAT_NUMBERS.map(seatNum => {
    const booking = filteredSeatsBookings.find(b => Number(b.seat_number) === seatNum);
    return {
      seatNum,
      booked: !!booking,
      name: booking ? booking.user_name : '-',
      email: booking ? booking.user_email : '-',
      phone: booking ? booking.user_phone : '-',
      duration: booking ? (booking.duration_type === '4hours' ? 'Morning/Evening' : 'Full Time') : '-',
      subscription: booking ? (SUBSCRIPTION_LABELS[booking.subscription_period] || booking.subscription_period) : '-',
      expiry: booking ? format(getExpiryDate(booking.start_date, booking.subscription_period), 'yyyy-MM-dd') : '-',
    };
  });

  // Expense form handlers
  const handleExpenseChange = (e) => {
    const { name, value, files } = e.target;
    setExpenseForm(f => ({
      ...f,
      [name]: files ? files[0] : value
    }));
  };
  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    setExpenseError('');
    if (!expenseForm.amount || !expenseForm.description || !expenseForm.owner) {
      setExpenseError('All fields except bill are required.');
      return;
    }
    setExpenses(prev => [
      { ...expenseForm, id: Date.now(), billName: expenseForm.bill ? expenseForm.bill.name : '' },
      ...prev
    ]);
    setExpenseForm({ amount: '', bill: null, description: '', owner: OWNERS[0] });
  };

  // For Morning/Evening seat assignment
  const morningEveningBookings = filteredSeatsBookings;
  // Get all assigned seat numbers for today (4-hour bookings)
  const assignedSeatNumbers = morningEveningBookings.map(b => Number(b.seat_number)).filter(Boolean);
  // Available seats for assignment
  const availableSeats = SEAT_NUMBERS.filter(num => !assignedSeatNumbers.includes(num));

  // Handler to assign/update seat
  const handleAssignSeat = async (bookingId, seatNumber) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/assign-seat`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seatNumber })
      });
      const data = await res.json();
      if (data.success) {
        // Refresh bookings
        const res2 = await fetch('/api/bookings');
        const data2 = await res2.json();
        if (data2.success) setBookings(data2.data);
      } else {
        alert(data.error || 'Failed to assign seat');
      }
    } catch (err) {
      alert('Failed to assign seat');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="flex flex-wrap gap-2 mb-8">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                if (t === 'Bookings') { setCurrentPage(1); setPastPage(1); }
              }}
              className={`px-4 py-2 rounded font-semibold shadow-sm transition-colors duration-150 ${tab === t ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-primary-100'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="bg-white rounded shadow p-4 md:p-6">
          {loading && <div>Loading...</div>}
          {error && <div className="text-red-600 mb-4">{error}</div>}
          {!loading && !error && tab === 'Bookings' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Current Bookings (Today)</h2>
              <div className="overflow-x-auto mb-4 rounded border border-gray-200">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-2 py-1">ID</th>
                      <th className="border px-2 py-1">Name</th>
                      <th className="border px-2 py-1">Email</th>
                      <th className="border px-2 py-1">Phone</th>
                      <th className="border px-2 py-1">Seat</th>
                      <th className="border px-2 py-1">Date</th>
                      <th className="border px-2 py-1">Expiry</th>
                      <th className="border px-2 py-1">Time</th>
                      <th className="border px-2 py-1">Duration</th>
                      <th className="border px-2 py-1">Subscription</th>
                      <th className="border px-2 py-1">Amount</th>
                      <th className="border px-2 py-1">Status</th>
                      <th className="border px-2 py-1">Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCurrentBookings.map(b => (
                      <tr key={b.id}>
                        <td className="border px-2 py-1">{b.id}</td>
                        <td className="border px-2 py-1">{b.user_name}</td>
                        <td className="border px-2 py-1">{b.user_email}</td>
                        <td className="border px-2 py-1">{b.user_phone}</td>
                        <td className="border px-2 py-1">{b.seat_number || '-'}</td>
                        <td className="border px-2 py-1">{b.start_date}</td>
                        <td className="border px-2 py-1">{format(getExpiryDate(b.start_date, b.subscription_period), 'yyyy-MM-dd')}</td>
                        <td className="border px-2 py-1">{b.start_time}</td>
                        <td className="border px-2 py-1">{b.duration_type === '4hours' ? 'Morning/Evening' : 'Full Time'}</td>
                        <td className="border px-2 py-1">{SUBSCRIPTION_LABELS[b.subscription_period] || b.subscription_period}</td>
                        <td className="border px-2 py-1">₹{b.total_amount}</td>
                        <td className="border px-2 py-1">{b.status}</td>
                        <td className="border px-2 py-1">{b.payment_status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col md:flex-row justify-between items-center gap-2 mb-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-1 px-3 py-1 rounded border border-gray-300 bg-white shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${currentPage === 1 ? '' : 'hover:bg-primary-50'}`}
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <span className="font-medium">Page {currentPage} of {totalCurrentPages || 1}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalCurrentPages, p + 1))}
                  disabled={currentPage === totalCurrentPages || totalCurrentPages === 0}
                  className={`flex items-center gap-1 px-3 py-1 rounded border border-gray-300 bg-white shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${currentPage === totalCurrentPages || totalCurrentPages === 0 ? '' : 'hover:bg-primary-50'}`}
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <h2 className="text-xl font-semibold mb-4">Past Bookings</h2>
              <div className="overflow-x-auto mb-4 rounded border border-gray-200">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-2 py-1">ID</th>
                      <th className="border px-2 py-1">Name</th>
                      <th className="border px-2 py-1">Email</th>
                      <th className="border px-2 py-1">Phone</th>
                      <th className="border px-2 py-1">Seat</th>
                      <th className="border px-2 py-1">Date</th>
                      <th className="border px-2 py-1">Expiry</th>
                      <th className="border px-2 py-1">Time</th>
                      <th className="border px-2 py-1">Duration</th>
                      <th className="border px-2 py-1">Subscription</th>
                      <th className="border px-2 py-1">Amount</th>
                      <th className="border px-2 py-1">Status</th>
                      <th className="border px-2 py-1">Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPastBookings.map(b => (
                      <tr key={b.id}>
                        <td className="border px-2 py-1">{b.id}</td>
                        <td className="border px-2 py-1">{b.user_name}</td>
                        <td className="border px-2 py-1">{b.user_email}</td>
                        <td className="border px-2 py-1">{b.user_phone}</td>
                        <td className="border px-2 py-1">{b.seat_number || '-'}</td>
                        <td className="border px-2 py-1">{b.start_date}</td>
                        <td className="border px-2 py-1">{format(getExpiryDate(b.start_date, b.subscription_period), 'yyyy-MM-dd')}</td>
                        <td className="border px-2 py-1">{b.start_time}</td>
                        <td className="border px-2 py-1">{b.duration_type === '4hours' ? 'Morning/Evening' : 'Full Time'}</td>
                        <td className="border px-2 py-1">{SUBSCRIPTION_LABELS[b.subscription_period] || b.subscription_period}</td>
                        <td className="border px-2 py-1">₹{b.total_amount}</td>
                        <td className="border px-2 py-1">{b.status}</td>
                        <td className="border px-2 py-1">{b.payment_status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col md:flex-row justify-between items-center gap-2 mb-8">
                <button
                  onClick={() => setPastPage(p => Math.max(1, p - 1))}
                  disabled={pastPage === 1}
                  className={`flex items-center gap-1 px-3 py-1 rounded border border-gray-300 bg-white shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${pastPage === 1 ? '' : 'hover:bg-primary-50'}`}
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <span className="font-medium">Page {pastPage} of {totalPastPages || 1}</span>
                <button
                  onClick={() => setPastPage(p => Math.min(totalPastPages, p + 1))}
                  disabled={pastPage === totalPastPages || totalPastPages === 0}
                  className={`flex items-center gap-1 px-3 py-1 rounded border border-gray-300 bg-white shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${pastPage === totalPastPages || totalPastPages === 0 ? '' : 'hover:bg-primary-50'}`}
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          {!loading && !error && tab === 'Seats' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Current Seat Allocations (Today)</h2>
              <div className="mb-4">
                <label className="font-semibold mr-2">Filter by Duration:</label>
                <select value={seatsFilter} onChange={e => setSeatsFilter(e.target.value)} className="border px-2 py-1 rounded">
                  {DURATION_FILTERS.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
              <div className="overflow-x-auto rounded border border-gray-200">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-2 py-1">Seat Number</th>
                      <th className="border px-2 py-1">Status</th>
                      <th className="border px-2 py-1">Name</th>
                      <th className="border px-2 py-1">Email</th>
                      <th className="border px-2 py-1">Phone</th>
                      <th className="border px-2 py-1">Duration</th>
                      <th className="border px-2 py-1">Subscription</th>
                      <th className="border px-2 py-1">Expiry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seatMap.map(seat => (
                      <tr key={seat.seatNum}>
                        <td className="border px-2 py-1">{seat.seatNum}</td>
                        <td className="border px-2 py-1">{seat.booked ? 'Booked' : 'Available'}</td>
                        <td className="border px-2 py-1">{seat.name}</td>
                        <td className="border px-2 py-1">{seat.email}</td>
                        <td className="border px-2 py-1">{seat.phone}</td>
                        <td className="border px-2 py-1">{seat.duration}</td>
                        <td className="border px-2 py-1">{seat.subscription}</td>
                        <td className="border px-2 py-1">{seat.expiry}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {!loading && !error && tab === 'Seats' && seatsFilter === '4hours' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Morning/Evening Seat Assignment (Today)</h2>
              <div className="overflow-x-auto rounded border border-gray-200">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-2 py-1">Name</th>
                      <th className="border px-2 py-1">Email</th>
                      <th className="border px-2 py-1">Phone</th>
                      <th className="border px-2 py-1">Assigned Seat</th>
                      <th className="border px-2 py-1">Assign/Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {morningEveningBookings.map(b => (
                      <tr key={b.id}>
                        <td className="border px-2 py-1">{b.user_name}</td>
                        <td className="border px-2 py-1">{b.user_email}</td>
                        <td className="border px-2 py-1">{b.user_phone}</td>
                        <td className="border px-2 py-1">{b.seat_number || '-'}</td>
                        <td className="border px-2 py-1">
                          <select
                            value={b.seat_number || ''}
                            onChange={e => handleAssignSeat(b.id, Number(e.target.value))}
                            className="border px-2 py-1 rounded"
                          >
                            <option value="">Select seat</option>
                            {/* Show all available seats + current assigned seat */}
                            {[...(b.seat_number ? [Number(b.seat_number)] : []), ...availableSeats]
                              .filter((v, i, arr) => arr.indexOf(v) === i)
                              .sort((a, b) => a - b)
                              .map(num => (
                                <option key={num} value={num}>{num}</option>
                              ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {!loading && !error && tab === 'Students' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Student Info (Past & Present)</h2>
              <div className="overflow-x-auto rounded border border-gray-200">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-2 py-1">Name</th>
                      <th className="border px-2 py-1">Email</th>
                      <th className="border px-2 py-1">Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, i) => (
                      <tr key={i}>
                        <td className="border px-2 py-1">{s.name}</td>
                        <td className="border px-2 py-1">{s.email}</td>
                        <td className="border px-2 py-1">{s.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {!loading && !error && tab === 'Expenses' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Expenses (5 Partners)</h2>
              <form className="mb-6" onSubmit={handleExpenseSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block font-semibold mb-1">Amount</label>
                    <input type="number" name="amount" value={expenseForm.amount} onChange={handleExpenseChange} className="w-full border px-3 py-2 rounded" required />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Upload Bill</label>
                    <input type="file" name="bill" onChange={handleExpenseChange} className="w-full" accept="image/*,application/pdf" />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Description</label>
                    <input type="text" name="description" value={expenseForm.description} onChange={handleExpenseChange} className="w-full border px-3 py-2 rounded" required />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Done By</label>
                    <select name="owner" value={expenseForm.owner} onChange={handleExpenseChange} className="w-full border px-3 py-2 rounded">
                      {OWNERS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
                {expenseError && <div className="text-red-600 mb-2">{expenseError}</div>}
                <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">Submit</button>
              </form>
              <div className="overflow-x-auto rounded border border-gray-200">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-2 py-1">Amount</th>
                      <th className="border px-2 py-1">Bill</th>
                      <th className="border px-2 py-1">Description</th>
                      <th className="border px-2 py-1">Done By</th>
                      <th className="border px-2 py-1">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map(e => (
                      <tr key={e.id}>
                        <td className="border px-2 py-1">₹{e.amount}</td>
                        <td className="border px-2 py-1">{e.billName ? e.billName : '-'}</td>
                        <td className="border px-2 py-1">{e.description}</td>
                        <td className="border px-2 py-1">{e.owner}</td>
                        <td className="border px-2 py-1">{format(new Date(e.id), 'yyyy-MM-dd HH:mm')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 