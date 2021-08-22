
module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        appId: "desktop-tool",
        productName: "desktop-tool",
        copyright: "Copyright © 2021 ",
        win: {
          icon: "./public/logo1.ico",
          target: "nsis",
        },
        linux: {
          "target": [
            "deb",
            "AppImage"
          ]
        },
        nsis: {
          oneClick: false,
          allowToChangeInstallationDirectory: true,
          shortcutName: "desktop-tool",
        },
        
      },
      nodeIntegration: true,
    },
  },
  configureWebpack: {
    externals: {},
  },
};
