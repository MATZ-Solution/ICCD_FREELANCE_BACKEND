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
      type,
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
      data: insertedNotification,
    });
  } catch (error) {
    console.error(" Error sending notification:", error);
    return res.status(500).json({
      error: "Failed to send notification",
    });
  }
};

// GET NOTIFICATIONS FOR USER

exports.getNotifications = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id, type } = req.query;
    console.log("query: ", req.query)

    let sql = `
      SELECT *
      FROM notifications 
      WHERE receiver_id = ?
    `;

    const params = [id];
    if (type) {
      sql += ` AND type = ?`;
      params.push(type);
    }

    sql += ` ORDER BY created_at DESC`;

    const [results] = await queryRunner(sql, params);

    return res.status(200).json({
      message: "Notifications fetched successfully.",
      data: results,
    });
  } catch (error) {
    console.error(" Error fetching notifications:", error);
    return res.status(500).json({
      error: "Failed to fetch notifications",
    });
  }
};

// COUNT UNREAD MESSAGES
exports.countUnReadMesg = async (req, res) => {
  const { userId } = req.user;
  const { id, type } = req.query;
  try {
    const result = await queryRunner(
      `SELECT COUNT(*) AS count FROM notifications WHERE  receiver_id = ? AND type = ? AND is_read = 0`,
      [id, type]
    );
    res.status(200).json({
      message: "success",
      data: [{ count: result[0][0]?.count, type: type }],
    });
  } catch (err) {
    console.log("err: ", err);
    return res.status(500).json({
      error: "Failed to count unread messages notifications",
    });
  }
};

// UPDATE READ MESSAGES
exports.updateReadMesg = async (req, res) => {
  const { userId } = req.user;
  const { id, type } = req.query;

  try {
    const result = await queryRunner(
      `UPDATE notifications SET is_read = 1 WHERE receiver_id = ? AND type = ? AND is_read = 0`,
      [id, type]
    );
    res.status(200).json({
      message: "success",
      data: result[0],
    });
  } catch (err) {
    console.log("err: ", err);
    return res.status(500).json({
      error: "Failed to update isRead notifications",
    });
  }
};
