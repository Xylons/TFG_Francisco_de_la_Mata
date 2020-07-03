const Profile = require("../models/profile");
const AdminProfile = require("../models/profileAdmin");
const ResponsibleProfile = require("../models/profileResponsible");
const PatientProfile = require("../models/profilePatient");
//const UserController = require("./user");
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
          if (diferentUser && requestRol === PATIENT) {
            throw new Error("Authorization Error");
          }
          profileModel = PatientProfile;
          newProfileData["bornDate"] = req.body.bornDate;
          newProfileData["patologies"] = req.body.patologies;
          newProfileData["contactPhone"] = req.body.contactPhone;
          newProfileData["comments"] = profileInfo.comments;
          newProfileData["responsibles"] = profileInfo.responsibles;
          newProfileData["insoles"] = profileInfo.insoles;
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
          profile = new ResponsibleProfile(newProfileData);

          break;
        case ADMIN:
          if (requestRol !== ADMIN) {
            throw new Error("Authorization Error");
          }
          profileModel = AdminProfile;
          newProfileData["authorizedUsers"] = req.body.authorizedUsers;
          profile = this.cleanEmptyFields(profile);
          profile = new AdminProfile(newProfileData);

          break;
        default:
          profileModel = Profile;
          profile = this.cleanEmptyFields(profile);
          profile = new Profile({ newProfileData });
          break;
      }
    } catch (e) {
      res.status(401).json({
        message: "Not authorized to edit the Profile",
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
          message: "Couldn't update profile",
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
      console.log(fechedProfiles);
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
      if (
        req.userData.rol === RESPONSIBLE &&
        (profileRol === ADMIN || profileRol === RESPONSIBLE)
      ) {
        res.status(500).json({
          message: "Not authorized to see that profile",
        });
      }
      if (profile) {
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
  // falta vincularlo con borrar usuario
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
          message: "Profile deletion failed!",
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
  let query={};
  if(req.query.age !== ""){
    query.bornDate = { $lt : req.query.age };
  }
  //No es necesario para usuario
  /*if(req.query.datepicked){
    query.
  }*/
  //Falta anadir
  if(req.query.gender !== ""){
    query.gender = req.query.gender;
  }

  if(req.query.mypatients=== "true"){
    query.responsibles = req.userData.userId;
  }
  if(req.query.patologies !== ""){
    query.patologies = req.query.patologies;
  }
  if(req.query.searchfield){
   //query+="name: { \"$regex\":\"" +req.query.searchfield +"\", \"$options\": \"i\" } "
   let nameOrSurname={};
   nameOrSurname.name= { $regex : req.query.searchfield , $options: "i" }; 
   nameOrSurname.surname= { $regex : req.query.searchfield , $options: "i" }; 
   query.$or = [nameOrSurname];
  }
 //query+="}";
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
      profileQuery = PatientProfile.find({ __t: PATIENT });
      profilesCounter = PatientProfile.countDocuments({ __t: PATIENT });
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
