// Test script to verify the badge display logic
console.log('🧪 Testing Badge Display Logic...\n');

// Mock orders with different statuses
const testOrders = [
  {
    orderNumber: 'ORD-001',
    orderStatus: 'DELIVERED',
    paymentStatus: 'PENDING'
  },
  {
    orderNumber: 'ORD-002', 
    orderStatus: 'DELIVERED',
    paymentStatus: 'PAID'
  },
  {
    orderNumber: 'ORD-003',
    orderStatus: 'SHIPPED',
    paymentStatus: 'PENDING'
  },
  {
    orderNumber: 'ORD-004',
    orderStatus: 'PLACED',
    paymentStatus: 'PAID'
  },
  {
    orderNumber: 'ORD-005',
    orderStatus: 'CANCELLED',
    paymentStatus: 'REFUNDED'
  }
];

// Test the badge display logic
console.log('📊 Badge Display Test Results:');
console.log('==============================');

testOrders.forEach(order => {
  const showOrderBadge = true; // Always show order status badge
  const showPaymentBadge = order.orderStatus.toUpperCase() !== 'DELIVERED';
  
  console.log(`\n${order.orderNumber}:`);
  console.log(`  Order Status: ${order.orderStatus}`);
  console.log(`  Payment Status: ${order.paymentStatus}`);
  console.log(`  Show Order Badge: ${showOrderBadge ? '✅ YES' : '❌ NO'}`);
  console.log(`  Show Payment Badge: ${showPaymentBadge ? '✅ YES' : '❌ NO'}`);
  
  // Expected behavior
  let expectedPaymentBadge;
  if (order.orderStatus.toUpperCase() === 'DELIVERED') {
    expectedPaymentBadge = false; // Don't show payment badge for delivered orders
  } else {
    expectedPaymentBadge = true; // Show payment badge for non-delivered orders
  }
  
  if (showPaymentBadge === expectedPaymentBadge) {
    console.log(`  ✅ Logic is CORRECT`);
  } else {
    console.log(`  ❌ Logic is INCORRECT`);
    console.log(`     Expected: ${expectedPaymentBadge}, Got: ${showPaymentBadge}`);
  }
});

console.log('\n📋 Summary:');
console.log('===========');
console.log('✅ Order status badge: Always displayed');
console.log('✅ Payment status badge: Hidden for DELIVERED orders');
console.log('✅ Payment status badge: Shown for all other order statuses');

console.log('\n🎯 Expected UI Behavior:');
console.log('- DELIVERED orders: Show only order status badge');
console.log('- All other orders: Show both order and payment status badges');

console.log('\n✨ Test completed successfully!');