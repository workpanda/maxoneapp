#!/usr/bin/env node
const program = require("commander");
const chalk = require("chalk");
const inquirer = require("inquirer");
const swapper = require("./utils/swapper");
const config = require("../../wltg.config.js");

program.version("0.1.0");

program.option(
  "-m, --mask [appName]",
  "Swap the current version of the app to [appName]"
);

program.parse(process.argv);

// No argument for the flag --mask was entered
if (program.mask === true) {
  console.log(
    chalk.bold.red(
      [
        "ERROR! Must provide argument to -m, --mask command.",
        "Example:",
        "\twltg --mask MyOtherVersion"
      ].join("\n")
    )
  );
  process.exit(1);
}

const getPromptQuestions = () => {
  try {
    const config = require("../../wltg.config.js");
    return [
      {
        type: "list",
        name: "build",
        message: "Choose the white label version to build as:",
        choices: config.packages.map(package => package.appName)
      }
    ];
  } catch (err) {
    console.log(chalk.red("ERROR! No wltg.config.js found in root directory."));
    process.exit(1);
  }
};

// User enters no arguments
if (process.argv.length === 2) {
  let appName;
  inquirer
    .prompt(getPromptQuestions())
    .then(({ build }) => {
      appName = build;
      console.log("⚡⚡⚡⚡ Starting White Lightning ⚡⚡⚡⚡");
      return swapper(build);
    })
    .then(() => {
      console.log(
        chalk.bold.green("Success! Build version applied: " + appName)
      );
      console.log("⚡⚡⚡⚡ White Lightning completed! ⚡⚡⚡⚡");
    })
    .catch(err => console.error(err));
}

// User enters an argument for --mask
if (program.mask !== undefined) {
  const [firstLetter, ...otherLetters] = program.mask;
  const capitalizedMaskName = firstLetter.toUpperCase() + otherLetters.join("");

  console.log("⚡⚡⚡⚡ Starting White Lightning ⚡⚡⚡⚡");
  swapper(capitalizedMaskName)
    .then(() => {
      console.log(
        chalk.bold.green(
          "Success! Build version applied: " + capitalizedMaskName
        )
      );
      console.log("⚡⚡⚡⚡ White Lightning completed. ⚡⚡⚡⚡");
    })
    .catch(err => console.error(err));
}
