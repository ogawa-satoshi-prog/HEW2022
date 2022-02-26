const http = require('http');
const express = require('express');
// const fs = require("fs");
// const ejs = require("ejs");
const mysql = require('mysql');
const crypto = require('crypto');
const bodyParser = require('body-parser');

// Userクラス
class User {
  constructor() {
    this.teachers = [];
    this.students = [];
  }

  // 教員追加{id:106, name:'川島'}
  addTeacher(tcObj) {
    // tcObj.socketId = '';
    this.teachers.push(Object.assign({}, tcObj));
  }
  // 生徒追加{id:05016, name:'堀之内', exp:10}
  addStudent(stObj) {
    // stObj.socketId = '';
    this.students.push(Object.assign({}, stObj));
  }

  // 教員・生徒ソケット追加(05016, ソケットID)
  setSocket(loginId, socketId) {
    this.teachers.forEach(tc => {
      if (tc.id == loginId) {
        tc.socketId = socketId;
        console.log(`${color.blue}接続${color.reset}: ${color.green}${tc.name}${color.reset}`);
        return;
      }
    });
    this.students.forEach(st => {
      if (st.id == loginId) {
        st.socketId = socketId;
        console.log(`${color.blue}接続${color.reset}: ${st.name}`);
        return;
      }
    });
  }

  // ソケット切断時に実行
  setDisconnect(socketId) {
    this.teachers.forEach((tc, key) => {
      if (tc.socketId == socketId) {
        this.teachers.splice(key, 1);
        console.log(`${color.yellow}切断${color.reset}: ${color.green}${tc.name}${color.reset}`);
        return;
      }
    });
    this.students.forEach((st, key) => {
      if (st.socketId == socketId) {
        this.students.splice(key, 1);
        console.log(`${color.yellow}切断${color.reset}: ${st.name}`);
        return;
      }
    });
  }

  // ユーザーを取得
  getUser(loginId) {
    if (user.teachers.some((tc) => tc.id == loginId)) {
      return user.teachers.find((tc) => tc.id == loginId);
    } else {
      return user.students.find((st) => st.id == loginId);
    }
  }

  // teachers配列の0番目の教師情報をオブジェクトで返す{id:'106', name:'kawashima', socketId:'adasdadfrgsg'}
  getMasterTeacher() {
    if (this.teachers[0]) {
      return this.teachers[0];
    } else {
      return null;
    }
  }
}

// Testクラス
class Test {
  constructor() {
    this.time = 300;
    this.ques = [];
    this.students = [];
  }

  // タイマー初期設定
  setTime(sec) {
    this.time = sec;
  }

  // タイマーカウンタ(ポーリング処理内で回す)
  timeCount() {
    this.time -= 1;
  }

  // 試験を行う生徒を初期設定(現在接続中の生徒全員)
  setStudent(students) {
    let tempSt;
    students.forEach(st => {
      tempSt.id = st.id;
      tempSt.progress = [];
      tempSt.check = 'n';
      this.students.push(tempSt);
    });
  }

  // 試験を行う生徒を追加(一人ずつ)
  addStudent(id) {
    let st;
    st.id = id;
    st.progress = [];
    st.check = 'n';
    this.students.push(st);
  }

  // 試験中に学生の回答進捗を追加
  // 第一引数:学籍番号, 第二引数:{que_id:問題ID, answer_id:回答ID}
  addProgress(id, obj) {
    this.students.find((st) => st.id == id).progress.push(obj);
  }

  // 試験後に確認OKボタンを押下後、確認記録をする
  setResultCheck(id) {
    this.students.find((st) => st.id == id).check = 'y';
  }

  // 試験前に問題を追加
  // que_idを渡すとtest.quesに問題を追加する
  addQuestion(queId) {
    let sql = "SELECT * FROM question WHERE que_id = " + queId;
    DB.query(sql, (err, results) => {
      if (err) {
        return NULL;
      }
      let que = results[0];
      que.choices = [];
      sql = "SELECT * FROM answer WHERE que_id = " + queId;
      DB.query(sql, (err, reChoices) => {
        if (err) {
          return NULL;
        }
        let choice;
        reChoices.forEach(el => {
          choice.id = el.que_id;
          choice.answer = el.choice;
          que.choices.push(choice);
        });
      });
    });
    this.ques.push(que);
  }
}

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
// let user = require('./state.json').user;
// let test = require('./state.json').test;

let user = new User();
// let test = new Test();

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
// const { NULL } = require('mysql/lib/protocol/constants/types');
let io = socketio(server);

// コネクション確立
io.sockets.on('connection', (socket) => {
  // ソケットIDを保存
  socket.on('send_id', (loginId) => {
    user.setSocket(loginId, socket.id);
  });

  socket.on('disconnect', (reason) => {
    user.setDisconnect(socket.id);
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
    res.render(CLIENT_ROOT + "/s_master.ejs", '試験に必要な情報');
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
          // setTeacher({ id: loginId, name: results[0].name });
          user.addTeacher({ id: loginId, name: results[0].name });
          DB.query('select * from subject;', function (err, results, fields) {
            if (err) {
              throw err;
            }
            let categorys = results;
            res.render(CLIENT_ROOT + '/t_master.ejs', { categorys: categorys, loginId: loginId })
          });
        } else {
          // 生徒ログイン
          const userName = results[0].name;
          const lv = Math.floor(results[0].exp / 10);
          // setStudent({ id: loginId, name: userName, exp: results[0].exp });
          user.addStudent({ id: loginId, name: userName, exp: results[0].exp });
          res.render(CLIENT_ROOT + "/s_master.ejs", {
            loginId: loginId,
            userName: userName,
            lv: lv
          });
        }
      } else {
        // 失敗
        console.log(`${color.red}ログイン失敗${color.reset}`);
        res.render(CLIENT_ROOT + "/toppage.ejs");
      }
    });
  }
}