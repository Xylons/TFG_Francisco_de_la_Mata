const Profile = require("../models/profile");
const AdminProfile = require("../models/profileAdmin");
const ResponsibleProfile = require("../models/profileResponsible");
const PatientProfile = require("../models/profilePatient");
const UserController = require("./user");
//const async = require('async');

const UNDEFINED = process.env.notdefined;
const PATIENT = process.env.patient;
const RESPONSIBLE = process.env.responsible;
const ADMIN = process.env.admin;

exports.createProfile = (name, surname, id) => {
  const profile = new Profile({
    name: name,
    surname: surname,
    linkedAccount: id,
  });
  // Almaceno los datos en Mongo
  profile
    .save()
    .then((createdProfile) => {
      /// con ...createdProfile hago una copia de el objeto createdProfile y añado el id luego
      // igual hay que poner al final _doc

      return {
        message: "Profile created",
        profile: {
          ...createdProfile,
          id: createdProfile._id,
        },
      };
    })
    .catch((error) => {
      return {
        message: "Creating a profile failed",
      };
    });
};

exports.getBasicInfo = (id) => {
  return Profile.findOne({ linkedAccount: id }, "name surname userImagePath");
};

exports.getInsoleInfo = (id) => { 
  return PatientProfile.findOne(
    { linkedAccount: id },
    "name surname leftInsole rightInsole tinetti getuptest mms description"
  );
};
exports.updateProfile = (req, res, err) => {
  //falta limpiar campos nulos a la hora de editar
  let requestRol = req.userData.rol;
  let profileModel;
  let profile;
  //console.log(req.body);
  //console.log(req);

  // si no tiene un archivo se extrae de imagePath
  let userImagePath = req.body.userImagePath;
  if (req.file) {
    const url = req.protocol + "://" + req.get("host");
    userImagePath = url + "/images/" + req.file.filename;
  }

  // Hago petición a la BD para comprobar asegurar que el rol del perfil es correcto
  this.getBasicInfo(req.body.userId).then((profileInfo) => {
    //Inicializo objeto con los valores básicos
    let newProfileData = {
      _id: profileInfo._id,
      __t: profileInfo.__t,
      name: req.body.name,
      surname: req.body.surname,
      phone: req.body.phone,
      userImagePath: userImagePath,
      linkedAccount: req.body.userId,
    };
    // Si tiene la imagen por defecto no la modifico
    if (
      newProfileData.userImagePath === "http://localhost:3000/images/user.png"
    ) {
      delete newProfileData.userImagePath;
    }

    try {
      let diferentUser = req.userData.userId !== req.body.userId;
      switch (profileInfo.__t) {
        case PATIENT:
          if (diferentUser && requestRol === PATIENT  ) {
            throw new Error("Authorization Error");
          }
          profileModel = PatientProfile;
          newProfileData["bornDate"] = req.body.bornDate;
          
          //newProfileData["patologies"] = ["parkinson"];
          newProfileData["contactPhone"] = req.body.contactPhone;
          newProfileData["comments"] = profileInfo.comments;
          newProfileData["responsibles"] = profileInfo.responsibles;
          //newProfileData["insoles"] = profileInfo.insoles;
          //newProfileData["leftInsole"] = 1234;
          //newProfileData["rightInsole"] = 1234;
          newProfileData["personalId"] = req.body.personalId;
          newProfileData["height"] = req.body.height;
          newProfileData["weight"] = req.body.weight;
          newProfileData["gender"] = req.body.gender;

          if (requestRol === RESPONSIBLE) {
            //Almaceno los valores de patologias eliminando repetidos
            newProfileData["patologies"] = Array.from(new Set([...req.body.patologies]));
            newProfileData["tinetti"] = req.body.tinetti;
            newProfileData["getuptest"] = req.body.getuptest;
            newProfileData["mms"] = req.body.mms;
            newProfileData["description"] = req.body.description;
            newProfileData["leftInsole"] =  req.body.leftInsole;
          newProfileData["rightInsole"] =  req.body.rightInsole;
          }
          profile = this.cleanEmptyFields(newProfileData);
          profile = new PatientProfile(newProfileData);
          break;
        case RESPONSIBLE:
          if (diferentUser && requestRol !== ADMIN) {
            throw new Error("Authorization Error");
          }
          profileModel = ResponsibleProfile;
          newProfileData["typeOfResponsible"] = req.body.typeOfResponsible;
          newProfileData["patients"] = req.body.patients;
          profile = this.cleanEmptyFields(newProfileData);
          profile = new ResponsibleProfile(profile);

          break;
        case ADMIN:
          if (requestRol !== ADMIN) {
            throw new Error("Authorization Error");
          }
          profileModel = AdminProfile;
          newProfileData["authorizedUsers"] = req.body.authorizedUsers;
          profile = this.cleanEmptyFields(newProfileData);
          profile = new AdminProfile(profile);

          break;
        default:
          profileModel = Profile;
          profile = this.cleanEmptyFields(newProfileData);
          profile = new Profile(profile);
          break;
      }
    } catch (e) {
      res.status(401).json({
        message: "Not authorized to edit the Profile" +e,
      });
    }
    profileModel
      .updateOne({ linkedAccount: req.body.userId }, profile)
      .then((result) => {
        // Si modifica algun profile
        if (result.n > 0) {
          console.log(result.n);
          res.status(200).json({
            message: "Profile Update Sucessfull",
          });
        } else {
          res.status(401).json({
            message: "Not authorized to edit the Profile!",
          });
        }
      })
      .catch((error) => {
        res.status(500).json({
          message: "Couldn't update profile" +error,
        });
      });
  });
};

