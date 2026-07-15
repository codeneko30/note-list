// ============================================
// TEST: POST /api/auth/login
// ============================================

async function testLogin() {
    console.log("🔹 Testing Login...");
  
    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: '+8801712345678',
          password: '123456'
        })
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${data.error || JSON.stringify(data)}`);
      }
  
      console.log("✅ Login Success:", data);
      return data.token; // Save token for authenticated requests
  
    } catch (error) {
      console.error("❌ Login Failed:", error.message);
      throw error;
    }
  }
  
  // Run test
  testLogin();