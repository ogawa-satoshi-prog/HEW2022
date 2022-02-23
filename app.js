const http = require('http');
const fs = require("fs");
const ejs = require("ejs");
const mysql = require('mysql');
const express = require('express');
const app = express();

const index_page = fs.readFileSync('./index.ejs', 'utf8');

var server = http.createServer(getFromClient);

server.listen(3000);
console.log('http://localhost:3000');

// expressを使用
app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));
// データベース接続
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'quest_meeting'
});

function getFromClient(request, response) {
  var content = ejs.render(index_page);
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(content);
  response.end();
}

// socket通信
const socketio = require('socket.io');
const { Console } = require('console');
let io = socketio(server);

// 1.アクセスされ、ソケット通信のコネクションが確立された時

io.sockets.on('connection',(socket)=>{
  console.log('connection');
  socket.on('client_to_server', (data)=>{
    io.sockets.emit('server_to_client', data);
    console.log(data);
  });

  // // 以下の形で受信イベントを登録する
  // socket.on(受信イベント名, (data)=>{
  //   // 処理
  //   // 送信処理例
  //   io.sockets.emit(送信イベント名, 送信オブジェクト);
  // });

  socket.on('stop', (data)=>{
    console.log(data);
  });

  // 出題設定（問題選択）
  socket.on('next', (data)=>{
      connection.query(
        'SELECT id,question FROM question WHERE subject_id='+data,
        (error, results) => {
          io.sockets.emit('resQuestion', {question: results});
        }
      );
  });

  // 問題を見る（SELECT句を必要に応じて書き換えてください）
  socket.on('detail', (data)=>{
    connection.query(
      'SELECT * FROM question WHERE que_id='+data,
      (error, results) => {
        io.sockets.emit('resQuestionDetail', {question: results});
      }
    );
});

  // 解説ボタン（SELECT句を必要に応じて書き換えてください）
  socket.on('commentary', (data)=>{
    connection.query(
      'SELECT * FROM question WHERE que_id='+data,
      (error, results) => {
        io.sockets.emit('resQuestionCommentary', {question: results});
      }
    );
});


});