const { queryRunner } = require("../helper/queryRunner");

exports.addGigs = async function (req, res) {
  const { userId } = req.user;
  const { gigsTitle, category, subCategory, description, packages } = req.body;

  try {
    // Add project into database
    const insertGigsQuery = `INSERT INTO gigs(title, description, category, subCategory, userID) VALUES (?,?,?,?,?) `;
    const queryParamsGigs = [
      gigsTitle,
      description,
      category,
      subCategory,
      userId,
    ];

    // add gigs in gigs table
    const insertGigsResult = await queryRunner(
      insertGigsQuery,
      queryParamsGigs
    );

    // add packages in packages table
    const gigId = insertGigsResult[0].insertId;
    const parsedPackages = JSON.parse(packages);
    for (const key of ["basic", "standard", "premium"]) {
      const pkg = parsedPackages[key];
      if (!pkg) continue;
      const { name, title, delivery, revisions, price } = pkg;
      await queryRunner(
        `INSERT INTO packages( name, title, deliveryTime, revisions, gigID)
       VALUES (?, ?, ?, ?, ?)`,
        [name, title, delivery, revisions, gigId]
      );
    }

    // add gig's file in gigsfiles table
    if (req.files.length > 0) {
      for (const file of req.files) {
        const insertFileResult = await queryRunner(
          `INSERT INTO gigsfiles(fileUrl, fileKey, gigID) VALUES (?, ?, ?)`,
          [file.location, file.key, gigId]
        );
        if (insertFileResult.affectedRows <= 0) {
          return res.status(500).json({
            statusCode: 500,
            message: "Failed to add files",
          });
        }
      }
    }

    return res.status(200).json({
      statusCode: 200,
      message: "Gigs added successfully",
    });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({
      message: "Failed to add Gigs",
      message: error.message,
    });
  }
};

exports.getAllGigs = async (req, res) => {
  const { search } = req.body;
  try {
    const getProjectQuery = `
      SELECT g.*, u.name, gf.fileUrl
      FROM gigs g
      LEFT JOIN users u ON u.id = g.userID
      LEFT JOIN gigsfiles gf ON gf.gigID = g.id
      WHERE g.title LIKE ? OR g.description LIKE ?
      `;

    const searchTerm = `%${search}%`;

    // Use parameterized query to prevent SQL injection
    const selectResult = await queryRunner(getProjectQuery, [
      searchTerm,
      searchTerm,
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

exports.getSingleGigs = async (req, res) => {
  const { gigID } = req.params;
  try {
    const getProjectQuery = `
      SELECT g.*, u.name, 
      p.title as packageTitle, p.name, p.deliveryTime, p.revisions, p.gigID
      FROM gigs g
      JOIN packages p ON p.gigID = g.id
      LEFT JOIN users u ON u.id = g.userID
      WHERE g.id = ?
      `;

    const selectResult = await queryRunner(getProjectQuery, [gigID]);
    console.log("selectResult: ", selectResult[0]);
    let arr = [];
    if (selectResult[0].length > 0) {
      const filter = selectResult[0].map((item) => {
        return { name: "sohaib" };
      });

      console.log("filter: ", filter);

      res.status(200).json({
        statusCode: 200,
        message: "Success",
        // data: selectResult[0],
        data2: filter,
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
