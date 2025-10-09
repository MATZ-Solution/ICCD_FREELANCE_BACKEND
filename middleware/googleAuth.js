const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { queryRunner } = require("../helper/queryRunner");
const jwt = require("jsonwebtoken");

passport.use(
  new GoogleStrategy(
    {
      clientID: '205822955997-9tb041db0e8rlh68h7cijana4sepk3oc.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'http://localhost:22306/auth/google/callback',
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        const email = profile.emails[0].value;
        const name = profile.displayName;

        // Check if user exists
        const selectQuery = `SELECT * FROM users WHERE email = ?`;
        const userResult = await queryRunner(selectQuery, [email]);

        let userId;
        if (userResult[0].length === 0) {
          // User does not exist → insert
          const insertQuery = `INSERT INTO users(name, email, password) VALUES (?, ?, ?)`;
          const insertResult = await queryRunner(insertQuery, [
            name,
            email,
            null, // password null for Google auth
          ]);
          userId = insertResult[0].insertId;
        } else {
          userId = userResult[0][0].id;
        }

        // Generate JWT token
        const token = jwt.sign({ userId, email }, process.env.JWT_SECRET, {
          expiresIn: "7d",
        });

        return done(null, { token, user: { id: userId, name, email } });
      } catch (err) {
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
