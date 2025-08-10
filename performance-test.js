// Performance test for multiple concurrent users
const BASE_URL = 'http://localhost:5000/api';

async function testConcurrentReads(numUsers = 10) {
  console.log(`🧪 Testing ${numUsers} concurrent read requests...`);
  const startTime = Date.now();
  
  const promises = Array.from({ length: numUsers }, (_, i) => 
    fetch(`${BASE_URL}/experiences?page=1&limit=20`)
      .then(res => res.json())
      .then(data => ({
        userId: i + 1,
        success: true,
        experienceCount: data.experiences?.length || 0,
        totalCount: data.pagination?.total || 0
      }))
      .catch(error => ({
        userId: i + 1,
        success: false,
        error: error.message
      }))
  );
  
  const results = await Promise.all(promises);
  const endTime = Date.now();
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Results: ${successful} successful, ${failed} failed`);
  console.log(`⏱️  Total time: ${endTime - startTime}ms`);
  console.log(`📊 Average time per request: ${(endTime - startTime) / numUsers}ms`);
  
  if (successful > 0) {
    console.log(`📈 Sample response: ${results.find(r => r.success).experienceCount} experiences returned`);
  }
  
  return { successful, failed, totalTime: endTime - startTime };
}

async function runPerformanceTests() {
  console.log('🚀 Starting PlacedIn Performance Tests for University Presentation\n');
  
  try {
    // Test health endpoint
    console.log('1️⃣ Testing server health...');
    const health = await fetch(`${BASE_URL}/health`).then(res => res.json());
    console.log(`✅ Server status: ${health.status}\n`);
    
    // Test concurrent reads (simulating multiple students viewing experiences)
    console.log('2️⃣ Testing concurrent reads (students viewing experiences)');
    await testConcurrentReads(10);
    console.log();
    
    // Test concurrent reads with higher load
    console.log('3️⃣ Testing higher concurrent reads (demo scenario)');
    await testConcurrentReads(20);
    console.log();
    
    console.log('🎉 Performance tests completed! Ready for university presentation.');
    
  } catch (error) {
    console.error('❌ Performance test failed:', error.message);
  }
}

// Run the tests
runPerformanceTests();
