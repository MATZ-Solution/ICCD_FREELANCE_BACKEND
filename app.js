const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const socketHandler = require('./socketHandler')

const userRoutes = require('./routes/userRoutes')
const projectRoutes = require('./routes/projectRoutes')
const gigsRoutes = require('./routes/gigsRoutes')
const freelancerRoutes = require('./routes/freelancerRoutes')
const orderRoutes = require('./routes/orderRoutes')
const clientRoutes = require('./routes/clientRoutes')
const stripeRoutes = require('./routes/stripe');
const notificationRoutes = require('./routes/notificationRoutes');
const jobRoutes = require('./routes/jobRoutes');
const messageRoutes = require('./routes/messageRoutes');
const superadminRoutes = require('./routes/superadminRoutes');
const disputeRoutes = require('./routes/disputeRoute');
const ratingRoutes = require('./routes/ratingsRoute');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger/swagger-output.json'); 

const { getConnectionFromPool } = require("./config/connection");
const http = require("http");
const { Server } = require("socket.io");

const app = express(); 
const server = http.createServer(app); 

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
app.set('io', io);
socketHandler(io)

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
  res.send("Hello World ICCD FREELANCE PLATFORM! 11-08-2025 again 1");
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
app.use('/superadmin', superadminRoutes);
app.use('/dispute', disputeRoutes);
app.use('/rating', ratingRoutes);


// app.use("/webhook", webhookRoute);

app.use("/notifications", notificationRoutes);
app.use("/messages", messageRoutes);


// local connection
// server.listen(2300,() => {
//   console.log("Server is running on port 2300");
// });

// live connection
server.listen(22306,() => {
  console.log("Server is running on port 22306");
});


