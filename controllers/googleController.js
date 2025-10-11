const passport = require("../middleware/googleAuth");

exports.googleLogin = passport.authenticate("google", { 
  scope: ["profile", "email"] 
});

exports.googleCallback = (req, res, next) => {
  passport.authenticate("google", { session: false }, (err, data) => {
    console.log('=== Google Callback Debug ===');
    console.log('Error:', err);
    console.log('Data:', data);
    console.log('Query:', req.query);
    console.log('============================');

    if (err) {
      console.error('Authentication error:', err);
      return res.redirect(`https://iccdtalentgate.com/login?error=google_auth_failed&details=${encodeURIComponent(err.message)}`);
    }

    if (!data) {
      console.error('No data returned from Google auth');
      return res.redirect(`https://iccdtalentgate.com/login?error=no_data_returned`);
    }

    const FRONTEND_URL = "https://iccdtalentgate.com/google-callback";
    res.redirect(`${FRONTEND_URL}?token=${data.token}`);
  })(req, res, next);
};