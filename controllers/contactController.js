const { queryRunner } = require("../helper/queryRunner");

exports.addContacts = async function (req, res) {
  const { fullName, email, message, organization, subject, category } = req.body;
  try {
    const insertQuery = `INSERT INTO contacts(fullName, email, message, organization, subject, category) VALUES (?,?,?,?,?,?) `;
    const queryParams = [fullName, email, message, organization, subject, category];
    const insertFileResult = await queryRunner(insertQuery, queryParams);
    if (insertFileResult[0].affectedRows > 0) {
        return res.status(200).json({
        statusCode: 200,
        message: "Contact Submit Successfully.",
      });
    }else{
        res.status(500).json({
          statusCode: 500,
          message: "Failed To Contact Issue",
        });
    }
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({
      message: "Failed To Submit Contact",
      message: error.message,
    });
  }
};
