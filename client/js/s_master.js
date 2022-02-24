let socket = io.connect();
console.log(socket);

// 「ちょっと待ったボタン」
const btn2 = document.getElementById('btn2');
btn2.addEventListener('click', () => {
  socket.emit('wait', '');
}, false);

// 画面22番「確認するボタン」
const btn6 = document.getElementById('btn6');
btn6.addEventListener('click', () => {
  socket.emit('confirm_btn', ''); // 第２引数を生徒の番号の値に変更する必要なし
}, false);

