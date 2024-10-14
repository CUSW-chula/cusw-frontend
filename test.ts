// WebSocket client for testing the /ws endpoint
const ws = new WebSocket("ws://localhost:4000/api/comments/ws");

// Event: Connection opened
ws.onopen = () => {
  console.log("Connected to WebSocket server");

  // Send a test comment message to the WebSocket server
  const message = {
    content: "This is a comment from Bun HTTP",
    authorId: "cm24ll4370008kh59coznldal",
    taskId: "cm24lq0sx0001jkpdbc9lxu8x",
  };

  // Send message to the server
  ws.send(JSON.stringify(message));
  console.log("SUCCESS");
};

// Event: Message received from the server
ws.onmessage = (event) => {
  console.log("Message from server:", event.data);
};

// Event: Error
ws.onerror = (err) => {
  console.error("WebSocket error:", err);
};

// Event: Connection closed
ws.onclose = () => {
  console.log("WebSocket connection closed");
};

// Function to test HTTP POST request
// async function testPostComment() {
//   const url = "http://localhost:4000/comments"; // URL of your API
//   const body = {
//     content: "This is a comment from Bun HTTP",
//     authorId: "cm24ll4370008kh59coznldal",
//     taskId: "cm24lq0sx0001jkpdbc9lxu8x",
//   };

//   try {
//     // Send POST request to the /comments endpoint
//     const response = await fetch(url, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(body),
//     });

//     // Parse the JSON response
//     const result = await response.json();
//     console.log("Response from POST /comments:", result);
//   } catch (error) {
//     console.error("Error in POST /comments:", error);
//   }
// }

// // Run the POST test
// testPostComment();
