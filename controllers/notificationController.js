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

    // Emit real-time notification via Socket.IO
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
    const { userId } = req.user;
    const { type } = req.query;

    let sql = `
      SELECT n.*, u.name AS sender_name, u.email AS sender_email
      FROM notifications n
      JOIN users u ON n.sender_id = u.id
      WHERE n.receiver_id = ?
    `;

    const params = [userId];
    if (type) {
      sql += ` AND n.type IN (?, 'all')`;
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


// MARK NOTIFICATION AS READ
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = ?
    `;

    const [result] = await queryRunner(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Notification not found."
      });
    }

    return res.status(200).json({
      message: "Notification marked as read."
    });

  } catch (error) {
    console.error(" Error marking notification as read:", error);
    return res.status(500).json({
      error: "Failed to mark notification as read."
    });
  }
};