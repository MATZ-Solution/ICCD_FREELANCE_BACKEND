const { queryRunner } = require("../helper/queryRunner");
const { deleteS3File } = require("../utils/deleteS3Files")

exports.addGigs = async function (req, res) {
  const {
    gigsTitle,
    category,
    subCategory,
    description,
    packages,
    freelancerId,
  } = req.body;

  try {
    // Add project into database
    const insertGigsQuery = `INSERT INTO gigs(title, description, category, subCategory, freelancer_id) VALUES (?,?,?,?,?) `;
    const queryParamsGigs = [
      gigsTitle,
      description,
      category,
      subCategory,
      freelancerId,
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
      const {
        packageType,
        name,
        description,
        deliveryTime,
        revisions,
        stationeryDesigns,
        vectorFile,
        sourceFile,
        socialMediaKit,
        printableFile,
        logoTransparency,
        price,
      } = pkg;
      const queryParams = [
        packageType,
        name,
        description,
        deliveryTime,
        revisions,
        stationeryDesigns,
        vectorFile,
        sourceFile,
        socialMediaKit,
        printableFile,
        logoTransparency,
        price,
        gigId,
      ];
      await queryRunner(
        `INSERT INTO packages( packageType, name, description, deliveryTime, revisions, stationeryDesigns,
        vectorFile, sourceFile, socialMediaKit, printableFile, logoTransparency, price,
        gigID)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        queryParams
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
  console.log("search: ", search);
  let queryParams = [];
  try {
    let getProjectQuery = `
    SELECT 
        g.*,
        f.firstName, f.lastName,
        GROUP_CONCAT(gf.fileUrl) AS fileUrls
      FROM gigs g
      LEFT JOIN freelancers f ON f.id = g.freelancer_id
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
      SELECT 
      g.id as gigsID, g.title, g.description, g.category,g.subCategory, g.freelancer_id as freelancerID, GROUP_CONCAT(DISTINCT(gf.fileUrl)) as gigsFiles,
      
      p.name as packageName, p.description as packageDescription,
      p.stationeryDesigns, p.vectorFile, p.sourceFile, p.socialMediaKit, p.printableFile,
      p.logoTransparency, p.deliveryTime, p.revisions, p.price,p.packageType,

      f.id as freelancerId, f.fileUrl as freelancerPic, f.firstName, f.lastName, f.about_tagline, f.about_description,
      GROUP_CONCAT(fl.language_name) as FreelancerLanguages
      
      FROM gigs g

      JOIN gigsfiles gf ON gf.gigID = g.id
      JOIN packages p ON p.gigID = g.id
      JOIN freelancers f ON f.id = g.freelancer_id
      JOIN freelancers_languages fl ON fl.freelancer_id = f.id
      WHERE g.id = ?
      GROUP BY p.packageType
      `;
    const selectResult = await queryRunner(getProjectQuery, [gigID]);
    console.log("selectResult: ", selectResult[0])
    const {
      title,
      category,
      subCategory,
      description,
      gigsFiles,
      firstName,
      lastName,
      about_tagline,
      about_description,
      freelancerPic,
      FreelancerLanguages,
      gigsID,
      freelancerId,
    } = selectResult[0][0];

    const filterData = selectResult[0].map((item) => ({
      packageId: item.id,
      packageType: item.packageType,
      packageName: item.packageName,
      packageDescription: item.packageDescription,
      deliveryTime: item.deliveryTime,
      stationeryDesigns: item.stationeryDesigns,
      vectorFile: item.vectorFile,
      sourceFile: item.sourceFile,
      socialMediaKit: item.socialMediaKit,
      printableFile: item.printableFile,
      logoTransparency: item.logoTransparency,
      revisions: item.revisions,
      price: item.price,
    }));

    const obj = {
      gigsDescription: {
        gigsID: gigsID,
        gigsTitle: title,
        gigsCategory: category,
        gigsSubcategory: subCategory,
        gigsDescription: description,
        gigsFiles: gigsFiles,
      },
      freelancerDetails: {
        freelancerId: freelancerId,
        freelancerName: firstName + lastName,
        about_tagline: about_tagline,
        freelancer_about_description: about_description,
        FreelancerLanguages,
        FreelancerLanguages,
        freelancerPic: freelancerPic,
      },
      packagesDetails: filterData,
    };

    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        // data: selectResult[0]
        data: [obj],
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
  const { id } = req.params;
  console.log("userId: ", userId);
  try {
    const getProjectQuery = `
    SELECT  g.*, GROUP_CONCAT(gf.fileUrl) AS gigsFiles
    FROM gigs g 
    LEFT JOIN gigsfiles gf ON gf.gigID = g.id
    WHERE g.freelancer_id = ?
    GROUP BY g.id
    `;

    const selectResult = await queryRunner(getProjectQuery, [id]);

    const filterData = selectResult[0].map((item) => ({
      ...item,
      gigsFiles: item.gigsFiles ? item.gigsFiles.split(",")[0] : [],
    }));

    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        // data: selectResult[0]
        data: filterData,
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

// ############   FOR EDIT GIGS   #########
exports.getGigsOverview = async (req, res) => {
  const { gigID } = req.params;
  try {
    const getProjectQuery = `SELECT title, category, subCategory, description FROM gigs WHERE id = ?`;

    const selectResult = await queryRunner(getProjectQuery, [gigID]);

    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0]
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

exports.getGigsFiles = async (req, res) => {
  const { gigID } = req.params;
  try {
    const getProjectQuery = `SELECT * FROM gigsfiles WHERE gigID = ?`;

    const selectResult = await queryRunner(getProjectQuery, [gigID]);

    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0]
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

exports.editGigsFiles = async function (req, res) {
  const { gigId } = req.params;
  const { delFilesKey } = req.body;
  console.log("gigs files: ", req.files)
  try {
    if (delFilesKey && JSON.parse(delFilesKey).length > 0) {
      for (const fileKey of JSON.parse(delFilesKey)) {
        await deleteS3File(fileKey);
        const insertFileResult = await queryRunner(
          `DELETE FROM gigsfiles WHERE gigID = ? AND fileKey = ?`,
          [gigId, fileKey]
        );
      }
    }
    if (req.files && req.files?.length > 0) {
      for (const file of req.files) {
        // await deleteS3File(fileKey);
        console.log("1")
        const insertFileResult = await queryRunner(
          `INSERT INTO gigsfiles(fileUrl, fileKey, gigID) VALUES (?, ?, ?)`,
          [file.location, file.key, gigId]
        );
        if (insertFileResult.affectedRows <= 0) {
          return res.status(500).json({
            statusCode: 500,
            message: "Failed to edit files",
          });
        }
      }
    }
    return res.status(200).json({
      statusCode: 200,
      message: "Gigs files Edited successfully",
    });

  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({
      message: "Failed to edit Gigs",
      message: error.message,
    });
  }
};

// ############   FOR EDIT GIGS END   #########

exports.editGigs = async function (req, res) {
  const { gigId } = req.params;
  const { gigsTitle, category, subCategory, description, packages = '' } = req.body;
  try {

    if (gigsTitle && category && subCategory) {
      const insertGigsQuery = `UPDATE gigs SET title = ?, category = ?, subCategory = ? WHERE id = ? `;
      const insertGigsResult = await queryRunner(insertGigsQuery, [
        gigsTitle,
        category,
        subCategory,
        gigId,
      ]);
    }

    if (description) {
      const insertGigsQuery = `UPDATE gigs SET description = ? WHERE id = ? `;
      const insertGigsResult = await queryRunner(insertGigsQuery, [
        description,
        gigId,
      ]);
    }

    if (packages && packages?.premium) {
      console.log("packages: ", packages)
      // const parsedPackages = JSON.parse(packages);
      for (const key of ["basic", "standard", "premium"]) {
        const pkg = packages[key];
        if (!pkg) continue;
        const {
          packageType,
          name,
          description,
          deliveryTime,
          revisions,
          stationeryDesigns,
          vectorFile,
          sourceFile,
          socialMediaKit,
          printableFile,
          logoTransparency,
          price,
        } = pkg;
        const queryParams = [
          packageType,
          name,
          description,
          deliveryTime,
          revisions,
          stationeryDesigns,
          vectorFile,
          sourceFile,
          socialMediaKit,
          printableFile,
          logoTransparency,
          price,
          gigId,
          packageType
        ];
        console.log("params: ", queryParams)
        await queryRunner(
          `UPDATE packages SET packageType = ?, name = ?, description = ?, deliveryTime = ?, 
           revisions = ? , stationeryDesigns = ?, vectorFile = ?, sourceFile = ?, socialMediaKit = ?, 
           printableFile = ?, logoTransparency = ?, price = ?
           WHERE gigID = ? AND packageType = ?`,
          queryParams
        );
      }
    }

    if (req.files && req.files?.length > 0) {
      for (const file of req.files) {
        console.log("1")
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
      message: "Gigs Edited successfully",
    });

  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({
      message: "Failed to add Gigs",
      message: error.message,
    });
  }
};

exports.checkDeleteFile = async (req, res) => {
  const { fileKey } = req.body
  try {
    await deleteS3File(fileKey);
  } catch (error) {
    console.error("Query error: ", error);
  }
};
