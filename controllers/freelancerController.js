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

exports.editProfile = async function (req, res) {
  const { userId } = req.user;
  const {
    name,
    languages,
    about_tagline,
    about_description,
    educations,
    certifications,
    skills,
  } = req.body;

  console.log("langguages: ", languages)

  try {
    // Add project into database

    let fields = [];
    let column = [];
    if (name) {
      fields.push(name);
      column.push("name");
    }
    if (about_tagline) {
      fields.push(about_tagline);
      column.push("about_tagline");
    }
    if (about_description) {
      fields.push(about_description);
      column.push("about_description");
    }

    if (fields && fields.length > 0) {
      fields.push(userId);
      const insertProjectQuery = `INSERT INTO freelancers(${column.map(item => item).join(',')}) VALUES (${fields.map(item => '?').join(',')})`;
      const insertFileResult = await queryRunner(insertProjectQuery, fields);
    }

    if (languages && languages.length > 0) {
      for (const language of languages) {
        const insertLanguagesQuery = `INSERT INTO freelancer_languages( name, freelancer_id ) VALUES (?,?)`;
        const queryParams = [language.language, userId];
        const insertLanguagesResult = await queryRunner(
          insertLanguagesQuery,
          queryParams
        );
      }
    }

    if (educations && educations.length > 0) {
      for (const education of educations) {
        const insertEducationstQuery = `INSERT INTO freelancer_education( university_name, country, degree, year, freelancer_id ) VALUES (?,?,?) `;
        const queryParams = [
          education.university_name,
          education.country,
          education.degree,
          education.year,
          userId,
        ];
        const insertEducationResult = await queryRunner(
          insertEducationstQuery,
          queryParams
        );
      }
    }

    if (certifications && certifications.length > 0) {
      for (const certification of certifications) {
        const insertCertificationstQuery = `INSERT INTO freelancer_certificate( certificate_name, awarded_by, year, freelancer_id ) VALUES (?,?,?) `;
        const queryParams = [
          certification.certificate_name,
          certification.awarded_by,
          certification.year,
          userId,
        ];
        const insertCertificationsResult = await queryRunner(
          insertCertificationstQuery,
          queryParams
        );
      }
    }

    if (skills && skills.length > 0) {
      for (const skill of skills) {
        const insertSkillstQuery = `INSERT INTO freelancer_skills( skill_name, experience_level, freelancer_id ) VALUES (?,?,?) `;
        const queryParams = [skill.skill_name, skill.experience_level, userId];
        const insertSkillsResult = await queryRunner(
          insertSkillstQuery,
          queryParams
        );
      }
    }

    // Add files into database
    // if (insertFileResult[0].affectedRows > 0) {
    //     let projectID = insertFileResult[0].insertId;
    //     if (req.files.length > 0) {
    //         for (const file of req.files) {
    //             const insertFileResult = await queryRunner(
    //                 "INSERT INTO projectfiles (fileUrl, fileKey, projectID) VALUES (?, ?, ?)",
    //                 [file.location, file.key, projectID]
    //             );
    //             if (insertFileResult.affectedRows <= 0) {
    //                 return res.status(500).json({
    //                     statusCode: 500,
    //                     message: "Failed to add files",
    //                 });
    //             }
    //         }
    //     }
    // } else {
    //     return res.status(200).json({
    //         statusCode: 200,
    //         message: "Failed to add Project",
    //     });
    // }
    res.status(200).json({
      statusCode: 200,
      message: "Profile Edit successfully",
    });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({
      message: "Failed to edit profile",
      message: error.message,
    });
  }
};
