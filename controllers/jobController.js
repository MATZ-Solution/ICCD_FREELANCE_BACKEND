const { queryRunner } = require("../helper/queryRunner");
const handleNotifications = require("../utils/sendnotification");
const { getTotalPage } = require("../helper/getTotalPage");
const { emailTemplates } = require("../utils/emailTemplates");
const { sendEmail } = require("../helper/emailService");

exports.addJob = async function (req, res) {
  const { userId } = req.user;

  const {
    jobTitle,
    jobType,
    country,
    city,
    payType,
    minSalaray,
    maxSalaray,
    jobDescription,
    totalPersontoHire,
  } = req.body;

  try {
    // Add job into database
    const insertProjectQuery = `INSERT INTO jobs( jobTitle, jobType, country, city, payType, minSalaray, maxSalaray, jobDescription, totalPersontoHire, remaining_position, status, clientID) VALUES (?,?,?,?,?,?,?,?,?,?,?,?) `;
    const queryParams = [
      jobTitle,
      jobType,
      country,
      city,
      payType,
      minSalaray,
      maxSalaray,
      jobDescription,
      totalPersontoHire,
      totalPersontoHire,
      "open",
      userId,
    ];
    const insertFileResult = await queryRunner(insertProjectQuery, queryParams);
    if (insertFileResult[0].affectedRows > 0) {
      // let io = req.app.get("io");

      // await handleNotifications(io,
      //   {sender_id: userId,
      //    receiver_id: 9, // send client if from front-end
      //    title: 'New Job',
      //    message : "Check live notification",
      //    type: 'freelancer'}
      // )

      return res.status(200).json({
        statusCode: 200,
        message: "Job created successfully.",
      });
    } else {
      return res.status(500).json({
        statusCode: 500,
        message: "Failed to add jobs",
      });
    }
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({
      message: "Failed to add job",
      message: error.message,
    });
  }
};

exports.closeJob = async function (req, res) {
  const { id } = req.params;
  try {
    const updateQuery = `UPDATE jobs SET status = ? WHERE id = ?`;
    const queryParams = ["closed", id];
    const result = await queryRunner(updateQuery, queryParams);
    if (result?.[0]?.affectedRows > 0) {
      return res.status(200).json({
        statusCode: 200,
        message: "Job closed successfully.",
      });
    } else {
      return res.status(404).json({
        statusCode: 404,
        message: "No job found with the given ID.",
      });
    }
  } catch (error) {
    console.error("Edit Job Error:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to closed job",
      error: error.message,
    });
  }
};

exports.jobProposalsAction = async function (req, res) {
  const { id, name, email, action, remaining_position, jobId } = req.body;

  if (!id || !action) {
    return res.status(400).json({
      statusCode: 400,
      message: "Missing required parameters.",
    });
  }

  try {
    // If proposal accepted
    if (action === "accept") {
      if (remaining_position <= 0) {
        return res.status(400).json({
          statusCode: 400,
          message: "No open positions available for this job.",
        });
      }

      const updatePosition = remaining_position - 1;
      const { subject, html } = emailTemplates.jobAccepted;

      const [updateJob, updateProposal] = await Promise.all([
        queryRunner(
          `UPDATE jobs SET remaining_position = ? WHERE id = ?`,
          [updatePosition, jobId]
        ),
        queryRunner(
          `UPDATE job_proposals SET status = ? WHERE id = ?`,
          ["selected", id]
        ),
      ]);

      const jobUpdated = updateJob?.[0]?.affectedRows > 0;
      const proposalUpdated = updateProposal?.[0]?.affectedRows > 0;

      if (jobUpdated && proposalUpdated) {
        await sendEmail(email, subject, html(name)); // send email after success

        return res.status(200).json({
          statusCode: 200,
          message: "Proposal accepted and applicant notified.",
        });
      } else {
        return res.status(404).json({
          statusCode: 404,
          message: "Failed to update job or proposal record.",
        });
      }
    }

    // If proposal rejected
    const [result] = await queryRunner(
      `UPDATE job_proposals SET status = ? WHERE id = ?`,
      ["not selected", id]
    );

    if (result?.affectedRows > 0) {
      return res.status(200).json({
        statusCode: 200,
        message: "Proposal marked as not selected.",
      });
    }

    // Default: No records found
    return res.status(404).json({
      statusCode: 404,
      message: "No proposals found with the given ID.",
    });

  } catch (error) {
    console.error("Job Proposal Action Error:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to update job proposal status.",
      error: error.message,
    });
  }
};

exports.editJob = async function (req, res) {
  const { id: jobId } = req.params;

  const {
    jobTitle,
    jobType,
    country,
    city,
    payType,
    minSalaray,
    maxSalaray,
    jobDescription,
    totalPersontoHire,
  } = req.body;

  try {
    const updateJobQuery = `
      UPDATE jobs 
      SET 
        jobTitle = ?, 
        jobType = ?, 
        country = ?, 
        city = ?,
        payType = ?, 
        minSalaray = ?, 
        maxSalaray = ?, 
        jobDescription = ?, 
        totalPersontoHire = ?
      WHERE id = ?
    `;

    const queryParams = [
      jobTitle,
      jobType,
      country,
      city,
      payType,
      minSalaray,
      maxSalaray,
      jobDescription,
      totalPersontoHire,
      jobId,
    ];

    const result = await queryRunner(updateJobQuery, queryParams);

    if (result?.[0]?.affectedRows > 0) {
      return res.status(200).json({
        statusCode: 200,
        message: "Job updated successfully.",
      });
    } else {
      return res.status(404).json({
        statusCode: 404,
        message: "No job found with the given ID.",
      });
    }
  } catch (error) {
    console.error("Edit Job Error:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to edit job",
      error: error.message,
    });
  }
};

