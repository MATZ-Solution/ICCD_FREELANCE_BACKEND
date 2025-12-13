const { queryRunner } = require("../helper/queryRunner");
const { getTotalPage } = require("../helper/getTotalPage");
const { emailTemplates } = require("../utils/emailTemplates");
const { sendEmail } = require("../helper/emailService");

exports.addProject = async function (req, res) {
  const { userId } = req.user;
  let {
    budget,
    category,
    deadline,
    deliverable,
    description,
    duration,
    freelancerType,
    language,
    skills,
    subCategory,
    title,
  } = req.body;

  try {
    // Add project into database
    if (typeof deadline === "string" && deadline.startsWith('"')) {
      deadline = JSON.parse(deadline); // remove outer quotes
    }
    const formattedDeadline = new Date(deadline)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    const insertProjectQuery = `INSERT INTO projects(title, budget, description, clientID, category, subCategory, deadline, duration, freelancerType, deliverable) VALUES (?,?,?,?,?,?,?,?,?,?) `;
    const values = [
      title,
      budget,
      description,
      userId,
      category,
      subCategory,
      formattedDeadline,
      duration,
      freelancerType,
      deliverable,
    ];

    const insertFileResult = await queryRunner(insertProjectQuery, values);

    const project_id = insertFileResult[0].insertId;
    let parsedSkills = JSON.parse(skills);
    if (parsedSkills && parsedSkills.length > 0) {
      for (const skill of parsedSkills) {
        const insertProjectQuery = `INSERT INTO project_skills( name, project_id) VALUES (?,?) `;
        const queryParams = [skill, project_id];
        const insertFileResult = await queryRunner(
          insertProjectQuery,
          queryParams
        );
      }
    }

    if (language && language.length > 0) {
      for (const i of language) {
        const insertProjectQuery = `INSERT INTO project_language( name, project_id) VALUES (?,?) `;
        const queryParams = [i, project_id];
        const insertFileResult = await queryRunner(
          insertProjectQuery,
          queryParams
        );
      }
    }

    // Add files into database
    if (insertFileResult[0].affectedRows > 0) {
      let projectID = insertFileResult[0].insertId;
      console.log("req.files.length :", req.files.length);
      if (req.files.length > 0) {
        for (const file of req.files) {
          const insertFileResult = await queryRunner(
            "INSERT INTO project_files (fileUrl, fileKey, projectID) VALUES (?, ?, ?)",
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
  const { search, page = 1 } = req.query;
  const { userId } = req.user;
  const limit = 10;
  const offset = (page - 1) * limit;

  try {
    let baseQuery = `
      FROM projects p 
      LEFT JOIN project_files pf ON pf.projectID = p.id
      LEFT JOIN project_skills ps ON ps.project_id = p.id
      LEFT JOIN project_proposals pp ON pp.projectId = p.id
      WHERE p.clientID = ?
    `;
    let whereClause = "";
    if (search) {
      whereClause = `AND ( p.title LIKE '%${search}%' OR p.description LIKE '%${search}%' OR p.category LIKE '%${search}%' OR p.subCategory LIKE '%${search}%' ) `;
    }

    let getProjectQuery = `
    SELECT  p.*, GROUP_CONCAT(pf.fileUrl) AS projectFiles, GROUP_CONCAT(ps.name) AS projectSkills,
    COUNT(DISTINCT pp.id) AS totalProposals
    ${baseQuery}
    ${whereClause}
     GROUP BY p.id
     LIMIT ${limit} OFFSET ${offset}
    `;

    const selectResult = await queryRunner(getProjectQuery, [userId]);
    const filterData = selectResult[0].map((item) => ({
      ...item,
      projectSkills: item.projectSkills ? item.projectSkills.split(",") : [],
      projectFiles: item.projectFiles ? item.projectFiles.split(",")[0] : [],
    }));

    if (selectResult[0].length > 0) {
      const countQuery = ` SELECT COUNT(DISTINCT p.id) AS total ${baseQuery} ${whereClause} `;
      const totalPages = await getTotalPage(countQuery, limit, [userId]);
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        // data: selectResult[0]
        data: filterData,
        totalPages,
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
  const { search, page = 1 } = req.query;
  const limit = 10;
  const offset = (page - 1) * limit;

  try {
    let baseQuery = ` FROM projects `;

    let whereClause = "";
    if (search) {
      whereClause += ` WHERE title LIKE '%${search}%' OR description LIKE '%${search}%' OR category LIKE '%${search}%' OR subCategory LIKE '%${search}%' `;
    }

    let getProjectQuery = `SELECT *  ${baseQuery} ${whereClause}  ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;

    const selectResult = await queryRunner(getProjectQuery);

    const filterData = selectResult[0].map((item) => ({
      ...item,
      projectSkills: item.projectSkills ? item.projectSkills.split(",") : [],
      projectFiles: item.projectFiles ? item.projectFiles.split(",")[0] : [],
    }));

    if (selectResult[0].length > 0) {
      const countQuery = ` SELECT COUNT(DISTINCT id) AS total ${baseQuery} ${whereClause} `;
      const totalPages = await getTotalPage(countQuery, limit);
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        // data: selectResult[0]
        data: filterData,
        totalPages,
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

exports.getProjectById = async (req, res) => {
  const { projectId } = req.params;
  try {
    const getProjectQuery = `
    SELECT  p.*, GROUP_CONCAT(DISTINCT ps.name) AS skills, GROUP_CONCAT(DISTINCT pl.name) AS languages,
    GROUP_CONCAT(DISTINCT pf.fileUrl) AS files,
    u.name as companyName, u.about as companyAbout, u.fileUrl as companyImg
    FROM projects p 
    LEFT JOIN project_skills ps ON ps.project_id = p.id
    LEFT JOIN project_language pl ON pl.project_id = p.id
    LEFT JOIN users u ON u.id = p.clientID
    LEFT JOIN project_files pf ON pf.projectID = p.id
    WHERE p.id = ?
     `;
    const selectResult = await queryRunner(getProjectQuery, [projectId]);

    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0],
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

exports.getProjectProposalsByClient = async (req, res) => {
  const { projectId } = req.params;
  const { userId } = req.user;
  try {
    const getProjectQuery = `
    SELECT  pp.*,
    f.id AS freelancerId, CONCAT(f.firstName, ' ', f.lastName) AS freelancerName,
    f.fileUrl as freelancerImg
    FROM project_proposals pp
    LEFT JOIN freelancers f ON f.id = pp.freelancerId
    WHERE pp.clientId = ? AND pp.projectId = ? AND pp.status = ?
     `;
    const selectResult = await queryRunner(getProjectQuery, [
      userId,
      projectId,
      "awaiting",
    ]);

    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0],
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
  const {
    portfolioLinks,
    paymentTerms,
    currency,
    proposedBudget,
    timeUnit,
    estimatedTime,
    proposedDeliverables,
    coverLetter,
    email,
    freelancerName,
    clientId,
    projectId,
    freelancerId,
    milestonePayment,
  } = req.body;
  const files = req.files;
  try {
    // Add project_proposals into database
    const insertProposalsQuery = `INSERT INTO project_proposals(name, email, status, fileUrl, fileKey, projectId, clientId, freelancerId, coverLetter, deliverable, budget, currency, paymentTerms, portfolioLinks) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?) `;
    const values = [
      freelancerName,
      email,
      "awaiting",
      files[0].location,
      files[0].key,
      projectId,
      clientId,
      freelancerId,
      coverLetter,
      proposedDeliverables,
      proposedBudget,
      currency,
      paymentTerms,
      portfolioLinks,
    ];
    const insertFileResult = await queryRunner(insertProposalsQuery, values);

    let milestonePaymentArray = JSON.parse(milestonePayment);
    if (milestonePaymentArray && milestonePaymentArray.length > 0) {
      for (const i of milestonePaymentArray) {
        const insertQuery = `INSERT INTO project_proposals_milestone(percentage, duration, freelancer_id) VALUES (?,?,?)`;
        const queryParams = [i.percentage, i.duration, freelancerId];
        const insertResult = await queryRunner(insertQuery, queryParams);
      }
    }

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

exports.editProject = async function (req, res) {
  const { id } = req.params;
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
    type,
  } = req.body;

  try {
    const editProjectQuery = `
      UPDATE projects SET 
        title = ?, budget = ?, type = ?, description = ?, 
        category = ?, subCategory = ?, deadline = ?, 
        duration = ?, total_freelancer = ?, freelancerType = ?, 
        overview = ?, deliverable = ?, mode = ? 
      WHERE id = ? AND clientID = ?`;

    const formattedDeadline = new Date(deadline)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    const values = [
      title,
      budget,
      type,
      description,
      category,
      subCategory,
      formattedDeadline,
      duration,
      total_freelancer,
      freelancerType,
      overview,
      deliverable,
      mode,
      id,
      userId,
    ];

    const updateResult = await queryRunner(editProjectQuery, values);

    if (updateResult.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Project not found or unauthorized" });
    }

    await queryRunner("DELETE FROM project_skills WHERE project_id = ?", [id]);
    if (Array.isArray(skills) && skills.length > 0) {
      for (const skill of skills) {
        await queryRunner(
          "INSERT INTO project_skills (name, project_id) VALUES (?, ?)",
          [skill, id]
        );
      }
    }

    await queryRunner("DELETE FROM project_language WHERE project_id = ?", [
      id,
    ]);
    if (Array.isArray(language) && language.length > 0) {
      for (const lang of language) {
        await queryRunner(
          "INSERT INTO project_language (name, project_id) VALUES (?, ?)",
          [lang, id]
        );
      }
    }

    if (req.files && req.files.length > 0) {
      await queryRunner("DELETE FROM projectfiles WHERE projectID = ?", [id]);

      for (const file of req.files) {
        const result = await queryRunner(
          "INSERT INTO projectfiles (fileUrl, fileKey, projectID) VALUES (?, ?, ?)",
          [file.location, file.key, id]
        );

        if (result.affectedRows <= 0) {
          return res.status(500).json({
            message: "Failed to save some files",
          });
        }
      }
    }

    return res.status(200).json({
      statusCode: 200,
      message: "Project updated successfully",
    });
  } catch (error) {
    console.error("Edit Project Error:", error);
    return res.status(500).json({
      message: "Server Error: " + error.message,
    });
  }
};

exports.projectProposalsAction = async function (req, res) {
  const { id, name, email, projectName, action } = req.body;
  try {
    const query = `UPDATE project_proposals SET status = ? WHERE id = ?`;
    const updateStatus = await queryRunner(query, [action, id]);
    const isUpdated = updateStatus[0]?.affectedRows > 0;

    if (isUpdated) {
      // send email to freelancers
      const { subject, html } = emailTemplates.acceptProposals;
      await sendEmail(email, subject, html(name, projectName));

      return res.status(200).json({
        statusCode: 200,
        message: "Successfully updated project proposals status",
      });
    } else {
      return res.status(404).json({
        statusCode: 404,
        message: "Failed to update project proposals status.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.getProjectShortlistedCandidates = async (req, res) => {
  const { id } = req.params;
  try {
    const query = ` SELECT name, email, fileUrl, status FROM project_proposals WHERE status = 'accept' AND projectId = ? `;
    const selectResult = await queryRunner(query, [id]);

    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0],
      });
    } else {
      res.status(200).json({
        data: [],
        message: "No Shortlist proposal Found",
      });
    }
  } catch (error) {
    console.error("Query error: ", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to get shortlist project proposals",
      error: error.message,
    });
  }
};
