const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { queryRunner } = require("../helper/queryRunner");
const jwt = require("jsonwebtoken");
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID:
        "205822955997-9tb041db0e8rlh68h7cijana4sepk3oc.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL:
        "https://iccd.freelanceserver.matzsolutions.com/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google profile:", profile);
        const email =
          profile.emails && profile.emails.length > 0
            ? profile.emails[0].value
            : null;

        if (!email) {
          throw new Error("No email returned by Google");
        }

        const name = profile.displayName;
        const selectQuery = `SELECT * FROM users WHERE email = ?`;
        const userResult = await queryRunner(selectQuery, [email]);

        let userId;
        if (userResult[0].length === 0) {
          const insertQuery = `INSERT INTO users(name, email, password) VALUES (?, ?, ?)`;
          const insertResult = await queryRunner(insertQuery, [
            name,
            email,
            null,
          ]);
          userId = insertResult[0].insertId;
        } else {
          userId = userResult[0][0].id;
        }

        const token = jwt.sign({ userId, email }, process.env.JWT_SECRET, {
          expiresIn: "7d",
        });

        return done(null, { token, user: { id: userId, name, email } });
      } catch (err) {
        console.error("Google Strategy Error:", err);
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

module.exports = passport;
