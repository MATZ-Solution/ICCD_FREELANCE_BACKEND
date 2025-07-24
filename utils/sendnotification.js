const { queryRunner } = require("../helper/queryRunner");

const handleNotifications = async (io, type, payload) => {
    try {
        if (!io && !type && !payload) {
            return console.log("Please provide 'io', 'type', 'payload' in arguments")
        }
        if (type === 'individual') {
            if (!payload.receiverId) {
                return console.log("Please provide receiverId in payload")
            }
            io.to(`user_${payload.receiverId}`).emit("notification");
        }
        if (type === 'freelancer_all') {
            io.emit("freelancer_notification");
        }
        const query = `INSERT INTO notifications (sender_id, receiver_id, title, message, type) VALUES (?, ?, ?, ?, ?) `;
        const insertFileResult = await queryRunner(query, [ payload.sender_id, payload.receiver_id, payload.title,payload.message, payload.type
        ]);

    } catch (err) {
        console.log("error: ", err)
    }

};

module.exports = handleNotifications
