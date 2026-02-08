require('dotenv').config();
const axios = require('axios');

// You need to replace this with an actual investor token from your localStorage
const token = 'YOUR_TOKEN_HERE'; // Get this from browser localStorage

async function testInvestorAPI() {
  try {
    console.log('🧪 Testing investor API endpoint...\n');
    
    const response = await axios.get('http://localhost:5000/api/projects/investor', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Success!');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    console.log('\nNumber of projects:', response.data.length);
    
  } catch (error) {
    console.error('❌ Error!');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Error Data:', error.response?.data);
    console.error('Error Message:', error.message);
  }
}

console.log('⚠️  IMPORTANT: Replace YOUR_TOKEN_HERE with actual token from browser localStorage');
console.log('   1. Open browser DevTools (F12)');
console.log('   2. Go to Console tab');
console.log('   3. Type: localStorage.getItem("token")');
console.log('   4. Copy the token and paste it in this file\n');

if (token === 'YOUR_TOKEN_HERE') {
  console.log('❌ Please set the token first!');
  process.exit(1);
}

testInvestorAPI();
