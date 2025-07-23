const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for local file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const originalName = file.originalname || 'booking-id-card.pdf';
    cb(null, `booking-${timestamp}-${originalName}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// API endpoint to receive PDF and save locally
router.post('/upload-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No PDF file provided' });
    }
    
    // Create a URL for the file (works in both dev and production)
    // Use FRONTEND_URL or BASE_URL in production, fallback to localhost
    const baseUrl = process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL || process.env.BASE_URL || 'https://yourdomain.com'
      : 'http://localhost:3001';
    const localUrl = `${baseUrl}/uploads/${path.basename(req.file.path)}`;
    
    res.json({ 
      success: true, 
      url: localUrl,
      localPath: req.file.path,
      message: 'PDF saved locally'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Send booking confirmation email with PDF attachment
router.post('/send-booking-email', async (req, res) => {
  try {
    const { email, name, pdfUrl, bookingDetails } = req.body;
    if (!email || !pdfUrl) {
      return res.status(400).json({ success: false, error: 'Missing email or pdfUrl' });
    }

    let pdfBuffer;
    
    // If we have a local PDF file, read it
    if (pdfUrl.includes('localhost') || pdfUrl.includes('uploads')) {
      const fileName = path.basename(pdfUrl);
      const pdfPath = path.join(uploadsDir, fileName);
      
      if (fs.existsSync(pdfPath)) {
        pdfBuffer = fs.readFileSync(pdfPath);
      } else {
        // console.log('PDF file not found locally, will create a new one');
      }
    }
    
    // If we don't have a PDF buffer, we need to create one
    if (!pdfBuffer) {
      // console.log('Creating PDF with booking details:', bookingDetails);
      // For now, create a simple text-based PDF or use a template
      // You might want to implement PDF generation here
      return res.status(400).json({ 
        success: false, 
        error: 'PDF generation not implemented. Please ensure PDF is uploaded first.' 
      });
    }

    // Set up Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'thestudypointlibraryjeeran@gmail.com',
        pass: process.env.SMTP_PASS,
      },
    });

    // Compose email
    const mailOptions = {
      from: `Study Point Library <${process.env.SMTP_USER || 'thestudypointlibraryjeeran@gmail.com'}>`,
      to: email,
      subject: 'Your Study Point Library Booking Confirmation',
      text:
        `Dear ${name},\n\n` +
        `Thank you for booking your seat at Study Point Library Jiran!\n\n` +
        `Please find your booking ID card attached as a PDF.\n\n` +
        `Booking Details:\n` +
        `Name: ${bookingDetails?.name || ''}\n` +
        `Seat(s): ${bookingDetails?.seats || ''}\n` +
        `Booking Date: ${bookingDetails?.bookingDate || ''}\n` +
        `Expiry Date: ${bookingDetails?.expiryDate || ''}\n` +
        `Amount: ${bookingDetails?.totalAmount || ''}\n\n` +
        `If you have any questions, contact us at thestudypointlibraryjeeran@gmail.com.\n\n` +
        `Best regards,\n` +
        `Study Point Library Jiran\n` +
        `Jiran, Neemuch District, Madhya Pradesh\n` +
        `Contact: thestudypointlibraryjeeran@gmail.com\n`,
      attachments: [
        {
          filename: 'StudyPoint_IDCard.pdf',
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve uploaded files
router.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);
  
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

module.exports = router;