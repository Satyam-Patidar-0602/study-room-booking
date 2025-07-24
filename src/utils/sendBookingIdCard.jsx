import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';
import React from 'react';
import { createRoot } from 'react-dom/client';
import BookingIdCard from '../components/BookingIdCard'; // You may need to extract the card from BookingSuccess.jsx
import { getBaseUrl } from '../config/urls';

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

  // 2. Render the card
  const root = createRoot(container);
  root.render(<BookingIdCard bookingDetails={bookingDetails} />);

  // 3. Wait for render
  await new Promise(resolve => setTimeout(resolve, 500));

  // 4. Generate PDF from card
  const cardNode = container.firstChild;
  const canvas = await html2canvas(cardNode, { backgroundColor: null, scale: 2 });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = 120;
  const imgHeight = (canvas.height / canvas.width) * imgWidth;
  const x = (pageWidth - imgWidth) / 2;
  const y = (pageHeight - imgHeight) / 2;
  pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);

  // 5. Upload PDF
  const pdfBlob = pdf.output('blob');
  const formData = new FormData();
  formData.append('pdf', pdfBlob, 'booking-id-card.pdf');
  const uploadRes = await axios.post(`${getBaseUrl()}/api/upload-pdf`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  if (!uploadRes.data.success) throw new Error('PDF upload failed');
  const pdfUrl = uploadRes.data.url;

  // 6. Send email
  await axios.post(`${getBaseUrl()}/api/upload-pdf/send-booking-email`, {
    email,
    name: bookingDetails.name,
    pdfUrl,
    bookingDetails: {
      ...bookingDetails,
      seats: Array.isArray(bookingDetails.seats) ? bookingDetails.seats.join(', ') : bookingDetails.seats,
      bookingDate: bookingDetails.date,
      expiryDate: bookingDetails.expiryDate,
      totalAmount: bookingDetails.totalAmount,
    },
  });

  // 7. Cleanup
  root.unmount();
  document.body.removeChild(container);
  if (onComplete) onComplete();
} 