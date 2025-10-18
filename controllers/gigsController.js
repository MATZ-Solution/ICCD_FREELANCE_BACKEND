const { queryRunner } = require("../helper/queryRunner");
const { deleteS3File } = require("../utils/deleteS3Files");
const { getTotalPage } = require("../helper/getTotalPage");
const { param } = require("../routes/gigsRoutes");

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
        delivery_time,
        revisions,
        price,
        ...rest
      } = pkg;
      await queryRunner(
        `
        INSERT INTO packages(packageType, name, description, deliveryTime, revisions, price, packages, gigID)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          packageType,
          name,
          description,
          delivery_time,
          revisions,
          price,
          JSON.stringify(rest),
          gigId,
        ]
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

// exports.getAllGigs = async (req, res) => {
//   const { search, page = 1 } = req.query;
//   const limit = 12;
//   const offset = (page - 1) * limit
//   console.log("req.query1: ", req.query)
//   let queryParams = [];
//   try {
//     let getProjectQuery = `
//     SELECT
//         g.*,
//         f.firstName, f.lastName, f.about_description,f.fileUrl as freelancerImg,
//         GROUP_CONCAT(gf.fileUrl) AS fileUrls
//       FROM gigs g
//       LEFT JOIN freelancers f ON f.id = g.freelancer_id
//       LEFT JOIN gigsfiles gf ON gf.gigID = g.id
//       `;

//     if (search) {
//       getProjectQuery += `WHERE ( g.title LIKE '%${search}%' OR g.description LIKE '%${search}%') `;
//     }
//     getProjectQuery += ` GROUP BY g.id `;
//     const selectResult = await queryRunner(getProjectQuery);

//       let countQuery = `
//       SELECT COUNT(DISTINCT g.id) AS total
//       FROM gigs g
//       LEFT JOIN freelancers f ON f.id = g.freelancer_id
//       LEFT JOIN gigsfiles gf ON gf.gigID = g.id
//       ${search ? `WHERE g.title LIKE '%${search}%' OR g.description LIKE '%${search}%'` : ""}
//     `;
//     const total = (await queryRunner(countQuery))[0][0].total;
//     const totalPages = Math.ceil(total / limit);

//     if (selectResult[0].length > 0) {
//       res.status(200).json({
//         statusCode: 200,
//         message: "Success",
//         data: selectResult[0],
//       });
//     } else {
//       res.status(200).json({
//         data: [],
//         message: "Gigs Not Found",
//       });
//     }
//   } catch (error) {
//     console.error("Query error: ", error);
//     return res.status(500).json({
//       statusCode: 500,
//       message: "Failed to get gigs",
//       error: error.message,
//     });
//   }
// };

exports.getAllGigs = async (req, res) => {
  const { search, page = 1, freelancer_id } = req.query;
  const limit = 15;
  const offset = (page - 1) * limit;

  try {
    let baseQuery = `
      FROM gigs g
      LEFT JOIN freelancers f ON f.id = g.freelancer_id
      LEFT JOIN gigsfiles gf ON gf.gigID = g.id
    `;
    let whereCond = [];
    let whereClause = ""
    if (search) {
      whereCond.push(` (g.title LIKE '%${search}%' OR g.description LIKE '%${search}%') `);
    }
    if(freelancer_id && freelancer_id !== 'undefined'){
      whereCond.push(` freelancer_id != ${freelancer_id} `);
    }
    if(whereCond.length > 0){
      let concat_whereCond = whereCond.join(" AND ")
      whereClause += ` WHERE ${concat_whereCond} `
    }
    let getProjectQuery = `
      SELECT 
        g.*,
        f.firstName, f.lastName, f.about_description, f.fileUrl as freelancerImg,
        GROUP_CONCAT(gf.fileUrl) AS fileUrls
      ${baseQuery}
      ${whereClause}
      GROUP BY g.id
      LIMIT ${limit} OFFSET ${offset}
    `;
    const selectResult = await queryRunner(getProjectQuery);

    if (selectResult[0].length > 0) {
      const countQuery = ` SELECT COUNT(DISTINCT g.id) AS total ${baseQuery} ${whereClause} `;
      const totalPages = await getTotalPage(countQuery, limit);
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0],
        totalPages
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
     
       p.name as packageName, p.description as packageDescription, p.deliveryTime, p.revisions,
        p.price,p.packageType, p.packages as gigPackages,

      f.id as freelancerId, f.userID as freelancerClientId, f.fileUrl as freelancerPic, f.firstName, f.lastName, f.about_tagline, f.about_description,
      GROUP_CONCAT(DISTINCT fl.language_name) as FreelancerLanguages
      
      FROM gigs g

      LEFT JOIN gigsfiles gf ON gf.gigID = g.id
      LEFT JOIN freelancers f ON f.id = g.freelancer_id
      LEFT JOIN packages p ON p.gigID = g.id
      LEFT JOIN freelancers_languages fl ON fl.freelancer_id = f.id
      WHERE g.id = ?
      GROUP BY p.packageType
      `;
    const selectResult = await queryRunner(getProjectQuery, [gigID]);
    const {
      title,
      category,
      subCategory,
      packages,
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
      freelancerClientId,
    } = selectResult[0][0];

    const filterData = selectResult[0].map((item) => ({
      packageId: item.id,
      packageType: item.packageType,
      packageName: item.packageName,
      packageDescription: item.packageDescription,
      deliveryTime: item.deliveryTime,
      revisions: item.revisions,
      price: item.price,
      packages: item.gigPackages,
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
        freelancerName: firstName + " " + lastName,
        about_tagline: about_tagline,
        freelancer_about_description: about_description,
        FreelancerLanguages,
        FreelancerLanguages,
        freelancerPic: freelancerPic,
        freelancerClientId,
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

exports.getPackages = async (req, res) => {
  const { id } = req.params;

  try {
    const getPackageQuery = `SELECT * FROM packages WHERE gigID = ? `;
    const selectResult = await queryRunner(getPackageQuery, [id]);

    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0],
        // data: filterData,
      });
    } else {
      res.status(200).json({
        data: [],
        message: "Package Not Found",
      });
    }
  } catch (error) {
    console.error("Query error: ", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to get Package",
      error: error.message,
    });
  }
};

exports.getGigsByUser = async (req, res) => {
  const { userId } = req.user;
  const { id } = req.params;
  const { search = '', page = 1  } = req.query;
  const limit = 10;
  const offset = (page - 1) * limit;
  try {
    let baseQuery = `
      FROM gigs g 
      LEFT JOIN gigsfiles gf ON gf.gigID = g.id
      WHERE g.freelancer_id = ?
    `;
    let whereClause = "";
    if (search) {
      whereClause = ` AND (g.title LIKE '%${search}%' OR g.description LIKE '%${search}%')`;
    }
    const getProjectQuery = `
    SELECT  g.*, GROUP_CONCAT(gf.fileUrl) AS gigsFiles
    ${baseQuery} ${whereClause}
    GROUP BY g.id
    LIMIT ${limit} OFFSET ${offset}
    `;

    const selectResult = await queryRunner(getProjectQuery, [id]);

    const filterData = selectResult[0].map((item) => ({
      ...item,
      gigsFiles: item.gigsFiles ? item.gigsFiles.split(",")[0] : [],
    }));

    if (selectResult[0].length > 0) {
      const countQuery = ` SELECT COUNT(DISTINCT g.id) AS total ${baseQuery} ${whereClause} `;
      const totalPages = await getTotalPage(countQuery, limit, [id]);
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        // data: selectResult[0]
        data: filterData,
        totalPages
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

exports.getGigsFiles = async (req, res) => {
  const { gigID } = req.params;
  try {
    const getProjectQuery = `SELECT * FROM gigsfiles WHERE gigID = ?`;

    const selectResult = await queryRunner(getProjectQuery, [gigID]);

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

exports.editGigsFiles = async function (req, res) {
  const { gigId } = req.params;
  const { delFilesKey } = req.body;
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
  const {
    gigsTitle,
    category,
    subCategory,
    description,
    package = "",
  } = req.body;
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

    // const parsedPackages = JSON.parse(packages);
    if (package) {
      for (const key of ["basic", "standard", "premium"]) {
        const pkg = package[key];
        if (!pkg) continue;
        const {
          packageType,
          name,
          description,
          deliveryTime,
          revisions,
          price,
          packages,
        } = pkg;
        const queryParams = [
          packageType,
          name,
          description,
          deliveryTime,
          revisions,
          price,
          packages,
          gigId,
          packageType,
        ];
        await queryRunner(
          `UPDATE packages SET packageType = ?, name = ?, description = ?, deliveryTime = ?, 
             revisions = ?, price = ?, packages = ?
             WHERE gigID = ? AND packageType = ?`,
          queryParams
        );
      }
    }

    if (req.files && req.files?.length > 0) {
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
  const { fileKey } = req.body;
  try {
    await deleteS3File(fileKey);
  } catch (error) {
    console.error("Query error: ", error);
  }
};
