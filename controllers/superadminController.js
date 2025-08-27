const { queryRunner } = require("../helper/queryRunner");
const handleNotifications = require("../utils/sendnotification");

exports.getAllUsers = async function (req, res) {
  try {
    const sql = "SELECT * FROM users";
    const [rows] = await queryRunner(sql);

    console.log("Fetched users:", rows); // rows is the actual data

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


