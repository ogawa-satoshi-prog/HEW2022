const http = require('http');
const express = require('express');
// const fs = require("fs");
// const ejs = require("ejs");
const mysql = require('mysql');


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
  .use(express.static('client'));



// socket通信
const socketio = require('socket.io');
let io = socketio(server);

// 1.アクセスされ、ソケット通信のコネクションが確立された時

io.sockets.on('connection', (socket) => {
  console.log('connection');
  // // 以下の形で受信イベントを登録する
  // socket.on(受信イベント名, (data)=>{
  //   // 処理
  //   // 送信処理例
  //   io.sockets.emit(送信イベント名, 送信オブジェクト);
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