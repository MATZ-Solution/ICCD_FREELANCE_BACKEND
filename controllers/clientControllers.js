const { queryRunner } = require("../helper/queryRunner");
const { deleteS3File } = require("../utils/deleteS3Files")

exports.getClientDashboardData = async (req, res) => {
  const { userId } = req.user;
  console.log("userId: ", userId)
  try {
    const getProjectQuery = `
    SELECT 
      (SELECT COUNT(*) FROM projects WHERE clientID = ? ) AS totalPostedProject,
      (SELECT COUNT(*) FROM orders WHERE clientID = ? ) AS totalOrder,
      (SELECT COUNT(*) FROM jobs WHERE clientID = ? ) AS totalPostedJob
    `;

    const selectResult = await queryRunner(getProjectQuery, [userId, userId, userId]);

    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0]
      });
    } else {
      res.status(200).json({
        data: [],
        message: "Project Not Found",
      });
    }
  } catch (error) {
    console.error("Query error: ", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to get projects",
      error: error.message,
    });
  }
};

exports.clientEditProfile = async function (req, res) {
  const { userId } = req.user;
  const { name, about, filekey } = req.body;
  console.log("req.body: ", req.body)
  try {

    let fields = [];
    let column = [];

    if (name) {
      fields.push(name);
      column.push(" name = ?  ");
    }
    if (about) {
      fields.push(about);
      column.push(" about = ? ");
    }

    if (req.files.length > 0) {
      // await deleteS3File(filekey);
      fields.push(req.files[0]?.location);
      fields.push(req.files[0]?.key);
      column.push(" fileUrl = ? ");
      column.push(" filekey = ? ");
    }
    const insertFileResult = await queryRunner(`UPDATE users SET ${column.join(',')} WHERE id = ? `,
      [...fields, userId]);

    if (insertFileResult[0].affectedRows > 0) {
      let result = await queryRunner(`SELECT id, name, email, about, fileUrl as userImg, fileKey FROM users WHERE id = ?`, [userId]);
      return res.status(200).json({
        statusCode: 200,
        message: "Profile Edit successfully",
        data: result[0][0]
      });
    } else {
      return res.status(500).json({
        statusCode: 200,
        message: "Failed to edit profile",
      });
    }

  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({
      message: "Failed to edit profile",
      message: error.message,
    });
  }
};