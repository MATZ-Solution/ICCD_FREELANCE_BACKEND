const { queryRunner } = require("../helper/queryRunner");

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
  const { search } = req.query;
  try {
    let queryParam = [];
    let getOrderQuery = `
        SELECT 
          so.id, 
          so.created_at,
          so.base_price, so.package_type, so.status,
          g.id as gigsID, g.title AS gigsTitle, g.description AS gigsDescription,
          GROUP_CONCAT(gf.fileUrl) AS gigsImage
        FROM stripeorders so
        JOIN gigs g ON g.id = so.gig_id
        JOIN gigsfiles gf ON gf.gigID = g.id
        WHERE so.freelancer_id = ?
      
     `;
    queryParam.push(freelancerID);
    if (search) {
      getOrderQuery += ` AND g.title LIKE ?`;
      const searchTerm = `%${search}%`;
      queryParam.push(searchTerm);
    }

    getOrderQuery += ` GROUP BY so.id ORDER BY so.id DESC `

    console.log("getOrderQuery: ", getOrderQuery);
    console.log("queryParam: ", queryParam);

    const selectResult = await queryRunner(getOrderQuery, queryParam);
    const validResult = selectResult[0].filter((item) => item.gigsID !== null);

    if (validResult.length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: validResult,
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
  const { search } = req.query;
  try {
    let queryParam = [];
    let getOrderQuery = `
        SELECT 
        so.base_price, so.package_type, so.status,
        g.id as gigsID, g.title AS gigsTitle, g.description AS gigsDescription,
        GROUP_CONCAT(gf.fileUrl) AS gigsImage
        
        FROM stripeorders so
        LEFT JOIN gigs g ON g.id = so.gig_id
        LEFT JOIN gigsfiles gf ON gf.gigID = g.id
        WHERE so.client_id = ?
     `;
    queryParam.push(clientID);
    if (search) {
      getOrderQuery += ` AND (g.title LIKE ? OR g.description LIKE ?)`;
      const searchTerm = `%${search}%`;
      queryParam.push(searchTerm, searchTerm);
    }

    const selectResult = await queryRunner(getOrderQuery, queryParam);
    const validResult = selectResult[0].filter((item) => item.gigsID !== null);
    if (validResult.length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: validResult,
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
    const getOrderQuery = `
        SELECT 
        o.*,
        g.id as gigsID, g.title AS gigsTitle, g.description AS gigsDescription,
        p.*

        FROM orders o
        JOIN gigs g ON g.id = o.gigID
        JOIN packages p ON p.id = o.packageID
        WHERE o.id = ?
     `;
    const selectResult = await queryRunner(getOrderQuery, [orderId]);

    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0],
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
