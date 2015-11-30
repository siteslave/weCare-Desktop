$(function() {
  var configFile = ipcRenderer.sendSync('get-config-file');
  var config = fse.readJsonSync(configFile);

  ///console.log(config);

  //var password = ipcRenderer.sendSync('decrypt', config.db.password);
  //var key = ipcRenderer.sendSync('decrypt', config.cloud.key);

  $('#txtHost').val(config.db.host);
  $('#txtDatabase').val(config.db.database);
  $('#txtPort').val(config.db.port);
  $('#txtUser').val(config.db.user);
  $('#txtPassword').val(config.db.password);
  $('#txtCloudURL').val(config.cloud.url);
  $('#txtCloudKey').val(config.cloud.key);

  // Save
  $('#btnSave').on('click', function(e) {
    e.preventDefault();

    var _config = {};
    _config.db = {};
    _config.cloud = {};

    _config.db.host = $('#txtHost').val();
    _config.db.database = $('#txtDatabase').val();
    _config.db.port = parseInt($('#txtPort').val());
    _config.db.user = $('#txtUser').val();
    _config.db.password = $('#txtPassword').val();
    _config.cloud.url = $('#txtCloudURL').val() || 'http://www.kchosp.go.th:3003';
    _config.cloud.key = $('#txtCloudKey').val() || '1234567890';

    //_config.cloud.key = ipcRenderer.sendSync('encrypt', _config.cloud.key);
    //_config.db.password = ipcRenderer.sendSync('encrypt', _config.db.password);

    if (!_config.db.host || !_config.db.database || !_config.db.port || !_config.db.user) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    } else {
      fse.writeJson(configFile, _config, function (err) {
        if (err) {
          console.log(err);
          alert('Error: ' + JSON.stringify(err));
        } else {
          alert('บันทึกเสร็จเรียบร้อยแล้ว');
        }
      });
    }
  });
});
