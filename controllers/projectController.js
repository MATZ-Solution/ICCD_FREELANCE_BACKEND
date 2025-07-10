const { queryRunner } = require("../helper/queryRunner");

exports.addProject = async function (req, res) {
  const { userId } = req.user;
  const {
    projectTitle,
    category,
    subCategory,
    skills,
    projectDescription,
    budget,
    deadline,
  } = req.body;

  try {
    // Add project into database
    const insertProjectQuery = `INSERT INTO projects( projectTitle,category, subCategory, skills,projectDescription, budget, deadline , clientID ) VALUES (?,?,?,?,?,?,?,?) `;
    const queryParams = [
      projectTitle,
      category,
      subCategory,
      skills,
      projectDescription,
      budget,
      deadline,
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
        message: "Failed to add Project",
      });
    }
    res.status(200).json({
      statusCode: 200,
      message: "Project Created successfully",
    });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({
      message: "Failed to add Project",
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
