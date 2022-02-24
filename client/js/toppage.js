// メッセージ表示関数
function appMsg(text) {
  const view = document.getElementById('ejsView');

  let newNode = document.createElement('div');
  newNode.innerText = text;
  view.appendChild(newNode);
}