// Aqui se puede cambiar el rol de los usuarios undefined
exports.updateRol = (req, res, err) => {
  // Controlo que si no es admin no puede cambiar y tampoco se puede cambiar el rol a si mismo
  if (req.userData.rol !== ADMIN && req.userData.userId !== req.body.userId) {
    res.status(401).json({ message: "No authorized to change the rol" });
  } else {
    var user = Profile.findOne({ linkedAccount: req.body.userId }).then(
      (profile) => {
        if (req.body.newRol !== profile.__t) {
          let newProfileData = {
            _id: profile.id,
            __t: req.body.newRol,
            name: profile.name,
            surname: profile.surname,
            phone: profile.phone,
            userImagePath: profile.userImagePath,
            linkedAccount: req.body.userId,
          };
          newProfileData = this.cleanEmptyFields(newProfileData);
          if (
            newProfileData.userImagePath ===
            "http://localhost:3000/images/user.png"
          ) {
            delete newProfileData.userImagePath;
          }
          // Sustituyo el perfil existente por el del nuevo rol
          Profile.findOneAndReplace(
            { linkedAccount: req.body.userId },
            newProfileData,
            { new: true, overwrite: true }
          )
            .then((result) => {
              res.status(200).json({ message: "Rol changed!" });
            })
            .catch((error) => {
              res.status(500).json({
                message: "Rol change failed!",
              });
            });
        }
      }
    );
  }
};

exports.getProfilesByPage = (req, res, next) => {
  //req.query muestra los datos que hay anadidos despues de ? y separados por &
  // + es la forma rapida de convertir en numero
  //Los responsibles solo ven a pacientes sean suyos o no,
  //Los administradores ven a todos, y el resto solo se ven a si mismo.
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  let profileQuery;
  let profilesCounter;
  //Distintas querys segun el rol
  switch (req.userData.rol) {
    /*Aqui modificaría si quiero poner que un paciente tenga más de uno
    case PATIENT:
        break;*/
    case RESPONSIBLE:
      profileQuery = PatientProfile.find({ __t: PATIENT });
      profilesCounter = PatientProfile.countDocuments({});
      break;
    case ADMIN:
      profileQuery = Profile.find();
      profilesCounter = Profile.countDocuments();
      break;
    default:
      profileQuery = Profile.find({ linkedAccount: req.userData.userId });
      profilesCounter = Profile.countDocuments({
        linkedAccount: req.userData.userId,
      });
  }

  let fechedProfiles;
  if (pageSize && currentPage) {
    profileQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  profileQuery
    .then((documents) => {
      fechedProfiles = documents;
      return profilesCounter;
    })
    .then((count) => {
      //console.log(fechedProfiles);
      res.status(200).json({
        message: "All fine",
        profiles: fechedProfiles,
        maxProfiles: count,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: "Fetching profiles failed!",
      });
    });
};

exports.getProfile = (req, res, next) => {
  console.log(req.params.id);
  console.log(req.userData.userId);
  if (
    req.userData.userId !== req.params.id &&
    (req.userData.rol === UNDEFINED || req.userData.rol === PATIENT)
  ) {
    res.status(500).json({
      message: "Not authorized to see that profile",
    });
  }

  Profile.findOne({ linkedAccount: req.params.id })
    .then((profile) => {
      console.log(profile);
      let profileRol = profile.__t;
      //Si tu rol es responsable
      // Y el perfil que quieres ver es igual a admin o responsable
      // y tu id es distinto del perfil que quieres ver
      //Entonces no tienes permiso
      if (
        req.userData.rol === RESPONSIBLE &&
        (profileRol === ADMIN || profileRol === RESPONSIBLE) &&
        req.userData.userId !== req.params.id
      ) {
        res.status(500).json({
          message: "Not authorized to see that profile",
        });
      }
      if (profile) {
        if(req.userData.rol === PATIENT){
          // Si el usuario es paciente eliminado los datos que no debe ver
          delete profile.tinetti;
          delete profile.getuptest;
          delete profile.mms;
          delete profile.description;
          delete profile.leftInsole;
          delete profile.rightInsole;
          delete profile.patologies;
        }
        res.status(200).json(profile);
      } else {
        res.status(404).json({ message: "Profile not found" });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Fetching profile failed!",
      });
    });
};

