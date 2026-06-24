const express = require("express");
const router = express.Router();
const albumController = require("../controllers/album.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

router.route("/")
  .get(albumController.getAlbums)
  .post(albumController.createAlbum);

router.route("/:id")
  .put(albumController.updateAlbum)
  .delete(albumController.deleteAlbum);

module.exports = router;
