var JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;
var LocalStratergy = require("passport-local").Strategy;
const passport = require("passport");
const bcrypt = require("bcryptjs");
const Users = require("../models").User;

// const env = require("../env");

const jwtOptions = {
  // jwtFromRequest: ExtractJwt.fromHeader("authorization"),
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    if (!payload.sub) return done(null, false);
    try {
      const user = await Users.findOne({
        where: { email: payload.sub },
      });

      if (!user) return done(null, false);
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

const localOptions = {
  usernameField: "email",
};

passport.use(
  new LocalStratergy(localOptions, async (email, password, done) => {
    try {
      const user = await Users.findOne({ where: { email } });
      if (!user) {
        return done(null, false);
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false);
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);
