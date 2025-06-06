const { createPool } = require("../config/connection")

exports.queryRunner= async(query,data)=>{
    if (!data) {
        data = [];
    }
    const connection = await createPool();
    try {

        return await connection.execute(query,data);
        // console.log("####### query runner end #######")
    } catch (error) {
        console.error('Query Error:', error);
        throw error;
    }
}