const { queryRunner } = require("../helper/queryRunner");

exports.addProject = async function (req, res) {
  const { userId } = req.user;
  const {
    budget,
    category,
    deadline,
    deliverable,
    description,
    duration,
    freelancerType,
    language,
    mode,
    overview,
    skills,
    subCategory,
    title,
    total_freelancer,
    type
  } = req.body;

  try {

    // Add project into database
    const insertProjectQuery = `INSERT INTO projects(title, budget,type, description, clientID, category, subCategory, deadline, duration, total_freelancer, freelancerType, overview, deliverable, mode) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?) `;
    const values = [title, budget,type, description, userId, category, subCategory, deadline, duration, total_freelancer, freelancerType, overview, deliverable, mode]
    const insertFileResult = await queryRunner(insertProjectQuery, values);

    const project_id = insertFileResult[0].insertId


    if (skills && skills.length > 0) {
      for (const skill of skills) {
        const insertProjectQuery = `INSERT INTO project_skills( name, project_id) VALUES (?,?) `;
        const queryParams = [skill, project_id]
        const insertFileResult = await queryRunner(insertProjectQuery, queryParams);
      }
    }

     if (language && language.length > 0) {
      for (const i of language) {
        const insertProjectQuery = `INSERT INTO project_language( name, project_id) VALUES (?,?) `;
        const queryParams = [i, project_id]
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

exports.getProjectByClient = async (req, res) => {
  const { userId } = req.user;
  console.log("userId: ", userId)
  try {
    const getProjectQuery = `
    SELECT  p.*, GROUP_CONCAT(pf.fileUrl) AS projectFiles, GROUP_CONCAT(ps.name) AS projectSkills,
    COUNT(DISTINCT pp.id) AS totalProposals
    FROM projects p 
    LEFT JOIN projectfiles pf ON pf.projectID = p.id
    LEFT JOIN project_skills ps ON ps.project_id = p.id
    LEFT JOIN project_proposals pp ON pp.projectId = p.id
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

exports.getAllProject = async (req, res) => {
  try {
    const getProjectQuery = `
    SELECT  p.*, GROUP_CONCAT(pf.fileUrl) AS projectFiles, GROUP_CONCAT(ps.name) AS projectSkills
    FROM projects p 
    LEFT JOIN projectfiles pf ON pf.projectID = p.id
    LEFT JOIN project_skills ps ON ps.project_id = p.id
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

exports.getProjectById = async (req, res) => {
   const { projectId } = req.params;
  try {
    const getProjectQuery = `
    SELECT  p.*, GROUP_CONCAT(DISTINCT ps.name) AS skills, GROUP_CONCAT(DISTINCT pl.name) AS languages
    FROM projects p 
    LEFT JOIN project_skills ps ON ps.project_id = p.id
    LEFT JOIN project_language pl ON pl.project_id = p.id
    WHERE p.id = ?
     `;
    const selectResult = await queryRunner(getProjectQuery, [projectId]);

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
      message: "Failed to get project",
      error: error.message,
    });
  }
};

exports.applyProject = async function (req, res) {
  const { userId } = req.user;
  const { name, experience, clientId, projectId} = req.body;
  const files = req.files

  try {
    // Add project_proposals into database
    const insertProposalsQuery = `INSERT INTO project_proposals(name, experience, projectId, clientId, freelancerId, fileUrl, fileKey) VALUES (?,?,?,?,?,?,?) `;
    const values = [name, experience, projectId, clientId, userId, files[0].location, files[0].key]
    console.log("values: ", values)
    const insertFileResult = await queryRunner(insertProposalsQuery, values);

     if (insertFileResult[0].affectedRows > 0) {
      return res.status(200).json({
        statusCode: 200,
        message: "Proposal submitted successfully",
      });
    } else {
      return res.status(200).json({
        statusCode: 200,
        message: "Failed to add Project",
      });
    }

  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({
      message: "Failed to add Project",
      message: error.message,
    });
  }
};

