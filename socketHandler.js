const { queryRunner } = require("./helper/queryRunner");

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    const userId = socket.handshake.query.userId;
    // Join user-specific room (supports multiple devices/tabs)
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room: user_${userId}`);

    socket.on("sendMessage", async (data) => {
      console.log("Received data: ", data);

      try {
        const { senderId, receiverId, messages } = data;

        const insertQuery = `
          INSERT INTO messages(senderId, receiverId, messages)
          VALUES (?, ?, ?)
        `;
        const insertResult = await queryRunner(insertQuery, [
          senderId,
          receiverId,
          messages,
        ]);

        // Build the message object to send
        const message = {
          messageId: insertResult.insertId,
          senderId,
          receiverId,
          messages,
          created_at: new Date().toISOString(),
        };

        // Emit message to receiver's room (covers all their devices)
        io.to(`user_${receiverId}`).emit("receive_message", message);

        // Optional: Echo message to sender's devices too (to update sender UI instantly)
        // io.to(`user_${senderId}`).emit("message_sent", message);

      } catch (err) {
        console.error("Message sending error:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};

module.exports = socketHandler;
