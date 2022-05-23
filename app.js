const http = require('http');
const express = require('express');
const mysql = require('mysql');
const awaitMysql = require('mysql-await');
const UA = require('express-useragent');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const microtime = require("microtime");
// Userクラス
class User {
  constructor() {
    this.teachers = [];
    this.students = [];
    this.adminSocketId;
    this.blackListLoginIds = [];
    this.kickListLoginIds = [];
  }

  // 教員追加{id:106, name:'川島'}
  addTeacher(tcObj) {
    try {
      this.teachers.push(Object.assign({}, tcObj));
    } catch (error) {
      console.log(`エラー: ${color.red}User.addTeacher${color.reset}`);
    }
  }
  // 生徒追加{id:05016, name:'堀之内', exp:10}
  addStudent(stObj) {
    try {
      this.students.push(Object.assign({}, stObj));
    } catch (error) {
      console.log(`エラー: ${color.red}User.addStudent${color.reset}`);
    }
  }

  // 不正アクセス検知
  checkRegularRoot(socketId) {
    try {
      if (this.getUserBySocketId(socketId) == null) {
        // 不正アクセス
        io.sockets.to(socketId).emit('returnTop', '');
        return false;
      } else {
        return true;
      }
    } catch (error) {
      console.log(`エラー: ${color.red}User.checkRegularRoot${color.reset}`);
    }
  }

  // adminsocketid
  getAdminSocketId() {
    return this.adminSocketId;
  }

  // 教員・生徒ソケット追加(05016, ソケットID)
  setSocket(loginId, socketId) {
    this.teachers.forEach(tc => {
      if (tc.id == loginId) {
        tc.socketId = socketId;
        io.sockets.to(this.getAdminSocketId()).emit('tcConnect', { tc: tc });
        console.log(`${color.blue}接続${color.reset}: ${color.green}${tc.name}${color.reset}`);
        return;
      }
    });
    this.students.forEach(st => {
      if (st.id == loginId) {
        try {
          io.sockets.to(this.getMasterTeacher().socketId).emit('studentsCount', { count: this.students.length });
        } catch (error) {
          console.log(`${color.red}setSocketでエラーが発生しました。${color.reset}`);
        }
        st.socketId = socketId;
        io.sockets.to(this.getAdminSocketId()).emit('stConnect', { st: st });
        console.log(`${color.blue}接続${color.reset}: ${st.name}`);
        return;
      }
    });
    return;
  }

  // ソケット切断時に実行
  setDisconnect(socketId) {
    this.teachers.forEach((tc, key) => {
      if (tc.socketId == socketId) {
        this.teachers.splice(key, 1);
        io.sockets.to(this.getAdminSocketId()).emit('tcDisconnect', { name: tc.name });
        console.log(`${color.yellow}切断${color.reset}: ${color.green}${tc.name}${color.reset}`);
        return;
      }
    });
    this.students.forEach((st, key) => {
      if (st.socketId == socketId) {
        try {
          io.sockets.to(this.getMasterTeacher().socketId).emit('studentsCount', { count: this.students.length });
        } catch (error) {
          console.log(`${color.red}setDisconnectでエラーが発生しました。${color.reset}`);
        }
        this.students.splice(key, 1);
        io.sockets.to(this.getAdminSocketId()).emit('stDisconnect', { name: st.name });
        console.log(`${color.yellow}切断${color.reset}: ${st.name}`);
        return;
      }
    });
    return;
  }

  // ログインIDからユーザーを取得
  getUser(loginId) {
    if (this.teachers.some((tc) => tc.id == loginId)) {
      return this.teachers.find((tc) => tc.id == loginId);
    } else if (this.students.some((st) => st.id == loginId)) {
      return this.students.find((st) => st.id == loginId);
    } else {
      return null;
    }
  }

  // ソケットIDからユーザーを取得
  getUserBySocketId(socketId) {
    if (this.teachers.some((tc) => tc.socketId == socketId)) {
      return this.teachers.find((tc) => tc.socketId == socketId);
    } else if (this.students.some((st) => st.socketId == socketId)) {
      return this.students.find((st) => st.socketId == socketId);
    } else {
      return null;
    }
  }

