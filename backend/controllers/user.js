const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var nodemailer = require("nodemailer");

const User = require("../models/user");
const ProfileController = require("./profile");

exports.createUser = (req, res, next) => {
  // este metodo anade genera salt aleatorio de 10 caracteres
  bcrypt.hash(req.body.password, 10).then((hash) => {
    const user = new User({
      email: req.body.email.toLowerCase(),
      password: hash,
    });
    console.log(user);
    user
      .save()
      .then((result) => {
        result._id;
        ProfileController.createProfile(
          req.body.name,
          req.body.surname,
          result._id
        );
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
      //Hago llamada para recoger los datos del perfil
      //let profileInfo=ProfileController.getBasicInfo(fechedUser._id);
      ProfileController.getBasicInfo(fechedUser._id).then((profileInfo)=> {
        //Creo un nuevo token usando jsonwebtoken para verificar el usuario en las peticiones y se lo mando
      console.log(profileInfo);
      const token = jwt.sign(
        {
          email: fechedUser.email,
          userId: fechedUser._id,
          rol: profileInfo.__t,
        },
        process.env.JWT_KEY,
        { expiresIn: "1h" }
      );
      
      res.status(200).json({
        token: token,
        expiresIn: 3600,
        userId: fechedUser._id,
        name: profileInfo.name,
        surname: profileInfo.userImagePath,
        image: profileInfo.surname,
        rol: profileInfo.__t,
      });
      });
      
    })
    .catch((err) => {
      return res.status(401).json({
        message: "Auth failed " + error,
      });
    });
};

exports.sendRecoveryToken = (req, res, next) => {
  // este metodo anade genera salt aleatorio de 10 caracteres

  User.findOne({ email: req.body.email.toLowerCase() })
    .then((user) => {
      fechedUser = user;
      //Creo un nuevo token usando jsonwebtoken para verificar el usuario en las peticiones y se lo mando
      const token = jwt.sign(
        {
          email: fechedUser.email,
        },
        process.env.JWT_KEY_RESET,
        { expiresIn: "1h" }
      );
      console.log(token);
      sendMail(
        fechedUser.email,
        token,
        /*callback*/ function (error, info) {
          if (error) {
            res.status(500).json({
              sended: false,
              message: "A problem ocurred while sending the email",
            });
          }
          console.log("Email sent: " + info.response);
          res.status(200).json({
            sended: true,
            message: "Email sended sucessfully",
          });
        }
      );
    })
    .catch((err) => {
      res.status(500).json({
        sended: false,
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
        });

        User.updateOne({ _id: fechedUser.id }, userWithNewPassword)
          .then((result) => {
            console.log(result);
            // Si modifica algun usuario
            if (result.n > 0) {
              //Hago llamada para recoger los datos del perfil
              let profileInfo = ProfileController.getBasicInfo(fechedUser._id);

              //Creo un nuevo token usando jsonwebtoken para verificar el usuario en las peticiones y se lo mando
              const token = jwt.sign(
                {
                  email: fechedUser.email,
                  userId: fechedUser._id,
                  rol: profileInfo.__t,
                },
                process.env.JWT_KEY,
                { expiresIn: "1h" }
              );

              res.status(200).json({
                token: token,
                expiresIn: 3600,
                userId: fechedUser._id,
                name: profileInfo.name,
                surname: profileInfo.userImagePath,
                image: profileInfo.surname,
                rol: profileInfo.__t,
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

function sendMail(email, token, callback) {
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

  transporter.sendMail(mailOptions, callback);
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
