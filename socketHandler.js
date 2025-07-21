const { queryRunner } = require("./helper/queryRunner");

const users = {};

const socketHandler = (io) => {

  io.on("connection", (socket) => {
    console.log(" Socket connected:", socket.id);

    const userId = socket.handshake.query.userId;
    users[userId] = socket.id;

    socket.on("join", (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User joined room: user_${userId}`);
    });

    socket.on("sendMessage", async (data) => {
      console.log("data: ", data);
      try {
        let { senderId, receiverId, messages } = data;
        let query = `INSERT INTO messages(senderId, receiverId, messages) VALUES(?, ?, ?)`;
        const selectResult = await queryRunner(query, [
          senderId,
          receiverId,
          messages,
        ]);

        const receiverSocketId = users[receiverId];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive_message", selectResult[0]);
        }

      } catch (err) {
        console.log("error: ", err);
      }
    });

    socket.on("disconnect", () => {
      console.log(" Socket disconnected:", socket.id);
    });

  });
};

module.exports = socketHandler;
