const { queryRunner } = require("../helper/queryRunner");
const handleNotifications = require("../utils/sendnotification");

exports.addDispute = async function (req, res) {
    const { subject, reason, raised_by, orderId, client_id, freelancer_id } = req.body;
    try {

        const insertDisputeQuery = `INSERT INTO dispute(subject, reason, raised_by, clientId, freelancerId, orderId, status) VALUES (?,?,?,?,?,?,?) `;
        const queryParams = [subject, reason, raised_by, client_id, freelancer_id, orderId, "pending"];

        const insertResult = await queryRunner(insertDisputeQuery, queryParams);

        if (insertResult[0].affectedRows > 0) {
            if (req.files.length > 0) {
                for (const file of req.files) {
                    const insertFileResult = await queryRunner(
                        `INSERT INTO disputefiles(fileUrl, fileKey, disputeId, userType ) VALUES (?, ?, ?, ?)`,
                        [file.location, file.key, insertResult[0].insertId, raised_by]
                    );
                    if (insertFileResult.affectedRows <= 0) {
                        return res.status(500).json({
                            statusCode: 500,
                            message: "Failed to add files",
                        });
                    }
                }
            }
            let io = req.app.get("io");
            await handleNotifications(io, {
                sender_id: raised_by === 'client' ? client_id : freelancer_id,
                receiver_id: raised_by !== 'client' ? client_id : freelancer_id,
                title: "Dispute",
                message: `${raised_by} raise a dispute. `,
                type: `${raised_by === 'client' ? 'freelancer' : 'client'}`,
            });
            return res.status(200).json({
                statusCode: 200,
                message: "Dispute created successfully.",
            });
        } else {
            return res.status(500).json({
                statusCode: 500,
                message: "Failed to add dispute",
            });
        }

    } catch (error) {
        console.log("Error: ", error);
        return res.status(500).json({
            message: "Failed to add dispute",
            message: error.message,
        });
    }
};

exports.getAllDisputeByClient = async (req, res) => {
    const { userId } = req.params;
    try {
        const getDisputeQueryClient = `
    SELECT d.*, u.name
    FROM dispute d
    JOIN users u ON u.id = d.clientId
    WHERE d.clientId = ?  
    `;
        const selectResultClient = await queryRunner(getDisputeQueryClient, [userId]);

        if (selectResultClient[0].length > 0) {
            res.status(200).json({
                statusCode: 200,
                message: "Success",
                data: selectResultClient[0],
            });

        } else {
            res.status(200).json({
                data: [],
                message: "Dispute Not Found",
            });
        }
    } catch (error) {
        console.error("Query error: ", error);
        return res.status(500).json({
            statusCode: 500,
            message: "Failed to get dispute",
            error: error.message,
        });
    }
};

exports.getAllDisputeByFreelancer = async (req, res) => {
    const { userId } = req.params;
    try {
        const getDisputeQueryClient = `
    SELECT d.*, CONCAT(f.firstName, f.lastName) as name
    FROM dispute d
    JOIN freelancers f ON f.id = d.freelancerId
    WHERE d.freelancerId = ? 
    `;
        const selectResultClient = await queryRunner(getDisputeQueryClient, [userId]);

        if (selectResultClient[0].length > 0) {
            res.status(200).json({
                statusCode: 200,
                message: "Success",
                data: selectResultClient[0],
            });

        } else {
            res.status(200).json({
                data: [],
                message: "Dispute Not Found",
            });
        }
    } catch (error) {
        console.error("Query error: ", error);
        return res.status(500).json({
            statusCode: 500,
            message: "Failed to get dispute",
            error: error.message,
        });
    }
};

exports.getDisputeById = async (req, res) => {
    const { id } = req.params;
    try {
        const getDispute = `
    SELECT d.*, os.id as orderId, os.total_price, g.id as gigId, g.title,
    (SELECT GROUP_CONCAT(df.fileUrl) FROM disputefiles df WHERE df.disputeId = d.id) as disputeFiles
    FROM dispute d
    JOIN stripeorders os ON os.id = d.orderId
    JOIN gigs g ON g.id = os.gig_id
    WHERE d.id = ?  
    `;
        const selectResult = await queryRunner(getDispute, [id]);

        if (selectResult[0].length > 0) {
            res.status(200).json({
                statusCode: 200,
                message: "Success",
                data: selectResult[0],
            });

        } else {
            res.status(200).json({
                data: [],
                message: "Dispute Not Found",
            });
        }
    } catch (error) {
        console.error("Query error: ", error);
        return res.status(500).json({
            statusCode: 500,
            message: "Failed to get dispute",
            error: error.message,
        });
    }
};

exports.getAllDisputeByAdmin = async (req, res) => {
    const { search } = req.query
    try {
        let getProjectQuery = ` 
        SELECT d.*, u.name as client, CONCAT(f.firstName, f.lastName) as freelancer,
        os.total_price
        FROM dispute d
        JOIN users u ON u.id = d.clientId
        JOIN freelancers f ON f.id = d.freelancerId
        JOIN stripeorders os ON os.id = d.orderId
        `
        // if (search) {
        //   getProjectQuery += ` WHERE title LIKE '%${search}%' OR description LIKE '%${search}%' OR category LIKE '%${search}%' OR subCategory LIKE '%${search}%' `;
        // }
        const selectResult = await queryRunner(getProjectQuery);

        if (selectResult[0].length > 0) {
            res.status(200).json({
                statusCode: 200,
                message: "Success",
                data: selectResult[0]
            });
        } else {
            res.status(200).json({
                data: [],
                message: "Dispute Not Found",
            });
        }
    } catch (error) {
        console.error("Query error: ", error);
        return res.status(500).json({
            statusCode: 500,
            message: "Failed to get dispute",
            error: error.message,
        });
    }
};

exports.getDisputeAdminById = async (req, res) => {
    const { id } = req.params;
    try {
        const getDispute = `
            SELECT d.*, os.id as orderId, os.total_price, os.status as paymentStatus, g.id as gigId, g.title,
            u.name as client, u.email as clientEmail, u.fileUrl as clientImg, 
            CONCAT(f.firstName, f.lastName) as freelancer, f.email as freelancerEmail, f.fileUrl as freelancerImg,
            (SELECT GROUP_CONCAT(df.fileUrl) FROM disputefiles df WHERE df.disputeId = d.id AND userType = 'freelancer' ) as disputeFilesFreelancer,
            (SELECT GROUP_CONCAT(df.fileUrl) FROM disputefiles df WHERE df.disputeId = d.id AND userType = 'client' ) as disputeFilesClient
            FROM dispute d
            JOIN stripeorders os ON os.id = d.orderId
            JOIN gigs g ON g.id = os.gig_id
            JOIN users u ON u.id = d.clientId
            JOIN freelancers f ON f.id = d.freelancerId
            WHERE d.id = ?  
            `;
        const selectResultClient = await queryRunner(getDispute, [id]);

        if (selectResultClient[0].length > 0) {
            res.status(200).json({
                statusCode: 200,
                message: "Success",
                data: selectResultClient[0],
            });

        } else {
            res.status(200).json({
                data: [],
                message: "Dispute Not Found",
            });
        }
    } catch (error) {
        console.error("Query error: ", error);
        return res.status(500).json({
            statusCode: 500,
            message: "Failed to get dispute",
            error: error.message,
        });
    }
};

