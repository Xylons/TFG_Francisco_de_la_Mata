const Comment = require("../models/comment");

const UNDEFINED = process.env.notdefined;
const PATIENT = process.env.patient;
const RESPONSIBLE = process.env.responsible;
const ADMIN = process.env.admin;

exports.createComment = (req, res, next) => {
  if (req.userData.rol !== RESPONSIBLE) {
    res.status(401).json({
      message: "Not authorized to see the posts",
    });
  } else {
    //const url = req.protocol + "://" + req.get("host");
    const comment = new Comment({
      title: req.body.title,
      content: req.body.content,
      creator: req.userData.userId,
      userId: req.body.userId,
    });
    // Almaceno los datos en Mongo
    comment
      .save()
      .then((createdComment) => {
        /// con ...createdComment hago una copia de el objeto creadedComment y añado el id luego
        // igual hay que poner al final _doc
        console.log(createdComment);
        res.status(201).json({
          message: "Comment Added",
          comment: {
            ...createdComment,
            id: createdComment._id,
          },
        });
      })
      .catch((error) => {
        res.status(500).json({
          message: "Creting a comment failed",
        });
      });
  }
};

exports.updateComment = (req, res, err) => {
  if (req.userData.rol !== RESPONSIBLE) {
    res.status(401).json({
      message: "Not authorized to update the comments",
    });
  } else {
    const comment = new Comment({
      _id: req.body.id,
      title: req.body.title,
      content: req.body.content,
      creator: req.userData.userId,
    });
    Comment.updateOne({ _id: req.params.id, creator: req.userData.userId }, comment)
      .then((result) => {
        // Si modifica algun comment
        if (result.n > 0) {
          res.status(200).json({
            message: "Comment Update Sucessfull",
          });
        } else {
          res.status(401).json({
            message: "Not authorized to edit the comment",
          });
        }
      })
      .catch((error) => {
        res.status(500).json({
          message: "Couldn't update comment",
        });
      });
  }
};

exports.getCommentsByPage = (req, res, next) => {
  if (req.userData.rol !== RESPONSIBLE) {
   /* res.status(401).json({
      message: "Not authorized to see the comments",
    });*/
    res.status(200).json({
      message: "Requested but cant see the comments",
      comments: [],
      maxComments: 0,
    });
  } else {
    //req.query muestra los datos que hay anadidos despues de ? y separados por &
    // + es la forma rapida de convertir en numero
    console.log(req.query);
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;
    const commentQuery = Comment.find({ userId: req.query.userId });
    let fechedComments;
    if (pageSize && currentPage) {
      commentQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
    }
    commentQuery.sort({ timestamp: -1 })
      .then((documents) => {
        fechedComments = documents;
        return Comment.countDocuments({ userId: req.query.userId });
      })
      .then((count) => {
        res.status(200).json({
          message: "All fine",
          comments: fechedComments,
          maxComments: count,
        });
      })
      .catch((error) => {
        res.status(500).json({
          message: "Fetching comments failed!"+error,
        });
      });
  }
};

exports.getComment = (req, res, next) => {
  if (req.userData.rol !== RESPONSIBLE) {
    res.status(401).json({
      message: "Not authorized to see the comment",
    });
  } else {
    Comment.findById(req.params.id)
      .then((comment) => {
        if (comment) {
          res.status(200).json(comment);
        } else {
          res.status(404).json({ message: "Comment not found" });
        }
      })
      .catch((error) => {
        res.status(500).json({
          message: "Fetching comment failed!",
        });
      });
  }
};

exports.deleteComment = (req, res, next) => {
  if (req.userData.rol !== RESPONSIBLE) {
    res.status(401).json({
      message: "Not authorized to delete the comments",
    });
  } else {
    Comment.deleteOne({ _id: req.params.id, creator: req.userData.userId })
      .then((result) => {
        // Si elimina algun comment
        if (result.n > 0) {
          res.status(200).json({ message: "Comment deleted!" });
        } else {
          res
            .status(401)
            .json({ message: "No authorized to delete this comment" });
        }
      })
      .catch((error) => {
        res.status(500).json({
          message: "Comment deletion failed!",
        });
      });
  }
};
