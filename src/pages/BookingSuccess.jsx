import { useEffect, useState, useRef } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'

import { format } from 'date-fns'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import axios from 'axios';
import { 
  CheckCircle, 
  User, 
  Download,
  ArrowLeft,
  Home,
  Shield
} from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { getUploadUrl, getFallbackUrl } from '../config/urls'
import BookingIdCard from '../components/BookingIdCard'

const BookingSuccess = () => {
  const location = useLocation()
  const [bookingDetails, setBookingDetails] = useState(null)
  const cardRef = useRef(null)
  const hiddenCardRef = useRef(null) // NEW: for hidden PDF rendering
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    if (location.state?.bookingDetails) {
      setBookingDetails(location.state.bookingDetails)
    } else {
      setBookingDetails({
        name: 'Demo User',
        email: 'demo@example.com',
        phone: '+91 98765 43210',
        date: new Date(),
        duration: '4',
        seats: ['Owner Allocated'],
        totalAmount: 300,
        subscriptionPeriod: '1month'
      })
    }
  }, [location])

  // 1. Add useEffect to auto-generate and upload PDF after bookingDetails is set
  useEffect(() => {
    if (!bookingDetails) return;
    (async () => {
      if (!hiddenCardRef.current) return; // Use hidden card
      
      // Get the booking details for PDF generation
      const name = bookingDetails.name ? String(bookingDetails.name) : 'N/A';
      const email = bookingDetails.email ? String(bookingDetails.email) : 'N/A';
      const phone = bookingDetails.phone ? String(bookingDetails.phone) : 'N/A';
      const seats = Array.isArray(bookingDetails.seats) ? bookingDetails.seats.join(', ') : (bookingDetails.seats || 'N/A');
      const totalAmount = bookingDetails.totalAmount ? `₹${bookingDetails.totalAmount}` : 'N/A';
      const bookingDate = bookingDetails.date
        ? (typeof bookingDetails.date === 'string'
            ? bookingDetails.date
            : format(new Date(bookingDetails.date), 'dd/MM/yyyy'))
        : 'N/A';
      
      // Calculate expiry date
      const getExpiryDate = (startDate, subscriptionPeriod) => {
        const start = new Date(startDate)
        const days = subscriptionPeriod === '0.5' ? 15 : 30
        const expiry = new Date(start)
        expiry.setDate(start.getDate() + days)
        return format(expiry, 'dd/MM/yyyy')
      }
      const expiryDate = bookingDetails.date && bookingDetails.subscriptionPeriod
        ? getExpiryDate(bookingDetails.date, bookingDetails.subscriptionPeriod)
        : 'N/A';
      
      // Generate PDF from card
      const canvas = await html2canvas(hiddenCardRef.current, { backgroundColor: null, scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = 120;
      const imgHeight = (canvas.height / canvas.width) * imgWidth;
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;
      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      
      // Convert PDF to Blob
      const pdfBlob = pdf.output('blob');
      const formData = new FormData();
      formData.append('pdf', pdfBlob, 'booking-id-card.pdf');
      
      // Upload to backend
      try {
        const response = await axios.post('/api/upload-pdf', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        if (response.data.success) {
          setPdfUrl(response.data.url);
          
          // Call backend to send email with PDF
          await axios.post('/api/send-booking-email', {
            email: email,
            name: name,
            pdfUrl: response.data.url,
            bookingDetails: {
              name, 
              email, 
              phone, 
              seats, 
              bookingDate, 
              expiryDate, 
              totalAmount
            }
          });
          
        }
      } catch (err) {
        console.error('PDF upload or email error:', err);
      }
    })();
    // eslint-disable-next-line
  }, [bookingDetails]);

  // 2. In handleDownloadIDCard, just download the PDF (no upload logic)
  const handleDownloadIDCard = async () => {
    if (!hiddenCardRef.current) return;
    const canvas = await html2canvas(hiddenCardRef.current, { backgroundColor: null, scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = 120;
    const imgHeight = (canvas.height / canvas.width) * imgWidth;
    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;
    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
    pdf.save('StudyPoint_IDCard.pdf');
  };

  if (!bookingDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Booking Found</h1>
          <p className="text-gray-600 mb-6">Please complete a booking to view your ID card.</p>
          <Link to="/booking" className="btn-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go to Booking
          </Link>
        </div>
      </div>
    )
  }

  // Prepare display values for the card
  const name = bookingDetails.name ? String(bookingDetails.name) : 'N/A';
  const email = bookingDetails.email ? String(bookingDetails.email) : 'N/A';
  const phone = bookingDetails.phone ? String(bookingDetails.phone) : 'N/A';
  const seats = Array.isArray(bookingDetails.seats) ? bookingDetails.seats.join(', ') : (bookingDetails.seats || 'N/A');
  const durationLabel =
    bookingDetails.duration === '4'
      ? '4 Hours (Morning/Evening)'
      : bookingDetails.duration === 'full'
      ? 'Full Time'
      : 'Custom Duration';
  const totalAmount = bookingDetails.totalAmount ? `₹${bookingDetails.totalAmount}` : 'N/A';
  const bookingDate = bookingDetails.date
    ? (typeof bookingDetails.date === 'string'
        ? bookingDetails.date
        : format(new Date(bookingDetails.date), 'dd/MM/yyyy'))
    : 'N/A';
  const issuedDate = format(new Date(), 'dd/MM/yyyy');
  const cardId = `SP${Math.random().toString().substr(2, 8).toUpperCase()}`;
  const bookingNumber = `BK${Math.random().toString().substr(2, 6)}`;

  // QR code data: use the uploaded PDF link if available, otherwise fallback
  const qrValue = pdfUrl || getFallbackUrl();

  // Calculate expiry date based on booking date and subscription period
  const getExpiryDate = (startDate, subscriptionPeriod) => {
    const start = new Date(startDate)
    const days = subscriptionPeriod === '0.5' ? 15 : 30
    const expiry = new Date(start)
    expiry.setDate(start.getDate() + days)
    return format(expiry, 'dd/MM/yyyy')
  }
  const expiryDate = bookingDetails.date && bookingDetails.subscriptionPeriod
    ? getExpiryDate(bookingDetails.date, bookingDetails.subscriptionPeriod)
    : 'N/A';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      {/* Hidden card for PDF generation only */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0, width: 480 }}>
        <div ref={hiddenCardRef}>
          <BookingIdCard bookingDetails={bookingDetails} />
        </div>
      </div>
      {/* Visible content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4"
          >
            <CheckCircle className="w-8 h-8 text-green-600" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Confirmed! 🎉
          </h1>
          <p className="text-lg text-gray-600">
            Your Study Point Library ID Card is ready
          </p>
        </motion.div>
        {/* ID Card Display - this is what will be exported */}
        <motion.div
          ref={cardRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8 bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-blue-500 relative max-w-xl mx-auto"
          style={{ width: 480 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/10 to-pink-400/20 pointer-events-none"></div>
          <div className="absolute inset-0 opacity-5">
            <div className="grid grid-cols-20 gap-1">
              {Array.from({ length: 400 }).map((_, i) => (
                <div key={i} className="w-1 h-1 bg-blue-500 rounded-full"></div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">SP</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold">STUDY POINT LIBRARY</h2>
                  <p className="text-xs opacity-90">JIRAN - BOOKING ID CARD</p>
                  <p className="text-xs opacity-90">Contact: thestudypointlibraryjeeran@gmail.com</p>
                </div>
              </div>
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                ACTIVE
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="w-24 h-32 bg-gray-200 rounded-lg border-2 border-blue-300 flex items-center justify-center">
                  <div className="text-center">
                    <User className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                    <span className="text-xs text-gray-500 font-bold">PHOTO</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <label className="text-xs font-bold text-blue-600 uppercase">Card ID</label>
                    <p className="text-sm font-mono text-gray-800">{cardId}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <label className="text-xs font-bold text-blue-600 uppercase">Booking No</label>
                    <p className="text-sm font-mono text-gray-800">{bookingNumber}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <label className="text-xs font-bold text-gray-600 uppercase">Full Name</label>
                  <p className="text-sm font-semibold text-gray-800">{name}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <label className="text-xs font-bold text-gray-600 uppercase">Email Address</label>
                  <p className="text-sm text-gray-800">{email}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <label className="text-xs font-bold text-gray-600 uppercase">Phone Number</label>
                  <p className="text-sm text-gray-800">{phone}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <label className="text-xs font-bold text-yellow-700 uppercase">Booking Date</label>
                <p className="text-sm font-semibold text-gray-800">{bookingDate}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <label className="text-xs font-bold text-green-700 uppercase">Duration</label>
                <p className="text-sm font-semibold text-gray-800">{durationLabel}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <label className="text-xs font-bold text-purple-700 uppercase">Seat(s)</label>
                <p className="text-sm font-semibold text-gray-800">{seats}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <label className="text-xs font-bold text-red-700 uppercase">Amount</label>
                <p className="text-sm font-semibold text-gray-800">{totalAmount}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 col-span-2 md:col-span-4">
                <label className="text-xs font-bold text-blue-700 uppercase">Expiry Date</label>
                <p className="text-base font-bold text-blue-900">{expiryDate}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              {/* Real QR code for booking info */}
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center border-2 border-blue-200">
                <QRCodeCanvas value={qrValue} size={56} level="M" includeMargin={false} />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 text-xs">
            <div className="flex flex-col md:flex-row justify-between items-center gap-2 md:gap-0">
              <div>
                <p>Established: July 10th, 2023 - First Library in Jiran</p>
                <p>Valid until: {expiryDate}</p>
              </div>
              <div className="text-right">
                <p>SECURITY FEATURES:</p>
                <p>Holographic Strip • UV Ink • QR Code</p>
              </div>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={handleDownloadIDCard}
            className="btn-primary flex items-center justify-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Download ID Card (PDF)
          </button>
          <Link to="/booking" className="btn-secondary flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Book Another Seat
          </Link>
          <Link to="/" className="btn-secondary flex items-center justify-center">
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Important Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-semibold mb-2">📋 What to Bring:</h4>
              <ul className="space-y-1">
                <li>• This ID card (digital or printed)</li>
                <li>• Valid government ID for verification</li>
                <li>• Payment receipt (if not paid online)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">⏰ Arrival Instructions:</h4>
              <ul className="space-y-1">
                <li>• Arrive 10 minutes before your session</li>
                <li>• Show this ID card to the staff</li>
                <li>• Seats will be allocated by the owner</li>
                <li>• Follow library rules and regulations</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BookingSuccess; 