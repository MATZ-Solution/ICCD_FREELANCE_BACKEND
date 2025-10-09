const { queryRunner } = require("../helper/queryRunner");

exports.addIssue = async function (req, res) {
  const { fullName, email, description, issueType, priority, userRole } = req.body;
  try {
    const insertQuery = `INSERT INTO issues(fullName, email, description, issueType, priority, userRole) VALUES (?,?,?,?,?,?) `;
    const queryParams = [fullName, email, description, issueType, priority, userRole];
    const insertFileResult = await queryRunner(insertQuery, queryParams);
    if (insertFileResult[0].affectedRows > 0) {
        return res.status(200).json({
        statusCode: 200,
        message: "Issue Submit Successfully.",
      });
    }else{
        res.status(500).json({
          statusCode: 500,
          message: "Failed To Submit Issue",
        });
    }
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({
      message: "Failed To Submit Issue",
      message: error.message,
    });
  }
};
