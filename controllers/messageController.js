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

exports.getMessageByUser = async (req, res) => {
  const { userId, recipientId } = req.body;
  try {
    const query = `
        SELECT * FROM messages
        WHERE (senderId = ? AND receiverId = ?)
        OR (senderId = ? AND receiverId = ?) `;

    const values = [userId, recipientId, recipientId, userId]
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
