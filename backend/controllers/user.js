const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.createUser = (req, res, next) => {
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
     
              message: "Invalid Authentication Credentials!"
  ,
          });
        });
    });
  }

  exports.userLogin = (req, res, next) => {
    let fechedUser;
    // Busco si existe el email
    User.findOne({ email: req.body.email })
      .then((user) => {
        fechedUser = user;
        if (!user) {
          return res.status(401).json({
            message: "Invalid Authentication Credentials!",
          });
        }
        return bcrypt.compare(req.body.password, user.password);
      })
      .then((result) => {
        if (!result) {
          return res.status(401).json({
            message: "Invalid Authentication Credentials!",
          });
        }
        //Creo un nuevo token usando jsonwebtoken para verificar el usuario en las peticiones y se lo mando
        const token = jwt.sign(
          { email: fechedUser.email, userId: fechedUser._id },
          process.env.JWT_KEY,
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
  }