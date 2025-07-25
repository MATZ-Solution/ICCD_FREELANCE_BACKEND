const { queryRunner } = require("../helper/queryRunner");

// SEND NOTIFICATION
exports.sendNotification = async (req, res) => {
  try {
    const { sender_id, receiver_id, title, message, type } = req.body;

    const sql = `
      INSERT INTO notifications (sender_id, receiver_id, title, message, type)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await queryRunner(sql, [
      sender_id,
      receiver_id,
      title,
      message,
      type
    ]);

    const insertedNotification = {
      id: result.insertId,
      sender_id,
      receiver_id,
      title,
      message,
      type,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    req.io.emit(`notify_${receiver_id}`, insertedNotification);

    return res.status(201).json({
      message: "Notification sent successfully!",
      data: insertedNotification
    });

  } catch (error) {
    console.error(" Error sending notification:", error);
    return res.status(500).json({
      error: "Failed to send notification"
    });
  }
};


// GET NOTIFICATIONS FOR USER

exports.getNotifications = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;

    let sql = `
      SELECT n.*, u.name AS sender_name, u.email AS sender_email
      FROM notifications n
      JOIN users u ON n.sender_id = u.id
      WHERE n.receiver_id = ?
    `;

    const params = [id];
    if (type) {
      sql += ` AND n.type = ?`;
      params.push(type);
    }

    sql += ` ORDER BY n.created_at DESC`;

    const [results] = await queryRunner(sql, params);

    return res.status(200).json({
      message: "Notifications fetched successfully.",
      data: results
    });

  } catch (error) {
    console.error(" Error fetching notifications:", error);
    return res.status(500).json({
      error: "Failed to fetch notifications"
    });
  }
};


// COUNT UNREAD MESSAGES
exports.countUnReadMesg = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await queryRunner(
      `SELECT COUNT(*) AS count FROM notifications WHERE receiver_id = ? AND is_read = 0`,
      [userId]
    );
    res.status(200).json({
      message: "success",
      data: result[0]
    });
  } catch (err) {
    console.log("err: ", err)
    return res.status(500).json({
      error: "Failed to count unread messages notifications"
    });
  }

};

// UPDATE READ MESSAGES
exports.updateReadMesg = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await queryRunner(
      `UPDATE notifications SET is_read = 1 WHERE receiver_id = ? AND is_read = 0`,
      [userId]
    );
    res.status(200).json({
      message: "success",
      data: result[0]
    });
  } catch (err) {
    console.log("err: ", err)
    return res.status(500).json({
      error: "Failed to update isRead notifications"
    });
  }

};
