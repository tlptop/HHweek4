const express = require("express");
const app = express();
const port = 3000;

const usersRouter = require("./routes/users");
const postsRouter = require("./routes/posts"); 
const commentsRouter = require("./routes/comments");


//

app.listen(port, () => {
  console.log(port, "포트로 서버가 열렸어요!");
});


//
app.use(express.urlencoded({ extended: true })); // 바디 파서.
app.use(express.json()); // 전역 미들웨어이다. 위치가 중요하다.
//
app.use("/posts", [postsRouter]); // 미들웨어의 일종이다. /posts로 들어오면 "반드시" postRouter를 통과해야 함. 
app.use("/comments", [commentsRouter]);
app.use("/users", [usersRouter]);