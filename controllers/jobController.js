const { queryRunner } = require("../helper/queryRunner");

exports.addJob = async function (req, res) {
  const { userId } = req.user;
 
  const {
    projectTitle,
    skills,
    budget,
    projectDescription,
    category,
    milestoneTitle,
    milestoneDueDate,
    milestoneAmount,
  } = req.body;

  try {

    // Add project into database
    const insertProjectQuery = `INSERT INTO projects( projectTitle, skills, budget, projectDescription, clientID, category, milestoneTitle, milestoneDueDate, milestoneAmount) VALUES (?,?,?,?,?,?,?,?,?) `;
    const queryParams = [
      projectTitle,
      skills,
      budget,
      projectDescription,
      userId,
      category,
      milestoneTitle,
      milestoneDueDate,
      milestoneAmount,
    ];
    const insertFileResult = await queryRunner(insertProjectQuery, queryParams);

    // Add files into database
    if (insertFileResult[0].affectedRows > 0) {
      let projectID = insertFileResult[0].insertId;
      if (req.files.length > 0) {
        for (const file of req.files) {
          const insertFileResult = await queryRunner(
            "INSERT INTO projectfiles (fileUrl, fileKey, projectID) VALUES (?, ?, ?)",
            [file.location, file.key, projectID]
          );
          if (insertFileResult.affectedRows <= 0) {
            return res.status(500).json({
              statusCode: 500,
              message: "Failed to add files",
            });
          }
        }
      }
    } else {
      return res.status(200).json({
        statusCode: 200,
        message: "Failed to add project",
      });
    }
    res.status(200).json({
      statusCode: 200,
      message: "Scout Created successfully",
    });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({
      message: "Failed to add Project",
      message: error.message,
    });
  }
};
