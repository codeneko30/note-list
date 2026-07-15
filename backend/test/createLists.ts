const TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInBob25lIjoiKzg4MDE3MTIzNDU2NzgiLCJpYXQiOjE3ODQwMzEyOTcsImV4cCI6MTc4NjYyMzI5N30.s7CVB07hROWMSvHhM60j3wG0gM62hMJtbE81yE7goug"

async function testCreateList() {
    try {
      const res = await fetch("http://localhost:4000/api/create-lists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({
          name: "driving",
          icon: "✈️",                          
        }),
      });
  
      const data = await res.json();
  
      console.log("Create List:", res.status, data);
  
      return data.list.id;
    } catch (err) {
      console.error(err);
    }
  }
  testCreateList()
