const express = require("express");
const router = express.Router();
const { Comment } = require("../models") // 변경된 부분
const authMiddleware = require("../middlewares/auth-middleware"); // 추가한 부분

// 5.댓글 생성 (로그인만 하면 아무나 가능)
router.post("/:postId", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const userId = res.locals.user.userId;
  const { content } = req.body;    // 게시글이 없다면 댓글을 달수없게 추가 설정 해줘야.
  if (content === "") {
    res.json({ message: "댓글 내용을 입력해주세요" });
  } else {
    const createComment = await Comment.create({ // 누가 썼는지 알아야하므로 userId 필수
      postId,
      userId,
      content,
    });
    res.json({ message: "댓글이 생성되었습니다." });
  }
});

// (특정 게시글) 댓글 조회
router.get("/:postId", async (req, res) => {
  const { postId } = req.params;
  const commentList = await Comment.findAll({
    where: { postId },
    attributes: { exclude: ["postId"] },
  });
  res.json({ commentListUp: commentList });
});


// 6.댓글 수정 (로그인 + 본인확인)
// router.put("/:commentId", authMiddleware, async (req, res) => {
//   const { commentId } = req.params;
//   const { content } = req.body;
//   const { user } = res.locals;
//   const comments = await Comment.findByPk(commentId);
//   if (comments.user === user.nickname) {
//     await Comment.update({ content }, { where: {id:commentId} });
//   } else {
//     res.json({ err: "권한이 없습니다." });
//     return;
//   }
//   res.json({ "message": "게시글이 수정되었습니다." });
// });


// 6.댓글 수정 (로그인 + 본인확인)
router.put("/:_commentId", authMiddleware, async (req, res) => {
  const { _commentId } = req.params;
  const userId = res.locals.user.userId;
  const selectedComment = await Comment.findOne({ where: { commentId: _commentId } });
  const { content } = req.body;

  if (userId === selectedComment.userId) {
    await Comment.update({ content }, { where: { commentId: _commentId } });
    res.json({ message: "댓글을 수정하였습니다" });
  } else {
    res.status(400).json({ message: "수정 권한이 없습니다." });
  }
});


// 7. 댓글 삭제 (로그인 + 본인확인)
router.delete("/:_commentId", authMiddleware, async (req, res) => {
  const { _commentId } = req.params;
  const userId = res.locals.user.userId;
  const selectedComment = await Comment.findOne({ where: { commentId: _commentId } });

  if (userId === selectedComment.userId) {
    await Comment.destroy( { where: { commentId: _commentId } });
    res.json({ message: "댓글을 수정하였습니다" });
  } else {
    res.status(400).json({ message: "삭제 권한이 없습니다." });
  }
});


module.exports = router;