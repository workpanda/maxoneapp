# White Lightning
Automated scripting to develop, process, and build white labelled expo.io apps.

## Config file
A config file must be present to operate White Lightning. This file name shall respectively be called `wltg.config.js`.

When trying to add a new app project several proerties while be required in an object.
* `appName`: This will be the app name when you run the White Lightning CLI.
* `packageAssets`: This is the location of the brands assets to be overwritten.
* `packageConfig`: This is the location of the brands expo `app.json` file to be overwritten.
* `assets`: This is the location of the assets which will overwrite the assets of a particular app.
* `appConfig`: This is the location of the brands white labelled expo `app.json` file to be used for the app that you are developing.
* `prescript`: Runs any cli commands before doing the asset and `app.json` swap. e.g. clean up scripts
* `postscript`: Rungs any cli commands after doing the asset and `app.json` swap. e.g. build or run the app

Here's an example:
```
module.exports = {
  packages: [
  	...,
    {
      appName: "MaxOne",
      packageAssets: "./packages/maxone-app/src/assets",
      packageConfig: "./packages/maxone-app/app.json",
      assets: "./brands/maxone/assets",
      appConfig: "./brands/maxone/app.json",
      prescript: "",
      postscript: "yarn workspace maxone start-ios"
    },
    ...
  ]
}
```

## Running White Lightning
There are two ways to run white lightning.

1. `yarn wltg`: will give you a list of all the packages in the `wltg.config.js` file. You can use your keyboard arrows to select the app that you would like to run.
2. `yarn wltg MaxOne`: If you know the name of the app feel free to type it after the `wltg` commmand to skip the prompt.

## Building an .apk or .ipa file
Coming soon...

## File sync with watchman
Coming soon...

