let socket = io.connect();


/*
// カンプにはないけど、生徒側にも「解説ボタン」は付けるのかな？
const btn5 = document.getElementById('btn5');
btn5.addEventListener('click', () => {
  socket.emit('commentary', '46'); // 第２引数を選択された問題番号の値に変更する必要あり
}, false);

// socket.on('resQuestionCommentary', (data) => {
//   appMsg("[" + data.question[0].que_id + "]" + data.question[0].question);
// });

// 試験結果確認画面の「問題を見るボタン」
const btn4 = document.getElementById('btn4');
btn4.addEventListener('click', () => {
  socket.emit('detail', '46'); // 第２引数を選択された問題番号の値に変更する必要あり
}, false);

// socket.on('resQuestionDetail', (data) => {
//   appMsg("[" + data.question[0].que_id + "]" + data.question[0].question);
// });

// トップ画面の「ちょっと待ったボタン」
const btn2 = document.getElementById('btn2');
btn2.addEventListener('click', () => {
  socket.emit('wait', '');
}, false);
*/
// 画面22番「確認するボタン」
const btn6 = document.getElementById('btn6');
btn6.addEventListener('click', () => {
  socket.emit('confirm_btn', ''); // 第２引数を生徒の番号の値に変更する必要なし
}, false);