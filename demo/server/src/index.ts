import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { createReadStream } from 'fs';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Path to the large JSON file
const largeJsonFilePath = path.join(__dirname, '../large-data.json');

// Large JSON streaming endpoint
app.get('/stream-json', (req, res) => {
  console.log('New JSON streaming connection established');

  // Check if the large JSON file exists
  if (!fs.existsSync(largeJsonFilePath)) {
    res.status(404).json({
      error: 'Large JSON file not found',
      path: largeJsonFilePath
    });
    return;
  }

  // Set streaming headers
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control',
    'Transfer-Encoding': 'chunked'
  });

  // Create a readable stream from the file with smaller chunks
  const fileStream = createReadStream(largeJsonFilePath, { 
    encoding: 'utf8',
    highWaterMark: 64 // Small chunks of 64 bytes
  });
  
  let chunkCount = 0;
  const delayMs = 200; // 200ms delay between chunks
  
  // Handle stream events
  fileStream.on('data', (chunk) => {
    chunkCount++;
    
    // Add delay before writing each chunk
    setTimeout(() => {
      res.write(chunk);
      console.log(`Sent chunk ${chunkCount}, size: ${chunk.length} bytes`);
    }, chunkCount * delayMs);
  });

  fileStream.on('end', () => {
    // Wait for the last chunk to be sent before ending
    setTimeout(() => {
      console.log(`JSON file streaming completed - sent ${chunkCount} chunks`);
      res.end();
    }, (chunkCount + 1) * delayMs);
  });

  fileStream.on('error', (error) => {
    console.error('Error streaming JSON file:', error);
    res.status(500).json({
      error: 'Error streaming JSON file',
      message: error.message
    });
  });

  // Handle client disconnect
  req.on('close', () => {
    console.log('JSON streaming connection closed');
    fileStream.destroy();
  });

  req.on('error', (error) => {
    console.error('JSON streaming connection error:', error);
    fileStream.destroy();
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint with instructions
app.get('/', (req, res) => {
  const largeJsonExists = fs.existsSync(largeJsonFilePath);
  const largeJsonSize = largeJsonExists ? fs.statSync(largeJsonFilePath).size : 0;
  
  res.json({
    message: 'SSE Test Server',
    endpoints: {
      '/stream-json': 'Stream large JSON file from filesystem',
      '/health': 'Health check endpoint'
    },
    stats: {
      largeJsonFile: {
        exists: largeJsonExists,
        size: largeJsonSize,
        path: largeJsonFilePath
      }
    }
  });
});

app.listen(PORT, () => {
  console.log(`SSE Test Server running on http://localhost:${PORT}`);
  console.log(`SSE endpoint: http://localhost:${PORT}/sse`);
  console.log(`JSON streaming endpoint: http://localhost:${PORT}/stream-json`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  
  const largeJsonExists = fs.existsSync(largeJsonFilePath);
  if (largeJsonExists) {
    const largeJsonSize = fs.statSync(largeJsonFilePath).size;
    console.log(`Large JSON file available: ${largeJsonSize} bytes`);
  } else {
    console.log('Large JSON file not found - /stream-json endpoint will return 404');
  }
});
