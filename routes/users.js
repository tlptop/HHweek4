//
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/auth-middleware");
const { User } = require("../models"); // 변경된 부분
const { Op } = require("sequelize"); // 추가된 부분


// 회원가입
router.post("/signup", async (req, res) => {
  const { nickname, password, confirmPassword } = req.body;

  const nicknameRegex = /^[a-zA-z0-9]{3,25}$/;
  const nicknameValueCheck = nicknameRegex.test(nickname);
  if (!nicknameValueCheck) {
    res.status(400).send({
      errorMessage: "닉네임을 다시 설정해주세요.",
    });
    return;
  }

  if (password !== confirmPassword) {
    res.status(400).send({
      errorMessage: "패스워드가 패스워드 확인란과 다릅니다.",
    });
    return; // 리턴은 꼭 써주는 게 좋다.
  }

  const existsUsers = await User.findAll({ where: { [Op.or]: [{ nickname }] }, });   // 변경된 부분
  if (existsUsers.length) {
    res.status(400).send({
      errorMessage: "이메일 또는 닉네임이 이미 사용중입니다.",
    });
    return;
  }

  await User.create({ nickname, password });
  res.status(201).send({});
});


// 2. 로그인
router.post("/auth", async (req, res) => {
  const { nickname, password } = req.body;

  const user = await User.findOne({ where: { nickname } });    //  변경된 부분
    
  if (!user || password !== user.password) { 
    res.status(400).send({
      errorMessage: "닉네임 또는 패스워드가 틀렸습니다.",
    });
    return;
  }

  res.send({
    token: jwt.sign({ userId: user.userId }, "customized-secret-key"),
  });
});

// 3. 내 정보 조회 (로그인 검사)
router.get("/me", authMiddleware, async (req, res) => {
  const { user } = res.locals;
  res.send({
    user,
  });
});

module.exports = router;