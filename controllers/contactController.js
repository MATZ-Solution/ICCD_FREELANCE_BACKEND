const { queryRunner } = require("../helper/queryRunner");
const { getTotalPage } = require("../helper/getTotalPage");
const { emailTemplates } = require('../utils/emailTemplates')
const { sendEmail } = require("../helper/emailService");

exports.addContacts = async function (req, res) {
  const { fullName, email, message, organization, subject, category } = req.body;
  try {
    const insertQuery = `INSERT INTO contacts(fullName, email, message, organization, subject, category) VALUES (?,?,?,?,?,?) `;
    const queryParams = [fullName, email, message, organization, subject, category];
    const insertFileResult = await queryRunner(insertQuery, queryParams);
    if (insertFileResult[0].affectedRows > 0) {
      const { subject, html } = emailTemplates.contactMessage;
      await sendEmail(email, subject, html(fullName));
        return res.status(200).json({
        statusCode: 200,
        message: "Contact Submit Successfully.",
      });
    }else{
        res.status(500).json({
          statusCode: 500,
          message: "Failed To Contact Issue",
        });
    }
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({
      message: "Failed To Submit Contact",
      message: error.message,
    });
  }
};

exports.getAllContacts = async (req, res) => {
  const { email, page = 1 } = req.query;
  console.log("request query: ", req.query)
  const limit = 10;
  const offset = (page - 1) * limit;
  try {
    let baseQuery = `
      FROM contacts
    `;
    let whereCond = [];
    let whereClause = "";

    if (email) {
      whereCond.push(` ( email LIKE '%${email}%' ) `);
    }

    if (whereCond.length > 0) {
      let concat_whereCond = whereCond.join(" AND ")
      whereClause += "WHERE" + ` ${concat_whereCond} `;
    }

    let getProjectQuery = `SELECT *
    ${baseQuery} 
    ${whereClause}
     LIMIT ${limit} OFFSET ${offset}
    `;

    const selectResult = await queryRunner(getProjectQuery);
    if (selectResult[0].length > 0) {
      const countQuery = ` SELECT COUNT(DISTINCT id) AS total ${baseQuery} ${whereClause} `;
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
        message: "Contact Not Found",
      });
    }
  } catch (error) {
    console.error("Query error: ", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to get contact",
      error: error.message,
    });
  }
};
