const passport = require("../middleware/googleAuth");

// Redirect to Google for login
exports.googleLogin = passport.authenticate("google", { scope: ["profile", "email"] });



exports.googleCallback = (req, res, next) => {
  passport.authenticate("google", { session: false }, (err, data) => {
    if (err || !data) {
      return res.redirect(`https://iccdtalentgate.com/login?error=google_auth_failed`);
    }

    const FRONTEND_URL = "https://iccdtalentgate.com/google-callback";
    res.redirect(`${FRONTEND_URL}?token=${data.token}`);
  })(req, res, next);
};

