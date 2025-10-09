const passport = require("../middleware/googleAuth");

// Redirect to Google for login
exports.googleLogin = passport.authenticate("google", { scope: ["profile", "email"] });



exports.googleCallback = (req, res, next) => {
  passport.authenticate("google", { session: false }, (err, data) => {
    if (err || !data) {
      return res.redirect(`http://localhost:5173/login?error=google_auth_failed`);
    }

    const FRONTEND_URL = "http://localhost:5173/google-callback";
    res.redirect(`${FRONTEND_URL}?token=${data.token}`);
  })(req, res, next);
};

