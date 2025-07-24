import { getBaseUrl } from '../config/urls';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';
import React from 'react';
import { createRoot } from 'react-dom/client';
import BookingIdCard from '../components/BookingIdCard'; // You may need to extract the card from BookingSuccess.jsx


/**
 * bookingDetails: {
 *   name, email, phone, seats, totalAmount, date, duration, subscriptionPeriod
 * }
 * email: string
 * onComplete: function (optional)
 */
export async function sendBookingIdCardPDF({ bookingDetails, email, onComplete }) {
  // 1. Create a hidden DOM node for rendering the card
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  document.body.appendChild(container);

  // Format seat(s) for display
  let seatInfo = 'N/A';
  if (Array.isArray(bookingDetails.seats) && bookingDetails.seats.length > 0) {
    seatInfo = bookingDetails.seats.map(seatId => `Seat ${seatId}`).join(', ');
  } else if (typeof bookingDetails.seats === 'number' || typeof bookingDetails.seats === 'string') {
    seatInfo = `Seat ${bookingDetails.seats}`;
  }

  // 2. Render the card with fallback QR (will update after upload)
  const root = createRoot(container);
  root.render(<BookingIdCard bookingDetails={{ ...bookingDetails, seats: seatInfo, qrValue: undefined }} />);
  await new Promise(resolve => setTimeout(resolve, 300));

  // 3. Generate initial PDF (not used, but keeps logic consistent)
  const cardNode = container.firstChild;
  let canvas = await html2canvas(cardNode, { backgroundColor: null, scale: 2 });
  let imgData = canvas.toDataURL('image/png');
  let pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  let pageWidth = pdf.internal.pageSize.getWidth();
  let pageHeight = pdf.internal.pageSize.getHeight();
  let imgWidth = 120;
  let imgHeight = (canvas.height / canvas.width) * imgWidth;
  let x = (pageWidth - imgWidth) / 2;
  let y = (pageHeight - imgHeight) / 2;
  pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);

  // 4. Upload PDF
  const pdfBlob = pdf.output('blob');
  const formData = new FormData();
  formData.append('pdf', pdfBlob, 'booking-id-card.pdf');
  const uploadRes = await axios.post(`${getBaseUrl()}/api/upload-pdf`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  if (!uploadRes.data.success) throw new Error('PDF upload failed');
  const pdfUrl = uploadRes.data.url;

  // 5. Re-render the card with the real PDF URL for the QR code
  root.render(<BookingIdCard bookingDetails={{ ...bookingDetails, seats: seatInfo, qrValue: pdfUrl }} />);
  await new Promise(resolve => setTimeout(resolve, 300));

  // 6. Regenerate the PDF with the correct QR code
  const cardNode2 = container.firstChild;
  canvas = await html2canvas(cardNode2, { backgroundColor: null, scale: 2 });
  imgData = canvas.toDataURL('image/png');
  pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  pageWidth = pdf.internal.pageSize.getWidth();
  pageHeight = pdf.internal.pageSize.getHeight();
  imgWidth = 120;
  imgHeight = (canvas.height / canvas.width) * imgWidth;
  x = (pageWidth - imgWidth) / 2;
  y = (pageHeight - imgHeight) / 2;
  pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);

  // 7. Send email with the correct PDF URL and seat info
  await axios.post(`${getBaseUrl()}/api/upload-pdf/send-booking-email`, {
    email,
    name: bookingDetails.name,
    pdfUrl,
    bookingDetails: {
      ...bookingDetails,
      seats: seatInfo,
      qrValue: pdfUrl,
      bookingDate: bookingDetails.date,
      expiryDate: bookingDetails.expiryDate,
      totalAmount: bookingDetails.totalAmount,
    },
  });

  // 8. Cleanup
  root.unmount();
  document.body.removeChild(container);
  if (onComplete) onComplete();
} 