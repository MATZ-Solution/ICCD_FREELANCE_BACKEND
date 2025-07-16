const { queryRunner } = require("../helper/queryRunner");

exports.createOrder = async function (req, res) {
    const { order_status, ordered, payment_status, gigID, clientID, freelancerID, packageID } = req.body;
    try {
        // Add orders into database
        const insertOrderQuery = `INSERT INTO orders(status, ordered, payment_status, gigID, clientID, freelancerID, packageID ) VALUES (?,?,?,?,?,?,?) `;
        const values = [order_status, ordered, payment_status, gigID, clientID, freelancerID, packageID]
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
    const { freelancerID } = req.params;
    try {
        const getOrderQuery = `
        SELECT 
        o.id as orderID,o.status, g.id as gigsID, g.title AS gigsTitle, g.description AS gigsDescription,
        GROUP_CONCAT(gf.fileUrl) AS gigsImage,
        u.name AS clientName, u.fileurl AS clientImage 

        FROM orders o
        JOIN gigs g ON g.id = o.gigID
        JOIN users u ON u.id = o.clientID
        JOIN gigsfiles gf ON gf.gigID = g.id
        WHERE o.freelancerID = ?
     `;
        const selectResult = await queryRunner(getOrderQuery, [freelancerID]);

        if (selectResult[0].length > 0) {
            res.status(200).json({
                statusCode: 200,
                message: "Success",
                data: selectResult[0]
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
                data: selectResult[0]
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

exports.getAllOrderByClient = async (req, res) => {
    const { userID } = req.body;
    try {
        const getOrderQuery = `
        SELECT 
        o.*,
        g.id as gigsID, g.title AS gigsTitle, g.description AS gigsDescription
        FROM orders o
        JOIN gigs g ON g.id = o.gigID
        WHERE o.userID = ?
     `;
        const selectResult = await queryRunner(getOrderQuery, [userID]);

        if (selectResult[0].length > 0) {
            res.status(200).json({
                statusCode: 200,
                message: "Success",
                data: selectResult[0]
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
                data: selectResult[0]
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