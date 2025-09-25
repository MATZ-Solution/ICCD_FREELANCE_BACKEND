const { queryRunner } = require("../helper/queryRunner");
const { getTotalPage } = require("../helper/getTotalPage");

exports.createOrder = async function (req, res) {
  const {
    order_status,
    ordered,
    payment_status,
    gigID,
    clientID,
    freelancerID,
    packageID,
  } = req.body;
  try {
    // Add orders into database
    const insertOrderQuery = `INSERT INTO orders(status, ordered, payment_status, gigID, clientID, freelancerID, packageID ) VALUES (?,?,?,?,?,?,?) `;
    const values = [
      order_status,
      ordered,
      payment_status,
      gigID,
      clientID,
      freelancerID,
      packageID,
    ];
    const insertFileResult = await queryRunner(insertOrderQuery, values);

    if (insertFileResult[0].affectedRows > 0) {
      return res.status(200).json({
        statusCode: 200,
        message: "Order Created successfully",
      });
    } else {
      return res.status(500).json({
        statusCode: 500,
        message: "Failed to create order",
      });
    }
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({
      message: "Failed to create order",
      message: error.message,
    });
  }
};

exports.getAllOrderByFreelancer = async (req, res) => {
  const { freelancerID } = req.params;  // changed from freelancerID to id
  const { search, page = 1 } = req.query;
  const limit = 10;
  const offset = (page - 1) * limit;
  try {
    let baseQuery = `
        FROM stripeorders so
        JOIN gigs g ON g.id = so.gig_id
        JOIN gigsfiles gf ON gf.gigID = g.id
        WHERE so.freelancer_id = ? AND so.isDisputed != 'true'
    `;
    let whereClause = "";
    if (search) {
      whereClause = ` AND g.title LIKE '%${search}%' `;
    }
    let queryParam = [];
    let getOrderQuery = `
        SELECT 
          so.id, 
          so.created_at,
          so.base_price, so.package_type, so.status,
          g.id as gigsID, g.title AS gigsTitle, g.description AS gigsDescription,
          GROUP_CONCAT(gf.fileUrl) AS gigsImage
          ${baseQuery} ${whereClause}
          GROUP BY so.id ORDER BY so.id DESC
          LIMIT ${limit} OFFSET ${offset}
     `;
    queryParam.push(freelancerID);

    const selectResult = await queryRunner(getOrderQuery, queryParam);
    const validResult = selectResult[0].filter((item) => item.gigsID !== null);

    if (validResult.length > 0) {
      const countQuery = ` SELECT COUNT(DISTINCT so.id) AS total ${baseQuery} ${whereClause} `;
      const totalPages = await getTotalPage(countQuery, limit, [freelancerID]);
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: validResult,
        totalPages
      });
    } else {
      res.status(200).json({
        data: [],
        message: "Order Not Found",
      });
    }
  } catch (error) {
    console.error("Query error: ", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to get order",
      error: error.message,
    });
  }
};

exports.getSingleOrderByFreelancer = async (req, res) => {
  const { orderId } = req.params;

  try {
    const getOrderQuery = `
      SELECT 
        so.id, 
        so.session_id, 
        so.email, 
        so.amount,
        so.created_at,
        so.base_price, 
        so.client_id, 
        so.freelancer_id, 
        so.gig_id, 
        so.revisions, 
        so.quantity, 
        so.total_price, 
        so.package_type, 
        so.status,
        g.id AS gigsID, 
        g.title AS gigsTitle, 
        g.description AS gigsDescription,
        GROUP_CONCAT(gf.fileUrl) AS gigsImage
      FROM stripeorders so
      JOIN gigs g ON g.id = so.gig_id
      LEFT JOIN gigsfiles gf ON gf.gigID = g.id
      WHERE so.id = ?
      GROUP BY so.id, g.id
    `;

    const selectResult = await queryRunner(getOrderQuery, [orderId]);

    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0][0], // return the single order object
      });
    } else {
      res.status(404).json({
        statusCode: 404,
        message: "Order Not Found",
        data: null,
      });
    }
  } catch (error) {
    console.error("Query error: ", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to get order",
      error: error.message,
    });
  }
};

