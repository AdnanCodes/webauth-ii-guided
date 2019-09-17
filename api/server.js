const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const session = require("express-session");
const KnexSessionStore = require("connect-session-knex")(session); //Currying by passing the session to the store

const authRouter = require("../auth/auth-router.js");
const usersRouter = require("../users/users-router.js");
const dbConnection = require("../database/dbConfig");
const server = express();

const sessionConfig = {
  name: "chocochip",
  secret: process.env.SESSION_SECRET || "keep it secret, keep it safe",
  cookie: {
    maxAge: 1000 * 60 * 60, // in milliseconds
    secure: false, //true means only send cookie over https
    httpOnly: true //True means JS has no access to the cookie
  },
  resave: false,
  saveUninitialized: true, // GDPR Compliance
  store: new KnexSessionStore({
    knex: dbConnection,
    tablename: "knexsessions",
    sidfieldname: "sessionid",
    createtable: true,
    clearInterval: 1000 * 60 * 30 //Clean out after session ends
  }) //Connect Store and add new keyword to use the store
};

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionConfig));

server.use("/api/auth", authRouter);
server.use("/api/users", usersRouter);

server.get("/", (req, res) => {
  res.json({ api: "up" });
});

server.get("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy(error => {
      if (error) {
        res
          .status(500)
          .json({
            message:
              "You can check out anytime you like, but you can never leave"
          });
      } else {
        res.status(200).json({ message: "Bye come back soon" });
      }
    });
  } else {
    res.status(200).json({ messsage: "already logged out" });
  }
});

module.exports = server;
