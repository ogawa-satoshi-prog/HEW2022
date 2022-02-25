const http = require('http');
const express = require('express');
// const fs = require("fs");
// const ejs = require("ejs");
const mysql = require('mysql');

const crypto = require('crypto');
const bodyParser = require('body-parser');

const color = {
  red: '\u001b[31m',
  green: '\u001b[32m',
  yellow: '\u001b[33m',
  blue: '\u001b[34m',
  magenta: '\u001b[35m',
  cyan: '\u001b[36m',
  reset: '\u001b[0m'
};

// サーバー情報
let user = require('./state.json').user;
let test = require('./state.json').test;


const app = express();
const server = http.Server(app);
const CLIENT_ROOT = __dirname + '/client';
const PORT = 3000;

const DB = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'quest_meeting',
  multipleStatements: true //★複数クエリの実行を許可する
});

server.listen(PORT);
console.log('http://localhost:3000');

// メソッドチェーンでルーティング記述
app
  .set("view engine", "ejs")
  .use(bodyParser.urlencoded({ extended: true }))
  .get('/', (req, res) => {
    res.render(CLIENT_ROOT + "/toppage.ejs");
  })
  .post('/', login)
  .use(express.static('client'));

// socket通信
const socketio = require('socket.io');
let io = socketio(server);

// コネクション確立
io.sockets.on('connection', (socket) => {
  console.log(`ソケット接続: ${socket.id}`);
  // ソケットIDを保存
  socket.on('send_id', (loginId) => {
    let student = user.students.find((st) => st.id == loginId);
    student.socketId = socket.id;
    console.log(`ソケットID登録: ${student.name} ${socket.id}`);
  });

  socket.on('disconnect', (reason)=>{
    console.log(`ソケット切断: ${socket.id}`);
  });

  // 以下の形で受信イベントを登録する
  // socket.on(受信イベント名, (data)=>{
  //   // 処理
  //   // 送信処理例

  //   // 全体送信
  //   io.sockets.emit(送信イベント名, 送信オブジェクト);

  //   // 全体送信(送信者除く)
  //   socket.broadcast.emit(送信イベント名, 送信オブジェクト);

  //   // 個別送信(特定の宛先)
  //   io.sockets.socket(ソケットID).emit(送信イベント名, 送信オブジェクト);

  //   // 個別送信(送信者宛)
  //   socket.emit(送信イベント名, 送信オブジェクト);
  //   io.sockets.socket(socket.id).emit(送信イベント名, 送信オブジェクト);

  //   // つまり、以下の二つは同じ
  //   // io.sockets.socket(socket.id)
  //   // socket
  // });
  socket.on("subject", (subject_id) => {
    DB.query('select * from que where subject_id = ' + subject_id + ';', function (err, results, fields) {
      if (err) {
        throw err;
      }
      let ques = results;
      socket.emit("question", ques);
    });
  });

  // // 出題設定（問題選択）
  // socket.on('next', (data) => {
  //   DB.query(
  //     'SELECT id,question FROM question WHERE subject_id=' + data,
  //     (error, results) => {
  //       io.sockets.emit('resQuestion', { question: results });
  //     }
  //   );
  // });

  // // 問題を見る（SELECT句を必要に応じて書き換えてください）
  // socket.on('detail', (data) => {
  //   DB.query(
  //     'SELECT * FROM question WHERE que_id=' + data,
  //     (error, results) => {
  //       io.sockets.emit('resQuestionDetail', { question: results });
  //     }
  //   );
  // });

  // // 解説ボタン（SELECT句を必要に応じて書き換えてください）
  // socket.on('commentary', (data) => {
  //   DB.query(
  //     'SELECT * FROM question WHERE que_id=' + data,
  //     (error, results) => {
  //       io.sockets.emit('resQuestionCommentary', { question: results });
  //     }
  //   );
  // });

  // 画面22番の確認ボタン（SELECT句を必要に応じて書き換えてください）
  socket.on('confirm_btn', (data) => {
    // 生徒がスコアボードを確認したことが通知された
    // console.log(socket.id);

    // JSONの処理
    // io.sockets.emit('', );
  });

  // ちょっと待ったボタン
  socket.on('confirm_btn', (data) => {
    // ちょっと待ったの処理
  });

  // 先生が試験開始ボタンを押した時の処理
  socket.on('test_start', (data) => {
    // 生徒側に問題と制限時間を送る処理が必要
    res.render(CLIENT_ROOT + "/s_master.ejs" , '試験に必要な情報');
  });
});

// toppageのログイン処理
function login(req, res) {
  let form = req.body;

  if (form.id == '' || form.password == '') {
    res.render(CLIENT_ROOT + "/toppage.ejs");
  } else {
    let sql = "SELECT * FROM User WHERE login = " + form.id;
    DB.query(sql, (err, results) => {
      // パスワード認証
      if (!err && results[0] && results[0].password == crypto.createHash('sha256').update(form.password).digest('hex')) {
        // 教員生徒 分別画面遷移
        const loginId = form.id;
        if (results[0].exp == -1) {
          // 教員ログイン
          setTeacher({ id: loginId, name: results[0].name });
          DB.query('select * from subject;', function (err, results, fields) {
            if (err) {
              throw err;
            }
            let categorys = results;
            res.render(CLIENT_ROOT + '/t_master.ejs', { categorys: categorys, loginId: loginId })
          });
          console.log(`${color.blue}教員ログイン: ${loginId} ${results[0].name}${color.reset}`);
        } else {
          // 生徒ログイン
          const userName = results[0].name;
          const lv = Math.floor(results[0].exp / 10);
          setStudent({ id: loginId, name: userName, exp: results[0].exp });
          res.render(CLIENT_ROOT + "/s_master.ejs", {
            loginId: loginId,
            userName: userName,
            lv: lv
          });
          console.log(`${color.blue}生徒ログイン: ${loginId} ${userName}${color.reset}`);
        }
      } else {
        // 失敗
        console.log(`${color.red}ログイン失敗${color.reset}`);
        res.render(CLIENT_ROOT + "/toppage.ejs");
      }
    });
  }
}

// userにstudent登録
function setStudent(obj) {
  let st = Object.assign({}, user.tempStudents);
  Object.assign(st, obj); // 上書き
  user.students.push(st); // 配列に追加
}

// userにteacher登録
function setTeacher(obj) {
  let te = Object.assign({}, user.tempTeachers);
  Object.assign(te, obj); // 上書き
  user.students.push(te); // 配列に追加
}