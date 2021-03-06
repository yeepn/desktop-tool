"use strict";

import { app, protocol, BrowserWindow, screen, ipcMain } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
const isDevelopment = process.env.NODE_ENV !== "production";
const { dialog } = require('electron')
const {exec} = require("child_process")
import { initExtra, createTray } from "@/utils/backgroundExtra";

import { autoUpdater } from "electron-updater";

import pkg from "../package.json";
let win;
let bounds;
let size;
if (app.requestSingleInstanceLock()) {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    if (win) {
      setPosition();
    }
  });
} else {
  app.quit();
}

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 446,
    height: 505,
    minWidth: 446,
    minHeight: 354,
    type: "dock",
    frame: false,
    title: pkg.name,
    //resizable: false,
    minimizable: false,
    maximizable: false,
    skipTaskbar: true,
    //closable: false,
    //show: false,
    transparent: true,
    alwaysOnTop: true,
    useContentSize: true,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
    },
  });

  setPosition();
  bounds = win.getBounds();
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
    autoUpdater.checkForUpdatesAndNotify();
  }
  // win.once("ready-to-show", () => {
  //   win.show();
  // });

  //屏蔽windows原生右键菜单
  if (process.platform === "win32") {
    //int WM_INITMENU = 0x116;
    //当一个下拉菜单或子菜单将要被激活时发送此消息，它允许程序在它显示前更改菜单，而不要改变全部
    win.hookWindowMessage(278, function(e) {
      win.setEnabled(false); //窗口禁用

      setTimeout(() => {
        win.setEnabled(true); //窗口启用
      }, 100); //延时太快会立刻启用，太慢会妨碍窗口其他操作，可自行测试最佳时间

      return true;
    });


  }

  win.on("closed", () => {
    win = null;
  });
}

//闪烁问题
app.commandLine.appendSwitch("wm-window-animations-disabled");

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) init();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  // if (isDevelopment && !process.env.IS_TEST) {
  //   // Install Vue Devtools
  //   try {
  //     await installExtension(VUEJS_DEVTOOLS);
  //   } catch (e) {
  //     console.error("Vue Devtools failed to install:", e.toString());
  //   }
  // }
  size = screen.getPrimaryDisplay().workAreaSize;
  init();

});

function init() {
  setTimeout(() => {
    createWindow();
  }, 1500);  //延时1.5s 更短也许也能行，具体看硬件
  initExtra();
  createTray(showWindow);
}

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}

function setPosition() {
  const size = screen.getPrimaryDisplay().workAreaSize;
  const winSize = win.getSize();
  win.setPosition(size.width - winSize[0]+20, 30);
}

function showWindow() {
  if (!win.isVisible()) win.show();
}
//设置壁纸,目前只支持meta ，传如图片url

async function setWallPaperViaUrl(url){
  var timestamp = (new Date()).valueOf();
  exec(`eval wget ${url} -O /home/$USER/Pictures/${timestamp}.jpg&&dconf write /org/mate/desktop/background/picture-filename "'/home/$USER/Pictures/${timestamp}.jpg'"`,
      (error, stdout, stderr) => {
        if(error==null)
          dialog.showMessageBox({message:"更换成功"});
        else
          dialog.showMessageBox({message:"error",detail:stderr});
      })
}



ipcMain.handle("hideWindow", (event) => {
  win.hide();
});

//ipc主进程处理函数
ipcMain.handle("setWallPaperViaUrl",(event,url)=>setWallPaperViaUrl(url));
//鼠标移入时，将窗口归位
ipcMain.handle("winShow",()=>{
  if (size.width-bounds.x-bounds.width>20) return;
  win.setBounds({width:bounds.width,x:size.width+15-bounds.width});
})
//鼠标移出时窗口归位，要保证归位窗口起始位置必须贴边显示，否则
ipcMain.handle("winHide",()=>{
  bounds = win.getBounds();
  //移出后首先保存位置，然后移动窗口
  if (size.width-bounds.x-bounds.width>20) return;
  win.setBounds({x:size.width-15});
})