const { queryRunner } = require("../helper/queryRunner");
const handleNotifications = require("../utils/sendnotification");

exports.addJob = async function (req, res) {
  const { userId } = req.user;

  const {
    jobTitle,
    jobType,
    joblocation,
    payType,
    minSalaray,
    maxSalaray,
    jobDescription,
    totalPersontoHire,
  } = req.body;

  try {
    // Add job into database
    const insertProjectQuery = `INSERT INTO jobs( jobTitle, jobType, joblocation, payType, minSalaray, maxSalaray, jobDescription, totalPersontoHire, clientID) VALUES (?,?,?,?,?,?,?,?,?) `;
    const queryParams = [
      jobTitle,
      jobType,
      joblocation,
      payType,
      minSalaray,
      maxSalaray,
      jobDescription,
      totalPersontoHire,
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

exports.editJob = async function (req, res) {
  const { id: jobId } = req.params;

  const {
    jobTitle,
    jobType,
    joblocation,
    payType,
    minSalaray,
    maxSalaray,
    jobDescription,
    totalPersontoHire,
  } = req.body;

  console.log("Edit Job Request Body:", req.body);

  try {
    const updateJobQuery = `
      UPDATE jobs 
      SET 
        jobTitle = ?, 
        jobType = ?, 
        joblocation = ?, 
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
      joblocation,
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
  const { jobTitle, jobType, joblocation } = req.query;
  console.log("req.query: ", req.query);
  try {
    const queryParams = [];
    const queryValue = [];
    let getProjectQuery = `SELECT j.*, u.name FROM jobs j LEFT JOIN users u ON u.id = j.clientID `;
    if (jobTitle) {
      queryParams.push(` j.jobTitle LIKE ? `);
      queryValue.push(`%${jobTitle}%`);
    }
    if (jobType) {
      queryParams.push(` j.jobType LIKE ? `);
      queryValue.push(`%${jobType}%`);
    }
    if (joblocation) {
      queryParams.push(` j.joblocation LIKE ? `);
      queryValue.push(`%${joblocation}%`);
    }
    if (queryParams.length > 0) {
      getProjectQuery += "WHERE" + ` ${queryParams.join(" AND ")} `;
    }
    console.log("getProjectQuery: ", getProjectQuery);
    console.log("queryValue: ", queryValue);

    const selectResult = await queryRunner(getProjectQuery, queryValue);
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
  let { search } = req.query
  const { userId } = req.user;
  try {
    let getJobQuery = `
       SELECT  j.*, u.name FROM jobs j
       LEFT JOIN users u ON u.id = j.clientID
       WHERE u.id = ?
    `;

    if (search) {
      getJobQuery += ` AND ( j.jobTitle LIKE '%${search}%' )`;
    }
    const selectResult = await queryRunner(getJobQuery, [userId]);

    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0],
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
  const { name, experience, freelancerId, projectId, clientId } = req.body;
  const files = req.files;

  try {
    // Add job_proposals into database
    const insertProposalsQuery = `INSERT INTO job_proposals(name, experience, jobId, clientId, freelancerId, fileUrl, fileKey) VALUES (?,?,?,?,?,?,?) `;
    const values = [
      name,
      experience,
      projectId,
      clientId,
      freelancerId,
      files[0].location,
      files[0].key,
    ];
    console.log("values: ", values);
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
  const { userId } = req.user
  const { id } = req.query
  try {
    const getJobQuery = `
    SELECT  jp.experience, jp.fileUrl,
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
