const http = require('http');
const express = require('express');
// const fs = require("fs");
// const ejs = require("ejs");
const mysql = require('mysql');
const awaitMysql = require('mysql-await');
const util = require('util');
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

  // ログインIDからユーザーを取得
  getUser(loginId) {
    if (user.teachers.some((tc) => tc.id == loginId)) {
      return user.teachers.find((tc) => tc.id == loginId);
    } else {
      return user.students.find((st) => st.id == loginId);
    }
  }

  // ソケットIDからユーザーを取得
  getUserBySocketId(socketId) {
    if (user.teachers.some((tc) => tc.socketId == socketId)) {
      return user.teachers.find((tc) => tc.socketId == socketId);
    } else {
      return user.students.find((st) => st.socketId == socketId);
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
    this.timer;
    this.ques = [];
    this.students = [];
  }

  // タイマー初期設定
  setTime(sec) {
    this.time = sec;
  }

  // タイマー停止処理
  timerStop() {
    clearInterval(this.timer);
  }

  // タイマーカウンタ(ポーリング処理内で回す)
  timeCount(sockets) {
    this.timer = setInterval(() => {
      this.time -= 1;
      io.sockets.emit('test_timer', this.time);
      if (this.time == 0) {
        // 教員に確認状況を送信
        io.sockets.to(user.getMasterTeacher).emit('test_check', this.getResultCheck(user.students));
        console.log(`${color.cyan}試験が終了しました${color.reset}`);
        // 試験終了
        clearInterval(this.timer);
      }
    }, 1000);
  }

  // 試験を行う生徒を初期設定(現在接続中の生徒全員)
  setStudent(students) {
    let tempSt;
    students.forEach(st => {
      tempSt = {};
      tempSt.id = st.id;
      tempSt.name = st.name;
      tempSt.exp = st.exp;
      tempSt.progress = [];
      tempSt.check = 'n';
      this.students.push(tempSt);
    });
  }

  // 試験を行う生徒を追加(一人ずつ){id:05016, name:堀之内, exp:10}
  addStudent(stObj) {
    let st = {};
    st.id = stObj.id;
    st.name = stObj.name;
    st.exp = stObj.exp;
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

  // 試験終了後に確認されている生徒の情報を送信
  getResultCheck(students) {
    let arr = [];
    let ob;
    for (const key in students) {
      ob.id = students[key].id;
      ob.name = students[key].name;
      ob.exp = students[key].exp;
      ob.check = this.students[key].check;
      arr.push(ob);
    }
    return arr;
  }

  // 正答率計算
  getAllAnswerRate() {
    let reQue = [];
    for (const que of this.ques) {
      reQue.push({
        que_id: que.que_id,
        answer_id: que.answer_id,
        totalAnsCount: 0,
        ansCount: 0,
        rate: 0
      });
    }
    for (const st of this.students) {
      for (const key in st.progress) {
        reQue[key].totalAnsCount++;
        if (reQue[key].answer_id == st.progress[key].answer_id) {
          reQue[key].ansCount++;
        }
      }
    }
    for (const que of reQue) {
      que.rate = Math.ceil(que.ansCount / que.totalAnsCount);
      delete que.totalAnsCount;
      delete que.ansCount;
    }
    return reQue;
  }

  // 正答率計算(1問のみ)
  getAnswerRate(que_id) {
    let queKey;
    for (const key in this.ques) {
      if (this.ques[key].que_id == que_id) {
        queKey = key;
        break;
      }
    }
    let que = {
      answer_id: this.ques[queKey].answer_id,
      totalAnsCount: 0,
      ansCount: 0
    }
    for (const st of this.students) {
      if (typeof st.progress[queKey] != 'undefined') {
        que.totalAnsCount++;
        if (que.answer_id == st.progress[queKey].answer_id) {
          que.ansCount++;
        }
      }
    }
    return Math.ceil(que.ansCount / que.totalAnsCount);
  }

  // test_start時に送信する問題情報
  getQuesNoAns() {
    let noAns = [];
    let ob;
    for (const que of this.ques) {
      ob = {};
      ob.que_id = que.que_id;
      ob.focus = que.focus;
      ob.question = que.question;
      ob.choices = que.choices;
      noAns.push(ob);
    }
    return noAns;
  }

  // 試験前に問題を追加
  // que_idを渡すとtest.quesに問題を追加する
  async addQuestion(queId) {
    let sql = "SELECT * FROM question WHERE que_id = " + queId;
    let results = await DB2.awaitQuery(sql);
    let que = results[0];
    que.choices = [];

    sql = "SELECT * FROM answer WHERE que_id = " + queId;
    let reChoices = await DB2.awaitQuery(sql);
    let choice;

    for (const el of reChoices) {
      choice = {};
      choice.id = el.choices_id;
      choice.answer = el.choice;
      que.choices.push(choice);
    }
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

// DB.query = util.promisify(DB.query);

const DB2 = awaitMysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'quest_meeting'
});

let user = new User();
let test = new Test();

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
const { resolve } = require('path');
const mysqlAwait = require('mysql-await');
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
  //   socket.to(ソケットID).emit(送信イベント名, 送信オブジェクト);

  //   // 個別送信(送信者宛)
  //   socket.emit(送信イベント名, 送信オブジェクト);
  //   socket.to(socket.id).emit(送信イベント名, 送信オブジェクト);

  //   // つまり、以下の二つは同じ
  //   // socket.to(socket.id)
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

  // ちょっと待ったボタン
  socket.on('wait', (data) => {
    // ちょっと待ったの処理
    socket.to(user.getMasterTeacher).emit('wait', '');
  });

  // 生徒が回答を終了
  socket.on('test_finish', (data) => {
    // [{que_id:1, rate:70, answer_id:2}, {que_id:2, rate:50, answer_id:5}]形式で正答率などを返す
    socket.emit('test_finish', (data) => { test.getAllAnswerRate() });
  });

  // 回答選択処理
  socket.on('test_progress', (data) => {
    let loginId = user.getUserBySocketId(socket.id).id;
    // 教員に進捗を送信
    socket.to(user.getMasterTeacher).emit('test_progress', { id: loginId, que_id: data.que_id, answer_id: data.answer_id });
    // 生徒に更新をかける {que_id:1, rate:40}形式
    for (const st of user.students) {
      socket.to(st.socketId).emit('test_rateUpdate', test.getAnswerRate(data.que_id));
    }
  });

  // 試験結果確認ボタン押下時
  socket.on('test_confirm', (data) => {
    let loginId = user.getUserBySocketId(socket.id).id;
    test.setResultCheck(loginId);
    // 随時更新の場合
    if (test.time == 0) {
      socket.to(user.getMasterTeacher).emit('test_confirm', { id: loginId });
    }
  });

  // 試験中断・一時停止処理
  socket.on('test_stop', (data) => {
    if (data == 0) {
      // 中断
      // 生徒に中断情報を送信
      for (const st of user.students) {
        socket.to(st.socketId).emit('test_timer', 0);
      }
      console.log(`${color.yellow}試験が中断されました${color.reset}`);
    } else if (data == 1) {
      // 一時停止
      test.timerStop();
      console.log(`${color.yellow}試験が一時停止されました${color.reset}`);
    }
  });

  // 試験再開処理
  socket.on('test_restart', (data) => {
    // タイマー再開
    test.timeCount();
    console.log(`${color.cyan}試験が再開されました${color.reset}`);
  });

  // 先生が試験開始ボタンを押した時の処理
  socket.on('test_start', (ques) => {
    (async () => {
      // testオブジェクトに問題を設定
      for (const queId of ques) {
        await test.addQuestion(queId);
      }
      // 生徒をtest.studentsに登録
      test.setStudent(user.students);
      // 教師に生徒一覧送信
      socket.to(user.getMasterTeacher).emit('test_start', { time: test.time, students: test.students });
      console.log(user.getMasterTeacher);
      // 生徒に問題情報を送信
      // user.students.forEach(st => {
      //   socket.to(st.socketId).emit('test_start', { time: test.time, ques: test.ques });
      // });

      for (const st of user.students) {
        await socket.to(st.socketId).emit('test_start', { time: test.time, ques: test.getQuesNoAns() });
      }

      // タイマーカウント開始
      test.timeCount();
      console.log(`${color.cyan}試験が開始されました${color.reset}`);

      // 試験終了時処理
      // setTimeout(() => {
      //   console.log(`${color.cyan}試験が終了しました${color.reset}`);

      //   // 教師に終了情報を送信
      // }, test.time * 1000);

    })();
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