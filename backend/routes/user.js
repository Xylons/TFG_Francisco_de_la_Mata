const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

const router = express.Router();

router.post("/signup", (req, res, next) => {
  // este metodo anade genera salt aleatorio de 10 caracteres
  bcrypt.hash(req.body.password, 10).then((hash) => {
    const user = new User({
      email: req.body.email,
      password: hash,
    });
    user
      .save()
      .then((result) => {
        res.status(201).json({
          message: "User created!",
          result: result,
        });
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
        });
      });
  });
});

router.post("/login", (req, res, next) => {
  let fechedUser;
  // Busco si existe el email
  User.findOne({ email: req.body.email })
    .then((user) => {
      fechedUser = user;
      if (!user) {
        return res.status(401).json({
          message: "Auth failed",
        });
      }
      return bcrypt.compare(req.body.password, user.password);
    })
    .then((result) => {
      if (!result) {
        return res.status(401).json({
          message: "Auth failed",
        });
      }
      //Creo un nuevo token usando jsonwebtoken para verificar el usuario en las peticiones y se lo mando
      const token = jwt.sign(
        { email: fechedUser.email, userId: fechedUser._id },
        "InclUir_luEgo_cLav3_s3cr3ta_más_l@rg@",
        { expiresIn: "1h" }
      );
      res.status(200).json({
        token: token,
        expiresIn: 3600,
        userId: fechedUser._id
        
      });
     
    })
    .catch((err) => {
      return res.status(401).json({
        message: "Auth failed",
      });
    });
});

module.exports = router;
