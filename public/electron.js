// Modules to control application life and create native browser window
const path = require("path");
const isDev = require("electron-is-dev");
const { app, dialog, globalShortcut, Menu, ipcMain, BrowserWindow, protocol, screen } = require("electron");
const { exec } = require("child_process");
const os = require("os");
const si = require("systeminformation");

let target = "control";

const appName = app.getName();
console.log("启动主进程。。。");

process.on("warning", e => console.warn(e.stack));
process.setMaxListeners(0); //设置listener上限为无限


if(appName !== "swos") {
  target = appName === "swos-control-center" ? "control" : appName === "swos-terminal" ? "terminal" : "single";
} else {
  target = (process.argv.length > 3) ? process.argv[3] : "control";
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;
let printWindow = null;
const LOGIN_WINDOW_WIDTH = 788;
const LOGIN_WINDOW_HEIGHT = 480;
let SCREEN_WIDTH = 1920;
let SCREEN_HEIGHT = 1080;
let alwaysOnTop = false;
let fullScreen = true;
let x = 0;
let y = 0;
let h = SCREEN_HEIGHT;
let w = SCREEN_WIDTH;
let imbedded = false;

function createWindow() {
  // Create the browser window.
  const point = screen.getCursorScreenPoint();
  const myScreen = screen.getDisplayNearestPoint(point);
  mainWindow = new BrowserWindow({
    width: 788,
    height: 440,
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    maximizable: false,
    useContentSize: false,
    resizable: true,
    center: true,
    fullscreenable: true,
    titleBarStyle: "default",
    screen: myScreen,
    webPreferences: {
      devTools: true,
      webSecurity: false,
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      autoHidMenuBar: true,
    }
  });


  mainWindow.once("ready-to-show", () => {
    mainWindow.focus();
    mainWindow.setFullScreen(fullScreen);
    mainWindow.setSize(w, h);
    mainWindow.setPosition(x, y);
  });

  protocol.interceptFileProtocol("sw-file", (req, callback) => {
    const url = req.url.substr(13);
    callback(decodeURI(url));
  });

  if (process.platform === "win32") {
    Menu.setApplicationMenu(null);
    // mainWindow.webContents.openDevTools();
    globalShortcut.register("CommandOrControl+r", () => {
      if (mainWindow !== null) mainWindow.reload();
    });
    globalShortcut.register("CommandOrControl+i", () => {
      if (mainWindow !== null) mainWindow.openDevTools();
    });
    globalShortcut.register("CommandOrControl+q", () => {
      if (mainWindow !== null) mainWindow.close();
      process.exit();
    });
  }
  globalShortcut.register("CommandOrControl+Shift+d", () => {
    if (mainWindow !== null) {
      mainWindow.openDevTools();
    }
  });
  // globalShortcut.register("CommandOrControl+Shift+i", () => {
  //   //do nothing
  // });

  // Emitted when the window is closed.
  mainWindow.on("closed", function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
    app.quit();
  });

  // and load the index.html of the app.
  mainWindow.loadURL(isDev ? "http://localhost:3000" : `file://${path.join(__dirname, "/index.html")}`);
}

app.on("ready", () => {
  const point = screen.getCursorScreenPoint();
  const myScreen = screen.getDisplayNearestPoint(point);
  SCREEN_WIDTH = myScreen.workAreaSize.width;
  SCREEN_HEIGHT = myScreen.workAreaSize.height;

  process.argv.map(a => {
    if (a.startsWith("redirect==")) {
      const redirectUrl = decodeURIComponent(a.split("==")[1]);
      global.sharedObject = {
        redirectUrl: redirectUrl,
      };
    }
    if (a.startsWith("imbedded")) {
      imbedded = true;
      fullScreen = false;
      x = 464;
      y = 0;
      w = SCREEN_WIDTH - 464;
      h = SCREEN_HEIGHT;
      alwaysOnTop = true;
    }
    return a;
  });
});

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  if(imbedded) {
    if(mainWindow) {
      mainWindow.close();
    }
    if (process.platform === "linux") {
      // app.commandLine.appendSwitch("disable-gpu");
      app.on("ready", () => setTimeout(createWindow, 500));
    } else {
      app.on("ready", createWindow);
    }
  } else {
    app.quit();
  }
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      mainWindow.close();
    }
  });

  if (process.platform === "linux") {
    app.commandLine.appendSwitch("disable-gpu");
    app.on("ready", () => setTimeout(createWindow, 500));
  } else {
    app.on("ready", createWindow);
  }
}

app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

