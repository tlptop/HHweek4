// middlewares/auth-middleware.js

const jwt = require("jsonwebtoken");
const { User } = require("../models"); // 변경된 부분  ( const User = require("../schemas/user"); )


module.exports = (req, res, next) => {
  const { authorization } = req.headers; // 헤더부분 authorization에 토큰을 넣어서 전달
  console.log(authorization);
  const [authType, authToken] = (authorization || "").split(" "); // authorization에서 실제 중요한 부분은 authToken임.

  if (!authToken || authType !== "Bearer") {
    res.status(401).send({
      errorMessage: "로그인 후 이용 가능한 기능입니다(1).",
    });
    return;
  }

  try {     // 요 아래부분도 좀 헷갈림 (영상05에 12분)
    const { userId } = jwt.verify(authToken, "customized-secret-key"); // jwt유효성에 통과했을 때 userID를 쓸 수.
    console.log(userId);
    User.findByPk(userId).then((user) => { // findByPk 변경된 부분 
      res.locals.user = user; // 객체임. express 자체에서 제공하는 임시저장소 같은.
      next(); // 요 next가 꽤 중요함.
    });
  } catch (err) {
    res.status(401).send({
      errorMessage: "로그인 후 이용 가능한 기능입니다(2).",
    });
  }
};