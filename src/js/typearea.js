$(function () {

  var T = {};
  var HOSPITAL_CODE;
  // var key = ipcRenderer.sendSync('encrypt', '123456');
  // console.log(key);
  var configFile = ipcRenderer.sendSync('get-config-file');
  var config = fse.readJsonSync(configFile);

  var db = require('knex')({
    client: 'mysql',
    connection: config.db
  });

  T.getHospitalCode = function () {
    var q = Q.defer();

    db('opdconfig')
    .select('hospitalcode')
    .limit(1)
    .then(function (rows) {
      q.resolve(rows[0].hospitalcode)
    })
    .catch(function (err) {
      console.log(err);
      q.reject(err)
    });

    return q.promise;
  };

  // Get hosptial code
  T.getHospitalCode()
  .then(function (hospitalcode) {
    HOSPITAL_CODE = hospitalcode;
  }, function (err) {
    alert('ERROR: ' + JSON.stringify(err));
  });

  T.setList = function (data) {
    var $table = $('#tblList > tbody');
    $table.empty();

    if (_.size(data)) {
      _.forEach(data, function (v, i) {
        var html = ``;
        if (v.reserved == 'Y' && v.reserved_hosp == v.hospcode) {
          html += `<tr class="table-success">`;
        } else if (v.reserved == 'Y' && v.reserved_hosp != v.hospcode) {
          html += `<tr class="table-danger">`;
        } else {
          html += `<tr>`;
        }

        var bCID = cryptojs.AES.decrypt(v.cid, KEY);
        var CID = bCID.toString(cryptojs.enc.Utf8);

        var bNAME = cryptojs.AES.decrypt(v.fname, KEY);
        var NAME = bNAME.toString(cryptojs.enc.Utf8);

        var bLNAME = cryptojs.AES.decrypt(v.lname, KEY);
        var LNAME = bLNAME.toString(cryptojs.enc.Utf8);

        html +=
        `
          <td>${i+1}</td>
          <td>${CID}</td>
          <td>${v.hn}</td>
          <td>${NAME} ${LNAME}</td>
          <td>${v.birth}</td>
          <td>${v.age}</td>
          <td style="text-align: center;">${v.typearea}</td>
          <td>
            <div class="btn-group btn-group-sm">
              <button type="button" class="btn btn-success dropdown-toggle"
              data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <i class="fa fa-th-list"></i>
              </button>
              <div class="dropdown-menu dropdown-menu-right">
                <a href="#" data-action="info" data-cid="${v.cid}" class="dropdown-item">
                  <i class="fa fa-search fa-fw"></i> &nbsp; ดูรายละเอียดซ้ำซ้อน
                </a>
          `;
          if (v.reserved != 'Y') {
            html += `
              <a href="#" data-action="reserve" data-cid="${v.cid}" class="dropdown-item">
                <i class="fa fa-folder-open fa-fw"></i> &nbsp; จองข้อมูลประชากร
              </a>
            `;
          }

          html +=`
                <div class="dropdown-divider"></div>
                <a href="#" data-action="edit" data-cid="${v.cid}" class="dropdown-item">
                    <i class="fa fa-edit fa-fw"></i> &nbsp; แก้ไข TYPEAREA
                  </a>
              </div>
            </div>
          </td>
        </tr>
        `;

        $table.append(html);
      });

      $('.dropdown-toggle').dropdown();

    } else {
      $table.append('<tr><td colspan="8">ไม่พบรายการ...</td></tr>')
    }

  };

  T.setDuplicatedList = function (data) {
    var $table = $('#tblDuplicatedResult > tbody');
    $table.empty();

    if (_.size(data)) {
      _.forEach(data, function (v, i) {

        var bNAME = cryptojs.AES.decrypt(v.fname, KEY);
        var NAME = bNAME.toString(cryptojs.enc.Utf8);

        var bLNAME = cryptojs.AES.decrypt(v.lname, KEY);
        var LNAME = bLNAME.toString(cryptojs.enc.Utf8);

        var html = `
        <tr>
          <td>${i+1}</td>
          <td>${v.hospname}</td>
          <td>${NAME} ${LNAME}</td>
          <td>${v.birth}</td>
          <td>${v.sex}</td>
          <td style="text-align: center;">${v.typearea}</td>
          <td>${v.d_update}</td>
          `;
        if (v.reserved == 'Y') {
          html += `<td><i class="text-success fa fa-check"></i></td>`;
        } else {
          html += `<td>&nbsp;</td>`;
        }
        html += `</tr>`;
        $table.append(html);
      });
    } else {
      $table.append('<tr><td colspan="8">ไม่พบรายการ...</td></tr>');
    }

  };

  T.doReserve = function (hospcode, cid) {
    // NProgress.start();
    $.ajax({
      url: config.cloud.url + '/reserve',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({hospcode: hospcode, cid: cid})
    })
    .success(function (data) {
      // NProgress.done();
      alert('จองเรียบร้อยแล้ว');
      T.getList();
    })
    .error(function (xhr, status, error) {
      // NProgress.done();
      alert('Error: ไม่สามารถเชื่อมต่อกับ Server ได้');
    });
  };

  T.getList = function () {
    // NProgress.start();
    T.getHospitalCode()
    .then(function (hospitalcode) {
      $.ajax({
        url: config.cloud.url + '/typearea',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({hospcode: hospitalcode})
      })
      .success(function (data) {
        T.setList(data.rows);
        //NProgress.done();
      })
      .error(function (xhr, status, error) {
        // NProgress.done();
        alert('Error: ไม่สามารถเชื่อมต่อกับ Server ได้');
      });
    }, function (err) {
      console.log(err);
      alert('ERROR: ' + JSON.stringify(err));
    })

  };

  T.getDetail = function (cid) {
    // NProgress.start();
    $.ajax({
      url: config.cloud.url + '/detail',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({cid: cid})
    })
    .success(function (data) {
      if (data.ok) {
        T.setDuplicatedList(data.rows);
        //console.log(data.rows);
        // NProgress.done();

        $('#mdlDuplicated').modal({backdrop: true});

      } else {
        alert('Error: ' + JSON.stringify(data.msg));
      }
    })
    .error(function (xhr, status, error) {
      // NProgress.done();
      alert('Error: ไม่สามารถเชื่อมต่อกับ Server ได้');
    });
  };

  // Get typearea
  T.getTypearea = function () {
    var q = Q.defer();
    db('house_regist_type')
    .select('house_regist_type_name', 'house_regist_type_id')
    .then(function (rows) {
      q.resolve(rows);
    })
    .catch(function (err) {
      q.reject(err);
    });

    return q.promise;
  };

  T.getList();

  $(document).on('click', 'a[data-action="info"]', function (e) {
    e.preventDefault();

    var cid = $(this).data('cid');

    T.getDetail(cid);
  });

  $(document).on('click', 'a[data-action="reserve"]', function (e) {
    e.preventDefault();

    var cid = $(this).data('cid');
    if (confirm('คุณต้องการจองข้อมูลนี้ ใช่หรือไม่')) {
      T.doReserve(HOSPITAL_CODE, cid);
    }

  });

  $(document).on('click', 'a[data-action="edit"]', function (e) {
    e.preventDefault();
    var cid = $(this).data('cid');
    $('#txtPatientCID').val(cid);

    T.getTypearea()
    .then(function (data) {
      $('#slTypearea').empty();
      _.forEach(data, function (v) {
        var html = `<option value="${v.house_regist_type_id}">${v.house_regist_type_name}</option>`;
        $('#slTypearea').append(html);
      });

      $('#mdlChangeTypearea').modal({backdrop: 'static'});
    }, function (err) {
      console.log(err);
      alert('ERROR: ' + JSON.stringify(err));
    });
  });

  $('#mdlChangeTypearea').on('hidden.bs.modal', function (e) {
    $('#txtPatientCID').val('');
  });


  T.saveTypeAreaPerson = function (cid, typearea) {
    var q = Q.defer();
    db('person')
    .where({
      cid: cid
    })
    .update({
      house_regist_type_id: typearea,
      last_update: moment().format('YYYY-MM-DD HH:mm:ss')
    })
    .then(function () {
      q.resolve();
    })
    .catch(function (err) {
      q.reject(err);
    });

    return q.promise;
  };

  T.saveTypeAreaPatient = function (cid, typearea) {
    var q = Q.defer();
    db('patient')
    .where({
      cid: cid
    })
    .update({
      type_area: typearea,
      last_update: moment().format('YYYY-MM-DD HH:mm:ss')
    })
    .then(function () {
      q.resolve();
    })
    .catch(function (err) {
      q.reject(err);
    });

    return q.promise;
  };

  $('#saveTypeArea').on('click', function (e) {
    e.preventDefault();

    var cid = $('#txtPatientCID').val();
    var typearea = $('#slTypearea').val();

    T.saveTypeAreaPerson(cid, typearea)
    .then(function () {
      return T.saveTypeAreaPatient(cid, typearea);
    })
    .then(function () {
      alert('เปลี่ยน Typearea ในฐาน HOSxP เสร็จเรียบร้อยแล้ว กรุณาส่งออกข้อมูล PERSON ให้ Admin อีกครั้ง (All person)');
      $('#mdlChangeTypearea').modal('hide');
    }, function (err) {
      console.log(err);
      alert('ERROR: ' + JSON.stringify(err));
    });
  });

});
