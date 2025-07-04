// socketHandler.js
const users = {};

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("✅ New client connected:", socket.id);
    const userId = socket.handshake.query.userId;
    users[userId] = socket.id;

    socket.on("sendMessage", async (data) => {
      console.log("data: ", data);
      try {
        let { messages, receiverID, senderID } = data;
        const query = `INSERT INTO MESSAGES(message, senderID, receiverID) VALUES(?, ?, ?)`;
        const insertResult = await queryRunner(query, [
          messages,
          senderID,
          receiverID,
        ]);
        if (insertResult[0].affectedRows === 0) {
          return res.status(404).json({
            message: "Failed to send message",
          });
        }
        const receiverSocketId = users[receiverID];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive_message", insertMeesages);
        }
      } catch (err) {
        console.log("error: ", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
      if ((users[userId] = socket.id)) {
        delete users[userId];
      }
      console.log("user disconnect: ", users);
    });
  });
};

module.exports = socketHandler;
