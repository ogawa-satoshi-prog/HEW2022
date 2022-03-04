// const { on } = require("mysql2/typings/mysql/lib/Connection");

$(function () {
  let socket = io.connect();
  socket.emit('send_id', loginId);

  // ここからが問題の定数
  const number_circle = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"];
  const answer = [{
    que_id: 1,
    rate : 100,
    answer_id: 1
},
{
    que_id: 3,
    rate : 40,
    answer_id: 1
},
{
    que_id: 5,
    rate : 40,
    answer_id: 2
},
{
    que_id: 10,
    rate : 60,
    answer_id: 1
},
{
    que_id: 11,
    rate : 70,
    answer_id: 2
},
{
    que_id: 12,
    rate : 40,
    answer_id: 2
},
{
    que_id: 13,
    rate : 40,
    answer_id:1
  }];

    question = [
        {
            que_id: 1,
            question: "dogの意味は？",
            focus : "アイウエオ",
            choices: [{ id: 1, answer: "犬" }, { id: 2, answer: "猫" }, { id: 3, answer: "猿" }, { id: 4, answer: "鳥" }]
        },
        {
            que_id: 3,
            question: "runの意味は？",
            focus : "アイウエオ",
            choices: [{ id: 9, answer: "走る" }, { id: 10, answer: "眠る" }, { id: 11, answer: "話す" }, { id: 12, answer: "飛ぶ" }]
        },
        {
            que_id: 5,
            question: "todayの意味は？",
            focus : "アイウエオ",
            choices: [{ id: 17, answer: "明日" }, { id: 18, answer: "今日" }, { id: 19, answer: "今年" }, { id: 20, answer: "来年" }]
        },
        {
            que_id: 10,
            question: "deleteの意味は？",
            focus : "アイウエオ",
            choices: [{ id: 17, answer: "犬" }, { id: 18, answer: "猫" }, { id: 19, answer: "猿" }, { id: 20, answer: "鳥" }]
        },
        {
            que_id: 11,
            question: "princeは女性を表す単語である",
            focus : "アイウエオ",
            choices: [{ id: 21, answer: "〇" }, { id: 22, answer: "✕" }]
        },
        {
            que_id: 12,
            question: "becomeは(　　　)だけ綴りが異なる",
            focus : "アイウエオ",
            choices: [{ id: 23, answer: "原型" }, { id: 24, answer: "過去形" }, { id: 25, answer: "過去分詞形" }]
        },
        {
            que_id: 13,
            question: "My father is (　　　)(　　　)(　　　) yours.（私の父はあなたのお父さんと同じくらいの年齢です）",
            focus : "アイウエオ",
            choices: [{ id: 26, answer: "as old as" }, { id: 27, answer: "older than" }, { id: 28, answer: "oldest in" }, { id: 28, answer: "old by" }]
        }
    ];
    progress = [{que_id:1,answer_id:1},{que_id:3,answer_id:1},{que_id:5,answer_id:0},{que_id:10,answer_id:0},{que_id:11,answer_id:1},{que_id:12,answer_id:0},{que_id:13,answer_id:3}];
// ここまでが問題の定数

  $('#modal1').hide();
  $('#modal2').hide();
  $('#modal3').hide();

  $('#btn3').on('click',function(){
    $('#modal1').fadeIn();
  });


  // ここで解答情報の取得の処理を書く
  socket.on('test_finish', (data) => {
      answer = data;
  });
  // rateを変動
  socket.on('test_rateUpdate', (data) => {
      for(let i = 0;i<answer.length;i++){
        if(answer[i].que_id == data.que_id){
          answer[i].rate = data.rate
        }
      };
  });
  // ここまでが解答情報の取得の処理を書く


  $('#btn4').on('click',function(){
      $('#modal1').fadeOut().hide();
      $('#modal2').fadeIn();

      
      for (let i=0;i < question.length;i++) {
        // console.log(progress[i].answer_id);
        console.log(answer[i].answer_id);
        
        if(progress[i].answer_id == answer[i].answer_id){
        $("#result_table").append(`
          <tr>
            <th class="q_number color_brown">${i+1}</th>
        
        
          <td class="q_result color_brown batu"></td>
          
          
          <td class="q_correct color_brown">${number_circle[answer[i].answer_id-1]}</td>
          <td class="q_your_answer color_brown">${number_circle[progress[i].answer_id]}</td>
          <td class="q_rate color_brown">${answer[i].rate}%</td>
          <td class="q_check color_brown"><button class="limegreen_btn">問題を見る</button></td>
          </tr>
          `);
        } else {
          $("#result_table").append(`
          <tr>
          <th class="q_number color_brown">${i+1}</th>
      
      
          <td class="q_result color_brown maru"></td>
          
          <td class="q_correct color_brown">${number_circle[answer[i].answer_id-1]}</td>
          <td class="q_your_answer color_brown">${number_circle[progress[i].answer_id]}</td>
          <td class="q_rate color_brown">${answer[i].rate}%</td>
          <td class="q_check color_brown"><button class="limegreen_btn">問題を見る</button></td>
          </tr>
        `);
        }
        };
  });

  
  $('body').on('click', '.limegreen_btn', function () {
    let index = $('.limegreen_btn').index(this);
    $('#question_info').html(`
    <table>
    <tr>
      <th>問題ID</th>
      <td>${index+1}</td>
    </tr>
    <tr>
      <th>テーマ</th>
      <td>${question[index].focus}</td>
    </tr>
    <tr>
      <th>問題内容</th>
      <td>${question[index].question}</td>
    </tr>
      <tr>
      <th>解答</th>
        <td>${question[index].choices[answer[index].answer_id].answer}</td>
      </tr>
    `);
    $('#modal2').fadeOut(500).hide();
    $('#modal3').fadeIn(500);
  });
  $('#btn5').click(function () {
    $('#modal3').fadeOut(500).hide();
    $('#modal2').fadeIn(500);
  });

  $('#confirm').click(function(){
    $('#modal2').fadeOut(500).hide();
    socket.emit('test_confirm', '');  
  });
});




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
// const confirm = document.getElementById('confirm');
// confirm.addEventListener('click', () => {
//   socket.emit('confirm_btn', ''); // 第２引数を生徒の番号の値に変更する必要なし
// }, false);