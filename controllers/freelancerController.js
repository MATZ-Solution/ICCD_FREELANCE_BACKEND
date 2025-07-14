const { language } = require("googleapis/build/src/apis/language");
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
    SELECT f.*, GROUP_CONCAT(fs.skill) AS skills, GROUP_CONCAT(fs.level) AS levels,
    GROUP_CONCAT(fl.language_name) AS languages, fe.*
    FROM freelancers f
    LEFT JOIN freelancer_skills fs ON fs.freelancer_id = f.id
    LEFT JOIN freelancers_languages fl ON fl.freelancer_id = f.id
    LEFT JOIN freelancer_education fe ON fe.freelancer_id = f.id
    WHERE userID = ?
    `;

    const selectResult = await queryRunner(getProjectQuery, [userId]);

    let emptyArray = []
    let name = selectResult[0][0]?.skills?.split(',')
    let level = selectResult[0][0]?.levels?.split(',')
    for (let i = 0; i <= name.length - 1; i++) {
      emptyArray.push({ name: name[i], level: level[i] })
    }

    const filterData = selectResult[0].map((item) => ({
      ...item,
      education:
      {
        institution: item?.university_name,
        location: item?.country, degree: item?.degree, major: item?.major, year: item?.year
      },
      languages: item.languages?.split(','),
      skills: emptyArray,
      levels: ''
    }))

    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        // data: selectResult[0],
        data: filterData
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
  } = req.body;

  console.log("education: ", educations)

  try {

    let languagesArray;
    if (languages && languages.length > 0) {
      languagesArray = JSON.parse(languages)
    }

    let skillsArray;
    if (skills && skills.length > 0) {
      skillsArray = JSON.parse(skills)
    }

    let certificationArray;
    if (certifications && certifications.length > 0) {
      certificationArray = JSON.parse(certifications)
    }

    let educationArray;
    if (educations && educations.length > 0) {
      educationArray = JSON.parse(educations)
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

    let freelancerId = freelancerResult[0].insertId

    if (languagesArray && languagesArray.length > 0) {
      for (const i of languagesArray) {
        const insertLanguagesQuery = `INSERT INTO freelancers_languages( language_name, freelancer_id ) VALUES (?,?)`;
        const queryParams = [i.language, freelancerId];
        const insertLanguagesResult = await queryRunner(
          insertLanguagesQuery,
          queryParams
        );
      }
    }

    if (educationArray && educationArray.length > 0) {
      for (const edu of educationArray) {
        const insertEducationstQuery = `INSERT INTO freelancer_education( university_name, country, degree, major, year, freelancer_id ) VALUES (?,?,?,?,?,?) `;

        const queryParams = [
          edu.institution,
          edu.level,
          edu.title,
          edu.major,
          edu.year,
          freelancerId,
        ];
        console.log("queryParams: ", queryParams)
        const insertEducationResult = await queryRunner(
          insertEducationstQuery,
          queryParams
        );
      }
    }

    if (certificationArray && certificationArray.length > 0) {
      for (const certification of certificationArray) {
        const insertCertificationstQuery = `INSERT INTO freelancer_certificate( certificate_name, awarded_by, year, freelancer_id ) VALUES (?,?,?,?) `;
        const queryParams = [
          certification.name,
          certification.from,
          certification.year,
          freelancerId,
        ];
        const insertCertificationsResult = await queryRunner(
          insertCertificationstQuery,
          queryParams
        );
      }
    }

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

exports.editProfile = async function (req, res) {
  const { userId } = req.user;
  const { freelancerId } = req.params
  const {
    firstName,
    lastName,
    languages,
    about_tagline,
    about_description,
    educations,
    certifications,
    skills,
  } = req.body;

  console.log("languages: ", languages)

  try {

    let languagesArray;
    if (languages && languages.length > 0) {
      languagesArray = JSON.parse(languages)
    }

    let skillsArray;
    if (skills && skills.length > 0) {
      skillsArray = JSON.parse(skills)
    }

    let certificationArray;
    if (certifications && certifications.length > 0) {
      certificationArray = JSON.parse(certifications)
    }

    let educationArray;
    if (educations && educations.length > 0) {
      educationArray = JSON.parse(educations)
    }

    // Add project into database
    let fields = [];
    let column = [];

    if (about_tagline) {
      fields.push(about_tagline);
      column.push(" about_tagline = ? ");
    }
    if (about_description) {
      fields.push(about_description);
      column.push(" about_description = ? ");
    }

    if (fields && fields.length > 0) {
      console.log("fields: ", [...fields, userId])
      const insertProjectQuery = `UPDATE freelancers SET ${column.map(item => item).join(',')} WHERE userID = ?`;
      const insertFileResult = await queryRunner(insertProjectQuery, [...fields, userId]);
    }

    if (languagesArray && languagesArray.length > 0) {
      console.log("1")
      let deleteQuery = `DELETE FROM freelancers_languages WHERE freelancer_id = ?;`
      let deleteLanguagesResult = await queryRunner(deleteQuery, [freelancerId]);

      // if (deleteLanguagesResult.affectedRows > 0) {
        for (const i of languagesArray) {
          const insertLanguagesQuery = `INSERT INTO freelancers_languages( language_name, freelancer_id ) VALUES (?,?)`;
          const queryParams = [i, freelancerId];
          const insertLanguagesResult = await queryRunner(
            insertLanguagesQuery,
            queryParams
          );
        }
      // }

    }

    // if (educationArray && educationArray.length > 0) {
    //   for (const edu of educationArray) {
    //     const insertEducationstQuery = `INSERT INTO freelancer_education( university_name, country, degree, major, year, freelancer_id ) VALUES (?,?,?,?,?,?) `;

    //     const queryParams = [
    //       edu.institution,
    //       edu.level,
    //       edu.title,
    //       edu.major,
    //       edu.year,
    //       freelancerId,
    //     ];
    //     console.log("queryParams: ", queryParams)
    //     const insertEducationResult = await queryRunner(
    //       insertEducationstQuery,
    //       queryParams
    //     );
    //   }
    // }

    // if (certificationArray && certificationArray.length > 0) {
    //   for (const certification of certificationArray) {
    //     const insertCertificationstQuery = `INSERT INTO freelancer_certificate( certificate_name, awarded_by, year, freelancer_id ) VALUES (?,?,?,?) `;
    //     const queryParams = [
    //       certification.name,
    //       certification.from,
    //       certification.year,
    //       freelancerId,
    //     ];
    //     const insertCertificationsResult = await queryRunner(
    //       insertCertificationstQuery,
    //       queryParams
    //     );
    //   }
    // }

    // if (skillsArray && skillsArray.length > 0) {
    //   for (const skill of skillsArray) {
    //     const insertSkillstQuery = `INSERT INTO freelancer_skills( skill, level, freelancer_id ) VALUES (?,?,?) `;
    //     const queryParams = [skill.skill, skill.level, freelancerId];
    //     const insertSkillsResult = await queryRunner(
    //       insertSkillstQuery,
    //       queryParams
    //     );
    //   }
    // }

    // Add files into database
    // if (freelancerResult && freelancerResult[0].affectedRows > 0) {
    //   let freelancerId = freelancerResult[0].insertId
    //   if (req.files.length > 0) {
    //     for (const file of req.files) {
    //       const insertFileResult = await queryRunner(
    //         `UPDATE freelancers
    //           SET fileUrl = ?, fileKey = ?, userID = ?
    //           WHERE id = ?`,
    //         [file.location, file.key, userId, freelancerId]
    //       );
    //       if (insertFileResult.affectedRows <= 0) {
    //         return res.status(500).json({
    //           statusCode: 500,
    //           message: "Failed to add files",
    //         });
    //       }
    //     }
    //   }
    // } else {
    //   return res.status(200).json({
    //     statusCode: 200,
    //     message: "Failed to add Project",
    //   });
    // }
    res.status(200).json({
      statusCode: 200,
      message: "Profile Edit successfully",
      // freelancerId: freelancerResult[0].insertId
    });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({
      message: "Failed to edit profile",
      message: error.message,
    });
  }
};
