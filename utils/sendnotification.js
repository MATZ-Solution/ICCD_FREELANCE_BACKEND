const { queryRunner } = require("../helper/queryRunner");

const handleNotifications = async (io, payload) => {
  const { sender_id, receiver_id, title, message, type = "individual" } = payload;

  const query = `
    INSERT INTO notifications (sender_id, receiver_id, title, message, type)
    VALUES (?, ?, ?, ?, ?)
  `;
  await queryRunner(query, [sender_id, receiver_id, title, message, type]);

  const socketId = global.connectedUsers?.[receiver_id];
  if (socketId) {
    io.to(socketId).emit("notification", { title, message });
  }
};

module.exports = handleNotifications
