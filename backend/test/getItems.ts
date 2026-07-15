const TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInBob25lIjoiKzg4MDE3MTIzNDU2NzgiLCJpYXQiOjE3ODQwMzEyOTcsImV4cCI6MTc4NjYyMzI5N30.s7CVB07hROWMSvHhM60j3wG0gM62hMJtbE81yE7goug"



const listId=1

async function testGetItems() {
    try {
      const res = await fetch(
        `http://localhost:4000/api/items?listId=${listId}`,
        {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );
  
      const data = await res.json();
  
      console.log("Items:", res.status, data);
    } catch (err) {
      console.error(err);
    }
  }

  testGetItems()