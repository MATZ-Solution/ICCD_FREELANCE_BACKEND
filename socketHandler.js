const { queryRunner } = require("./helper/queryRunner");

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);
    const userId = socket.handshake.query.userId;

    socket.join(`user_${userId}`);
    socket.on("sendMessage", async (data) => {
      console.log("Received data: ", data);
      try {
        const { senderId, receiverId, messages } = data;
        console.log("data: ", data)
        const insertQuery = `
          INSERT INTO messages(senderId, receiverId, messages)
          VALUES (?, ?, ?)
        `;
        const insertResult = await queryRunner(insertQuery, [
          senderId,
          receiverId,
          messages,
        ]);

        const message = {
          messageId: insertResult.insertId,
          senderId,
          receiverId,
          messages,
          created_at: new Date().toISOString(),
        };
        io.to(`user_${receiverId}`).emit("receive_message", message);
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
