exports.editProfile = async function (req, res) {
    const { userId } = req.user;
    const {
        name,
        languages,
        about_tagline,
        about_description,
        educations,
        certifications,
        skills
    } = req.body;

    try {
        // Add project into database

        let fields = []
        if(name){ fields.push(name)}
        if(about_tagline){fields.push(about_tagline)}
         if(about_description){fields.push(about_description)}

         if(fields && fields.length > 0){
             const insertProjectQuery = `INSERT INTO freelancers(${array.map(item => item).join(',')}) VALUES (${array.map(item => '?').join(',')}) `;
             const queryParams = [projectTitle, category, subCategory, skills, projectDescription, budget, deadline];
             const insertFileResult = await queryRunner(insertProjectQuery, queryParams);
         }


         if (languages && languages.length > 0) {
            for (const language of languages) {
                const insertLanguagesQuery = `INSERT INTO freelancer_languages( name, freelancer_id ) VALUES (?,?) `;
                const queryParams = [language.name, userId];
                const insertLanguagesResult = await queryRunner(insertLanguagesQuery, queryParams);
            }
        }

        if (educations && educations.length > 0) {
            for (const education of educations) {
                const insertEducationstQuery = `INSERT INTO freelancer_education( university_name, country, degree, year, freelancer_id ) VALUES (?,?,?) `;
                const queryParams = [education.university_name, education.country, education.degree, education.year, userId];
                const insertEducationResult = await queryRunner(insertEducationstQuery, queryParams);
            }
        }

        if (certifications && certifications.length > 0) {
            for (const certification of certifications) {
                const insertCertificationstQuery = `INSERT INTO freelancer_certificate( certificate_name, awarded_by, year, freelancer_id ) VALUES (?,?,?) `;
                const queryParams = [certification.certificate_name, certification.awarded_by, certification.year, userId];
                const insertCertificationsResult = await queryRunner(insertCertificationstQuery, queryParams);
            }
        }

        if (skills && skills.length > 0) {
            for (const skill of skills) {
                const insertSkillstQuery = `INSERT INTO freelancer_skills( skill_name, experience_level, freelancer_id ) VALUES (?,?,?) `;
                const queryParams = [skill.skill_name, skill.experience_level, userId];
                const insertSkillsResult = await queryRunner(insertSkillstQuery, queryParams);
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