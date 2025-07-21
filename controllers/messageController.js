const { queryRunner } = require("../helper/queryRunner");

exports.getAllMessage = async (req, res) => {
  const { userId } = req.user;
  console.log("userId: ", userId)
  try {
    return res.statusCode(200).json({ text: "hello world "})

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
        message: "Project Not Found",
      });
    }
  } catch (error) {
    console.error("Query error: ", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to get projects",
      error: error.message,
    });
  }
};