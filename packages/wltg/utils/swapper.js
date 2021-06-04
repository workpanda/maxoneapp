const chalk = require("chalk");
const replace = require("replace");
const fs = require("fs-extra");
const util = require("util");
const opn = require("opn");
// const exec = util.promisify(require("child_process").exec);
const { exec } = require("child_process");
const execSync = require("child_process").execSync;
const config = require("../../../wltg.config.js");

const changeProjectSubfolderName = async (baseFolder, newFolderName) => {
  console.log(chalk.bold.blue("📂  Configuring app"));
  await fs.move(baseFolder, newFolderName, { overwrite: true });
};

const removeOldProjectSubfolder = async oldFolder => {
  await fs.remove(oldFolder);
};

const copyAssets = async (assetPath, copyToPath) => {
  console.log(chalk.bold.blue("🎫  Bundling assets from " + assetPath + " to " + copyToPath));
  await fs.copy(assetPath, copyToPath, { overwrite: true });
};

const removeAssets = async assetPath => {
  console.log(chalk.bold.blue("🗑  Remove assets from " + assetPath));
  await fs.remove(`${assetPath}`);
};

const emptyAssets = async assetPath => {
  console.log(chalk.bold.blue("🗑  Empty assets from " + assetPath ));
  await fs.emptyDir(`${assetPath}`);
};

const addPackageJson = async (assets, type) => {
  if (type === "vnn")
    await fs.writeJson(`${assets}/package.json`, { name: "@assets" });
  else
    await fs.writeJson(`${assets}/package.json`, { name: "@assets" });
};
const addNavigationPackageJson = async (path, type) => {
  if (type === "vnn")
    await fs.writeJson(`${path}/package.json`, { name: "@vnnNavigation" });
  else
    await fs.writeJson(`${path}/package.json`, { name: "@navigation" });
};

const addScreensPackageJson = async (path, type) => {
  if (type === "vnn")
    await fs.writeJson(`${path}/package.json`, { name: "@vnnScreens" });
  else
    await fs.writeJson(`${path}/package.json`, { name: "@screens" });

};

const addConstantsPackageJson = async (path, type) => {
  if (type === "vnn")
    await fs.writeJson(`${path}/package.json`, { name: "@vnnConstants" });
  else
    await fs.writeJson(`${path}/package.json`, { name: "@constants" });
};

const preScript = async pre => {
  await exec(pre);
};

const postScript = async post => {
  const processing = exec(post);

  processing.stdout.on("data", function(data) {
    console.log(data);
  });
  // process.exit(1);
};

const init = async newAppName => {
  const newPackage = config.packages.find(
    package => package.appName.toLowerCase() === newAppName.toLowerCase()
  );
  if (!newPackage) {
    throw new Error(
      [
        "Failed to find package settings for the target build in your wltg.config.js file.",
        "Check the wltg.config.js config and be sure that your current settings are present."
      ].join(" ")
    );
    process.exit(1);
  }

  // remove assets
  for (let i = 0; i < config.packages.length; i++) {
    await emptyAssets(config.packages[i].packageAssets);
  }

  await removeAssets(newPackage.packageConfig);

  // - copy assets
  await copyAssets(newPackage.assets, newPackage.packageAssets);
  // - write app.json
  await copyAssets(newPackage.appConfig, newPackage.packageConfig);
  await addPackageJson(newPackage.packageAssets, newPackage.appType);

  // // - copy navigation
  // await copyAssets(newPackage.navigation, newPackage.packageNavigation);
  // await addNavigationPackageJson(newPackage.packageNavigation, newPackage.appType);
  //
  // // - copy screens
  // await copyAssets(newPackage.screens, newPackage.packageScreens);
  // await addScreensPackageJson(newPackage.packageScreens, newPackage.appType);
  //
  // // - copy constants
  // await copyAssets(newPackage.constants, newPackage.packageConstants);
  // await addConstantsPackageJson(newPackage.packageConstants, newPackage.appType);

  await postScript(newPackage.postscript);
  await opn("http://localhost:19002");
  // process.exit(1);
};

module.exports = init;
