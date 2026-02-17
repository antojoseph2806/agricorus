#!/usr/bin/env node

/**
 * Pre-test server availability checker
 * Verifies that frontend and backend servers are running before tests
 */

const http = require('http');
const https = require('https');
require('dotenv').config();

const config = {
  frontend: process.env.BASE_URL || 'http://localhost:5173',
  backend: process.env.API_BASE_URL || 'http://localhost:5000/api'
};

function checkUrl(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'GET',
      timeout: 5000
    };

    const req = protocol.request(options, (res) => {
      resolve({
        success: true,
        status: res.statusCode,
        url: url
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message,
        url: url
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Connection timeout',
        url: url
      });
    });

    req.end();
  });
}

async function checkServers() {
  console.log('🔍 Checking server availability...\n');

  const frontendResult = await checkUrl(config.frontend);
  const backendResult = await checkUrl(config.backend);

  console.log('Frontend Server:', config.frontend);
  if (frontendResult.success) {
    console.log('  ✅ Status:', frontendResult.status);
  } else {
    console.log('  ❌ Error:', frontendResult.error);
  }

  console.log('\nBackend Server:', config.backend);
  if (backendResult.success) {
    console.log('  ✅ Status:', backendResult.status);
  } else {
    console.log('  ❌ Error:', backendResult.error);
  }

  console.log('\n' + '='.repeat(50));

  if (frontendResult.success && backendResult.success) {
    console.log('✅ All servers are running! You can proceed with tests.');
    process.exit(0);
  } else {
    console.log('❌ Some servers are not running. Please start them before running tests.\n');
    
    if (!frontendResult.success) {
      console.log('To start frontend:');
      console.log('  cd frontend && npm run dev\n');
    }
    
    if (!backendResult.success) {
      console.log('To start backend:');
      console.log('  cd backend && npm start\n');
    }
    
    process.exit(1);
  }
}

checkServers();
