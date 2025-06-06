const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");

const userRoutes = require('./routes/userRoutes')

const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger/swagger-output.json'); 

const { getConnectionFromPool } = require("./config/connection");
const http = require("http");
const { Server } = require("socket.io");

const app = express(); // Initialize app first
const server = http.createServer(app); // Use http.createServer to create the server

app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors({ credentials: true, origin: "*" }));

app.use((req, res, next) => {
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Pragma", "no-cache");
  res.header("Expires", "0");
  next();
});

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile)); // This comes after app is initialized

app.get("/", (req, res) => {
  res.send("Hello World Power House Backend! 14-4-2025 again 78");
});

getConnectionFromPool();

// Use routes after middlewares
app.use("/", userRoutes);
// app.use("/scout", scoutRoutes);
// app.use("/MeetingMembers", MeetingMembersRoutes);
// app.use("/notify", notificationRoutes);
// app.use("/dashboard", dashboardRoutes);
// app.use("/catalogue", catalogueRoutes);
// app.use("/handshake", handshakeRoutes);

server.listen(2300, () => {
  console.log("Server is running on port 2300");
});
