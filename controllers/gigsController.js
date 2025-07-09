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
  const { search } = req.query;
  console.log("search: ", search)
  let queryParams = [];
  try {
    let getProjectQuery = `
    SELECT 
        g.*,
        u.name,
        GROUP_CONCAT(gf.fileUrl) AS fileUrls
      FROM gigs g
      LEFT JOIN users u ON u.id = g.userID
      LEFT JOIN gigsfiles gf ON gf.gigID = g.id
      `;

    if (search) {
      getProjectQuery += ` WHERE g.title LIKE '%${search}%' OR g.description LIKE '%${search}%' `;
    }
    getProjectQuery += ` GROUP BY g.id `;
    const selectResult = await queryRunner(getProjectQuery);
    // console.log("getData: ", getData)

    // const getData = selectResult[0].filter((data)=> data.id);
    // console.log("getData: ", getData)
    // const getFiles = [...new Set(selectResult[0].map((item) => item.fileUrl))];

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
      SELECT g.id as gigsID, g.title, g.description, g.category, g.userID as freelancerID,  
      u.name as username, GROUP_CONCAT(DISTINCT(gf.fileUrl)) as gigsFiles,
      p.title as packageTitle,p.id as packageID, p.name, p.deliveryTime, p.revisions, p.gigID
      FROM gigs g
      JOIN gigsfiles gf ON gf.gigID = g.id
      JOIN packages p ON p.gigID = g.id
      LEFT JOIN users u ON u.id = g.userID
      WHERE g.id = ?
      GROUP BY p.name
      `;

    const selectResult = await queryRunner(getProjectQuery, [gigID]);
    console.log("selectResult: ", selectResult[0])
    const {
      gigsID,
      title,
      username,
      description,
      category,
      subCategory,
      freelancerID,
      created_at,
      gigsFiles
    } = selectResult[0][0];

    const getPackages = selectResult[0].map((item) => ({
      name: item.name,
      packageID: item.packageID,
      packageTitle: item.packageTitle,
      deliveryTime: item.deliveryTime,
      revisions: item.revisions,
    }));

    const filterData = {
      gigsID,
      title,
      username,
      description,
      category,
      subCategory,
      freelancerID,
      created_at,
      gigsFiles: gigsFiles.split(','),
      packages: getPackages,
    };

    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        // data: selectResult[0]
        data: filterData,
        // data2: filter,
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

exports.getGigsByUser = async (req, res) => {
  const { userId } = req.user;
  console.log("userId: ", userId)
  try {
    const getProjectQuery = `
    SELECT  g.*, GROUP_CONCAT(DISTINCT(gf.fileUrl)) AS gigsFiles, gf.id as gigFileID , gf.fileKey, gf.created_at, gf.gigID
     FROM gigs g 
    LEFT JOIN gigsfiles gf ON gf.gigID = g.id
    GROUP BY g.id
    HAVING g.userID = ?
    `;

    const selectResult = await queryRunner(getProjectQuery, [userId]);

    const filterData = selectResult[0].map((item) => ({
      ...item,
      gigsFiles: item.gigsFiles.split(',')[0]
    }))

    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        // data: selectResult[0]
        data: filterData
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
