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
    const insertProjectQuery = `INSERT INTO projects( projectTitle,category, subCategory, projectDescription, budget, deadline , clientID ) VALUES (?,?,?,?,?,?,?) `;
    const queryParams = [
      projectTitle,
      category,
      subCategory,
      projectDescription,
      budget,
      deadline,
      userId
    ];
    const insertFileResult = await queryRunner(insertProjectQuery, queryParams);

    const project_id = insertFileResult[0].insertId

    let skillsArrays = skills.split(',')
    if (skillsArrays && skillsArrays.length > 0) {
      for (const skill of skillsArrays) {
        const insertProjectQuery = `INSERT INTO projectskills( name, project_id) VALUES (?,?) `;
        const queryParams = [skill, project_id]
        const insertFileResult = await queryRunner(insertProjectQuery, queryParams);
      }
    }

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
    const getProjectQuery = `
    SELECT  p.*, GROUP_CONCAT(pf.fileUrl) AS projectFiles, GROUP_CONCAT(ps.name) AS projectSkills
    FROM projects p 
    LEFT JOIN projectfiles pf ON pf.projectID = p.id
    LEFT JOIN projectskills ps ON ps.project_id = p.id
    WHERE p.clientID = ?
    GROUP BY p.id
    `;

    const selectResult = await queryRunner(getProjectQuery, [userId]);

    const filterData = selectResult[0].map((item) => ({
      ...item,
      projectSkills: item.projectSkills ? item.projectSkills.split(',') : [],
      projectFiles: item.projectFiles ? item.projectFiles.split(',')[0] : []
    }))

    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        // data: selectResult[0]
        data: filterData
      });
    } else {
      res.status(200).json({
        data: [],
        message: "Gigs Not Found",
      });
    }
  } catch (error) {
    console.error("Query error: ", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to get gigs",
      error: error.message,
    });
  }
};

exports.getAllProject = async (req, res) => {
  try {
    const getProjectQuery = `
    SELECT  p.*, GROUP_CONCAT(pf.fileUrl) AS projectFiles, GROUP_CONCAT(ps.name) AS projectSkills
    FROM projects p 
    LEFT JOIN projectfiles pf ON pf.projectID = p.id
    LEFT JOIN projectskills ps ON ps.project_id = p.id
    GROUP BY p.id
    `;

    const selectResult = await queryRunner(getProjectQuery);

    const filterData = selectResult[0].map((item) => ({
      ...item,
      projectSkills: item.projectSkills ? item.projectSkills.split(',') : [],
      projectFiles: item.projectFiles ? item.projectFiles.split(',')[0] : []
    }))

    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        // data: selectResult[0]
        data: filterData
      });
    } else {
      res.status(200).json({
        data: [],
        message: "Gigs Not Found",
      });
    }
  } catch (error) {
    console.error("Query error: ", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to get gigs",
      error: error.message,
    });
  }
};

