const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var nodemailer = require("nodemailer");

const User = require("../models/user");

exports.createUser = (req, res, next) => {
  // este metodo anade genera salt aleatorio de 10 caracteres
  bcrypt.hash(req.body.password, 10).then((hash) => {
    const user = new User({
      email: req.body.email.toLowerCase(),
      password: hash,
      rol: undefined,
    });
    console.log(user);
    user
      .save()
      .then((result) => {
        res.status(201).json({
          message: "User created!",
          result: result,
        });
        console.log(result);
      })
      .catch((err) => {
        res.status(500).json({
          message: "Invalid Authentication Credentials!",
        });
      });
  });
};

exports.userLogin = (req, res, next) => {
  let fechedUser;
  // Busco si existe el email
  User.findOne({ email: req.body.email.toLowerCase() })
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
        {
          email: fechedUser.email,
          userId: fechedUser._id,
          rol: fechedUser.rol,
        },
        process.env.JWT_KEY,
        { expiresIn: "1h" }
      );

      res.status(200).json({
        token: token,
        expiresIn: 3600,
        userId: fechedUser._id,
        rol: fechedUser.rol,
      });
    })
    .catch((err) => {
      return res.status(401).json({
        message: "Auth failed",
      });
    });
};

exports.sendRecoveryToken = (req, res, next) => {
  // este metodo anade genera salt aleatorio de 10 caracteres

  User.findOne({ email: req.body.email.toLowerCase() })
    .then((user) => {
      fechedUser = user;
      console.log(user);
      //Creo un nuevo token usando jsonwebtoken para verificar el usuario en las peticiones y se lo mando
      const token = jwt.sign(
        {
          email: fechedUser.email,
        },
        process.env.JWT_KEY_RESET,
        { expiresIn: "1h" }
      );
      console.log(token);
      sendMail(fechedUser.email, token);
      res.status(200).json({
        token: token,
        expiresIn: 3600,
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "The e-mail have doesn't have an account",
      });
    });
};
exports.resetPassword = (req, res, next) => {
  let email = decodeResetToken(req.body.token);
  let fechedUser;
  // Busco si existe el email
  User.findOne({ email: email })
    .then((user) => {
      fechedUser = user;
      if (!user) {
        return res.status(401).json({
          message: "Email not valid",
        });
      }
      bcrypt.hash(req.body.password, 10).then((hash) => {
        const userWithNewPassword = new User({
          _id: fechedUser.id,
          email: fechedUser.email,
          password: hash,
          rol: fechedUser.rol,
        });

        User.updateOne({ _id: fechedUser.id }, userWithNewPassword)
          .then((result) => {
            console.log(result);
            // Si modifica algun usuario
            if (result.n > 0) {
              //Creo un nuevo token usando jsonwebtoken para verificar el usuario en las peticiones y se lo mando
              const token = jwt.sign(
                {
                  email: fechedUser.email,
                  userId: fechedUser._id,
                  rol: fechedUser.rol,
                },
                process.env.JWT_KEY,
                { expiresIn: "1h" }
              );

              res.status(200).json({
                token: token,
                expiresIn: 3600,
                userId: fechedUser._id,
                rol: fechedUser.rol,
                message: "User Updated Sucessfully",
              });
            } else {
              res.status(401).json({
                message: "Problem updating the user",
              });
            }
          })
          .catch((error) => {
            res.status(500).json({
              message: "Problem updating the user",
            });
          });
      });
    })
    .catch((err) => {
      return res.status(401).json({
        message: "Auth failed",
      });
    });
};

function sendMail(email, token) {
  var transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: "SteBysContact@gmail.com",
      pass: "SteBys22SteBys",
    },
  });

  var mailOptions = {
    from: "SteBysContact@gmail.com",
    to: email,
    subject: "Sending Email using Node.js",
    text:
      "This is the URL for changing your password " +
      process.env.IP_FRONT +
      "/auth/reset/" +
      token,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

function decodeResetToken(token) {
  try {
    //Decodifico el token de reset para ver si es correcto y extraigo el email
    const decodedToken = jwt.verify(token, process.env.JWT_KEY_RESET);
    return decodedToken.email.toLowerCase();
  } catch (error) {
    return null;
  }
}
