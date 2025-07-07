const { queryRunner } = require("../helper/queryRunner");

exports.postGigs = async function (req, res) {
  const { userId } = req.user;
  const {
    gigsTitle,
    category,
    subCategory,
    description,
    packages
  } = req.body;

  try {

    // Add project into database
    const insertGigsQuery = `INSERT INTO gigs(title, description, category, subCategory, userID) VALUES (?,?,?,?,?) `;
    const queryParamsGigs = [gigsTitle, category, subCategory, description, packages];

    const insertGigsResult = await queryRunner(insertGigsQuery, queryParamsGigs);

    for (const key of ['basic', 'standard', 'premium']) {
      const pkg = packages[key];
      
      if (!pkg) continue; 
      const { name, description, delivery_time, revisions, price } = pkg;
      await queryRunner(
        `INSERT INTO packages (gig_id, name, description, delivery_time, revisions, price)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [gigId, name, description, delivery_time, revisions, price]
      );
    }


    // Add files into database
    if (insertFileResult[0].affectedRows > 0) {
      let projectID = insertFileResult[0].insertId;
      if (req.files.length > 0) {
        for (const file of req.files) {
          const insertFileResult = await queryRunner(
            "INSERT INTO gigsfiles (fileUrl, fileKey, projectID) VALUES (?, ?, ?)",
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
        message: "Failed to add project",
      });
    }
    res.status(200).json({
      statusCode: 200,
      message: "Scout Created successfully",
    });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({
      message: "Failed to add Project",
      message: error.message,
    });
  }
};