ipcMain.on("new-print", (_, args) => {
  if (printWindow === null) {
    printWindow = new BrowserWindow({
      show: false,
      alwaysOnTop: true,
      webPreferences: {
        devTools: true,
        webSecurity: false,
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
      }
    });
    printWindow.setFullScreen(false);
    const printTmpl =
      isDev ? `file://${path.join(__dirname, "template.html")}`
        : `file://${path.join(__dirname, "../build/template.html")}`;

    printWindow.loadURL(printTmpl);

    printWindow.on("closed", function () {
      printWindow = null;
    });

    printWindow.webContents.on("dom-ready", () => {
      printWindow.webContents.send("ready", args);
    });
  } else {
    printWindow = null;
  }
});

ipcMain.on("print", event => {
  const { webContents } = BrowserWindow.fromWebContents(event.sender);
  webContents.print(
    { silent: false, printBackground: false, margins: { marginType: "none" } },
    (success, errorType) => {
      mainWindow.webContents.send("did-print", success, errorType);
      printWindow.close();
    }
  );
});

ipcMain.on("maxSze", () => {
  mainWindow.setFullScreen(true);
});

ipcMain.on("minSze", () => {
  mainWindow.setFullScreen(false);
  mainWindow.setSize(LOGIN_WINDOW_WIDTH, LOGIN_WINDOW_HEIGHT);
  const x = parseInt((SCREEN_WIDTH - LOGIN_WINDOW_WIDTH) / 2);
  const y = parseInt((SCREEN_HEIGHT - LOGIN_WINDOW_HEIGHT) / 2);
  mainWindow.setPosition(x, y);
});

ipcMain.on("toggleFullScreen", () => {
  if(mainWindow.fullScreen) {
    mainWindow.setFullScreen(false);
  } else {
    mainWindow.setFullScreen(true);
  }
});

ipcMain.on("open-save-dialog", (event, properties) => {
  const result = dialog.showSaveDialogSync(mainWindow, properties);
  event.sender.send("selectedDir", result);
});

process.on("uncaughtException", err => {
  console.log("主程序错误：", err);
});


const { SysCheckService } = require("./js/sys-check-service");
console.log("启动设备温度监测服务", target);


/**
 * 新日志数据的handler
 * data: 要推送的数据
 * type: 数据类型： error | status
 */
const newDataHandler = data => {
  //当有新的数据时，将数据推送到主窗口的渲染进程去处理
  if(data && data.length > 0) {
    mainWindow && mainWindow.webContents.send("newSysCheckData", "Status", data);
  }
};

SysCheckService.setDebug(false);
const service = new SysCheckService(newDataHandler);

// //检测数据库是否正确
// service.getLatestStatus(data => {
//   let check = false;
//   let exists = false; //数据库是否存在
//   if(!data || data.length < 1 || !data[0] || !data[0].dog) {
//     check = false;
//     console.error("设备监测数据库不存在！");
//   } else {
//     exists = true;
//     const dog = data[0].dog;
//     const md5Result = crypto.createHash("md5").update(dog).digest("hex");
//     if(md5Result.toLowerCase()  !== md5dog) {
//       check = false;
//       console.error("设备监测数据库标识错误！");
//     } else {
//       check = true;
//     }
//   }
//   if(!check) {
//     setTimeout(() => {
//       mainWindow && mainWindow.close();
//       if(!exists) {
//         dialog.showErrorBox("系统错误", "设备状态监测服务未启动，系统将停止运行！");
//       } else {
//         dialog.showErrorBox("系统错误", "设备授权标识错误，系统将停止运行！");
//       }
//       app.quit();
//       // process.exit();
//     }, 1000);
//   } else {
//     console.log("数据监测服务已启动。");
//   }
// });

// const getCpuTemperature = async () => {
//   exec("cat /sys/class/thermal/thermal_zone0/temp", (error, stdout, stderr) => {
//     if (error) {
//       console.error("执行获取CPU温度的命令失败:", error);
//     }
//     if (stderr) {
//       console.error("获取CPU温度失败:", error);
//     }
//     let temperature = 0;
//     if (stdout) {
//       const temp = parseInt(stdout.replaceAll(os.EOL, ""));
//       temperature = Math.round( temp / 1000);
//     }
//     if (temperature > 0) {
//       mainWindow && mainWindow.webContents.send("newSysCheckData", "CPU-TEMPER", {cpuTemperature: temperature});
//     }
//   });
// };

const getCpuTemperature = async () => {
  si.cpuTemperature().then(data => {
    const temperature = Math.round(data.main);
    if (temperature > 0) {
      mainWindow && mainWindow.webContents.send("newSysCheckData", "CPU-TEMPER", {cpuTemperature: temperature});
    }
  });
};

// 定期同步数据库
setInterval(() => {
  getCpuTemperature();
  service.getLatestStatus();
}, 5000);