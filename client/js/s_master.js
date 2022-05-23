$(function () {
	$('#loginBackSound')[0].play();
	let socket = io.connect();
	$('#modal1').hide();
	$('#modal2').hide();
	$('#modal3').hide();
	$('#modal9').hide();
	let question;

	// $('#confirm').on('click', function () {
	// 	$('#modal2').fadeOut().hide();
	// });

	/* socket.on('test_start', (data)=>{
		console.log(data);
	}); */
	const number_circle = ["A", "B", "C", "D"];
	const color_class = ["red", "blue", "green", "yellow"];
	const subject_name = ["英語", "国語", "数学", "理科", "社会"]; 1
	let progress;

	socket.emit('send_id', loginId);

	socket.on('test_start', (data) => {
		$('#testStartBackSound')[0].play();
		//試験問題情報
		question = data.ques;
		//制限時間
		time = data.time;
		//進捗用配列を作成
		progress = [];
		for (let i in question) {
			progress[i] = { que_id: question[i].que_id, answer_id: -1 }
		}
		//モーダルを表示
		$("#modal1").fadeIn(500).css("display", "flex");
		$('#time_start')[0].play();
		//======================================
		//試験開始時：第一問を描画
		//======================================
		let now_question = 0;
		let answer = -1;
		let event_flg = 0;

		render_quiz_form(question);


		$(".question_num").click(function () {
			if ($(this).hasClass('selected')) {
			} else {
				if (event_flg == 0) {
					now_question = $(".question_num").index(this);
					render_quiz(now_question + 1, question)
				}
			}
		});

		$("#test_finish_btn").click(function () {
			if ($(this).hasClass("finish_allow")) {
				socket.emit('test_finish', "");
			}
		});

		function render_quiz_form(question_obj) {
			//①問題番号部分の書き出し
			//１問目はclassに「selected」を付ける
			$("#question_list").html("")
			for (let i = 0; i < question_obj.length; i++) {
				$('#question_list').append(`<p class="question_num">${i + 1}</p>`);
			}
			render_quiz(1, question_obj)
		}

		function render_quiz(n, question_obj) {
			event_flg = 1;
			$("#question_sentence > h2").html("");
			$("#question_content").html("");
			$("#select_answer").html("");
			//①選択番号を変更
			let selected = document.getElementsByClassName("selected");
			if (!selected.length == 0) {
				$('.selected').eq(0).removeClass('selected');
			}
			$('.question_num').eq(n - 1).addClass('selected');

			new Promise((resolve, reject) => {
				setTimeout(() => {
					//②n問目を表示
					$("#question_sentence > h2").hide().text("Q" + n).fadeIn(500);
					resolve();
				}, 500);
			}).then(function () {

				return new Promise((resolve, reject) => {

					setTimeout(() => {
						if (question_obj[n - 1].subject_id == 3) {
							// 数学
							$("#question_content").append(
								`<img src="./img/ques/${question_obj[n - 1].question}.png"></img>`
							);
						} else {
							// それ以外
							$("#question_content").hide().text(question_obj[n - 1].question).fadeIn(500);
						}
						resolve();
					}, 500);

				})

			}).then(function () {

				return new Promise((resolve, reject) => {

					//③選択肢をレンダリング
					setTimeout(() => {
						for (let i = 0; i < question_obj[n - 1].choices.length; i++) {
							let add_item1 = `<input type="radio" id="${"s_" + question_obj[n - 1].choices[i].id}" name="${"select"}" value="${question_obj[n - 1].choices[i].id}">`
							let add_item2 = `<label class="input_label ${color_class[i]}" for="${"s_" + question_obj[n - 1].choices[i].id}"><div class="select_title">${number_circle[i]}</div><div class="select_content">${question_obj[n - 1].choices[i].answer}</div></label>`
							$(add_item1).appendTo("#select_answer").hide().fadeIn(500).css({ "display": "none" });
							$(add_item2).appendTo("#select_answer").hide().fadeIn(500);
						}
						resolve();
					}, 500);
				})
			}).then(function () {
				event_flg = 0;
				if (progress[n - 1].answer_id != -1) {
					$('#s_' + progress[n - 1].answer_id).prop('checked', true);
				}
				//======================================
				//回答入力時：
				//======================================
				$("input[name='select']").change(function () {
					$('#btnClick')[0].play();
					setTimeout(() => {
						//回答を取得
						answer = $("input[name='select']:checked").val();
						//進捗を更新
						progress[now_question].answer_id = answer;
						send_progress = { que_id: question[n - 1].que_id, answer_id: answer }
						socket.emit('test_progress', send_progress);
						if (search_unanswered(progress) == "comp") {
							$('#test_finish_btn').removeClass("finish_not_allow").addClass("finish_allow");
						}
						else {
							//まだ答えていない問題のうち一番若い番号を求める
							now_question = search_unanswered(progress);
							//画面の再描画
							render_quiz(now_question + 1, question_obj)
						}
					}, 500);
				});
			});
		}
		function search_unanswered(progress) {
			for (let i = 0; i < progress.length; i++) {
				if (progress[i].answer_id == -1) {
					return i;
				}
			}
			return "comp";
		}
	});

	let ques_answer = [];
	// const audio_level_up = document.getElementById("audio_level_up");

	let flg = 0;
	socket.on('test_finish', (data) => {
		// 問題リストを削除(次の問題のため)
		$("#question").empty();
		// 正答率を求める
		let myRate = { ans: 0, allQ: 0, rating: 0 };

		// 問題に対する解答・正答率が送られてくる
		if(ques_answer.length == 0){
			ques_answer = data;
		}
		// console.log(ques_answer);
		// console.log(data);
		// 問題を見るの解説用
		for (const key in data) {
			question[key].comment = data[key].comment;
		}

		// モーダルを表示
		$('#modal1').fadeOut(500).hide();
		$("#modal2").fadeIn(500).css("display", "flex");
		// $('#confirm').prop("disabled",true);
		// $("#confirm").css("background-color" , "black");
		// $("#confirm").css("border" , "none");
		// $("#confirm").css("color" , "white");

		// モーダルの内容を表示
		let test_result = "";
		test_result = '<tr class="fixed"><th class="color_brown">設問</th><th class="color_brown">採点</th><th class="color_brown">正解</th><th class="color_brown">あなたの回答</th><th class="color_brown">正答率</th>       <th></th></tr>';
		for (let i = 0; i < question.length; i++) {
			myRate.allQ++;
			if(progress.length != 0){
				console.log(progress);
				console.log(ques_answer);
				if (progress[i].answer_id != ques_answer[i].answer_id) {
					test_result += '<tr>';
					test_result += '<th class="q_number color_brown">' + (i + 1) + '</th>';
					test_result += '<td class="q_result color_brown batu"></td>';
					test_result += '<td class="q_correct color_brown">' + (number_circle[(ques_answer[i].answer_id % 4 == 0) ? 3 : ques_answer[i].answer_id % 4 - 1]) + '</td>';
					if (progress[i].answer_id != -1) {
						test_result += '<td class="q_your_answer color_brown">' + (number_circle[(progress[i].answer_id % 4 == 0) ? 3 : progress[i].answer_id % 4 - 1]) + '</td>';
					} else {
						test_result += '<td class="q_your_answer color_brown">　ー　</td>';
					}
					
					if (ques_answer[i].rate != null) {
						test_result += '<td class="q_rate color_brown">' + (ques_answer[i].rate) + '%</td>';
					} else {
						test_result += '<td class="q_rate color_brown">　ー　</td>';
					}
					
					test_result += '<td class="q_check color_brown"><button class="limegreen_btn">問題を見る</button></td>';
					test_result += '</tr>';
				} else if (progress[i].answer_id == ques_answer[i].answer_id) {
					test_result += '<tr>';
					test_result += '<th class="q_number color_brown">' + (i + 1) + '</th>';
					test_result += '<td class="q_result color_brown maru"></td>';
					test_result += '<td class="q_correct color_brown">' + (number_circle[(ques_answer[i].answer_id % 4 == 0) ? 3 : ques_answer[i].answer_id % 4 - 1]) + '</td>';
					test_result += '<td class="q_your_answer color_brown">' + (number_circle[(progress[i].answer_id % 4 == 0) ? 3 : progress[i].answer_id % 4 - 1]) + '</td>';
					test_result += '<td class="q_rate color_brown">' + (ques_answer[i].rate) + '%</td>';
					test_result += '<td class="q_check color_brown"><button class="limegreen_btn">問題を見る</button></td>';
					test_result += '</tr>';
				}
			} else {
				test_result += '<tr>';
				test_result += '<th class="q_number color_brown">' + (i + 1) + '</th>';
				test_result += '<td class="q_result color_brown"></td>';
				test_result += '<td class="q_correct color_brown">　ー　</td>';
				test_result += '<td class="q_your_answer color_brown">　ー　</td>';
				test_result += '<td class="q_rate color_brown">' + (ques_answer[i].rate) + '%</td>';
				test_result += '<td class="q_check color_brown"><button class="limegreen_btn">問題を見る</button></td>';
				test_result += '</tr>';
			}
		};
		$('#resultBackSound')[0].play();
		myRate.rating = Math.floor((myRate.ans / myRate.allQ) * 100);
		if (myRate.rating == 100) {
			// エクセレント
			$('#rate_100')[0].play();
		} else if (myRate.ans == myRate.allQ - 1 && myRate.allQ != 1) {
			// 惜しい
			$('#rate_min1')[0].play();
		} else if (50 < myRate.rating) {
			// もう一息
			$('#rate_50')[0].play();
		} else if (20 < myRate.rating) {
			// 頑張ったね
			$('#rate_20')[0].play();
		} else {
			// がんばりましょう
			$('#rate_0')[0].play();
		}
		$("#result_table").html(test_result);
		
		
		// レベルアップの処理
		level = [10,20,10,20,10,20,10,20,10,20,10,20,300,1600,1000000]; //レベルアップに必要な経験値
        exp = myRate.allQ * 10; // 獲得した経験値
        num = level[0] / 50; // これでビヨーンを表現
        now_level = 1;
        now_exp = 0; // 現在の経験値
        per = 0;
		console.log(myRate.ans);
        if(exp > level[now_level - 1]){
            $("#level_up_img").animate(
                {
                    top : "50%",
                    opacity : "1"
                },
                500
            )
        }
        let guage_interval = setInterval(() => {
            if(now_exp > level[now_level - 1]){
                now_exp = 0;
                now_level = now_level + 1;
                num = level[now_level - 1] / 50;
                $("#level_num").text(now_level);
                document.getElementById("audio_level_up").play();
                $("#level_up_img").animate({height:"120%"},100,function(){
                    $("#level_up_img").animate({height:"100%"},300);
                });
            }
            // 最終的に経験値が尽きたらclearIntervalを実行する
            if(exp < 0){
                clearInterval(guage_interval);
            }
    
            now_exp = now_exp + num;
            
            exp = exp * 100 - num * 100;
            exp = exp / 100;
            
            exp = floor_round(exp,4);
            per = floor_round(((now_exp * 100) / (level[now_level - 1] * 100) * 100),0)
            $("#guage_solid_wrap").css("width",per + "%");

			if(now_level >= 5 && flg == 0){
				flg++;
				$('#character').html(`<img src="./img/level5.png" alt="キャラ画像" width="50" height="50">`);
				$("#level_up").fadeIn(500).css("display", "flex");
				count = 0; //カウントの初期値
				timerID = setTimeout(function(){
					$("#level_up").fadeOut(500).css("display", "flex");
				},3000); //1秒毎にcountup()を呼び出し
			}
        }, 20);
		
	});




	// 正答率が更新された時の処理
	socket.on('test_rateUpdate', (data) => {
		test_result = '<tr class="fixed"><th class="color_brown">設問</th><th class="color_brown">採点</th><th class="color_brown">正解</th><th class="color_brown">あなたの回答</th><th class="color_brown">正答率</th>       <th></th></tr>';
		for (let i = 0; i < ques_answer.length; i++) {
			if (ques_answer[i].que_id == data.que_id) {
				ques_answer[i].rate = data.rate;
			}

			if(progress.length != 0){
				if (progress[i].answer_id != ques_answer[i].answer_id) {
					test_result += '<tr>';
					test_result += '<th class="q_number color_brown">' + (i + 1) + '</th>';
					test_result += '<td class="q_result color_brown batu"></td>';
					test_result += '<td class="q_correct color_brown">' + (number_circle[(ques_answer[i].answer_id % 4 == 0) ? 3 : ques_answer[i].answer_id % 4 - 1]) + '</td>';
					console.log(progress[i]);
					if (progress[i].answer_id != -1) {
						test_result += '<td class="q_your_answer color_brown">' + (number_circle[(progress[i].answer_id % 4 == 0) ? 3 : progress[i].answer_id % 4 - 1]) + '</td>';
					} else {
						test_result += '<td class="q_your_answer color_brown">　ー　</td>';
					}

					if (ques_answer[i].rate != null) {
						test_result += '<td class="q_rate color_brown">' + (ques_answer[i].rate) + '%</td>';
					} else {
						test_result += '<td class="q_rate color_brown">　ー　</td>';
					}
					test_result += '<td class="q_check color_brown"><button class="limegreen_btn">問題を見る</button></td>';
					test_result += '</tr>';
				} else if (progress[i].answer_id == ques_answer[i].answer_id) {
					test_result += '<tr>';
					test_result += '<th class="q_number color_brown">' + (i + 1) + '</th>';
					test_result += '<td class="q_result color_brown maru"></td>';
					test_result += '<td class="q_correct color_brown">' + (number_circle[(ques_answer[i].answer_id % 4 == 0) ? 3 : ques_answer[i].answer_id % 4 - 1]) + '</td>';
					test_result += '<td class="q_your_answer color_brown">' + (number_circle[(progress[i].answer_id % 4 == 0) ? 3 : progress[i].answer_id % 4 - 1]) + '</td>';
					test_result += '<td class="q_rate color_brown">' + (ques_answer[i].rate) + '%</td>';
					test_result += '<td class="q_check color_brown"><button class="limegreen_btn">問題を見る</button></td>';
					test_result += '</tr>';
				}
			} else {
				test_result += '<tr>';
				test_result += '<th class="q_number color_brown">' + (i + 1) + '</th>';
				test_result += '<td class="q_result color_brown"></td>';
				test_result += '<td class="q_correct color_brown">　ー　</td>';
				test_result += '<td class="q_your_answer color_brown">　ー　</td>';
				test_result += '<td class="q_rate color_brown">' + (ques_answer[i].rate) + '%</td>';
				test_result += '<td class="q_check color_brown"><button class="limegreen_btn">問題を見る</button></td>';
				test_result += '</tr>';
			}
		}
		$("#result_table").html(test_result);
	});

	// 問題を見るボタン
	$('body').on('click', '.limegreen_btn', function () {
		$('#tabOn')[0].play();
		let index = $('.limegreen_btn').index(this);
		// $('#question_check_detail').html(`
		//     <div id="question_sentence">
		//         <h2 class="color_brown">${question[index].focus}</h2>
		//     </div>
		//         <p id="question_content">${question[index].question}</p>
		//     <form>
		//         <div id="select_answer">
		//             <input type="radio" id="q1" name="answer" value="q1"><label for="q1" class="${(question[index].choices[0].id == ques_answer[index].answer_id) ? 'question_answer' : ''}">①&nbsp;${question[index].choices[0].answer}</label>
		//             <input type="radio" id="q2" name="answer" value="q1"><label for="q2" class="${(question[index].choices[1].id == ques_answer[index].answer_id) ? 'question_answer' : ''}">②&nbsp;${question[index].choices[1].answer}</label>
		//             <input type="radio" id="q3" name="answer" value="q1"><label for="q3" class="${(question[index].choices[2].id == ques_answer[index].answer_id) ? 'question_answer' : ''}">③&nbsp;${question[index].choices[2].answer}</label>
		//             <input type="radio" id="q4" name="answer" value="q1"><label for="q4" class="${(question[index].choices[3].id == ques_answer[index].answer_id) ? 'question_answer' : ''}">④&nbsp;${question[index].choices[3].answer}</label>
		//         </div>
		//     </form>
		// `);

		// 問題を見るの新しいほう
		$("#qi_subject").text(subject_name[question[index].subject_id - 1]);
		$("#qi_focus").text(question[index].focus);

		if (question[index].subject_id == 3) {
			$("#qi_question").empty();
			$("#qi_question").append(
				`<img src="./img/ques/${question[index].question}.png"></img>`
			);
		} else {
			$("#qi_question").text(question[index].question);
		}
		for (let i in question[index].choices) {
			$("#qi_select_" + i).text(question[index].choices[i].answer);
			if (question[index].choices[i].id == ques_answer[index].answer_id) {
				qi_ans_symbol = number_circle[i];
				qi_ans = question[index].choices[i].answer;
			}
		}
		$("#qi_ans_symbol").text(qi_ans_symbol);
		$("#qi_ans").text(qi_ans);

		if (question[index].subject_id == 3) {
			$("#question_info_comment").empty();
			$("#question_info_comment").append(
				`<img src="./img/comment/${question[index].comment}.png"></img>`
			);
		} else {
			$("#question_info_comment").text(question[index].comment);
		}

		$('#modal2').fadeOut(500).hide();
		$('#modal3').fadeIn(500).css("display", "flex");
	});

	// 問題を見るを閉じる
	$('#question_info_close').click(function () {
		$('#tabOff')[0].play();
		$('#modal3').fadeOut(500).hide();
		$('#modal2').fadeIn(500).css("display", "flex");
	});

	// 確認ボタンを表示させる処理
	socket.on("test_check", function (data) {
		$('#confirm').fadeIn();
		$('#confirm').prop("disabled",false);
		$('#confirm').css("background-color", "#FFDD38");
		$('#confirm').css("border", "solid #FFDD38 5px");
		$('#confirm').css("color", "#46380D");
	});

	// 問題が終わってなかった時の処理

	// 確認するボタン
	$('#confirm').click(function () {
		$('#btnClick')[0].play();
		$('#confirm').hide();
		socket.emit('test_confirm', '');
	});

	socket.on("test_timer", function (time) {
		switch (time) {
			case 5:
				$('#time_5')[0].play();
				break;
			case 4:
				$('#time_4')[0].play();
				break;
			case 3:
				$('#time_3')[0].play();
				break;
			case 2:
				$('#time_2')[0].play();
				break;
			case 1:
				$('#time_1')[0].play();
				break;
			case 0:
				$('#time_end')[0].play();
				$('#modal1').fadeOut(500).hide();
				$('#modal2').fadeIn(500);
				socket.emit("test_finish" , "");
				break;
		}
		if (time % 2 == 0) {
			$("#display_animation").html('<img src="./img/考え中1.png" alt=""></div>')
		} else {
			$("#display_animation").html('<img src="./img/考え中2.png" alt=""></div>')
		}

		$("#time").text(`${Math.floor(time / 60)}:${(time % 60) < 10 ? '0' : ''}${time % 60}`);
	});

	// 教員が試験を終了した時の処理
	socket.on("test_complete", function (data) {
		$('#modal2').fadeOut(500).hide();
	});


	// ちょっと待ったボタンを押した時の処理
	$("#wait").click(function () {
		socket.emit('wait', "");
		$('#wait-music')[0].play();
	});


	// 解説画面
	socket.on("commentary_start", function (data) {
		let index = data.que_id;
		$('.ques_number').text(index + 1);
		$('#answer_number').text(`「${number_circle[ques_answer[index].answer_id % 4 == 0 ? 3 : ques_answer[index].answer_id % 4 - 1]}」`);
		$('#explanation_img').text(data.comment);


		$('#modal2').fadeOut(500).hide();
		$('#modal9').fadeIn(500);
	});

	// 解説を閉じる
	socket.on("commentary_close", function (data) {
		$('#modal9').fadeOut(500).hide();
		$('#modal2').fadeIn(500).css("display", "flex");
	});

	// returnTopイベントで再読み込み
	socket.on("returnTop", function (data) {
		$('#modal9').empty();
		$('#modal9').append(`
		<form method="post" action="/login" id="formLogin">
		<input type="hidden" name="loginId" value="${loginId}">
		</form>
		`);
		$('#formLogin').submit();
	});
});

function floor_round(num, decimal) {
	const decimal_num = 10 ** decimal;
	num = num * decimal_num;
	num = Math.floor(num);
	num = num / decimal_num;
	return num;
}











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
