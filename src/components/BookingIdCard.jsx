import React from 'react';
import { User } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { format } from 'date-fns';

const BookingIdCard = ({ bookingDetails }) => {
  if (!bookingDetails) return null;
  const name = bookingDetails.name ? String(bookingDetails.name) : 'N/A';
  const email = bookingDetails.email ? String(bookingDetails.email) : 'N/A';
  const phone = bookingDetails.phone ? String(bookingDetails.phone) : 'N/A';
  let seats = 'N/A';
  if (Array.isArray(bookingDetails.seats) && bookingDetails.seats.length > 0) {
    seats = bookingDetails.seats
      .map(seatId => typeof seatId === 'number' ? `Seat ${seatId}` : seatId)
      .join(', ');
  } else if (typeof bookingDetails.seats === 'number') {
    seats = `Seat ${bookingDetails.seats}`;
  } else if (typeof bookingDetails.seats === 'string') {
    seats = bookingDetails.seats;
  }
  const durationLabel =
    bookingDetails.duration === '4'
      ? '4 Hours(Morning/Evening)'
      : bookingDetails.duration === 'full'
      ? 'Full Time'
      : 'Custom Duration';
  const totalAmount = bookingDetails.totalAmount ? `₹${bookingDetails.totalAmount}` : 'N/A';
  const bookingDate = bookingDetails.date
    ? (typeof bookingDetails.date === 'string'
        ? bookingDetails.date
        : format(new Date(bookingDetails.date), 'dd/MM/yyyy'))
    : 'N/A';
  const cardId = bookingDetails.cardId || `SP${Math.random().toString().substr(2, 8).toUpperCase()}`;
  const bookingNumber = bookingDetails.bookingNumber || `BK${Math.random().toString().substr(2, 6)}`;
  const qrValue = bookingDetails.qrValue || 'https://studypointlibrary.vercel.app/';
  const getExpiryDate = (startDate, subscriptionPeriod) => {
    const start = new Date(startDate)
    const days = subscriptionPeriod === '0.5' ? 15 : 30
    const expiry = new Date(start)
    expiry.setDate(start.getDate() + days)
    return format(expiry, 'dd/MM/yyyy')
  }
  const expiryDate = bookingDetails.expiryDate || (bookingDetails.date && bookingDetails.subscriptionPeriod
    ? getExpiryDate(bookingDetails.date, bookingDetails.subscriptionPeriod)
    : 'N/A');

  return (
    <div className="mb-8 bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-blue-500 relative max-w-xl mx-auto" style={{ width: 480 }}>
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
          <div className="bg-green-50 p-3 rounded-lg border border-green-200 max-w-sm">
            <label className="text-xs font-bold text-green-700 uppercase">Duration</label>
            <p className="text-xs font-semibold text-gray-800 break-words whitespace-normal leading-snug">{durationLabel}</p>
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
    </div>
  );
};

export default BookingIdCard; 