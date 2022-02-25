const http = require('http');
const express = require('express');
// const fs = require("fs");
// const ejs = require("ejs");
const mysql = require('mysql');

const crypto = require('crypto');
const bodyParser = require('body-parser')


// ステータスオブジェクト
let state = require('./state.json');

const app = express();
const server = http.Server(app);
const CLIENT_ROOT = __dirname + '/client';
const PORT = 3000;

const DB = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'quest_meeting'
};


// データベース接続
const connection = mysql.createConnection(DB);

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
  .get('/t_master', (req, res) => {
    DB.query('select * from subject;', function (err, results, fields) {
      if (err) {
        throw err;
      }
      let categorys = results[0];
      res.render(CLIENT_ROOT + 't_master.ejs', { categorys: categorys })
    });
  })
  .use(express.static('client'));

// socket通信
const socketio = require('socket.io');
let io = socketio(server);

// 1.アクセスされ、ソケット通信のコネクションが確立された時
io.sockets.on('connection', (socket) => {
  console.log('connection: ' + socket.id);
  // ソケットIDを保存

  socket.on('send_id', (loginId) => {
    console.log('on(send_id): ' + loginId);
    let student = state.user.students.find((st) => st.id == loginId);
    student.socketId = socket.id;
    console.log(state);
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

  // // 出題設定（問題選択）
  // socket.on('next', (data) => {
  //   connection.query(
  //     'SELECT id,question FROM question WHERE subject_id=' + data,
  //     (error, results) => {
  //       io.sockets.emit('resQuestion', { question: results });
  //     }
  //   );
  // });

  // // 問題を見る（SELECT句を必要に応じて書き換えてください）
  // socket.on('detail', (data) => {
  //   connection.query(
  //     'SELECT * FROM question WHERE que_id=' + data,
  //     (error, results) => {
  //       io.sockets.emit('resQuestionDetail', { question: results });
  //     }
  //   );
  // });

  // // 解説ボタン（SELECT句を必要に応じて書き換えてください）
  // socket.on('commentary', (data) => {
  //   connection.query(
  //     'SELECT * FROM question WHERE que_id=' + data,
  //     (error, results) => {
  //       io.sockets.emit('resQuestionCommentary', { question: results });
  //     }
  //   );
  // });

  // 画面22番の確認ボタン（SELECT句を必要に応じて書き換えてください）
  // socket.on('confirm_btn', (data) => {
  // 生徒がスコアボードを確認したことが通知された
  // JSONの処理
  // io.sockets.emit('', );
  // });

  // ちょっと待ったボタン
  socket.on('confirm_btn', (data) => {
    // ちょっと待った時の処理
  });
});

// toppageのログイン処理
function login(req, res) {
  let form = req.body;

  if (form.id == '' || form.password == '') {
    res.render(CLIENT_ROOT + "/toppage.ejs");
  } else {
    let sql = "SELECT * FROM User WHERE login = " + form.id;
    connection.query(sql, (err, results) => {
      // パスワード認証
      if (!err && results[0].password == crypto.createHash('sha256').update(form.password).digest('hex')) {
        // 教員生徒 分別画面遷移
        if (results[0].exp == -1) {
          // 教員ログイン
          console.log("教員ログイン: " + results[0].name);
          const loginId = form.id;
          res.render(CLIENT_ROOT + "/t_master.ejs", {
            loginId: loginId
          });
        } else {
          // 生徒ログイン
          const loginId = form.id;
          const userName = results[0].name;
          const lv = Math.floor(results[0].exp / 10);
          setStudent({ id: form.id, name: results[0].name, exp: results[0].exp });
          res.render(CLIENT_ROOT + "/s_master.ejs", {
            loginId: loginId,
            userName = results[0].name,
            lv = Math.floor(results[0].exp / 10)
          });
          console.log("生徒ログイン: " + results[0].name);
        }
      } else {
        // 失敗
        console.log('ログイン失敗');
        res.render(CLIENT_ROOT + "/toppage.ejs");
      }
    });
  }
}

// stateにuser登録
function setStudent(obj) {
  let st = Object.assign({}, state.user.tempStudents);
  Object.assign(st, obj); // 上書き
  state.user.students.push(st); // 配列に追加
}