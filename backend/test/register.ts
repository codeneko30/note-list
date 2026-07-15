// ============================================
// TEST: POST /api/auth/register
// ============================================

async function testRegister() {
    console.log("🔹 Testing Register...");
  
    try {
      const response = await fetch('http://localhost:4000/api/auth/register', {
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
  
      console.log("✅ Register Success:", data);
      return data.token; // Save token for later use
  
    } catch (error) {
      console.error("❌ Register Failed:", error.message);
      throw error;
    }
  }
  
  // Run test
  testRegister();