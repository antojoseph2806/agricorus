// Test script for the enhanced review system with photo uploads
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';

// Test configuration
const testConfig = {
  token: 'your-buyer-jwt-token-here', // Replace with actual buyer token
  orderId: 'your-order-id-here',      // Replace with actual delivered order ID
  productId: 'your-product-id-here'   // Replace with actual product ID
};

async function testReviewSystem() {
  console.log('🧪 Testing Enhanced Review System with Photo Upload...\n');

  const headers = {
    'Authorization': `Bearer ${testConfig.token}`,
    'Content-Type': 'application/json'
  };

  try {
    // Test 1: Get existing reviews for a product
    console.log('📊 Testing GET /reviews/product/:productId...');
    const reviewsResponse = await fetch(`${BASE_URL}/reviews/product/${testConfig.productId}?page=1&limit=5&sortBy=newest`, {
      headers: { ...headers, 'Content-Type': undefined }
    });
    
    if (reviewsResponse.ok) {
      const reviewsData = await reviewsResponse.json();
      console.log('✅ Product reviews endpoint working!');
      console.log(`📈 Found ${reviewsData.data?.stats?.totalReviews || 0} reviews`);
      console.log(`⭐ Average rating: ${reviewsData.data?.stats?.averageRating || 0}/5`);
    } else {
      console.log('❌ Product reviews endpoint failed:', reviewsResponse.status);
    }

    // Test 2: Get buyer's reviews for an order
    console.log('\n📋 Testing GET /reviews/order/:orderId...');
    const orderReviewsResponse = await fetch(`${BASE_URL}/reviews/order/${testConfig.orderId}`, { headers });
    
    if (orderReviewsResponse.ok) {
      const orderReviewsData = await orderReviewsResponse.json();
      console.log('✅ Order reviews endpoint working!');
      console.log(`📝 Found ${orderReviewsData.data?.length || 0} reviews for this order`);
    } else {
      console.log('❌ Order reviews endpoint failed:', orderReviewsResponse.status);
    }

    // Test 3: Create a sample review (without photos for testing)
    console.log('\n📝 Testing POST /reviews (text-only review)...');
    const reviewData = {
      orderId: testConfig.orderId,
      productId: testConfig.productId,
      rating: 5,
      comment: 'Test review from automated script - excellent product!'
    };

    const createReviewResponse = await fetch(`${BASE_URL}/reviews`, {
      method: 'POST',
      headers,
      body: JSON.stringify(reviewData)
    });

    if (createReviewResponse.ok) {
      const createReviewData = await createReviewResponse.json();
      console.log('✅ Review creation endpoint working!');
      console.log(`📝 Created review with ID: ${createReviewData.data?._id}`);
      
      // Test 4: Vote on the created review
      if (createReviewData.data?._id) {
        console.log('\n👍 Testing POST /reviews/:reviewId/vote...');
        const voteResponse = await fetch(`${BASE_URL}/reviews/${createReviewData.data._id}/vote`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ voteType: 'helpful' })
        });

        if (voteResponse.ok) {
          const voteData = await voteResponse.json();
          console.log('✅ Review voting endpoint working!');
          console.log(`👍 Helpful votes: ${voteData.data?.helpfulVotes || 0}`);
        } else {
          console.log('❌ Review voting endpoint failed:', voteResponse.status);
        }
      }
    } else {
      const errorData = await createReviewResponse.json();
      console.log('❌ Review creation failed:', createReviewResponse.status);
      console.log('📄 Error message:', errorData.message);
    }

    // Test 5: Photo upload endpoint (standalone)
    console.log('\n📸 Testing POST /reviews/upload-photos...');
    
    // Create a simple test image file (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00,
      0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33,
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    const formData = new FormData();
    formData.append('reviewPhotos', testImageBuffer, {
      filename: 'test-image.png',
      contentType: 'image/png'
    });

    const uploadResponse = await fetch(`${BASE_URL}/reviews/upload-photos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testConfig.token}`
      },
      body: formData
    });

    if (uploadResponse.ok) {
      const uploadData = await uploadResponse.json();
      console.log('✅ Photo upload endpoint working!');
      console.log(`📸 Uploaded ${uploadData.data?.files?.length || 0} files`);
    } else {
      const uploadError = await uploadResponse.json();
      console.log('❌ Photo upload endpoint failed:', uploadResponse.status);
      console.log('📄 Error message:', uploadError.message);
    }

  } catch (error) {
    console.error('🚫 Test failed:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   1. Backend server is running on port 5000');
    console.log('   2. You have a valid buyer JWT token');
    console.log('   3. The order is delivered and 7+ days old');
    console.log('   4. Database is connected and has sample data');
    console.log('   5. The product exists and is part of the order');
  }
}

// Helper function to create test data
function printTestDataInstructions() {
  console.log('\n📋 To run this test, you need:');
  console.log('1. A valid buyer JWT token (farmer/landowner/investor)');
  console.log('2. An order ID that is DELIVERED and 7+ days old');
  console.log('3. A product ID that is part of that order');
  console.log('\n🔧 Update the testConfig object with your actual values:');
  console.log('   - token: Get from login response or browser localStorage');
  console.log('   - orderId: From your orders collection');
  console.log('   - productId: From the order items');
  console.log('\n🚀 Then run: node test-review-system.js');
}

// Check if test config is set up
if (testConfig.token === 'your-buyer-jwt-token-here') {
  printTestDataInstructions();
} else {
  testReviewSystem();
}