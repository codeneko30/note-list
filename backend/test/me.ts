// ============================================
// TEST: GET /api/auth/me
// ============================================

// Replace with actual token from login/register
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInBob25lIjoiKzg4MDE3MTIzNDU2NzgiLCJpYXQiOjE3ODQwMzEyOTcsImV4cCI6MTc4NjYyMzI5N30.s7CVB07hROWMSvHhM60j3wG0gM62hMJtbE81yE7goug"

async function testMe() {
  console.log("🔹 Testing Me (Protected)...");

  try {
    const response = await fetch('http://localhost:4000/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.message || JSON.stringify(data)}`);
    }

    console.log("✅ Me Success:", data);
    return data;

  } catch (error) {
    console.error("❌ Me Failed:", error.message);
    throw error;
  }
}

// Run test
testMe();