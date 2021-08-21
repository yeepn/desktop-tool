
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
        nsis: {
          oneClick: false,
          allowToChangeInstallationDirectory: true,
          shortcutName: "desktop-tool",
        },
        publish: ["gitee"],
      },
      nodeIntegration: true,
    },
  },
  configureWebpack: {
    externals: {},
  },
};
