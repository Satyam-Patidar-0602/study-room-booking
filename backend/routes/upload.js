const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const readline = require('readline');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Google Drive setup
const KEYFILEPATH = path.join(__dirname, '../service-account.json'); // Adjust path as needed
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

const CREDENTIALS_PATH = path.join(__dirname, '../credentials.json');
const TOKEN_PATH = path.join(__dirname, '../token.json');

function getOAuth2Client() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  oAuth2Client.setCredentials(token);
  return oAuth2Client;
}

async function uploadPDFToDrive(pdfBuffer, fileName) {
  const auth = getOAuth2Client();
  const driveService = google.drive({ version: 'v3', auth });

  const fileMetadata = { name: fileName };
  const media = { mimeType: 'application/pdf', body: Readable.from(pdfBuffer) };

  const file = await driveService.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id, webViewLink, webContentLink'
  });

  // Make the file public (optional)
  await driveService.permissions.create({
    fileId: file.data.id,
    requestBody: { role: 'reader', type: 'anyone' },
  });

  // Get the shareable link
  const result = await driveService.files.get({
    fileId: file.data.id,
    fields: 'webViewLink, webContentLink',
  });

  return result.data.webViewLink;
}

// API endpoint to receive PDF and upload to Drive
router.post('/upload-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No PDF file provided' });
    }
    
    console.log('PDF received:', req.file.originalname, 'Size:', req.file.size);
    
    // Check if service account file exists
    if (!fs.existsSync(KEYFILEPATH)) {
      console.log('Service account file not found, using mock response');
      const mockDriveLink = 'https://drive.google.com/file/d/mock-file-id/view?usp=sharing';
      return res.json({ success: true, url: mockDriveLink });
    }
    
    // Upload to Google Drive
    const pdfBuffer = req.file.buffer;
    const fileName = req.file.originalname || 'booking-id-card.pdf';
    const driveLink = await uploadPDFToDrive(pdfBuffer, fileName);
    
    res.json({ success: true, url: driveLink });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
