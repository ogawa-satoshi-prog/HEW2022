let socket = io.connect();
console.log(socket);

// 試験終了画面２の「解説ボタン」
const btn5 = document.getElementById('btn5');
btn5.addEventListener('click', () => {
  socket.emit('commentary', '46'); // 第２引数を選択された問題番号の値に変更する必要あり
}, false);

// socket.on('resQuestionCommentary', (data) => {
//   appMsg("[" + data.question[0].que_id + "]" + data.question[0].question);
// });

// 問題選択画面の「問題を見るボタン」
const btn4 = document.getElementById('btn4');
btn4.addEventListener('click', () => {
  socket.emit('detail', '46'); // 第２引数を選択された問題番号の値に変更する必要あり
}, false);

// socket.on('resQuestionDetail', (data) => {
//   appMsg("[" + data.question[0].que_id + "]" + data.question[0].question);
// });

// 教科選択画面の「次へボタン」
const btn3 = document.getElementById('btn3');
btn3.addEventListener('click', () => {
  socket.emit('subject_code', '5'); // 第２引数を選択された科目番号の値に変更する必要あり
}, false);

// socket.on('resQuestion', (data) => {
//   for (let i = 0; i < data.question.length; i++) {
//     appMsg(data.question[i].question);
//   }
// });

// 問題選択画面の「次へボタン」
const btn9 = document.getElementById('btn9');
btn9.addEventListener('click', () => {
  socket.emit('question_code', [1,2,,5,8,9,11,12,15]); // 第２引数を選択された科目番号の値に変更する必要あり
}, false);

// 先生側TOP画面「試験開始ボタン」
const btn8 = document.getElementById('btn8');
btn.addEventListener('click', () => {
  socket.emit('start', '');
}, false);

// 以下、stopは第二引数をもとに判断してください
// 試験中画面「「中断ボタン」
const btn6 = document.getElementById('btn6');
btn6.addEventListener('click', () => {
  socket.emit('stop', 0);
}, false);
// 試験中画面「一時停止ボタン」
const btn7 = document.getElementById('btn7');
btn.addEventListener('click', () => {
  socket.emit('stop', 1);
}, false);