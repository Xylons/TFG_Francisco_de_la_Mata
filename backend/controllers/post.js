const Post = require("../models/post");

const UNDEFINED = process.env.notdefined;
const PATIENT = process.env.patient;
const RESPONSIBLE = process.env.responsible;
const ADMIN = process.env.admin;

exports.createPost = (req, res, next) => {
  if (req.userData.rol !== RESPONSIBLE) {
    res.status(401).json({
      message: "Not authorized to edit the Profile",
    });
  } else {
    //const url = req.protocol + "://" + req.get("host");
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      creator: req.userData.userId,
      userId: req.body.userId,
    });
    // Almaceno los datos en Mongo
    post
      .save()
      .then((createdPost) => {
        /// con ...createdPost hago una copia de el objeto creadedPost y añado el id luego
        // igual hay que poner al final _doc
        console.log(createdPost);
        res.status(201).json({
          message: "Post Added",
          post: {
            ...createdPost,
            id: createdPost._id,
          },
        });
      })
      .catch((error) => {
        res.status(500).json({
          message: "Creting a post failed",
        });
      });
  }
};

exports.updatePost = (req, res, err) => {
  if (req.userData.rol !== RESPONSIBLE) {
    res.status(401).json({
      message: "Not authorized to edit the Profile",
    });
  } else {
    const post = new Post({
      _id: req.body.id,
      title: req.body.title,
      content: req.body.content,
      creator: req.userData.userId,
    });
    Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post)
      .then((result) => {
        // Si modifica algun post
        if (result.n > 0) {
          res.status(200).json({
            message: "Post Update Sucessfull",
          });
        } else {
          res.status(401).json({
            message: "Not authorized to edit the post",
          });
        }
      })
      .catch((error) => {
        res.status(500).json({
          message: "Couldn't update post",
        });
      });
  }
};

exports.getPostsByPage = (req, res, next) => {
  if (req.userData.rol !== RESPONSIBLE) {
    res.status(401).json({
      message: "Not authorized to edit the Profile",
    });
  } else {
    //req.query muestra los datos que hay anadidos despues de ? y separados por &
    // + es la forma rapida de convertir en numero
    console.log(req.query);
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;
    const postQuery = Post.find({ userId: req.query.userId });
    let fechedPosts;
    if (pageSize && currentPage) {
      postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
    }
    postQuery.sort({ timestamp: -1 })
      .then((documents) => {
        fechedPosts = documents;
        return Post.countDocuments({ userId: req.query.userId });
      })
      .then((count) => {
        res.status(200).json({
          message: "All fine",
          posts: fechedPosts,
          maxPosts: count,
        });
      })
      .catch((error) => {
        res.status(500).json({
          message: "Fetching posts failed!",
        });
      });
  }
};

exports.getPost = (req, res, next) => {
  if (req.userData.rol !== RESPONSIBLE) {
    res.status(401).json({
      message: "Not authorized to edit the Profile",
    });
  } else {
    Post.findById(req.params.id)
      .then((post) => {
        if (post) {
          res.status(200).json(post);
        } else {
          res.status(404).json({ message: "Post not found" });
        }
      })
      .catch((error) => {
        res.status(500).json({
          message: "Fetching post failed!",
        });
      });
  }
};

exports.deletePost = (req, res, next) => {
  if (req.userData.rol !== RESPONSIBLE) {
    res.status(401).json({
      message: "Not authorized to edit the Profile",
    });
  } else {
    Post.deleteOne({ _id: req.params.id, creator: req.userData.userId })
      .then((result) => {
        // Si elimina algun post
        if (result.n > 0) {
          res.status(200).json({ message: "Post deleted!" });
        } else {
          res
            .status(401)
            .json({ message: "No authorized to delete this post" });
        }
      })
      .catch((error) => {
        res.status(500).json({
          message: "Post deletion failed!",
        });
      });
  }
};
