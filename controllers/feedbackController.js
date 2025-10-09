const { queryRunner } = require("../helper/queryRunner");

exports.addFeedback = async function (req, res) {
  const { name, email, message } = req.body;
  try {
    const insertQuery = `INSERT INTO feedback(name, email, message) VALUES (?,?,?) `;
    const queryParams = [name, email, message];
    const insertFileResult = await queryRunner(insertQuery, queryParams);
    if (insertFileResult[0].affectedRows > 0) {
        return res.status(200).json({
        statusCode: 200,
        message: "Feedback Submit Successfully.",
      });
    }else{
        res.status(500).json({
          statusCode: 500,
          message: "Failed To Submit Feedback",
        });
    }
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({
      message: "Failed To Submit Feedback",
      message: error.message,
    });
  }
};
