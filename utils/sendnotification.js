const { queryRunner } = require("../helper/queryRunner");

const handleNotifications = async (io, payload) => {
  const { sender_id, receiver_id, title, message, type } = payload;

  console.log("payload :", payload)

  const query = `
    INSERT INTO notifications (sender_id, receiver_id, title, message, type)
    VALUES (?, ?, ?, ?, ?)
  `;
  await queryRunner(query, [sender_id, receiver_id, title, message, type]);

  io.to(`user_${receiver_id}`).emit("notification", { type });
};

module.exports = handleNotifications
