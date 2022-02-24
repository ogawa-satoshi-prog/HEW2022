let socket = io.connect();
console.log(socket);


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