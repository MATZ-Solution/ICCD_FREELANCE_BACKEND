const { queryRunner } = require("../helper/queryRunner");

exports.addProject = async function (req, res) {
  const { userId } = req.user;
  const {
    companyName,
    companyContactNumber,
    jobTitle,
    joblocationType,
    jobType,
    jobDescription,
    hiringTimeline,
  } = req.body;

  try {
    // Add project into database
    const insertProjectQuery = `INSERT INTO jobs( projectTitle, skills, budget, projectDescription, clientID, category, milestoneTitle, milestoneDueDate, milestoneAmount) VALUES (?,?,?,?,?,?,?,?,?) `;
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
        message: "Failed to add job",
      });
    }
    res.status(200).json({
      statusCode: 200,
      message: "Job Created successfully",
    });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({
      message: "Failed to add Job",
      message: error.message,
    });
  }
};

exports.getProjectByUser = async (req, res) => {
  const { userId } = req.user;
  console.log("userId: ", userId)
  try {
    const getProjectQuery = `SELECT * FROM projects where clientID=${userId}`;

    const selectResult = await queryRunner(getProjectQuery);
    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0],
      });
    } else {
      res
        .status(200)
        .json({ data: selectResult[0], message: "Project Not Found" });
    }
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to get project",
      error: error.message,
    });
  }
};
