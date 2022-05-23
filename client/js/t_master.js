$(function () {
    $('#loginBackSound')[0].play();
    let socket = io.connect();
    socket.emit('send_id', loginId);

    const subject_name = ["英語", "国語", "数学", "理科", "社会"];
    const number_circle = ["A", "B", "C", "D"];

    $("#test_start_btn").click(function () {
        $("#modal1").fadeIn(500).css("display", "flex");
    })

    $('#modal6').hide();
    $('#modal7').hide();
    $('#modal8').hide();
    $('#modal9').hide();

    $('#btn1').click(function () {
        $('#btnClick')[0].play();
        socket.emit("subject", $('select[name="subject"]').val());
    });

    let question_list = [];

    socket.on('question', function (question) {
        $('#modal1').fadeOut(500).hide();
        $('#modal2').fadeIn(500).css("display", "flex");
        question_list = question;
        $("#table2").html("");
        if (question.length == 0) {
            $("#table2").html("<p>該当データが登録されていません</p>");
        }
        for (let i in question) {
            $("#table2").append(`
                <div class="row">
                    <div class="cell_num color_brown">
                        <label class="my_checkbox" for="${question[i].que_id}">
                            <input type="checkbox" id="${question[i].que_id}" name="question" value="${i}">
                            <span class="checkmark"></span>
                            <p class="check_font color_brown">${question[i].focus}</p>
                        </label>
                    </div>
                    <div class="cell_detail"><button class="limegreen_btn view_question_1">問題を見る</button></div>
                </div>
            `);
        }
    });

    //======================================
    //「問題を見る」の処理
    //======================================

    let modal_id;

    $('body').on('click', '.view_question_1', function () {
        modal_id = "#modal2";
        index = $(".view_question_1").index(this);
        display_info(index, question_list);
        $(modal_id).fadeOut(500).hide();
        $('#modal3').fadeIn(500).css("display", "flex");
    });

    $('body').on('click', '.view_question_2', function () {
        modal_id = "#ob_modal";
        index = $(".view_question_2").index(this);
        display_info_2(index, question);
        $(modal_id).fadeOut(500).hide();
        $('#modal3').fadeIn(500).css("display", "flex");
    });

    $('body').on('click', '.view_question_3', function () {
        modal_id = "#modal7";
        index = $(".view_question_3").index(this);
        display_info_2(index, question);
        $(modal_id).fadeOut(500).hide();
        $('#modal3').fadeIn(500).css("display", "flex");
    });

    function display_info(index, question_list) {
        $("#qi_subject").text(subject_name[question_list[index].subject_id - 1]);
        $("#qi_focus").text(question_list[index].focus);
        if (question_list[index].subject_id == 3) {
            $("#qi_question").empty();
            $("#qi_question").append(
                `<img src="./img/ques/${question_list[index].question}.png"></img>`
            );
        } else {
            $("#qi_question").text(question_list[index].question);
        }
        for (let i in question_list[index].choices) {
            $("#qi_select_" + i).text(question_list[index].choices[i].choice);
            if (question_list[index].choices[i].choices_id == question_list[index].answer_id) {
                qi_ans_symbol = number_circle[i];
                qi_ans = question_list[index].choices[i].choice;
            }
        }
        $("#qi_ans_symbol").text(qi_ans_symbol);
        $("#qi_ans").text(qi_ans);
        if (question_list[index].subject_id == 3) {
            $("#question_info_comment").empty();
            $("#question_info_comment").append(
                `<img src="./img/comment/${question_list[index].comment}.png"></img>`
            );
        } else {
            $("#question_info_comment").text(question_list[index].comment);
        }
    }

    function display_info_2(index, question_list) {
        $("#qi_subject").text(subject_name[question_list[index].subject_id - 1]);
        $("#qi_focus").text(question_list[index].focus);
        if (question_list[index].subject_id == 3) {
            $("#qi_question").empty();
            $("#qi_question").append(
                `<img src="./img/ques/${question_list[index].question}.png"></img>`
            );
        } else {
            $("#qi_question").text(question_list[index].question);
        }
        for (let i in question_list[index].choices) {
            $("#qi_select_" + i).text(question_list[index].choices[i].answer);
            if (question_list[index].choices[i].id == question_list[index].answer_id) {
                qi_ans_symbol = number_circle[i];
                qi_ans = question_list[index].choices[i].answer;
            }
        }
        $("#qi_ans_symbol").text(qi_ans_symbol);
        $("#qi_ans").text(qi_ans);
        if (question_list[index].subject_id == 3) {
            $("#question_info_comment").empty();
            $("#question_info_comment").append(
                `<img src="./img/comment/${question_list[index].comment}.png"></img>`
            );
        } else {
            $("#question_info_comment").text(question_list[index].comment);
        }
    }

    $('#question_info_close').click(function () {
        $('#modal3').fadeOut(500).hide();
        $(modal_id).fadeIn(500).css("display", "flex");
    });

    const selected_questions = [];

    $('#btn2').click(function () {
    //     socket.emit('studentsExist', '');
    // });
    
    // socket.on('studentsCount', function (data) {
        $('#btnClick')[0].play();
        // 配列の要素を空にする
        selected_questions.length = 0;
        let work;
        $('input[name="question"]:checked').each(function () {
            work = { index: $(this).val(), id: question_list[$(this).val()].que_id };
            selected_questions.push(work);
        });
        $("#question_confirm").html('');
        if (selected_questions.length == 0) {
            $("#question_confirm").html("<p>問題が選択されていません</p>");
        }
        for (let i = 0; i < selected_questions.length; i++) {
            num = i + 1;
            $("#question_confirm").append(`
                <div class="row">
                <div class="cell_num color_brown">
                第${num}問 ▶▶ ${question_list[selected_questions[i].index].focus}
                </div>
                </div>
                `);
            }
            $('#modal2').fadeOut(500).hide();
            $('#modal4').fadeIn(500).css("display", "flex");
            
            // if(data.count != 0){
            //     // 活性化させる
            //     $('#btn4').prop("disabled",false);
            //     $('#btn4').css("background-color", "#FFDD38");
            //     $('#btn4').css("color", "#46380D");
            // }
        // $('#btn4').prop("disabled",true);
        // $('#btn4').css("background-color", "black");
        // $('#btn4').css("color", "#ffffff");
    });

    // 生徒がいない時に、試験が始められないようにする
    // socket.on('studentsCount', function (data) {
    //     // オブジェクト形式の{count:1}で送られてくる
    //     if(data.count != 0){
    //         // 活性化させる
    //         $('#btn4').prop("disabled",false);
    //         $('#btn4').css("background-color", "#FFDD38");
    //         $('#btn4').css("color", "#46380D");
    //     }
    // });
    // socket.on('studentsExist', function (data) {
    //     // オブジェクト形式の{count:1}で送られてくる
    //     if(data.count != 0){
    //         // 活性化させる
    //         $('#btn4').prop("disabled",false);
    //         $('#btn4').css("background-color", "#FFDD38");
    //         $('#btn4').css("color", "#46380D");
    //     }
    // });

    $('#btn4').click(function () {
        $('#btnClick')[0].play();
        const send_data = [];
        for (let i in selected_questions) {
            send_data.push(selected_questions[i].id);
        }
        socket.emit("test_start", send_data);
    });

    $('#btn5').click(function () {
        $('#tabOff')[0].play();
        $('#modal4').fadeOut(500).hide();
        $('#modal2').fadeIn(500).css("display", "flex");
    });

    $('#btn6').click(function () {
        $('#tabOff')[0].play();
        $('#modal2').fadeOut(500).hide();
        $('#modal1').fadeIn(500).css("display", "flex");
    });

    //▼▽▼▽▼▽▼▽▼▽▼▽▼▽▼▽▼▽▼▽▼▽▼▽▼▽▼▽
    //▼▽▼▽▼▽▼▽▼▽▼▽▼▽▼▽▼▽▼▽▼▽▼▽▼▽▼▽
    //●先生が生徒の回答状況を確認する処理
    //▼▽▼▽▼▽▼▽▼▽▼▽▼▽▼▽▼▽▼▽▼▽▼▽▼▽▼▽
    //▼▽▼▽▼▽▼▽▼▽▼▽▼▽▼▽▼▽▼▽▼▽▼▽▼▽▼▽

    //================================
    //●試験開始を押した後の画面生成
    //================================
    socket.on('test_start', function (data) {
        question = data.question;
        students = data.students;
        $("#table3").html('<tr id="ob_question"></tr>');
        $("#ob_question").append(`<th></th>`);
        let num = 0;
        for (let i in question) { //balloon2はdisplay:flexで表示
            num = Number(i) + 1;
            $("#ob_question").append(`
                <th class="test_cell_head tooltip ob_hover_cell">${(num)}
                    <div class="balloon2"> 
                        <div class="balloon_question_content">${question[i].focus}</div>
                        <button class="btn_in_balloon color_brown view_question_2">問題をみる</button>
                    </div>
                </th>
            `);
        }
        for (let i in students) {
            $("#table3").append(`<tr id="ob_user_${students[i].id}"></tr>`);
            $("#ob_user_" + students[i].id).append(`<th class="test_name">Lv.1 ${students[i].name}</th>`);
            for (let j in question) {
                $("#ob_user_" + students[i].id).append(`
                    <td class="test_cell ob_hover_cell" id="ob_${students[i].id}_${question[j].que_id}">
                        <div class="balloon2">?</div>
                        <span class="material-icons-outlined remove">remove</span>
                    </td>
                `);
            }
        }
        $("#modal4").fadeOut(200).hide();
        $("#ob_modal").fadeIn(200).css("display", "flex");

        //================================
        //●ホバーした際のウィンドウ表示
        //================================
        let index = 0;
        $(document).on({
            "mouseenter": function () {
                index = $(".ob_hover_cell").index(this);
                $(".balloon2").eq(index).fadeIn(500).css("display", "flex");
            }, "mouseleave": function () {
                $(".balloon2").eq(index).fadeOut(500).css("display", "none");
            }
        }, ".ob_hover_cell");

        socket.on('test_progress', function (data) {
            let judge;
            let hit_question;
            for (let i in question) {
                if (question[i].que_id == data.que_id) {
                    hit_question = question[i];
                }
            }
            if (hit_question.answer_id == data.answer_id) {
                judge = "circle";
            } else {
                judge = "clear";
            }
            let user_answer;
            const number_circle = ["A", "B", "C", "D"];
            for (let i in hit_question.choices) {
                if (hit_question.choices[i].id == data.answer_id) {
                    user_answer = number_circle[i];
                }
            }
            //情報の書き換え
            selecter1 = "#ob_" + data.id + "_" + data.que_id + "> .balloon2";
            selecter2 = "#ob_" + data.id + "_" + data.que_id + "> .material-icons-outlined";
            $(selecter1).text(user_answer);
            $(selecter2).removeClass("circle").removeClass("clear").removeClass("remove").addClass(judge).text(judge);
        });
    });

    //ー－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－>>>>

    /* $('body').on('click', '.test_cell_head', function () {
        let index = $('.test_cell_head').index(this);
        
        $("#qi_subject_third").text(subject_name[question_list[selected_questions[index].id].subject_id - 1]);
        $("#qi_focus_third").text(question_list[selected_questions[index].id - 1].focus);
        $("#qi_question_third").text(question_list[selected_questions[index].id -1].question);
        for(let i in question_list[selected_questions[index].id].choices){
            $("#qi_select_third_" + i).text(question_list[selected_questions[index].id - 1].choices[i].choice);
            if(question_list[index].choices[i].choices_id == question_list[index].answer_id){
                qi_ans_symbol = number_circle[i];
                qi_ans = question_list[index].choices[i].choice;
            }
        }
        $("#qi_ans_symbol_third").text(qi_ans_symbol);
        $("#qi_ans_third").text(qi_ans);
        $("#question_info_comment_third").text(question_list[selected_questions[index].id - 1].comment);

        $('#ob_modal').fadeOut(500).hide();
        $('#modal10').fadeIn(500).css("display","flex");
    });

    // 問題を見るを閉じる
    $('#close_hover').click(function () {
        $('#modal9').fadeOut(500).hide();
        $('#ob_modal').fadeIn(500).css("display","flex");
    }); */

    //<<<<ー－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－

    let test_check;
    let confirmed_user;
    socket.on('test_check', function (data) {
        test_check = data;
        $('#ob_modal').fadeOut(500).hide();
        $('#modal6').fadeIn(500).css("display", "flex");;

        // 生徒の進捗配列を表示させる
        confirmed_user = "";
        let check;
        $.each(test_check, function (index, value) {
            if (index % 6 == 0) {
                confirmed_user += '<div class="line">';
            }
            confirmed_user += '<div class="block">';
            confirmed_user += '<div class="cell_top">' + (test_check[index] == "" ? '' : test_check[index].name) + '</div>';
            check = (test_check[index].check == "y" ? '確認OK' : '確認中');
            confirmed_user += '<div class="cell_bottom">' + check + '</div>';
            confirmed_user += '</div>';
            if ((index % 6 == 1 && index >= 6) || (test_check.length == index + 1)) {
                confirmed_user += '</div>';
            }

        });
        $('#test_finish_tech').html(confirmed_user);
    });

    socket.on('test_confirm', function (data) {
        confirmed_user = "";
        $('#test_finish_tech').html(confirmed_user);
        // 生徒が確認ボタンを押した時の処理
        $.each(test_check, function (index, value) {
            if (test_check[index].id == data.id) {
                test_check[index].check = 'y';
            }
        });
        // 生徒の進捗配列を更新する
        let check;
        $.each(test_check, function (index, value) {
            if (index % 6 == 0) {
                confirmed_user += '<div class="line">';
            }
            confirmed_user += '<div class="block">';
            confirmed_user += '<div class="cell_top">' + (test_check[index] == "" ? '' : test_check[index].name) + '</div>';
            check = (test_check[index].check == "y" ? '確認OK' : '確認中');
            confirmed_user += '<div class="cell_bottom">' + check + '</div>';
            confirmed_user += '</div>';
            if ((index % 6 == 1 && index >= 6) || (test_check.length == index + 1)) {
                confirmed_user += '</div>';
            }
        });

        $('#test_finish_tech').html(confirmed_user);
    });

    // 解説画面へのボタンが押された時の処理
    $('#commentary').click(function () {
        socket.emit('test_commentary', '');
    });

    // サーバーからtest_commentaryイベントが送られてきた時の処理
    let test_commentary;
    socket.on('test_commentary', function (data) {
        // サーバー側から解答・解説に関する情報が送られてきた時の処理
        test_commentary = data; // {que_id , rate , answer_id}
        $('#modal6').fadeOut(500).hide();
        $('#modal7').fadeIn(500).css("display", "flex");;

        let test_comment = "";
        $.each(selected_questions, function (index, value) {
            test_comment += '<div class="row">';
            test_comment += '<div class="cell_num color_brown">問' + (index + 1) + '</div>';
            test_comment += '<div class="cell_num color_brown special-width">' + test_commentary[index].rate + '%</div>';
            test_comment += '<div class="cell_detail"><button class="yellow_btn color_brown view_question_3">問題をみる</button></div>';
            test_comment += '<div class="cell_detail"><button class="yellow_btn color_brown que_comment">解説</button></div>';
            test_comment += '</div>';
        });
        $('#test_comment_tech').append(test_comment);
    });

    // 問題を見るボタン
    // $('body').on('click', '.view_question', function () {
    // 	let index = $('.view_question').index(this);
    // 	$('#question_check').prepend(`
    // 		<div id="question_sentence">
    // 			<h2 class="color_brown">${question_list[selected_questions[index].id].focus}</h2>
    // 		</div>
    // 			<p id="question_content">${question_list[selected_questions[index].id].question}</p>
    // 		<form>
    // 			<div id="select_answer">
    // 				<input type="radio" id="q1" name="answer" value="q1"><label for="q1">①&nbsp;${question_list[selected_questions[index].id].answer}</label>
    // 				<input type="radio" id="q2" name="answer" value="q1"><label for="q2">②&nbsp;${question_list[selected_questions[index].id].answer}</label>
    // 				<input type="radio" id="q3" name="answer" value="q1"><label for="q3">③&nbsp;${question_list[selected_questions[index].id].answer}</label>
    // 				<input type="radio" id="q4" name="answer" value="q1"><label for="q4">④&nbsp;${question_list[selected_questions[index].id].answer}</label>
    // 			</div>
    // 		</form>
    // 	`);

    // 	$('#modal7').fadeOut(500).hide();
    // 	$('#modal8').fadeIn(500).css("display","flex");;
    // });

    //ー－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－>>>>

    /* $('body').on('click', '.view_question_second', function () {
        let index = $('.view_question_second').index(this);
        
        $("#qi_subject_second").text(subject_name[question_list[selected_questions[index].id].subject_id - 1]);
        $("#qi_focus_second").text(question_list[selected_questions[index].id - 1].focus);
        $("#qi_question_second").text(question_list[selected_questions[index].id -1].question);
        for(let i in question_list[selected_questions[index].id].choices){
            $("#qi_select_second_" + i).text(question_list[selected_questions[index].id - 1].choices[i].choice);
            if(question_list[index].choices[i].choices_id == question_list[index].answer_id){
                qi_ans_symbol = number_circle[i];
                qi_ans = question_list[index].choices[i].choice;
            }
        }
        $("#qi_ans_symbol_second").text(qi_ans_symbol);
        $("#qi_ans_second").text(qi_ans);
        $("#question_info_comment_second").text(question_list[selected_questions[index].id - 1].comment);

        $('#modal7').fadeOut(500).hide();
        $('#modal8').fadeIn(500).css("display","flex");
    });
  
  
  //=====================================================
    
    // 問題を見るを閉じる
    //$('#close_btn').click(function () {
        //$('#modal8').fadeOut(500).hide();
        //$('#modal7').fadeIn(500).css("display","flex");
    //});
    // 解説を閉じる
    //$('#close').click(function () {
        //$('#modal9').fadeOut(500).hide();
  
  //=====================================================
  
  
    $('#close_btn_second').click(function () {
        console.log("ここは押されてる");
        $('#test_comment_tech').empty();
        console.log("2個目はいけてる");
        $('#modal8').fadeOut(500).hide();

        socket.emit('test_commentary', '');
    });
    // 解説を閉じる
    $('#close').click(function () {
        $('#explain').empty();
        $('#modal9').fadeOut(500).hide();

        $('#modal7').fadeIn(500).css("display","flex");
    }); */

    //<<<<ー－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－

    // 解説ボタン
    $('body').on('click', '.que_comment', function () {
        let index = $('.que_comment').index(this);
        $('.ques_number').text(index + 1);
        $('#answer_number').text(`「${number_circle[test_commentary[index].answer_id % 4 == 0 ? 3 : test_commentary[index].answer_id % 4 - 1]}」`);
        $('#explanation_img').text(question[index].comment);
        // console.log(question);
        // console.log(test_commentary);

        socket.emit('commentary_start', { que_id: index });

        $('#modal7').fadeOut(500).hide();
        $('#modal9').fadeIn(500);
    });
    $('#close').click(function () {
        $('#explain').empty();
        socket.emit('commentary_close', '');
        $('#modal9').fadeOut(500).hide();
        $('#modal7').fadeIn(500).css("display", "flex");
    });

    // 試験終了ボタンが押された時の処理
    $('#test_complete').click(function () {
        $('#test_comment_tech').empty();
        socket.emit('test_complete', loginId);
        $('#modal7').fadeOut(500).hide();
    });


    //タイマー処理
    socket.on("test_timer", function (time) {
        $("#time").text(`${Math.floor(time / 60)}:${(time % 60) < 10 ? '0' : ''}${time % 60}`);
    });

    $("#stop").click(function () {
        socket.emit('test_stop', 1);
        $("#restart").css("display", "block");
        $("#stop").css("display", "none");
    });

    $("#restart").click(function () {
        socket.emit('test_restart');
        $("#stop").css("display", "block");
        $("#restart").css("display", "none");
    });

    $("#break").click(function () {
        socket.emit('test_stop', 0);
    });


    /* socket.on("test_timer",function(time){
        $("#time").text(sec_to_time(time));
    }); */

    /* function sec_to_time(sec){
        min = Math.floor(sec / 60);
        min_s = String(min);
        sec = sec % 60;
        if(sec.length == 1){
            sec_s = String("0" + sec);
        }
        else{
            sec_s = String(sec);
        }
        console.log(sec_s);
        return min_s + ":" + sec_s;
    } */

    
	// returnTopイベントで再読み込み
	socket.on("returnTop", function (data) {
        location.reload();
	});
    
    // ちょっと待った処理
    $("#wait-check-btn").click(function () {
        $('#wait-modal').fadeIn(200);
        $("#wait-check-btn").css("display", "none");
    });
    $("#wait-modal-btn").click(function () {
        $('#wait-modal').fadeOut(200);
        $("#wait-check-btn").css("display", "block");
    });
    $("#wait-modal").click(function () {
        $('#wait-modal').fadeOut(200);
        $("#wait-check-btn").css("display", "block");
    });

    let cnt = 0;
    socket.on("wait",function(data){
        $('#wait-music')[0].play();
        cnt++
        alarm(data.name,cnt); //モーダルを表示させる
    });    

    function alarm(name,cnt) {
        setTimeout(function() {
            const nowDate = new Date();
            let h = nowDate.getHours();
            let m = nowDate.getMinutes();
            let s = nowDate.getSeconds();

            // ５件より多い時に、消す処理
            let count = $('#message-box').find("p").length;
            let messages = document.getElementsByClassName('name_wait');
            if(count < 5){
                $('#message-box').append(`
                <p class="name_wait">
                <span class="wait-name">「${name}」</span><span class="wait-time">${zeroUmeko(h)}時${zeroUmeko(m)}分${zeroUmeko(s)}秒</span>
                </p>
                `);
            } else {
                document.getElementById('message-box').removeChild(messages[0]);
                $('#message-box').append(`
                <p class="name_wait">
                <span class="wait-name">「${name}」</span><span class="wait-time">${zeroUmeko(h)}時${zeroUmeko(m)}分${zeroUmeko(s)}秒</span>
                </p>
                `);
            }
        }, 1000);
    }
    // ２桁揃え
    function zeroUmeko(time){
        if(String(time).length == 1){
            time = "0" + time;
        }
        return time;
    }
    
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
