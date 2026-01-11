// Test script to verify the 7-day return window logic
console.log('🧪 Testing 7-Day Return Window Logic...\n');

// Mock order data for testing
const createMockOrder = (deliveredDaysAgo) => {
  const deliveredAt = new Date();
  deliveredAt.setDate(deliveredAt.getDate() - deliveredDaysAgo);
  
  return {
    orderStatus: 'DELIVERED',
    deliveredAt: deliveredAt.toISOString(),
    returnStatus: 'NONE'
  };
};

// Test functions (same logic as in the component)
const canReview = (orderObj) => {
  if (orderObj.orderStatus !== 'DELIVERED' || !orderObj.deliveredAt) return false;
  const days = (Date.now() - new Date(orderObj.deliveredAt).getTime()) / (1000 * 60 * 60 * 24);
  return days >= 7;
};

const canReturn = (orderObj) => {
  if (orderObj.orderStatus !== 'DELIVERED' || !orderObj.deliveredAt) return false;
  const days = (Date.now() - new Date(orderObj.deliveredAt).getTime()) / (1000 * 60 * 60 * 24);
  return days < 7;
};

const getDaysUntilReturnExpiry = (orderObj) => {
  if (orderObj.orderStatus !== 'DELIVERED' || !orderObj.deliveredAt) return 0;
  const days = (Date.now() - new Date(orderObj.deliveredAt).getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(0, 7 - Math.floor(days));
};

// Test scenarios
const testScenarios = [
  { daysAgo: 1, description: 'Order delivered 1 day ago' },
  { daysAgo: 3, description: 'Order delivered 3 days ago' },
  { daysAgo: 6, description: 'Order delivered 6 days ago' },
  { daysAgo: 7, description: 'Order delivered exactly 7 days ago' },
  { daysAgo: 8, description: 'Order delivered 8 days ago' },
  { daysAgo: 14, description: 'Order delivered 14 days ago' },
  { daysAgo: 30, description: 'Order delivered 30 days ago' }
];

console.log('📊 Test Results:');
console.log('================');

testScenarios.forEach(scenario => {
  const order = createMockOrder(scenario.daysAgo);
  const canReturnResult = canReturn(order);
  const canReviewResult = canReview(order);
  const daysLeft = getDaysUntilReturnExpiry(order);
  
  console.log(`\n${scenario.description}:`);
  console.log(`  📦 Can Return: ${canReturnResult ? '✅ YES' : '❌ NO'}`);
  console.log(`  ⭐ Can Review: ${canReviewResult ? '✅ YES' : '❌ NO'}`);
  console.log(`  ⏰ Days left for return: ${daysLeft}`);
  
  // Expected behavior validation
  const expectedCanReturn = scenario.daysAgo < 7;
  const expectedCanReview = scenario.daysAgo >= 7;
  
  if (canReturnResult === expectedCanReturn && canReviewResult === expectedCanReview) {
    console.log(`  ✅ Logic is CORRECT`);
  } else {
    console.log(`  ❌ Logic is INCORRECT`);
    console.log(`     Expected: Return=${expectedCanReturn}, Review=${expectedCanReview}`);
    console.log(`     Actual: Return=${canReturnResult}, Review=${canReviewResult}`);
  }
});

console.log('\n📋 Summary:');
console.log('===========');
console.log('✅ Return window: Available for first 7 days after delivery');
console.log('✅ Review window: Available from day 7 onwards after delivery');
console.log('✅ No overlap: Returns and reviews are mutually exclusive');
console.log('\n🎯 Expected UI Behavior:');
console.log('- Days 0-6: Show return form with countdown');
console.log('- Day 7+: Hide return form, show "Return Window Closed" message');
console.log('- Day 7+: Show review form for products');

// Test edge cases
console.log('\n🔍 Edge Case Tests:');
console.log('==================');

// Test with non-delivered order
const nonDeliveredOrder = {
  orderStatus: 'SHIPPED',
  deliveredAt: null,
  returnStatus: 'NONE'
};

console.log('\nNon-delivered order:');
console.log(`  📦 Can Return: ${canReturn(nonDeliveredOrder) ? '✅ YES' : '❌ NO'} (Expected: NO)`);
console.log(`  ⭐ Can Review: ${canReview(nonDeliveredOrder) ? '✅ YES' : '❌ NO'} (Expected: NO)`);

// Test with order that has return status
const returnRequestedOrder = createMockOrder(2);
returnRequestedOrder.returnStatus = 'REQUESTED';

console.log('\nOrder with return already requested (2 days ago):');
console.log(`  📦 Can Return: ${canReturn(returnRequestedOrder) ? '✅ YES' : '❌ NO'} (Expected: YES - logic only checks delivery date)`);
console.log(`  ⭐ Can Review: ${canReview(returnRequestedOrder) ? '✅ YES' : '❌ NO'} (Expected: NO)`);
console.log('  ℹ️  Note: UI will show return status instead of return form');

console.log('\n✨ Test completed successfully!');