  // teachers配列の0番目の教師情報をオブジェクトで返す{id:'106', name:'kawashima', socketId:'adasdadfrgsg'}
  getMasterTeacher() {
    if (this.teachers[0]) {
      return this.teachers[0];
    } else {
      console.log(`${color.red}教員のログイン情報がありません${color.reset}`);
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
    this.isTest = 0;
    this.finishStudentsCount = 0;
  }

  // タイマー初期設定
  setTime(sec) {
    this.time = sec;
  }

  // タイマー停止処理
  timerStop() {
    try {
      clearInterval(this.timer);
    } catch (error) {
      console.log(`エラー: ${color.red}Test.timerStop${color.reset}`);
      console.log('おそらくtimeCountのsetIntervalが動作していません。');
    }
  }

  // タイマーカウンタ(ポーリング処理内で回す)
  timeCount(sockets) {
    this.isTest = 1;
    this.timer = setInterval(() => {
      if (0 < this.time) {
        this.time -= 1;
      }
      try {
        if (user.students.length == 0 && user.teachers.length == 0) {
          this.time = 0;
        }
      } catch (error) {
        console.log(`${color.red}全ユーザー切断により、テストを中断しました。${color.reset}`);
      }
      try {
        io.sockets.emit('test_timer', this.time);
      } catch (error) {
        console.log(`エラー: ${color.red}Test.timeCount${color.reset}`);
        console.log('ソケットエラー:test_timer全体送信');
      }
      // 時間切れ・中断・全員終了
      if (this.time <= 0) {
        this.time = 0;
        this.isTest = 2;
        // 教員に確認状況を送信
        try {
          io.sockets.to(user.getMasterTeacher().socketId).emit('test_check', this.getResultCheck(user.students));
          for (const st of user.students) {
            try {
              io.sockets.to(st.socketId).emit('test_check', '');
            } catch (error) {
              console.log(`${color.red}on('test_check')で生徒宛のtest_timerのソケット通信に失敗しました。${color.reset}`);
            }
          }
        } catch (error) {
          console.log(`エラー: ${color.red}Test.timeCount${color.reset}`);
          console.log('ソケットエラー:test_checkを教員に送信できませんでした。');
          console.log('おそらく教員がログインされていません。');
        }
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
    try {
      this.students.push({
        id: stObj.id,
        name: stObj.name,
        exp: stObj.exp,
        progress: [],
        check: 'n'
      });
    } catch (error) {
      console.log(`エラー: ${color.red}Test.addStudent${color.reset}`);
      console.log('Test.studentsにstObjを追加できませんでした。');
    }
  }

  // 試験中に学生の回答進捗を追加
  // 第一引数:学籍番号, 第二引数:{que_id:問題ID, answer_id:回答ID}
  addProgress(id, obj) {
    const stProgress = this.students.find((st) => st.id == id).progress;
    if (stProgress == undefined) {
      console.log(`エラー: ${color.red}Test.addProgress${color.reset}`);
      console.log('進捗を追加しようとした生徒の情報が存在しません。');
      return;
    }
    if (stProgress.some((pr) => pr.que_id == obj.que_id)) {
      // 上書き
      let prog = stProgress.find((pr) => pr.que_id == obj.que_id);
      Object.assign(prog, obj);
    } else {
      // 追加
      this.students.find((st) => st.id == id).progress.push(obj);
    }
    const stName = this.students.find((st) => st.id == id).name;
    if (stName == undefined) {
      console.log(`エラー: ${color.red}Test.addProgress${color.reset}`);
      console.log('名前が見つかりませんでした。');
      return;
    }
    console.log(`${color.green}${stName}:回答を送信しました${color.reset}`);
  }

  // 試験後に確認OKボタンを押下後、確認記録をする
  setResultCheck(id) {
    if (this.students.some((st) => st.id == id)) {
      this.students.find((st) => st.id == id).check = 'y';
      const stName = this.students.find((st) => st.id == id).name;
      if (stName == undefined) {
        console.log(`エラー: ${color.red}Test.setResultCheck${color.reset}`);
        console.log('名前が見つかりませんでした。');
        return;
      }
      console.log(`${color.green}${stName}:試験結果を確認しました${color.reset}`);
      return;
    } else {
      console.log(`エラー: ${color.red}Test.setResultCheck${color.reset}`);
      console.log(`ログインID:${id}`);
      console.log('確認記録に失敗しました。');
      return;
    }
  }

  // 試験終了後に確認されている生徒の情報を送信
  getResultCheck(students) {
    let arr = [];
    try {
      for (const key in students) {
        arr.push({
          id: students[key].id,
          name: students[key].name,
          exp: students[key].exp,
          check: this.students[key].check
        });
      }
    } catch (error) {
      console.log(`エラー: ${color.red}Test.getResultCheck${color.reset}`);
      console.log('引数のstudentsオブジェクトからプロパティが見つかりませんでした。');
      return;
    }
    return arr;
  }

  // 正答率計算
  getAllAnswerRate() {
    let reQue = [];
    try {
      for (const que of this.ques) {
        reQue.push({
          que_id: que.que_id,
          answer_id: que.answer_id,
          totalAnsCount: 0,
          ansCount: 0,
          rate: 0,
          comment: que.comment
        });
      }
    } catch (error) {
      console.log(`エラー: ${color.red}Test.getAllAnswerRate${color.reset}`);
      console.log('Test.quesからプロパティが見つかりませんでした。');
      return;
    }

    try {
      for (const st of this.students) {
        for (const key in st.progress) {
          reQue[key].totalAnsCount++;
          if (reQue[key].answer_id == st.progress[key].answer_id) {
            reQue[key].ansCount++;
          }
        }
      }
      for (const key in reQue) {
        reQue[key].rate = Math.ceil(reQue[key].ansCount / reQue[key].totalAnsCount * 100);
        delete reQue[key].totalAnsCount;
        delete reQue[key].ansCount;
      }
    } catch (error) {
      console.log(`エラー: ${color.red}Test.getAllAnswerRate${color.reset}`);
    }

    return reQue;
  }

  // 正答率計算(1問のみ)
  getAnswerRate(que_id) {
    let queKey;
    try {
      for (const key in this.ques) {
        if (this.ques[key].que_id == que_id) {
          queKey = key;
          break;
        }
      }
    } catch (error) {
      console.log(`エラー: ${color.red}Test.getAnswerRate${color.reset}`);
      console.log('Test.quesからオブジェクトを取得できませんでした。');
      return;
    }

    let que = {
      answer_id: this.ques[queKey].answer_id,
      totalAnsCount: 0,
      ansCount: 0
    }

    try {
      for (const st of this.students) {
        if (typeof st.progress[queKey] != 'undefined') {
          que.totalAnsCount++;
          if (que.answer_id == st.progress[queKey].answer_id) {
            que.ansCount++;
          }
        }
      }
    } catch (error) {
      console.log(`エラー: ${color.red}Test.getAnswerRate${color.reset}`);
      console.log('Test.studentsからオブジェクトを取得できない可能性があります。');
      return;
    }

    return Math.ceil(que.ansCount / que.totalAnsCount * 100);
  }

  // test_start時に送信する問題情報
  getQuesNoAns() {
    let noAns = [];
    try {
      for (const que of this.ques) {
        noAns.push({
          que_id: que.que_id,
          focus: que.focus,
          question: que.question,
          choices: que.choices,
          subject_id: que.subject_id
        });
      }
    } catch (error) {
      console.log(`エラー: ${color.red}Test.getQuesNoAns${color.reset}`);
      console.log('Test.quesからオブジェクトを取得できない可能性があります。');
      return;
    }

    return noAns;
  }

  // 試験前に問題を追加
  // que_idを渡すとtest.quesに問題を追加する
  async addQuestion(queId) {
    let sql = "SELECT * FROM question WHERE que_id = " + queId;
    let results;
    let que;
    try {
      results = await DB2.awaitQuery(sql);
      que = results[0];
    } catch (error) {
      console.log(`エラー: ${color.red}Test.addQuestion${color.reset}`);
      console.log('DBに接続できない可能性があります。');
      return;
    }

    que.choices = [];

    sql = "SELECT * FROM answer WHERE que_id = " + queId;
    let reChoices;
    try {
      reChoices = await DB2.awaitQuery(sql);
    } catch (error) {
      console.log(`エラー: ${color.red}Test.addQuestion${color.reset}`);
      console.log('DBに接続できない可能性があります。');
      return;
    }

    for (const el of reChoices) {
      que.choices.push({
        id: el.choices_id,
        answer: el.choice
      });
    }
    this.ques.push(que);
  }

  // 科目IDから問題を取得
  async getQuestion(subjectId) {
    let sql = "SELECT * FROM question WHERE subject_id = " + subjectId;
    let questions;
    try {
      questions = await DB2.awaitQuery(sql);
    } catch (error) {
      console.log(`エラー: ${color.red}Test.getQuestion${color.reset}`);
      console.log('DBに接続できない可能性があります。');
      return;
    }

    let answer = [];
    for (const key in questions) {
      sql = "SELECT * FROM answer where que_id = " + questions[key].que_id;
      try {
        answer = await DB2.awaitQuery(sql);
      } catch (error) {
        console.log(`エラー: ${color.red}Test.getQuestion${color.reset}`);
        console.log('DBに接続できない可能性があります。');
        return;
      }

      for (const ansKey in answer) {
        delete answer[ansKey].que_id;
      }
      questions[key].choices = answer;
    }
    return questions;
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

const app = express();
const server = http.Server(app);
const CLIENT_ROOT = __dirname + '/client';
const PORT = 80;
const ADMINID = 'ohs05016';
let guestEntryMode = 'off';

const DB = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'quest_meeting',
  multipleStatements: true //★複数クエリの実行を許可する
});

const DB2 = awaitMysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'quest_meeting'
});

let user = new User();
let test = new Test();

server.listen(PORT);
console.log('http://localhost:' + PORT);
// メソッドチェーンでルーティング記述
app
  .set("view engine", "ejs")
  .use(bodyParser.urlencoded({ extended: true }))
  .use(UA.express())
  .get('/login', (req, res) => {
    const rendObj = { loginId: '', password: '', alert: '' };
    res.render(CLIENT_ROOT + "/toppage.ejs", rendObj);
  })
  .get('/', (req, res) => {
    // スマホアクセス対策
    if (!req.useragent.isDesktop) {
      console.log(`${color.red}スマホアクセスがありました${color.reset}`);
      res.status(400).send('<h1><font color="red">スマホではアクセスできません。</font><h1>');
      return;
    }

    // ゲストエントリー不可能
    if (guestEntryMode == 'off') {
      const rendObj = { loginId: '', password: '', alert: '' };
      res.render(CLIENT_ROOT + "/toppage.ejs", rendObj);
      return;
    }

    (async () => {
      // 時刻とIPアドレスを取得
      let time;
      let ip;
      try {
        time = microtime.now();
        ip = req.ip;
      } catch (error) {
        console.log(`${color.red}時刻とIPアドレスの取得に失敗しました。${color.reset}`);
        return;
      }

      // 時刻とIPアドレスのハッシュ化
      let tempId;
      let tempPw;
      let tempPwHash;
      try {
        // ハッシュ化
        const hash = crypto.createHash('sha256').update(time + ip).digest('hex');
        // 頭6桁をID,その後6桁をパスワードとする
        tempId = hash.substring(0, 6);
        tempPw = hash.substring(6, 12);
        tempPwHash = crypto.createHash('sha256').update(tempPw).digest('hex');
      } catch (error) {
        console.log(`${color.red}時刻とIPアドレスのハッシュ化に失敗しました。${color.reset}`);
        return;
      }

      // ゲストアカウント数取得
      let guestCount;
      try {
        guestCount = await DB2.awaitQuery("select count(*) as count from user where name like 'ゲスト%'");
        guestCount = guestCount[0].count;
      } catch (error) {
        console.log(`${color.red}ゲストアカウント数の取得に失敗しました。${color.reset}`);
        return;
      }

      // DB登録実行
      try {
        await DB2.awaitQuery(`INSERT INTO User (name, login, password, exp) VALUES ('ゲスト${guestCount + 1}', '${tempId}', '${tempPwHash}', 10)`);
        console.log(`${color.blue}登録: ${color.reset}${tempId}`);
      } catch (error) {
        console.log(`${color.red}DB登録に失敗しました。${color.reset}`);
        return;
      }

      // レンダリング
      try {
        const rendObj = { loginId: tempId, password: tempPw };
        res.render(CLIENT_ROOT + '/entry.ejs', rendObj);
      } catch (error) {
        console.log(`${color.red}entryのレンダリングに失敗しました。${color.reset}`);
      }
      return;
    })();
  })
  .post('/', login)
  .post('/login', (req, res) => {
    let rendObj = { loginId: '', password: '', alert: '' };

    if (req.body.loginId != undefined && req.body.password != undefined) {
      // エントリー画面からの遷移
      rendObj.loginId = req.body.loginId;
      rendObj.password = req.body.password;
    } else if (req.body.loginId != undefined && req.body.password == undefined) {
      // キックなどの処理
      rendObj.loginId = req.body.loginId;
      try {
        if (user.kickListLoginIds.some((stId) => stId == rendObj.loginId)) {
          user.kickListLoginIds = user.kickListLoginIds.filter(stId => (stId == rendObj.loginId) == null);
          rendObj.alert = 'あなたは不適切な行為を行った為、管理者によりキックされました。';
        } else if (user.blackListLoginIds.some((stId) => stId == rendObj.loginId)) {
          rendObj.alert = 'このアカウントでは現在ログインできません。';
        }
      } catch (error) {
        console.log(`エラー: ${color.red}post[/login]${color.reset}`);
      }
    }
    // アカウント情報を保持したままトップページへ遷移
    res.render(CLIENT_ROOT + "/toppage.ejs", rendObj);
  })
  .use(express.static('client'));

// socket通信
const socketio = require('socket.io');
const { append } = require('express/lib/response');
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

  // 管理者類
  socket.on('adminConnect', (data) => {
    user.adminSocketId = socket.id;
    const userList = {
      teachers: user.teachers,
      students: user.students
    };
    try {
      socket.emit('adminConnect', { userList: userList });
    } catch (error) {
      console.log('管理者送信失敗');
    }
  });

  // キック
  socket.on('stkick', (data) => {
    try {
      const stSocketId = user.getUser(data.stId).socketId;
      user.kickListLoginIds.push(data.stId);
      socket.to(stSocketId).emit('returnTop', '');
      console.log(`${color.yellow}${user.getUser(data.stId).name}さんをキックしました${color.reset}`);
    } catch (error) {
      console.log('キック失敗');
    }
  });

  // ブラックリスト
  socket.on('stblackList', (data) => {
    try {
      const stSocketId = user.getUser(data.stId).socketId;
      socket.to(stSocketId).emit('returnTop', '');
      user.blackListLoginIds.push(data.stId);
      console.log(`${color.yellow}${user.getUser(data.stId).name}さんをブラックリストに追加しました${color.reset}`);
    } catch (error) {
      console.log('キック・ブラックリスト追加失敗');
    }
  });

  // ゲストエントリーモード
  socket.on('guestEntry', (data) => {
    guestEntryMode = data.mode;
  });

  socket.on("subject", (subject_id) => {
    (async () => {
      obj = await test.getQuestion(subject_id);
      socket.emit('question', obj);
    })();
  });

  // 試験開始前人数確認イベント
  socket.on('studentsExist', (data) => {
    try {
      socket.emit('studentsCount', { count: user.students.length });
    } catch (error) {
      console.log(`${color.red}on('studentsExist')で教師にstudentsCountイベントが送信できませんでした${color.reset}`);
    }
  });

  // ちょっと待ったボタン
  socket.on('wait', (data) => {
    if (!user.checkRegularRoot(socket.id)) {
      return;
    }
    try {
      socket.to(user.getAdminSocketId()).emit('wait', { name: user.getUserBySocketId(socket.id).name });
    } catch (error) {
      console.log(`${color.red}on('wait')で管理者にwaitイベントが送信できませんでした${color.reset}`);
    }
    // ちょっと待ったの処理
    if (user.teachers.length != 0) {
      try {
        socket.to(user.getMasterTeacher().socketId).emit('wait', { name: user.getUserBySocketId(socket.id).name });
      } catch (error) {
        console.log(`${color.red}教員宛のwaitのソケット通信に失敗しました${color.reset}`);
        console.log('おそらく教員のログイン情報がありません。');
        return;
      }
    }
    try {
      console.log(`${color.yellow}${user.getUserBySocketId(socket.id).name}さんから待ったがかかりました${color.reset}`);
    } catch (error) {
      console.log(`${color.red}on('wait')のソケットIDから生徒情報が見つかりませんでした。${color.reset}`);
      return;
    }
  });

  // 生徒が回答を終了
  socket.on('test_finish', (data) => {
    if (!user.checkRegularRoot(socket.id)) {
      return;
    }
    // [{que_id:1, rate:70, answer_id:2}, {que_id:2, rate:50, answer_id:5}]形式で正答率などを返す
    try {
      socket.emit('test_finish', test.getAllAnswerRate());
    } catch (error) {
      console.log(`${color.red}test_finishイベントが送信できませんでした。${color.reset}`);
      console.log('おそらくTest.getAllAnswerRateにバグがあります。');
      return;
    }

    test.finishStudentsCount++;
    if (test.finishStudentsCount == user.students.length) {
      // 試験終了処理
      test.time = 0;
      test.isTest = 2;
      try {
        socket.to(user.getMasterTeacher().socketId).emit('test_timer', 0);
      } catch (error) {
        console.log(`${color.red}教員へのソケット通信に失敗しました${color.reset}`);
        console.log('おそらく教員のログイン情報がありません。');
        return;
      }
    }
  });

  // 解説開始
  socket.on('commentary_start', (data) => {
    let sendObj;
    try {
      sendObj = {
        que_id: data.que_id,
        answer: test.ques[data.que_id].answer,
        comment: test.ques[data.que_id].comment
      };
    } catch (error) {
      console.log('commentary_startでエラーが発生しました。');
    }

    // 生徒に送信
    for (const st of user.students) {
      try {
        socket.to(st.socketId).emit('commentary_start', sendObj);
      } catch (error) {
        console.log(`${color.red}生徒宛のcommentary_startのソケット通信に失敗しました${color.reset}`);
        return;
      }
    }
  });

  socket.on('commentary_close', (data) => {
    // 生徒に送信
    for (const st of user.students) {
      try {
        socket.to(st.socketId).emit('commentary_close', '');
      } catch (error) {
        console.log(`${color.red}生徒宛のcommentary_closeのソケット通信に失敗しました${color.reset}`);
        return;
      }
    }
  });

  // 小川くん依頼
  socket.on('test_commentary', (data) => {
    // 教師に送信
    try {
      socket.emit('test_commentary', test.getAllAnswerRate());
    } catch (error) {
      console.log(`${color.red}教員宛のcommentary_startのソケット通信に失敗しました${color.reset}`);
      return;
    }
  });

  // 回答選択処理
  socket.on('test_progress', (data) => {
    if (!user.checkRegularRoot(socket.id)) {
      return;
    }
    let loginId;
    try {
      loginId = user.getUserBySocketId(socket.id).id;
    } catch (error) {
      console.log(`${color.red}on('test_progress')でUser.getUserBySocketIdに失敗しました。${color.reset}`);
      return;
    }
    // progress更新
    try {
      test.addProgress(loginId, data);
    } catch (error) {
      console.log(`${color.red}on('test_progress')でTest.addProgressに失敗しました。${color.reset}`);
      return;
    }
    // 教員に進捗を送信
    try {
      socket.to(user.getMasterTeacher().socketId).emit('test_progress', { id: loginId, que_id: data.que_id, answer_id: data.answer_id });
    } catch (error) {
      console.log(`${color.red}教員宛のtest_progressのソケット通信に失敗しました${color.reset}`);
      console.log('おそらく教員のログイン情報がありません。');
      return;
    }
    // 生徒に更新をかける {que_id:1, rate:40}形式
    for (const st of user.students) {
      try {
        socket.to(st.socketId).emit('test_rateUpdate', { que_id: data.que_id, rate: test.getAnswerRate(data.que_id) });
      } catch (error) {
        console.log(`${color.red}生徒宛のtest_progressのソケット通信に失敗しました${color.reset}`);
        return;
      }
    }
  });

  // 試験結果確認ボタン押下時
  socket.on('test_confirm', (data) => {
    if (!user.checkRegularRoot(socket.id)) {
      return;
    }
    let loginId;
    try {
      loginId = user.getUserBySocketId(socket.id).id;
    } catch (error) {
      console.log(`${color.red}on('test_confirm')でUser.getUserBySocketIdに失敗しました。${color.reset}`);
      return;
    }

    try {
      test.setResultCheck(loginId);
    } catch (error) {
      console.log(`${color.red}on('test_confirm')でTest.setResultCheckに失敗しました。${color.reset}`);
      return;
    }
    // 随時更新の場合
    if (test.time <= 0) {
      try {
        socket.to(user.getMasterTeacher().socketId).emit('test_confirm', { id: loginId });
      } catch (error) {
        console.log(`${color.red}on('test_confirm')で教員宛のtest_confirmのソケット通信に失敗しました。${color.reset}`);
        console.log('おそらく教員のログイン情報がありません。');
      }
    }
  });

  // 試験終了画面
  socket.on('test_complete', (data) => {
    // 生徒全員にテスト終了を通知
    for (const st of user.students) {
      try {
        socket.to(st.socketId).emit('test_complete', '');
      } catch (error) {
        console.log(`${color.red}on('test_complete')で生徒宛のtest_completeのソケット通信に失敗しました。${color.reset}`);
      }
    }
  });

  // 試験中断・一時停止処理
  socket.on('test_stop', (data) => {
    if (data == 0 && test.isTest == 1) {
      test.time = 0;
      test.isTest = 2;
      // 中断
      // 生徒に中断情報を送信
      for (const st of user.students) {
        try {
          socket.to(st.socketId).emit('test_timer', 0);
        } catch (error) {
          console.log(`${color.red}on('test_stop')で生徒宛のtest_timerのソケット通信に失敗しました。${color.reset}`);
        }
      }
      // 教員に時間切れを送信
      try {
        socket.emit('test_timer', 0);
      } catch (error) {
        console.log(`${color.red}on('test_stop')で教員宛のtest_timerのソケット通信に失敗しました。${color.reset}`);
      }
      console.log(`${color.yellow}試験が中断されました${color.reset}`);
    } else if (data == 1 && test.isTest == 1) {
      // 一時停止
      test.timerStop();
      console.log(`${color.yellow}試験が一時停止されました${color.reset}`);
    }
  });

  // 試験再開処理
  socket.on('test_restart', (data) => {
    if (test.isTest == 1) {
      // タイマー再開
      test.timeCount();
      console.log(`${color.cyan}試験が再開されました${color.reset}`);
    }
  });


  // 先生が試験開始ボタンを押した時の処理
  socket.on('test_start', (ques) => {
    (async () => {
      test = new Test();
      // testオブジェクトに問題を設定
      for (const queId of ques) {
        await test.addQuestion(queId);
      }
      // 生徒をtest.studentsに登録
      test.setStudent(user.students);
      try {
        // 教師に生徒一覧送信
        socket.emit('test_start', { time: test.time, students: test.students, question: test.ques });
      } catch (error) {
        console.log(`${color.red}on('test_start')で教員宛のtest_startのソケット通信に失敗しました。${color.reset}`);
      }
      // 生徒に問題情報を送信
      for (const st of user.students) {
        try {
          await socket.to(st.socketId).emit('test_start', { time: test.time, ques: test.getQuesNoAns() });
        } catch (error) {
          console.log(`${color.red}on('test_start')で生徒宛のtest_startのソケット通信に失敗しました。${color.reset}`);
        }
      }

      // タイマーカウント開始
      test.timeCount();
      console.log(`${color.cyan}試験が開始されました${color.reset}`);
    })();
  });
});

