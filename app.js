const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const socketHandler = require('./utils/socketHandler')

const userRoutes = require('./routes/userRoutes')
const projectRoutes = require('./routes/projectRoutes')
const gigsRoutes = require('./routes/gigsRoutes')
const freelancerRoutes = require('./routes/freelancerRoutes')
const orderRoutes = require('./routes/orderRoutes')
const clientRoutes = require('./routes/clientRoutes')
const stripeRoutes = require('./routes/stripe');
const notificationRoutes = require('./routes/notificationRoutes');
const jobRoutes = require('./routes/jobRoutes');


const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger/swagger-output.json'); 

const { getConnectionFromPool } = require("./config/connection");
const http = require("http");
const { Server } = require("socket.io");

const app = express(); // Initialize app first
const server = http.createServer(app); // Use http.createServer to create the server

// ✅ Initialize socket.io on the server
const io = new Server(server, {
  cors: {
    origin: '*', // Update with frontend origin in production
    methods: ['GET', 'POST'],
  },
});

//  Socket connection and room handling
io.on("connection", (socket) => {
  console.log(" Socket connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User joined room: user_${userId}`);
  });

  socket.on("disconnect", () => {
    console.log(" Socket disconnected:", socket.id);
  });
});

//  Attach io to every request
app.use((req, res, next) => {
  req.io = io;
  next();
});

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
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile)); // This comes after app is initialized

app.get("/", (req, res) => {
  res.send("Hello World Power House Backend! 14-4-2025 again 78");
});

getConnectionFromPool();

// Use routes after middlewares
app.use("/", userRoutes);
app.use("/project", projectRoutes);
app.use("/job", jobRoutes);
app.use("/gigs", gigsRoutes);
app.use("/freelancer", freelancerRoutes);
app.use("/order", orderRoutes);
app.use("/client", clientRoutes);
app.use("/stripe", stripeRoutes);
app.use("/notifications", notificationRoutes);

server.listen(2300, () => {
  console.log("Server is running on port 2300");
});