exports.getAllOrderByClient = async (req, res) => {
  const { clientID } = req.params;
  const { search, page = 1 } = req.query;
  const limit = 10;
  const offset = (page - 1) * limit;
  try {
    let queryParam = [];
    let baseQuery = ` FROM stripeorders so
        LEFT JOIN gigs g ON g.id = so.gig_id
        JOIN freelancers f ON  f.id = so.freelancer_id `
    let whereClause = "";
    if (search) {
      whereClause = ` WHERE so.client_id = ? AND so.isDisputed != 'true' `;
    }
    let getOrderQuery = `
        SELECT so.id as orderId, so.session_id, so.amount, so.status, so.gig_id, so.base_price,
        so.total_price, so.package_type, so.revisions, so.client_id,
        g.*, f.userID as freelancerUserId,
        (SELECT GROUP_CONCAT(gf.fileUrl)  FROM gigsfiles gf WHERE gf.gigID = so.gig_id ) as gigsImage
        ${baseQuery}
       ${whereClause}
       LIMIT ${limit} OFFSET ${offset}
     `;
    queryParam.push(clientID);
    // if (search) {
    //   getOrderQuery += ` AND (g.title LIKE ? OR g.description LIKE ?)`;
    //   const searchTerm = `%${search}%`;
    //   queryParam.push(searchTerm, searchTerm);
    // }

    const selectResult = await queryRunner(getOrderQuery, queryParam);
    const validResult = selectResult[0].filter((item) => item.gigsID !== null);
    if (validResult.length > 0) {
      const countQuery = ` SELECT COUNT(DISTINCT so.id) as total ${baseQuery} ${whereClause} `;
      const totalPages = await getTotalPage(countQuery, limit);
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: validResult,
        totalPages
      });
    } else {
      res.status(200).json({
        data: [],
        message: "Order Not Found",
      });
    }
  } catch (error) {
    console.error("Query error: ", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to get order",
      error: error.message,
    });
  }
};

exports.getSingleOrderByClient = async (req, res) => {
  const { orderId } = req.params;

  try {
    // 1️⃣ Fetch order with gig info
    const getOrderQuery = `
      SELECT so.*, g.* ,(SELECT GROUP_CONCAT(gf.fileUrl)  FROM gigsfiles gf WHERE gf.gigID = so.gig_id ) as gigsImage
      FROM stripeorders so
      JOIN gigs g ON g.id = so.gig_id
      WHERE so.id = ?
    `;
    const orderResult = await queryRunner(getOrderQuery, [orderId]);

    if (orderResult[0].length === 0) {
      return res.status(200).json({
        data: null,
        message: "Order Not Found",
      });
    }

    const order = orderResult[0][0]; // single order with gig info

    // 2️⃣ Fetch all packages for this gig
    const getPackagesQuery = `
      SELECT * FROM packages WHERE gigID = ?
    `;
    const packagesResult = await queryRunner(getPackagesQuery, [order.gig_id]);

    res.status(200).json({
      statusCode: 200,
      message: "Success",
      data: {
        order,
        packages: packagesResult[0], // array of packages
      },
    });

  } catch (error) {
    console.error("Query error: ", error);
    res.status(500).json({
      statusCode: 500,
      message: "Failed to get order",
      error: error.message,
    });
  }
};


exports.getAllOrderByAdmin = async (req, res) => {
  if (!queryRunner) {
    return res.status(500).json({ error: "Database connection not available" });
  }

  try {
    const { search } = req.query;

    let query = `
      SELECT so.*, g.title, 
      (SELECT GROUP_CONCAT(gf.fileUrl) AS gigsImage 
       FROM gigsfiles gf 
       WHERE gf.gigID = g.id) as gigsImage
      FROM stripeorders so
      LEFT JOIN gigs g ON g.id = so.gig_id
      LEFT JOIN gigsfiles gf ON gf.gigID = g.id
    `;

    if (search) {
      query += `
        WHERE g.title LIKE ? OR so.package_type LIKE ? OR so.status LIKE ?
      `;
    }

    query += ` GROUP BY so.id`;

    const params = search ? [`%${search}%`, `%${search}%`, `%${search}%`] : [];
    const result = await queryRunner(query, params);

    res.status(200).json({ orders: result[0] });
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    res.status(500).json({
      error: "Failed to fetch orders",
      details: error.message,
    });
  }
};
