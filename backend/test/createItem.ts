
const TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInBob25lIjoiKzg4MDE3MTIzNDU2NzgiLCJpYXQiOjE3ODQwMzEyOTcsImV4cCI6MTc4NjYyMzI5N30.s7CVB07hROWMSvHhM60j3wG0gM62hMJtbE81yE7goug"

const listId = 4
async function testCreateItem() {
    try {
      const res = await fetch("http://localhost:4000/api/create-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({
          listId,
          title: "soft drinks",
          notes: "4 liters",
        }),
      });
  
      const data = await res.json();
  
      console.log("Create Item:", res.status, data);
  
      return data.item.id;
    } catch (err) {
      console.error(err);
    }
  }
  testCreateItem()