exports.deleteProfile = (req, res, next) => {
  if (req.userData.rol !== ADMIN) {
    res.status(401).json({ message: "No authorized to delete this profile" });
  } else {
    Profile.deleteOne({ linkedAccount: req.params.id })
      .then((result) => {
        // Si elimina algun profile
        if (result.n > 0) {
          //Elimino el usuario del documento de usuarios
          UserController.deleteProfile(req.params.id);
          res.status(200).json({ message: "Profile deleted!" });
        } else {
          res
            .status(401)
            .json({ message: "No authorized to delete this profile" });
        }
      })
      .catch((error) => {
        res.status(500).json({
          message: "Profile deletion failed! " +error,
        });
      });
  }
};

exports.cleanEmptyFields = (profile) => {
  // Controlo que no tenga campos en undefined
  Object.keys(profile).forEach((key) => {
    profile[key] === undefined ? delete profile[key] : null;
  });
  return profile;
};

exports.filteredSearch = (req, res, next) => {
  //req.query muestra los datos que hay anadidos despues de ? y separados por &
  // + es la forma rapida de convertir en numero
  console.log("aaaaaaaaaaaaaaaaa");
  let query = {};
  console.log(req.query.age);
  if (req.query.age !== "") {
    //Desactivado temporamente
    query.bornDate = { $gte : req.query.age };
    console.log(query.bornDate);
    //Cuadno tenga 2 será query.bornDate: { $gte:req.query.Minage, $lte: req.query.Maxage }
  }
  //No es necesario para usuario
  /*if(req.query.datepicked){
    query.
  }*/
  //Falta anadir
  if (req.query.gender !== "All" && req.query.gender !== "") {
    query.gender = req.query.gender.toLowerCase();
  }

  if (req.query.mypatients === "true" && req.userData.rol !== ADMIN) {
    query.responsibles = req.userData.userId;
  }
  if (req.query.patologies !== "" && req.query.patologies !== "All") {
    query.patologies = {$in: req.query.patologies.split(",")};
  }
  if (req.query.searchfield) {
    let name = { $regex: req.query.searchfield, $options: "i" };
    let surname = { $regex: req.query.searchfield, $options: "i" };
    query.$or = [{ name: name }, { surname: surname }];
  }

  console.log(query);

  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  let profileQuery;
  let profilesCounter;
  //Distintas querys segun el rol
  switch (req.userData.rol) {
    /*Aqui modificaría si quiero poner que un paciente tenga más de uno
    case PATIENT:
        break;*/
    case RESPONSIBLE:
      query.__t = PATIENT;
      profileQuery = PatientProfile.find(query);
      profilesCounter = PatientProfile.countDocuments(query);
      break;
    case ADMIN:
      profileQuery = Profile.find(query);
      profilesCounter = Profile.countDocuments(query);
      break;
    default:
      profileQuery = Profile.find({ linkedAccount: req.userData.userId });
      profilesCounter = Profile.countDocuments({
        linkedAccount: req.userData.userId,
      });
  }

  let fechedProfiles;
  if (pageSize && currentPage) {
    profileQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  profileQuery
    .then((documents) => {
      console.log(documents);
      fechedProfiles = documents;
      return profilesCounter;
    })
    .then((count) => {
      console.log(fechedProfiles);
      console.log(JSON.stringify(query));
      res.status(200).json({
        message: "All fine",
        profiles: fechedProfiles,
        maxProfiles: count,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: "Fetching profiles failed!",
      });
    });
};

//Este campo se realiza cuando el alcance sea pequeño, para mejorar las busquedas y que sean
// menos frustantes, si se amplia el alcance esto se desactivaria por rendimiento
exports.getSearchParams = (req, res, next) => {
  let maxAge;
  let minAge;
  let patologies;
  //Distintas querys segun el rol
  let rol = req.userData.rol;

  if (rol === ADMIN || rol === RESPONSIBLE) {
    try {
      //Query para extraer la edad maxima
      PatientProfile.findOne({ bornDate: { $exists: true } }, "bornDate")
        .sort({ bornDate: 1 })
        .then((maxDate) => {
          let datediff = new Date() - new Date(maxDate.bornDate);
          //Paso la fecha a years
          maxAge = Math.trunc(datediff / (1000 * 60 * 60 * 24 * 365));
          //Query para extraer la edad minima
          PatientProfile.findOne({ bornDate: { $exists: true } }, "bornDate")
            .sort({ 'bornDate': -1 })
            .then((minDate) => {
              let datediff = new Date() - new Date(minDate.bornDate);
              minAge = Math.trunc(datediff / (1000 * 60 * 60 * 24 * 365));
              console.log(maxAge + " Min");
              console.log(minAge + " Max");
              ///Query para extraer patologias
              PatientProfile.distinct("patologies").then((patologies) => {
                res.status(200).json({
                  message: "All fine",
                  maxAge: maxAge,
                  minAge: minAge,
                  patologies: patologies,
                });
              });
            });
        });
    } catch (error) {
      res.status(500).json({
        message: "Fetching search failed!",
      });
    }
  } else {
    res.status(401).json({
      message: "Not authorized to search!",
    });
    /*else{
      // No es necesario ahora mismo, pero lo dejo por si se quiere que los usuarios tengan barra de busqueda
      profileQuery = Profile.find({ linkedAccount: req.userData.userId }, "bornDate", "patologies").then(data=>{
        minAge,maxAge=data.bornDate;
        patologies=data.patologies;
      });;;
      profilesCounter = Profile.countDocuments({
        linkedAccount: req.userData.userId,
      });
    }*/
  }
};

exports.getPatients = (req, res, next) => {
  //Distintas querys segun el rol
  let rol = req.userData.rol;

  if (rol === RESPONSIBLE) {
    try {
      //Query para extrar los datos de pacientes que tienen asginado como responsable al que solicita
      PatientProfile.find(
        { responsibles: req.userData.userId },
        "name surname bornDate leftInsole rightInsole linkedAccount"
      ).then((patients) => {
        if (patients.length > 0) {
          res.status(200).json({
            message: "All fine",
            patients: patients,
          });
        } else {
          res
            .status(404)
            .json({ message: "You need to have assigned patients first" });
        }
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed getting the patients!",
      });
    }
  } else {
    res.status(401).json({
      message: "Not authorized to search!",
    });
    /*else{
      // No es necesario ahora mismo, pero lo dejo por si se quiere que los usuarios tengan barra de busqueda
      profileQuery = Profile.find({ linkedAccount: req.userData.userId }, "bornDate", "patologies").then(data=>{
        minAge,maxAge=data.bornDate;
        patologies=data.patologies;
      });;;
      profilesCounter = Profile.countDocuments({
        linkedAccount: req.userData.userId,
      });
    }*/
  }
};
// Aqui se puede cambiar el responsable de un paciente
exports.editResponsible = (req, res, err) => {
  //
  if (req.userData.rol !== RESPONSIBLE) {
    res.status(401).json({ message: "No authorized to change the rol" });
  } else {
    //Anado el responsable al usuario
    if (req.body.mode === true) {
      PatientProfile.updateOne(
        { linkedAccount: req.body.userId },
        { $push: { responsibles: req.userData.userId } }
      ).then((result) => {
        if (result.n > 0) {
          res.status(200).json({ message: "Assigned Patient" });
        } else {
          res.status(500).json({
            message: "Change failed!",
          });
        }
      });
    } else {
      PatientProfile.updateOne(
        { linkedAccount: req.body.userId },
        { $pull: { responsibles: req.userData.userId } }
      ).then((result) => {
        if (result.n > 0) {
          res.status(200).json({ message: "Assigned Patient" });
        } else {
          res.status(500).json({
            message: "Change failed!",
          });
        }
      });
    }
  }
};


exports.getAgeByInsole = (insoleid) => {
   //query.$or = [{ name: name }, { surname: surname }];
  return Profile.findOne({ $or: [{ leftInsole: insoleid }, { rightInsole: insoleid }] }, "bornDate leftInsole rightInsole");
};