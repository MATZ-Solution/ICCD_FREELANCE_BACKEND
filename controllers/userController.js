const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { selectQuery, insertScoutUserQuery } = require("../constants/queries");
const { queryRunner } = require("../helper/queryRunner");

// ###################### user Create #######################################
exports.signUp = async function (req, res) {
  const { name, email, password } = req.body;
  const currentDate = new Date();
  try {
    const selectResult = await queryRunner(selectQuery("users", "email"), [
      email,
    ]);

    if (selectResult[0].length > 0) {
      return res.status(404).json({
        statusCode: 200,
        message: `User already exists on this email ${email}`,
      });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const insertQuery = `INSERT INTO USERS( name, email, password) VALUES (?,?,?) `;
    const insertResult = await queryRunner(insertQuery, [
      name,
      email,
      hashPassword,
      // currentDate,
    ]);
    if (insertResult[0].affectedRows > 0) {
      return res.status(200).json({
        message: "User added successfully",
        id: insertResult[0].insertid,
      });
    } else {
      return res.status(200).json({
        statusCode: 200,
        message: "Failed to add user",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Failed to add user",
      message: error.message,
    });
  }
};
// // ###################### Scout user Create #######################################

// // ###################### SignIn user start #######################################
exports.signIn = async function (req, res) {
  const { email, password } = req.body;
  try {
    const query = ` SELECT id, name, email, password FROM users where email = ? `;
    const findUser = await queryRunner(query, [email]);

    if (findUser[0].length === 0) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    const checkPass = await bcrypt.compare(password, findUser[0][0].password);
    if (!checkPass) return res.status(401).json({ message : "Invalid email or password"});

    const token = jwt.sign({ id: findUser[0][0]?.id, email: findUser[0][0]?.email }, "1dikjsaciwndvc", {
      expiresIn: "7d",
    });

    res.status(200).json({
      token: token,
      message: "LogIn successfull",
      data: {
        id: findUser[0][0].id,
        name: findUser[0][0].name,
        email: findUser[0][0].email,
      },
    });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to SignIn",
      error: error.message,
    });
  }
};
// ###################### SignIn user End #######################################

// ###################### Get Scout Members start #######################################
exports.check = async function (req, res) {
  try {
    res.status(200).json({ message: " API working fine. " });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error " });
  }
};
