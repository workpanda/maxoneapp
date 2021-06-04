module.exports = {
  packages: [
    {
      appName: "MaxOne",
      appType: "m1",
      packageAssets: "./packages/maxone-app/src/assets",
      packageConfig: "./packages/maxone-app/app.json",
      assets: "./brands/maxone/assets",
      appConfig: "./brands/maxone/app.json",
      packageNavigation: "./packages/maxone-app/src/navigation",
      navigation: "./brands/maxone/navigation",
      packageScreens: "./packages/maxone-app/src/screens",
      screens: "./brands/maxone/screens",
      packageConstants: "./packages/maxone-app/src/constants",
      constants: "./brands/maxone/constants",
      prescript: "",
      postscript: "yarn workspace maxone start-ios"
    },
    {
      appName: "OSB",
      appType: "m1",
      packageAssets: "./packages/maxone-app/src/assets",
      packageConfig: "./packages/maxone-app/app.json",
      assets: "./brands/osb/assets",
      appConfig: "./brands/osb/app.json",
      packageNavigation: "./packages/maxone-app/src/navigation",
      navigation: "./brands/osb/navigation",
      packageScreens: "./packages/maxone-app/src/screens",
      screens: "./brands/osb/screens",
      packageConstants: "./packages/maxone-app/src/constants",
      constants: "./brands/osb/constants",
      prescript: "",
      postscript: "yarn workspace maxone start-ios"
    },
    {
      appName: "VNN",
      appType: "vnn",
      packageAssets: "./packages/vnn-app/src/assets",
      packageConfig: "./packages/vnn-app/app.json",
      assets: "./brands/vnn/assets",
      appConfig: "./brands/vnn/app.json",
      packageNavigation: "./packages/vnn-app/src/navigation",
      navigation: "./brands/vnn/navigation",
      packageScreens: "./packages/vnn-app/src/screens",
      screens: "./brands/vnn/screens",
      packageConstants: "./packages/vnn-app/src/constants",
      constants: "./brands/vnn/constants",
      prescript: "",
      postscript: "yarn workspace vnn start-ios"
    },
    {
      appName: "PGC",
      appType: "m1",
      packageAssets: "./packages/maxone-app/src/assets",
      packageConfig: "./packages/maxone-app/app.json",
      assets: "./brands/pgc/assets",
      appConfig: "./brands/pgc/app.json",
      packageNavigation: "./packages/maxone-app/src/navigation",
      navigation: "./brands/pgc/navigation",
      packageScreens: "./packages/maxone-app/src/screens",
      screens: "./brands/pgc/screens",
      packageConstants: "./packages/maxone-app/src/constants",
      constants: "./brands/pgc/constants",
      prescript: "",
      postscript: "yarn workspace maxone start-ios"
    }
  ]
};
