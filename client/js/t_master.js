$(function () {
    let socket = io.connect();
    console.log(socket);

    //socket.emit('send_id', loginId);

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
    });

    $('#btn5').click(function(){
        $('#modal4').fadeOut(500).hide();
        $('#modal2').fadeIn(500);
    });

    $('#btn6').click(function(){
        $('#modal2').fadeOut(500).hide();
        $('#modal1').fadeIn(500);
    });
});
