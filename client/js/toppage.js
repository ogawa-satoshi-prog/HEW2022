let socket = io.connect();
console.log(socket);

// サーバーで指定されたイベントをトリガーとして扱う
socket.on('server_to_client', (data) => {
  appMsg("受信:" + data.text);
});

// メッセージ表示関数
function appMsg(text) {
  const view = document.getElementById('ejsView');

  let newNode = document.createElement('div');
  newNode.innerText = text;
  view.appendChild(newNode);
}

const btn1 = document.getElementById('btn1');
btn1.addEventListener('click', () => {
  socket.emit('client_to_server', { text: 'world' });
}, false);

const btn2 = document.getElementById('btn2');
btn2.addEventListener('click', () => {
  socket.emit('stop', 'ちょっと待った!!');
}, false);

// --------------------------------以下、小川が追加した３種類---------------------------------------

const btn3 = document.getElementById('btn3');
btn3.addEventListener('click', () => {
  socket.emit('next', '5'); // 第２引数を選択された科目番号の値に変更する必要あり
}, false);

socket.on('resQuestion', (data) => {
  for (let i = 0; i < data.question.length; i++) {
    appMsg(data.question[i].question);
  }
});

const btn4 = document.getElementById('btn4');
btn4.addEventListener('click', () => {
  socket.emit('detail', '46'); // 第２引数を選択された問題番号の値に変更する必要あり
}, false);

socket.on('resQuestionDetail', (data) => {
  appMsg("[" + data.question[0].que_id + "]" + data.question[0].question);
});

const btn5 = document.getElementById('btn5');
btn5.addEventListener('click', () => {
  socket.emit('commentary', '46'); // 第２引数を選択された問題番号の値に変更する必要あり
}, false);

socket.on('resQuestionCommentary', (data) => {
  appMsg("[" + data.question[0].que_id + "]" + data.question[0].question);
});

// 画面22番「確認するボタン」
const btn6 = document.getElementById('btn6');
btn6.addEventListener('click', () => {
  socket.emit('confirm_btn', '2'); // 第２引数を生徒の番号の値に変更する必要あり
}, false);