// toppageのログイン処理
function login(req, res) {
  let form = req.body;
  const rendObj = { loginId: '', password: '', alert: '' };

  // 非常時用
  if (form.id == undefined || form.password == undefined) {
    console.log(`${color.red}login関数でform情報を受信できていません${color.reset}`);
    return;
  }

  if (form.id == '' || form.password == '' || (test.isTest == 1 && form.id != ADMINID) || user.blackListLoginIds.some((stId) => stId == form.id)) {
    try {
      if (user.blackListLoginIds.some((stId) => stId == form.id)) {
        rendObj.alert = 'このアカウントでは現在ログインできません。';
      } else {
        rendObj.alert = 'ログインID又はパスワードが違います。';
      }

      // レンダリング
      res.render(CLIENT_ROOT + "/toppage.ejs", rendObj);
    } catch (error) {
      console.log(`${color.red}login関数でtoppageのレンダリングに失敗しました。${color.reset}`);
    }

  } else {
    // ログイン許容状態
    let sql;
    if (isNaN(form.id)) {
      sql = "SELECT * FROM User WHERE login = '" + form.id + "'";
    } else {
      sql = "SELECT * FROM User WHERE login = " + form.id;
    }
    DB.query(sql, (err, results) => {
      // パスワード認証
      if (!err && results[0] && !user.getUser(form.id) && results[0].password == crypto.createHash('sha256').update(form.password).digest('hex')) {
        // 教員生徒 分別画面遷移
        const loginId = form.id;
        const account = results[0];

        // 管理者ログイン
        if (account.name == ADMINID) {
          res.render(CLIENT_ROOT + '/back.ejs');
          console.log(`${color.magenta}管理者ログイン${color.reset}`);
          return;
        }

        // 教員ログイン
        if (account.exp == -1) {
          user.addTeacher({ id: loginId, name: account.name });
          DB.query('select * from subject;', function (err, results, fields) {
            if (err) {
              throw err;
            }
            let categorys;
            try {
              categorys = results;
              res.render(CLIENT_ROOT + '/t_master.ejs', { categorys: categorys, loginId: loginId });
            } catch (error) {
              console.log(`${color.red}login関数でt_masterのレンダリング又はカテゴリの取得に失敗しました。${color.reset}`);
            }
          });

        } else {
          // 生徒ログイン
          const userName = account.name;
          const lv = Math.floor(account.exp / 10);
          user.addStudent({ id: loginId, name: userName, exp: account.exp });
          try {
            const rendObj = { loginId: loginId, userName: userName, lv: lv };
            res.render(CLIENT_ROOT + "/s_master.ejs", rendObj);
          } catch (error) {
            console.log(`${color.red}login関数でs_masterのレンダリングに失敗しました。${color.reset}`);
          }
        }

      } else {
        // パスワード認証失敗
        console.log(`${color.red}ログイン失敗${color.reset}`);
        try {
          rendObj.alert = 'ログインID又はパスワードが違います。';
          res.render(CLIENT_ROOT + "/toppage.ejs", rendObj);
        } catch (error) {
          console.log(`${color.red}login関数でtoppageのレンダリングに失敗しました。${color.reset}`);
        }
      }
    });
  }
}