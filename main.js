var app = require('electron').app; // Module to control application life.
var BrowserWindow = require('browser-window'); // Module to create native browser window.
var ipcMain = require('electron').ipcMain;
var fse = require('fs-extra');
var path = require('path');
var fs = require('fs');
var NodeRSA = require('node-rsa');
var key = new NodeRSA({b: 512});

var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  app.quit();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {

  var dataPath = app.getPath('appData');
  var appPath = path.join(dataPath, 'weCare');
  var configFile = path.join(appPath, 'config.json');

  fse.ensureDirSync(appPath);

  fs.access(configFile, fs.W_OK && fs.R_OK, function(err) {
    if (err) {
      var encrypted = key.encrypt('123456', 'base64');
      var defaultConfig = {
        db: {
          host: 'localhost',
          database: 'hos',
          port: 3306,
          user: 'sa',
          password: encrypted
        },
        cloud: {
          url: 'http://localhost',
          key: encrypted
        }
      };

      fse.writeJsonSync(configFile, defaultConfig);
    }
  });

  ipcMain.on('decrypt', function(event, encrypted) {
    var decrypted = key.decrypt(encrypted, 'utf8');
    event.returnValue = decrypted;
  });


  ipcMain.on('encrypt', function(event, text) {
    var encrypted = key.encrypt(text, 'base64');
    event.returnValue = encrypted;
  });

  ipcMain.on('get-app-path', function(event, arg) {
    event.returnValue = appPath;
  });


  ipcMain.on('get-config-file', function(event, arg) {
    event.returnValue = configFile;
  });

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600
  });

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/app/pages/index.html');

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
