const Post = require("../models/post");

exports.createPost = (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/images/" + req.file.filename,
    creator: req.userData.userId,
  });
  // Almaceno los datos en Mongo
  post
    .save()
    .then((createdPost) => {
      /// con ...createdPost hago una copia de el objeto creadedPost y añado el id luego
      // igual hay que poner al final _doc
      console.log(createdPost);
      console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
      console.log({
        ...createdPost,
        id: createdPost._id,
      });
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
};

exports.updatePost = (req, res, err) => {
  // si no tiene un archivo se extrae de imagePath
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + "://" + req.get("host");
    imagePath = url + "/images/" + req.file.filename;
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
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
};

exports.getPostsByPage = (req, res, next) => {
  //req.query muestra los datos que hay anadidos despues de ? y separados por &
  // + es la forma rapida de convertir en numero
  console.log(req.query);
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fechedPosts;
  if (pageSize && currentPage) {
    postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  postQuery
    .then((documents) => {
      fechedPosts = documents;
      return Post.count();
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
};

exports.getPost = (req, res, next) => {
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
};

exports.deletePost = (req, res, next) => {
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId })
    .then((result) => {
      // Si elimina algun post
      if (result.n > 0) {
        res.status(200).json({ message: "Post deleted!" });
      } else {
        res.status(401).json({ message: "No authorized to delete this post" });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Post deletion failed!",
      });
    });
};
