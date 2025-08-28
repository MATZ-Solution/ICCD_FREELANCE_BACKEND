const { queryRunner } = require("../helper/queryRunner");
const handleNotifications = require("../utils/sendnotification");

exports.getAllUsers = async function (req, res) {
  try {
    const sql = "SELECT * FROM users";
    const [rows] = await queryRunner(sql);

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


exports.getAllFreelancers = async function (req, res) {
  try {
        const sql = "SELECT f.*,  u.email,u.id , fs.* FROM freelancers f JOIN users u ON u.id = f.userID JOIN freelancer_skills fs on fs.freelancer_id = f.id ";

    const [rows] = await queryRunner(sql);

    console.log("Fetched freelancers:", rows);

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching freelancers:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.getAllGigs = async function (req, res) {
  try {
    const sql = "SELECT * FROM gigs"; // assume table name is 'gigs'
    const [rows] = await queryRunner(sql);

    console.log("Fetched gigs:", rows);

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching gigs:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


exports.getAllProjects = async function (req, res) {
  try {
    const sql = "SELECT * FROM projects"; 
    const [rows] = await queryRunner(sql);

    console.log("Fetched Projects:", rows);

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching Projects:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
