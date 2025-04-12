const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const Stock = require('../../models/Stock');
const auth = require('../../middleware/auth');

// Configure multer for file upload with more robust settings
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, '../../uploads');
      // Create uploads directory if it doesn't exist
      if (!fs.existsSync(uploadDir)){
        fs.mkdirSync(uploadDir);
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    // Allow only csv and txt files
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv') || file.originalname.endsWith('.txt')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and TXT files are allowed'), false);
    }
  }
});

router.post('/upload', auth, upload.single('file'), async (req, res) => {
  console.log('File Upload Received:', req.file);

  if (!req.file) {
    console.error('No file uploaded');
    return res.status(400).json({ 
      msg: 'No file uploaded',
      error: 'File upload failed' 
    });
  }

  const results = [];
  const filePath = req.file.path;

  try {
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv({
          separator: ',',  // Changed from '\t' to ',' to accept comma-separated values
          headers: ['Date', 'series', 'OPEN', 'HIGH', 'LOW', 'PREV. CLOSE', 'ltp', 'close', 'vwap', '52W H', '52W L', 'VOLUME', 'VALUE', 'No of trades'],
          strict: true,
          skipLines: 1
        }))
        .on('data', (data) => {
          if (data.OPEN && data.close) {
            results.push(data);
          }
        })
        .on('end', () => {
          console.log(`Processed ${results.length} rows`);
          resolve();
        })
        .on('error', (err) => {
          console.error('CSV Parsing Error:', err);
          reject(err);
        });
    });

    const processedData = processStockData(results);
    console.log('Processed Data:', JSON.stringify(processedData, null, 2));

    // Save to database
    const savedStocks = [];
    for (const stock of processedData) {
      const savedStock = await Stock.findOneAndUpdate(
        { symbol: stock.symbol },
        stock,
        { upsert: true, new: true }
      );
      savedStocks.push(savedStock);
    }

    // Delete the uploaded file
    fs.unlinkSync(filePath);

    res.status(200).json({ 
      msg: 'Stock data uploaded successfully', 
      count: processedData.length,
      details: savedStocks
    });

  } catch (err) {
    console.error('Complete Upload Error:', err);
    
    // Clean up file if it exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    res.status(500).json({ 
      msg: 'Upload failed', 
      error: err.message || 'Unexpected server error',
      fullError: err
    });
  }
});

function processStockData(csvData) {
  try {
    const stockMap = {};
    const defaultSymbol = 'EQ';
    const defaultName = 'Equity Stock';

    csvData.forEach((row, index) => {
      // Skip invalid rows
      if (!row.OPEN) {
        console.log(`Skipping row ${index} due to missing OPEN value`);
        return;
      }

      // Initialize stock if it doesn't exist
      if (!stockMap[defaultSymbol]) {
        stockMap[defaultSymbol] = {
          symbol: defaultSymbol,
          name: defaultName,
          price: parseFloat(row.close) || 0,
          change: parseFloat(row.close) - parseFloat(row['PREV. CLOSE']) || 0,
          changePercent: ((parseFloat(row.close) - parseFloat(row['PREV. CLOSE'])) / parseFloat(row['PREV. CLOSE']) * 100) || 0,
          sector: 'Equity',
          marketCap: 0,
          prices: []
        };
      }

      // Clean volume by removing non-numeric characters
      const cleanVolume = row.VOLUME.replace(/[^\d]/g, '');

      // Add price data
      stockMap[defaultSymbol].prices.push({
        date: row.Date || new Date().toISOString().split('T')[0],
        open: parseFloat(row.OPEN) || 0,
        high: parseFloat(row.HIGH) || 0,
        close: parseFloat(row.close) || 0,
        low: parseFloat(row.LOW) || 0,
        volume: parseInt(cleanVolume) || 0
      });
    });

    return Object.values(stockMap);
  } catch (error) {
    console.error('Process Stock Data Error:', error);
    throw error;
  }
}

module.exports = router;