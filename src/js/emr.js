$(function() {

  var configFile = ipcRenderer.sendSync('get-config-file');
  var config = fse.readJsonSync(configFile);

  var E = {};

  var params = getUrlVars();
  console.log(params);
  var pid = params.pid;
  var hospcode = params.hospcode;

  E.getFirstService = function (services) {
    var firstService = _.max(services, 'STR_TIME');
    console.log(firstService);
  }

  E.getServiceList = function (pid, hospcode) {
    var data = {pid: '004570', hospcode: hospcode}
    var query = cryptojs.AES.encrypt(JSON.stringify(data), KEY).toString();
    $.ajax({
      url: config.cloud.url + '/emr/service_list',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({query: query})
    })
    .success(function (data) {
      if (_.size(data.rows)) {
        var $listView = $('#lstService');
        $listView.empty();

        var html = `
        <a href="#" class="list-group-item active">
          <i class="fa fa-desktop fa-fw"></i>
          ประวัติรับบริการ
        </a>`;

        if (_.size(data.rows)) {
          _.forEach(data.rows, function (v) {
            html += `
            <a href="#" class="list-group-item" data-action="getService" data-pid="${v.PID}" data-hospcode="${v.HOSPCODE}">
              <h5 class="list-group-item-heading">${v.DATE_SERV} ${v.TIME_SERV}</h5>
              <p class="list-group-item-text">[${v.HOSPCODE}] ${v.HOSPNAME}</p>
            </a>`;
          });

          $listView.append(html);

          // Get service
          E.getFirstService(data.rows);
        }
      } else {
        $('#info').fadeOut();
        $('#alert').fadeIn();
        $('#msg').html(`<strong>Oop!</strong> ไม่พบข้อมูลผู้รับบริการรายนี้ <a href="./index.html" class="alert-link">กลับหน้าหลัก</a>`);
      }

    })
    .error(function (xhr, status, error) {
      $('#info').fadeOut();
      $('#alert').fadeIn();
      $('#msg').html(`<strong>Oop!</strong> ไม่สามารถเชื่อมต่อกับแม่ข่ายได้ <a href="./index.html" class="alert-link">กลับหน้าหลัก</a>`);
    });
  }

  if (pid) {
    E.getServiceList(pid, hospcode);
  } else {
    // alert('ไม่พบเลขบัตรประชาชน กรุณาตรวจสอบ');
    // window.location.href = './index.html';
  };

  $(document).on('click', 'a[data-action="getService"]', function (e) {
    e.preventDefault();

    var pid = $(this).data('pid');
    var hospcode = $(this).data('hospcode');

    console.log(pid);
    console.log(hospcode);
  });

});