exports.getAllJob = async (req, res) => {
  const { jobTitle, type, country, city, page = 1 } = req.query;
  console.log("request query: ", req.query);
  const limit = 10;
  const offset = (page - 1) * limit;
  try {
    let baseQuery = `
      FROM jobs j LEFT JOIN users u ON u.id = j.clientID 
    `;
    let whereCond = [];
    let whereClause = "";

    if (jobTitle) {
      whereCond.push(` ( j.jobTitle LIKE '%${jobTitle}%' ) `);
    }
    if (type) {
      whereCond.push(` ( j.jobType LIKE '%${type}%' ) `);
    }
    if (country) {
      whereCond.push(` ( j.country LIKE '%${country}%' ) `);
    }
    if (city) {
      whereCond.push(` ( j.city LIKE '%${city}%' ) `);
    }

    if (whereCond.length > 0) {
      let concat_whereCond = whereCond.join(" AND ");
      whereClause += "WHERE" + ` ${concat_whereCond} `;
    }

    let getProjectQuery = `SELECT j.*, u.name 
    ${baseQuery} 
    ${whereClause}
     LIMIT ${limit} OFFSET ${offset}
    `;

    const selectResult = await queryRunner(getProjectQuery);
    if (selectResult[0].length > 0) {
      const countQuery = ` SELECT COUNT(DISTINCT j.id) AS total ${baseQuery} ${whereClause} `;
      const totalPages = await getTotalPage(countQuery, limit);
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0],
        totalPages,
      });
    } else {
      res.status(200).json({
        data: [],
        message: "Jobs Not Found",
      });
    }
  } catch (error) {
    console.error("Query error: ", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to get jobs",
      error: error.message,
    });
  }
};

exports.getJobById = async (req, res) => {
  const { id } = req.params;
  try {
    const getProjectQuery = `
    SELECT  j.*, u.name FROM jobs j
    LEFT JOIN users u ON u.id = j.clientID
    WHERE j.id = ?
    `;

    const selectResult = await queryRunner(getProjectQuery, [id]);

    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0],
      });
    } else {
      res.status(200).json({
        data: [],
        message: "Jobs Not Found",
      });
    }
  } catch (error) {
    console.error("Query error: ", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to get jobs",
      error: error.message,
    });
  }
};

exports.getJobByClient = async (req, res) => {
  let { search, page = 1 } = req.query;
  const { userId } = req.user;
  const limit = 12;
  const offset = (page - 1) * limit;

  try {
    let baseQuery = `
     FROM jobs j
     LEFT JOIN users u ON u.id = j.clientID
     WHERE u.id = ?
    `;
    let whereClause = "";
    if (search) {
      whereClause = `AND ( j.jobTitle LIKE '%${search}%' ) `;
    }
    let getJobQuery = ` SELECT  j.*, u.name ${baseQuery} ${whereClause} `;

    const selectResult = await queryRunner(getJobQuery, [userId]);

    if (selectResult[0].length > 0) {
      const countQuery = ` SELECT COUNT(DISTINCT j.id) AS total ${baseQuery} ${whereClause} `;
      const totalPages = await getTotalPage(countQuery, limit, [userId]);
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0],
        totalPages,
      });
    } else {
      res.status(200).json({
        data: [],
        message: "Job Not Found",
      });
    }
  } catch (error) {
    console.error("Query error: ", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to get job",
      error: error.message,
    });
  }
};

exports.applyJob = async function (req, res) {
  const { userId } = req.user;
  const { name, email, experience, freelancerId, projectId, clientId } =
    req.body;
  const files = req.files;

  try {
    // Add job_proposals into database
    const insertProposalsQuery = `INSERT INTO job_proposals(name, email, experience, status, jobId, clientId, freelancerId, fileUrl, fileKey) VALUES (?,?,?,?,?,?,?,?,?) `;
    const values = [
      name,
      email,
      experience,
      "awaiting response",
      projectId,
      clientId,
      freelancerId,
      files[0].location,
      files[0].key,
    ];
    const insertFileResult = await queryRunner(insertProposalsQuery, values);

    if (insertFileResult[0].affectedRows > 0) {
      return res.status(200).json({
        statusCode: 200,
        message: "Job Proposal submitted successfully",
      });
    } else {
      return res.status(200).json({
        statusCode: 200,
        message: "Failed to add job proposals",
      });
    }
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({
      message: "Failed to add job proposals",
      message: error.message,
    });
  }
};

exports.getJobProposalsByClient = async (req, res) => {
  const { userId } = req.user;
  const { id } = req.query;
  try {
    const getJobQuery = `
    SELECT  jp.id, jp.email, jp.status, jp.experience, jp.fileUrl,
    f.id AS freelancerId, CONCAT(f.firstName, ' ', f.lastName) AS freelancerName,
    f.fileUrl as candidateImg
    FROM job_proposals jp
    LEFT JOIN freelancers f ON f.id = jp.freelancerId
    WHERE jp.clientId = ? AND jobId = ?
     `;
    const selectResult = await queryRunner(getJobQuery, [userId, id]);

    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0],
      });
    } else {
      res.status(200).json({
        data: [],
        message: "job Not Found",
      });
    }
  } catch (error) {
    console.error("Query error: ", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to get job",
      error: error.message,
    });
  }
};
