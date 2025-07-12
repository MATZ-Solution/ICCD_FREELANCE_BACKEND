const { queryRunner } = require("../helper/queryRunner");

// Check freelancer
exports.checkIsFreelancer = async (req, res) => {
  const { userId } = req.user;
  console.log("userId: ", userId);
  try {
    const getProjectQuery = `
    SELECT * FROM freelancers
    WHERE userID = ?
    `;

    const selectResult = await queryRunner(getProjectQuery, [userId]);


    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0],
        // data: filterData
      });
    } else {
      res.status(200).json({
        data: [],
        message: "Profile Not Found",
      });
    }
  } catch (error) {
    console.error("Query error: ", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to get Profile",
      error: error.message,
    });
  }
};

exports.getFreelancerProfile = async (req, res) => {
  const { userId } = req.user;
  console.log("userId: ", userId);
  try {
    const getProjectQuery = `
    SELECT * FROM freelancers
    WHERE userID = ?
    `;

    const selectResult = await queryRunner(getProjectQuery, [userId]);

    // const filterData = selectResult[0].map((item) => ({
    //   ...item,
    //   projectSkills: item.projectSkills ? item.projectSkills.split(',') : [],
    //   projectFiles: item.projectFiles ? item.projectFiles.split(',')[0] : []
    // }))

    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0],
        // data: filterData
      });
    } else {
      res.status(200).json({
        data: [],
        message: "Profile Not Found",
      });
    }
  } catch (error) {
    console.error("Query error: ", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to get Profile",
      error: error.message,
    });
  }
};

exports.addProfile = async function (req, res) {
  const { userId } = req.user;
  const {
    firstName,
    lastName,
    languages,
    about_tagline,
    about_description,
    educations,
    certifications,
    skills,
    freelancerId
  } = req.body;

  try {

    console.log("freelancerId: ", freelancerId)
    let languagesArray;
    if (languages && languages.length > 0) {
      languagesArray = JSON.parse(languages)
    }

    let skillsArray;
    if (skills && skills.length > 0) {
      skillsArray = JSON.parse(skills)
    }

    // Add project into database
    let fields = [];
    let column = [];
    if (firstName) {
      fields.push(firstName);
      column.push("firstName");
    }
    if (lastName) {
      fields.push(lastName);
      column.push("lastName");
    }
    if (about_tagline) {
      fields.push(about_tagline);
      column.push("about_tagline");
    }
    if (about_description) {
      fields.push(about_description);
      column.push("about_description");
    }

    let freelancerResult;

    if (fields && fields.length > 0) {
      const insertProjectQuery = `INSERT INTO freelancers(${column.map(item => item).join(',')}) VALUES (${fields.map(item => '?').join(',')})`;
      const insertFileResult = await queryRunner(insertProjectQuery, fields);
      freelancerResult = insertFileResult
    }

    if (languagesArray && languagesArray.length > 0) {
      for (const i of languagesArray) {
        const insertLanguagesQuery = `INSERT INTO freelancers_languages( language_name, freelancer_id ) VALUES (?,?)`;
        const queryParams = [i.language, userId];
        const insertLanguagesResult = await queryRunner(
          insertLanguagesQuery,
          queryParams
        );
      }
    }

    // if (educations && educations.length > 0) {
    //   for (const education of educations) {
    //     const insertEducationstQuery = `INSERT INTO freelancer_education( university_name, country, degree, year, freelancer_id ) VALUES (?,?,?) `;
    //     const queryParams = [
    //       education.university_name,
    //       education.country,
    //       education.degree,
    //       education.year,
    //       userId,
    //     ];
    //     const insertEducationResult = await queryRunner(
    //       insertEducationstQuery,
    //       queryParams
    //     );
    //   }
    // }

    // if (certifications && certifications.length > 0) {
    //   for (const certification of certifications) {
    //     const insertCertificationstQuery = `INSERT INTO freelancer_certificate( certificate_name, awarded_by, year, freelancer_id ) VALUES (?,?,?) `;
    //     const queryParams = [
    //       certification.certificate_name,
    //       certification.awarded_by,
    //       certification.year,
    //       userId,
    //     ];
    //     const insertCertificationsResult = await queryRunner(
    //       insertCertificationstQuery,
    //       queryParams
    //     );
    //   }
    // }

    if (skillsArray && skillsArray.length > 0) {
      for (const skill of skillsArray) {
        const insertSkillstQuery = `INSERT INTO freelancer_skills( skill, level, freelancer_id ) VALUES (?,?,?) `;
        const queryParams = [skill.skill, skill.level, freelancerId];
        const insertSkillsResult = await queryRunner(
          insertSkillstQuery,
          queryParams
        );
      }
    }

    // Add files into database
    if (freelancerResult && freelancerResult[0].affectedRows > 0) {
      let freelancerId = freelancerResult[0].insertId
      if (req.files.length > 0) {
        for (const file of req.files) {
          const insertFileResult = await queryRunner(
            `UPDATE freelancers
              SET fileUrl = ?, fileKey = ?, userID = ?
              WHERE id = ?`,
            [file.location, file.key, userId, freelancerId]
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
      message: "Profile Edit successfully",
      freelancerId: freelancerResult[0].insertId
    });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({
      message: "Failed to edit profile",
      message: error.message,
    });
  }
};
