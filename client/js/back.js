$(function () {
  let socket = io.connect();
  socket.emit('adminConnect', '');

  let userList = {};

  $('#guestEntryBtn').change(function (){
    // チェック状況判断
    if ($(this).prop('checked')) {
      // ゲスト登録可能状態
      socket.emit(`guestEntry`, {mode:'on'});
    } else {
      // ゲスト登録不可能状態
      socket.emit(`guestEntry`, {mode:'off'});
    }
  });

  socket.on('adminConnect', (data) => {
    userList = data.userList;

    // レンダリング
    for (const tc of userList.teachers) {
      $('#teachersTable').append(
        `<tr id="${tc.name}">
        <td>${tc.id}</td>
        <td>${tc.name}</td>
        </tr>`
      );
    }

    for (const st of userList.students) {
      $('#studentsTable').append(
        `<tr id=${st.name}>
        <td>${st.id}</td>
        <td>${st.name}</td>
        <td><button type="button" class="btn btn-secondary" value="${st.id}" id="kick_${st.id}">kick</button></td>
        <td><button type="button" class="btn btn-danger" value="${st.id}" id="blackList_${st.id}">blackList</button></td>
        <td id="waitCount_${st.name}">0</td>
        </tr>`
      );
    }
  });

  socket.on('tcConnect', (data) => {
    console.log('tcログイン');
    const tc = data.tc
    $(`#teachersTable`).append(
      `<tr id="${tc.name}">
        <td>${tc.id}</td>
        <td>${tc.name}</td>
        </tr>`
    );
  });

  socket.on('stConnect', (data) => {
    console.log('stログイン');
    const st = data.st;
    $(`#studentsTable`).append(
      `<tr id=${st.name}>
        <td>${st.id}</td>
        <td>${st.name}</td>
        <td><button type="button" class="btn btn-secondary" value="${st.id}" id="kick_${st.id}">kick</button></td>
        <td><button type="button" class="btn btn-danger" value="${st.id}" id="blackList_${st.id}">blackList</button></td>
        <td id="waitCount_${st.name}">0</td>
        </tr>`
    );
  });

  socket.on('wait', (data) => {
    console.log('wait');
    const stName = data.name;
    let waitCount = parseInt($(`#waitCount_${stName}`).text());
    waitCount++;
    $(`#waitCount_${stName}`).text(waitCount);
  });

  socket.on('tcDisconnect', (data) => {
    console.log('tc切断');
    console.log(data);
    const tcName = data.name;
    $(`#${tcName}`).remove();
  });

  socket.on('stDisconnect', (data) => {
    console.log('st切断');
    console.log(data);
    const stName = data.name;
    $(`#${stName}`).remove();
  });

  // kick.blacklist
  $('body').on('click', '.btn', function () {
    console.log('ボタンイベント発生');
    if (!confirm(`${$(this).text()}を実行しますか?`)) {
      return false;
    } else {
      const st = {
        id: $(this).val(),
        method: $(this).text()
      };
      socket.emit(`st${st.method}`, { stId: st.id });
    }
  });
});