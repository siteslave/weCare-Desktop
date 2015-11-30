$(function() {
  //NProgress.start();

  var M = {};

  var configFile = ipcRenderer.sendSync('get-config-file');
  var config = fse.readJsonSync(configFile);

  var db = require('knex')({
    client: 'mysql',
    connection: config.db
  });

  var currentDate = moment().format('YYYY-MM-DD');
  $('#txtDate').val(currentDate);

  M.getVisit = function() {
    var q = Q.defer();
    var date = $('#txtDate').val();

    var startDate = date ? moment(date).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');

    var sql = `select (select hospitalcode from opdconfig limit 1) as hospcode, p.person_id as pid,
      o.vstdate, o.hn, o.vn, p.pname, p.fname, p.lname, p.cid,
      od.icd10 as diag_code, icd.name as diag_name, o.pttype, ptt.name as pttype_name,
      timestampdiff(year, p.birthdate, o.vstdate) as age_y
      from ovst as o
      inner join person as p on p.patient_hn=o.hn
      left join ovstdiag as od on od.vn=o.vn
      left join icd101 as icd on icd.code=od.icd10
      left join pttype as ptt on ptt.pttype=o.pttype
      where o.vstdate = ?
      and od.diagtype="1"
      group by o.vn order by p.fname, p.lname`;

    db.raw(sql, [startDate])
      .then(function(rows) {
        q.resolve(rows[0]);
      })
      .catch(function(err) {
        q.reject(err);
      });

    return q.promise;
  };

  M.setVisitList = function(data) {
    var $table = $('#tblList > tbody');

    $table.empty();

    if (_.size(data)) {
      _.forEach(data, function(v, i) {
        i++;
        var html = `
        <tr>
          <td>${i}</td>
          <td>${v.hn}</td>
          <td>${v.pname}${v.fname} ${v.lname}</td>
          <td>${v.age_y}</td>
          <td>${v.diag_code} ${v.diag_name}</td>
          <td>${v.pttype} ${v.pttype_name}</td>
          <td>
            <button class="btn btn-info btn-sm" data-action="emr" data-pid="${v.pid}" data-hospcode="${v.hospcode}"><i class="fa fa-search"></i></button>
          </td>
        </tr>
        `;

        $table.append(html);
      })
    } else {
      var html = `<tr><td colspan="7">ไม่พบรายการ</td></tr>`;
      $table.append(html);
    }
  };

  M.getVisit()
    .then(function(rows) {
      M.setVisitList(rows);
    }, function(err) {
      var $table = $('#tblList > tbody');
      $table.empty();
      $table.append('<tr><td colspan="7">เกิดข้อผิดพลาด</td></tr>');
      alert('ERROR: ' + JSON.stringify(err));
    });

  $('#btnSearchService').on('click', function(e) {
    e.preventDefault();
    var $table = $('#tblList > tbody');
    $table.empty();
    $table.append('<tr><td colspan="7">กรุณารอซักครู่...</td></tr>');

    M.getVisit()
      .then(function(rows) {
        M.setVisitList(rows);
      }, function(err) {
        var $table = $('#tblList > tbody');
        $table.empty();
        $table.append('<tr><td colspan="7">เกิดข้อผิดพลาด</td></tr>');
        alert('ERROR: ' + JSON.stringify(err));
      });

  });

  $(document).on('click', 'button[data-action="emr"]', function(e) {
    var pid = $(this).data('pid');
    var hospcode = $(this).data('hospcode');

    window.location.href = `./emr.html?pid=${pid}&hospcode=${hospcode}`;
  });

});
