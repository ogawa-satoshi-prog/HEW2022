const http = require('http');
const express = require('express');
// const fs = require("fs");
// const ejs = require("ejs");
const mysql = require('mysql');

const crypto = require('crypto');

// json読み込み
// const json = require('data.json');


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
  .get('/', (req, res) => {
    res.render(CLIENT_ROOT + "/toppage.ejs");
  })
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
let arr = [];
io.sockets.on('connection', (socket) => {
  arr.push(socket.id);
  console.log('connection');
  console.log(arr);

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
});


// ログイン関数
// @str id, str pass
// login("05016", "horinouchi");
function login(id, pass) {
  let sql = "SELECT * FROM User WHERE login = " + id;
  connection.query(sql, (err, results) => {
    // パスワード認証
    if (!err && results[0].password == crypto.createHash('sha256').update(pass).digest('hex')) {
      // 成功
      console.log('Login: ' + results[0].name);
    } else {
      // 失敗
      console.log('Login failed');
    }
  })
}