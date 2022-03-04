$(function () {
    let socket = io.connect();
    console.log(socket);

    socket.emit('send_id', loginId);
    $('#modal5').fadeOut(500).hide();
    $('#modal6').fadeOut(500).hide();
    $('#modal7').fadeOut(500).hide();

    $('#btn1').click(function () {
        socket.emit("subject", $('select[name="subject"]').val());
    });

    let question_list = [];

    socket.on('question', function (question) {
        question_list = question;
        $('#modal1').fadeOut(500).hide();
        $('#modal2').fadeIn(500);
        console.log(question_list.length);
        console.log(question_list.length == 0);
        $("#checkbox_area").html("");
        if(question_list.length == 0){
            $("#checkbox_area").html("<p>該当データが登録されていません</p>");
        }
        for (let i in question) {
            $("#checkbox_area").append(`
                <tr>
                    <td>
                        <input class="checkbox" type="checkbox" id="${question[i].id}" name="question" value="${i}">
                        <label for="${question[i].id}">${question[i].focus}</label>
                    </td>
                    <td class="out">
                        <div class="view_question">問題を見る</div>
                    </td>
                </tr>
            `);
        }
        console.log(question_list);
    });

    $('body').on('click', '.view_question', function () {
        let index = $('.view_question').index(this);
        $('#question_info').html(`
        <table>
        <tr>
          <th>問題ID</th>
          <td>${question_list[index].id}</td>
        </tr>
        <tr>
          <th>テーマ</th>
          <td>${question_list[index].focus}</td>
        </tr>
        <tr>
          <th>問題内容</th>
          <td>${question_list[index].question}</td>
        </tr>
        </table>
        `);
        $('#modal2').fadeOut(500).hide();
        $('#modal3').fadeIn(500);
    });

    $('#btn3').click(function () {
        $('#modal3').fadeOut(500).hide();
        $('#modal2').fadeIn(500);
    });

    const selected_questions = [];

    $('#btn2').click(function () {
        // 配列の要素を空にする
        selected_questions.length = 0;
        let work;
        $('input[name="question"]:checked').each(function () {
            work = {index : $(this).val(), id : question_list[$(this).val()].id};
            selected_questions.push(work);
        });
        console.log(selected_questions);
        $("#question_confirm").html('');
        if(selected_questions.length == 0){
            $("#question_confirm").html("<p>問題が選択されていません</p>");
        }
        for(let i in selected_questions){
            $("#question_confirm").append(`
                <tr>
                    <th>第${i}問</th>
                    <td>${question_list[selected_questions[i].index].focus}</td>
                </tr>
            `);
        }
        $('#modal2').fadeOut(500).hide();
        $('#modal4').fadeIn(500);
    });

    $('#btn4').click(function(){
        const send_data = [];
        for(let i in selected_questions){
            send_data.push(selected_questions[i].id);
        }
        socket.emit("test_start", send_data);
        $('#modal4').fadeOut(500).hide();
        $('#modal5').fadeIn(500);
        
        socket.on('test_start', (data) => {
            console.log(data);
        });
            


        // ここに表示される処理




    });

    $('#btn5').click(function(){
        $('#modal4').fadeOut(500).hide();
        $('#modal2').fadeIn(500);
    });

    $('#btn6').click(function(){
        $('#modal2').fadeOut(500).hide();
        $('#modal1').fadeIn(500);
    });


    // 一時停止の処理をここに書く
    $('#btn7').click(function(){
        // 一時停止の時の処理
        // socket.emit("test_start", send_data);
    });
    // 中断の処理をここに書く
    $('#btn8').click(function(){
        // タイマーが切れたことをサーバー側に知らせる処
        socket.emit("test_stop", 0);
        $('#modal5').fadeOut(500).hide();
        $('#modal6').fadeIn(500);
        
    });





});

/*

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

*/
