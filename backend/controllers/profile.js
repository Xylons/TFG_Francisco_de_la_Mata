const Profile = require("../models/profile");
const Admin = require("../models/profileAdmin");
const Responsible = require("../models/profileResponsible");
const Patient = require("../models/profilePatient");
//const async = require('async');



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
exports.createEmptyProfile = (req, res, next) => {
  const profile = new Profile({
    name: req.body.name,
    surname: req.body.surname,
    linkedAccount: req.userData.userId,
  });
  // Almaceno los datos en Mongo
  profile
    .save()
    .then((createdProfile) => {
      /// con ...createdProfile hago una copia de el objeto createdProfile y añado el id luego
      // igual hay que poner al final _doc
      
      res.status(201).json({
        
        message: "Profile created",
        profile: {
          ...createdProfile,
          id: createdProfile._id,
        },
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: "Creting a profile failed",
      });
    });
};
exports.updateProfile= (req, res, err) => {
  // si no tiene un archivo se extrae de imagePath
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + "://" + req.get("host");
    imagePath = url + "/images/" + req.file.filename;
  }
  const profile = new profile({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData.userId,
  });
  profile.updateOne({ _id: req.params.id, creator: req.userData.userId }, profile)
    .then((result) => {
      // Si modifica algun profile
      if (result.n > 0) {
        res.status(200).json({
          message: "Profile Update Sucessfull",
        });
      } else {
        res.status(401).json({
          message: "Not authorized to edit the Profile",
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Couldn't update profile",
      });
    });
};

exports.getProfilesByPage = (req, res, next) => {
  //req.query muestra los datos que hay anadidos despues de ? y separados por &
  // + es la forma rapida de convertir en numero
  console.log(req.query);
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const profileQuery = Profile.find();
  let fechedProfiles;
  if (pageSize && currentPage) {
    profileQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  profileQuery
    .then((documents) => {
      fechedProfiles = documents;
      return Profile.count();
    })
    .then((count) => {
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
  Profile.findById(req.params.id)
    .then((profile) => {
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
  Profile.deleteOne({ _id: req.params.id, creator: req.userData.userId })
    .then((result) => {
      // Si elimina algun profile
      if (result.n > 0) {
        res.status(200).json({ message: "Profile deleted!" });
      } else {
        res.status(401).json({ message: "No authorized to delete this profile" });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Profile deletion failed!",
      });
    });
};
