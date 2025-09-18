// Import the express package
const express = require('express');
// Create an instance of the express application
const app = express();
// Define the port the server will run on
const port = 3000;

// Serve static files from the 'frontend' directory
app.use(express.static('frontend'));

// Start the server and listen for incoming requests
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});