const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { selectQuery, insertScoutUserQuery } = require("../constants/queries");
const { queryRunner } = require("../helper/queryRunner");
const { sendEmail } = require("../helper/emailService");

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
        message: `User already exists on this email`,
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
// // ######################  user Create #######################################

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
    if (!checkPass)
      return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: findUser[0][0]?.id, email: findUser[0][0]?.email },
      "1dikjsaciwndvc",
      {
        expiresIn: "7d",
      }
    );

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

// // ######################  password reset #######################################

exports.passwordReset = async function (req, res) {
  const { email } = req.body;
  try {
    const query = ` SELECT id, email FROM users where email = ? `;
    const findUser = await queryRunner(query, [email]);

    if (findUser[0].length === 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    return res.status(200).json({ message: "Email found successfully" });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// // ######################  End #######################################

exports.sendOtp = async function (req, res) {
  const { email } = req.body;
  console.log("email: ", email)
  // const date = new Date()
  // console.log("date: ", date)
  try {
    const pin = Math.floor(1000 + Math.random() * 9000);
    console.log(pin);

    // FIND USER IF EXIST OR NOT
    const findUserQuery = `SELECT email from users WHERE email = ? `;
    const findUser = await queryRunner(findUserQuery, [email]);

    // IF USER EXISTS THEN ADD OTP IN DATABASE AND SEND EMAIL
    if (findUser[0].length > 0) {
      // INSERT OTP IN DATABASE
      const insertQuery = `UPDATE USERS SET otp = ? WHERE email = ? `;
      const insertResult = await queryRunner(insertQuery, [pin, email]);

      if (insertResult[0].affectedRows > 0) {
        // Send email
        sendEmail(
          findUser[0][0]?.email,
          'password reset',
          `your otp code is ${pin}`
        )
        return res.status(200).json({ message: "Email send successfully." });
      } else {
        return res.status(404).json({ message: "Failed to send email." });
      }
    } else {
      return res.status(404).json({ message: "Email not found" });
    }
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.submitOtp = async function (req, res) {
  const { otp, email } = req.body;
  try {
    // FIND USER EXISTS OR NOT
    const findUserQuery = `SELECT email, otp FROM users WHERE email = ? `;
    const findUserResult = await queryRunner(findUserQuery, [email]);

    if (findUserResult[0].length > 0) {
      // CHECK USER PROVIDED OTP AND DATABASE OTP MATCH OR NOT
      
      if (findUserResult[0][0]?.otp === otp) {
        return res.status(200).json({ message: "Otp match successfully" });
      } else {
        return res.status(404).json({ message: "Invalid Otp" });
      }
    } else {
      return res.status(404).json({ message: "Email not found" });
    }

  } catch (error) {
    console.log("error", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.changePasword = async function (req, res) {
  const { password, email } = req.body;
  try {
    // FIND USER EXISTS OR NOT
    const findUserQuery = `SELECT email FROM users WHERE email = ? `;
    const findUserResult = await queryRunner(findUserQuery, [email]);

    if (findUserResult[0].length > 0) {
      // ENCRYPT PASSWORD AND ADD TO DATABASE
      const hashPassword = await bcrypt.hash(password, 10);
      const insertQuery = `UPDATE USERS SET password = ? WHERE email = ? `;
      const insertResult = await queryRunner(insertQuery, [
        hashPassword,
        findUser[0][0]?.email,
      ]);
      if (insertResult[0].affectedRows > 0) {
        return res.status(200).json({
          message: "password reset successfully",
          id: insertResult[0].insertid,
        });
      } else {
        return res.status(200).json({
          statusCode: 200,
          message: "failed to reset password",
        });
      }
    } else {
      return res.status(404).json({ message: "Email not found" });
    }
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ###################### Get Scout Members start #######################################
exports.check = async function (req, res) {
  try {
    res.status(200).json({ message: " API working fine. " });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error " });
  }
};
