const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const router = express.Router();
const { Post } = require("../models"); // 변경된 부분
const { Op } = require("sequelize"); // 추가된 부분
const { Like } = require("../models"); // 추가된 부분

// 2.게시글 작성 (post)
router.post("/", authMiddleware, async (req, res) => {   
  const { title, content } = req.body;
  const userId = res.locals.user.userId;
    const createdPosts = await Post.create({ // userId는 꼭 찍어줘야 그래야 나중에 수정이나 삭제.
    userId,
    title,
    content,
  }); 
  res.json({ message: "게시글을 생성하였습니다." });
});

// 1.전체 게시글 조회(get)
router.get("/", async (req, res) => {
  const postList = await Post.findAll({
    attributes: [
      "postId",
      "userId",
      "title",
      "createdAt",
      "updatedAt",
      "likeSum",
    ],
  });
  postList.sort((a, b) => b.createdAt - a.createdAt);
  res.json({ postlist: postList });
});

// 3.특정 게시글 조회(get)
router.get("/:_postId", async (req, res) => {
  const { _postId } = req.params;
  const selectedPost = await Post.findOne({ where: {postId: _postId } });
  res.json({ detail: selectedPost });
});

// 4.게시글 수정
router.put("/:_postId", authMiddleware, async (req, res) => {
  const { _postId } = req.params;
  const userId = res.locals.user.userId;
  const selectedPost = await Post.findOne({ where: { postId: _postId } });
  const { title, content } = req.body;

  if (userId === selectedPost.userId) {
    await Post.update({ title, content }, { where: { postId: _postId } });
    res.json({ message: "게시글을 수정하였습니다." });
  } else {
    res.json({ message: "게시글 작성자가 아닙니다." });
  }
});

// 5.게시글 삭제
router.delete("/:postId", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const userId = res.locals.user.userId;
  const selectedPost = await Post.findOne({ where: { postId } });

  if (userId === selectedPost.userId) {
    await Post.destroy({ where: { postId } });
    res.json({ message: "게시글을 삭제하였습니다." });
  } else {
    res.json({ message: "게시글 작성자가 아닙니다." });
  }
});


// 게시글 좋아요 (patch도 고려해봐야)
router.put("/:postId/like", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const userId = res.locals.user.userId;
  const likey = await Like.findOne({ where: { postId, userId } });

  if (!likey) {
    await Like.create({ postId, userId });
    await Post.increment({ likeSum: 1 }, { where: { postId } });
    res.json({ message: "게시글의 좋아요를 등록하였습니다." });
  } else {
    await Like.destroy({ where: { postId, userId } });
    await Post.decrement({ likeSum: 1 }, { where: { postId } });
    res.json({ message: "게시글의 좋아요를 취소하였습니다." });
  }
});


// (내가) 좋아요 누른 게시글 전체 조회 (get? post?)
router.get("/like", authMiddleware, async (req, res) => {
  const userId = res.locals.user.userId;
  const [result] = await sequelize.query( "SELECT * FROM Posts JOIN Likes ON Likes.postId = Posts.postId" );
  const likeList = [];

  result.map((like) => {     
    if (like.userId === userId) {
      likeList.push({
        "postId": like.postId,
        "userId": like.userId,
        "title": like.title,
        "updatedAt": like.updatedAt,
        "likeSum": like.likeSum,
      });
    }
  });
  likeList.sort((a, b) => { return b.likeSum - a.likeSum; });
  res.json({ likeList });
});


module.exports = router;