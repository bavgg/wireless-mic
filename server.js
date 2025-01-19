const express = require("express");
const { createServer } = require("https"); // Use https instead of http
const fs = require("fs");
const { Server } = require("socket.io");

// Read your SSL certificate and key
const options = {
  key: fs.readFileSync("server.key"),
  cert: fs.readFileSync("server.crt"),
};

const app = express();
const server = createServer(options, app); // Create an HTTPS server
const io = new Server(server);
let activeDevices = new Set();

app.use(express.static("public"));

function findPlatform(userAgent) {
  if (/mac/i.test(userAgent)) {
    return "mac";
  } else if (/android/i.test(userAgent)) {
    return "android";
  }
}

io.on("connection", (socket) => {
  console.log("A user connected");
  

  const userAgent = socket.request.headers["user-agent"];

  device = findPlatform(userAgent);
  activeDevices.add(device);
  console.log(activeDevices)

  if (activeDevices.has("android")) {
    socket.emit("phone");
  }

  // Handle offer
  socket.on("offer", (offer) => {
    console.log("Offer received");
    socket.broadcast.emit("offer", offer); // Broadcast the offer to other peers
  });

  // Handle answer
  socket.on("answer", (answer) => {
    console.log("Answer received");
    socket.broadcast.emit("answer", answer); // Broadcast the answer to other peers
  });

  socket.on("disconnect", () => {
    const userAgent = socket.request.headers["user-agent"];
    currentDevice = findPlatform(userAgent)

    activeDevices.delete(currentDevice);
    
    console.log("A user disconnected");
    // socket.broadcast.emit("disconnected")
  });
});

server.listen(3000, () => {
  console.log("Server started at port: 3000 (HTTPS)");
});
