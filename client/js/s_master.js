// 処理を記述するためにモーダル作ってみましたが、書き方が間違ってたらごめんなさい
// 処理はまだ付けてません
$(function () {
    let socket = io.connect();
    socket.emit('send_id', loginId);
    /*   $('#modal1').hide();
      $('#modal2').hide();
    
      $('#btn3').on('click',function(){
        $('#modal1').fadeIn();
      });
      $('#btn4').on('click',function(){
          $('#modal1').fadeOut().hide();
          $('#modal2').fadeIn();
      });
      $('#confirm').on('click',function(){
        $('#modal2').fadeOut().hide();
      }); */

    const number_circle = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"];
    question = [
        {
            que_id: 1,
            question: "dogの意味は？",
            choices: [{ id: 1, answer: "犬" }, { id: 2, answer: "猫" }, { id: 3, answer: "猿" }, { id: 4, answer: "鳥" }]
        },
        {
            que_id: 3,
            question: "runの意味は？",
            choices: [{ id: 9, answer: "走る" }, { id: 10, answer: "眠る" }, { id: 11, answer: "話す" }, { id: 12, answer: "飛ぶ" }]
        },
        {
            que_id: 5,
            question: "todayの意味は？",
            choices: [{ id: 17, answer: "明日" }, { id: 18, answer: "今日" }, { id: 19, answer: "今年" }, { id: 20, answer: "来年" }]
        },
        {
            que_id: 10,
            question: "deleteの意味は？",
            choices: [{ id: 17, answer: "犬" }, { id: 18, answer: "猫" }, { id: 19, answer: "猿" }, { id: 20, answer: "鳥" }]
        },
        {
            que_id: 11,
            question: "princeは女性を表す単語である",
            choices: [{ id: 21, answer: "〇" }, { id: 22, answer: "✕" }]
        },
        {
            que_id: 12,
            question: "becomeは(　　　)だけ綴りが異なる",
            choices: [{ id: 23, answer: "原型" }, { id: 24, answer: "過去形" }, { id: 25, answer: "過去分詞形" }]
        },
        {
            que_id: 13,
            question: "My father is (　　　)(　　　)(　　　) yours.（私の父はあなたのお父さんと同じくらいの年齢です）",
            choices: [{ id: 26, answer: "as old as" }, { id: 27, answer: "older than" }, { id: 28, answer: "oldest in" }, { id: 28, answer: "old by" }]
        }
    ];


    render_quiz_form(question);

    function render_quiz_form(question_obj) {
        //①問題番号部分の書き出し
        //１問目はclassに「selected」を付ける
        for (let i = 0; i < question_obj.length; i++) {
            $('#question_list').append(`<p class="question_num">${i + 1}</p>`);
        }
        render_quiz(1,question_obj)
    }

    function render_quiz(n,question_obj){
        //①選択番号を変更
        let selected = document.getElementsByClassName("selected");
        if(!selected.length == 0){
            $('.selected').eq(0).removeClass('selected');
        }
        $('.question_num').eq(n - 1).addClass('selected');
        //②n問目を表示
        $("#question_sentence > h2").hide().text("Q" + n).fadeIn(500);
        setTimeout(() => {
            $("#question_content").hide().text(question_obj[n - 1].question).fadeIn(500);
            //③選択肢をレンダリング
            $("select_answer").html("");
            setTimeout(() => {
                for (let i = 0; i < question_obj[n - 1].choices.length; i++) {
                    let add_item1 =`<input type="radio" id="${"s_" + i}" name="${"select1"}" value="${question_obj[n - 1].choices[i].id}">`
                    let add_item2 =`<label for="${"s_" + i}">${number_circle[i]}&nbsp;${question_obj[n - 1].choices[i].answer}</label>`
                    $(add_item1).appendTo("#select_answer").hide().fadeIn(500).css({"display":"none"});
                    $(add_item2).appendTo("#select_answer").hide().fadeIn(500);
                }
            }, 500);
        }, 500);
    }
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
/* const confirm = document.getElementById('confirm');
confirm.addEventListener('click', () => {
  socket.emit('confirm_btn', ''); // 第２引数を生徒の番号の値に変更する必要なし
}, false); */