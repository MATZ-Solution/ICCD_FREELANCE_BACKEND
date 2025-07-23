const { queryRunner } = require("../helper/queryRunner");

exports.addMessageByUser = async (req, res) => {
  const { senderId, receiverId, messages } = req.body;
  try {
    let query = `INSERT INTO messages(senderId, receiverId, messages) VALUES(?, ?, ?)`;
    const selectResult = await queryRunner(query, [
      senderId,
      receiverId,
      messages,
    ]);
    if (selectResult[0].affectedRows > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Message sent successfully",
      });
    } else {
      res.status(200).json({
        data: [],
        message: "Failed to sent messages",
      });
    }
  } catch (error) {
    console.error("Query error: ", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to sent messages",
      error: error.message,
    });
  }
};


exports.getAllMessageByUser = async (req, res) => {
  const { userId } = req.user;
  try {
    const query = `
     SELECT 
    m1.messageId AS message_id,
    m1.messages,
    m1.senderId,
    m1.receiverId,
    m1.created_at,
    IF(m1.senderId = ?, m1.receiverId, m1.senderId) AS chat_partner_id,
    u.name AS chat_partner_name
    FROM messages m1
    JOIN (
      SELECT 
          LEAST(senderId, receiverId) AS userA,
          GREATEST(senderId, receiverId) AS userB,
          MAX(messageId) AS last_message_id
      FROM messages
      WHERE senderId = ? OR receiverId = ?
      GROUP BY userA, userB
    ) groupedMessages ON m1.messageId = groupedMessages.last_message_id
    JOIN users u ON u.id = IF(m1.senderId = ?, m1.receiverId, m1.senderId)
    ORDER BY m1.created_at DESC;
       `;

    // const values = [userId, recipientId, recipientId, userId]
    const selectResult = await queryRunner(query, [userId, userId, userId, userId]);

    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0]
      });
    } else {
      res.status(200).json({
        data: [],
        message: "Failed to get messages",
      });
    }
  } catch (error) {
    console.error("Query error: ", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to get messages",
      error: error.message,
    });
  }
};

exports.getMessageByUserWithRecipitant = async (req, res) => {
  const { userId, recipientId, page } = req.query;
  const limit = 15
  const offset = (page - 1 ) * limit
  try {
    const query = `
        SELECT * FROM messages
        WHERE (senderId = ? AND receiverId = ?)
        OR (senderId = ? AND receiverId = ?) LIMIT ? OFFSET ?`;

    const values = [userId, recipientId, recipientId, userId, limit, offset]
    const selectResult = await queryRunner(query, values);

    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0]
      });
    } else {
      res.status(200).json({
        data: [],
        message: "Failed to get messages",
      });
    }
  } catch (error) {
    console.error("Query error: ", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to get messages",
      error: error.message,
    });
  }
};

exports.getAllMessage = async (req, res) => {
  try {
    let query = `SELECT * FROM messages`;
    const selectResult = await queryRunner(query);
    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0]
      });
    } else {
      res.status(200).json({
        data: [],
        message: "Failed to get messages",
      });
    }
  } catch (error) {
    console.error("Query error: ", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to get messages",
      error: error.message,
    });
  }
};
