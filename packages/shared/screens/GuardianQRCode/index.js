import React, { Component } from "react";
import {
  View,
  Text,
  Image,
  Alert,
  StatusBar,
  StyleSheet,
  Dimensions,
  AsyncStorage,
  ImageBackground,
  TouchableOpacity,
  Vibration
} from "react-native";

import AppColors from "@assets/theme/colors";
import { BarCodeScanner, Permissions } from "expo";
import CommonStyles from "@m1/shared/theme/styles";
import { API } from "aws-amplify"
import { Constants } from "expo";
import ContextService from "@m1/shared/services/context";

const focusImage = require("@m1/shared/assets/qr_focus.png");

const SCREEN_WIDTH = Dimensions.get("window").width;
const qrSize = SCREEN_WIDTH * 0.7;

class GuardianQRCode extends Component {
  static navigationOptions = {
    header: null
  };
  constructor(props) {
    super(props);

    this.mount = true;

    this.state = { hasCameraPermission: null, isScanned: false };
  }

  componentWillUnmount() {
    this.mount = false;
  }

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    var userContextString = await AsyncStorage.getItem("@M1:userContext");
    var userContext = JSON.parse(userContextString);
    this.setState({
      currentUser: userContext.user,
      hasCameraPermission: status === "granted"
    });
  }

  componentWillReceiveProps(props) {
    if (!this.mount) return;
  }

  gotoBack = () => {
    this.props.navigation.goBack();
  };

  onSuccess = async({ type, data }) => {
    await this.getUserById(data);
  };

  getUserById = async(userId)  => {
    var { isScanned } = this.state;
    if(isScanned){
      return
    }
    this.setState({error: ""})
    var athlete = await this.getAthleteUser(userId)
    if(!athlete || athlete.length === 0){
      Alert.alert("Sorry, we couldn't find that athlete.  Please try again.")
    }
    else{
      this.setState({isScanned: true})
      Vibration.vibrate(100);
      var guardianLink = await this.createGuardianLink(athlete.id)
      var userContextString = await AsyncStorage.getItem("@M1:userContext");
      var userContext = JSON.parse(userContextString);
      var user = userContext.user;
      alert(`Successfully linked to athlete: ${athlete.nameFirst} ${athlete.nameLast}` )

      // get updated userContext\
      await this.setSessionInfo(user.username)

      this.props.navigation.navigate("ParentView")
    }
  }

  async getAthleteUser(userId){
    return API.get("users", `/users/${userId}`);
  }

  createGuardianLink(athleteId){
    const { currentUser } = this.state;
    return API.post("users", `/guardian/${currentUser.id}/athlete/${athleteId}`);
  }

  _storeUserContext = async userContext => {
    try {
      if (userContext !== {}) {
        await AsyncStorage.setItem("@M1:userContext", JSON.stringify(userContext));
      }
    } catch (error) {
      console.error("error in store data", error);
      // Error saving data
    }
  };
  
  _storeAppContext = async appContext => {
    try {
      if (appContext !== {}) {
        await AsyncStorage.setItem("@M1:appContext", JSON.stringify(appContext));
      }
    } catch (error) {
      console.error("error in store data", error);
      // Error saving data
    }
  };


  setSessionInfo = async username => {
    const contextService = new ContextService();
    var { userContext, appContext } = await contextService.buildUserContext(
      username
    );
    console.log("USER CONTEXT =====``= ", userContext);
    await this._storeUserContext(userContext);
    appContext = await contextService.buildAppContext(userContext);
    console.log("appContext CONTEXT ====== ", appContext);
    var retrievedAppContext = await this._retrieveAppContext();
    //   Log.debug('retrievedAppContext retrievedAppContext ====== ', retrievedAppContext)

    if (
      retrievedAppContext &&
      _.find(userContext.appContextList, c => c.id === retrievedAppContext)
    ) {
      // set the app context to this id.
      const newAppContext = await contextService.changeAppContext(
        userContext,
        retrievedAppContext
      );
      console.log('newAppContext == ', newAppContext)
      appContext = newAppContext;
      // if not, then store the current appContext idea
    } else {
      console.log("appContext ===== ", appContext);
      await this._storeAppContext(appContext);
    }
    return userContext.user;
  };

  render() {
    return (
      <View style={CommonStyles.container}>
        <StatusBar barStyle="light-content" translucent={false} />
        <BarCodeScanner
          onBarCodeScanned={this.onSuccess}
          style={[StyleSheet.absoluteFill, styles.qr_container]}
          barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
        >
          <View style={styles.qr_focus}>
            <View style={styles.qr_focus_image}>
              <Image
                style={styles.qr_focus_image}
                source={focusImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.description_text_container}>
              <Text style={styles.description_text}>Scan QR Code</Text>
            </View>
          </View>
        </BarCodeScanner>
        <TouchableOpacity
          style={styles.cancel_container}
          onPress={this.gotoBack}
        >
          <Text style={styles.cancel_text}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

let style = {
  qr_container: {
    flex: 1,
    alignItems: "center",
    position: "relative"
  },
  qr_focus: {
    marginTop: 200,
    width: qrSize,
    height: qrSize,
    position: "relative"
  },
  qr_focus_image: {
    width: qrSize,
    height: qrSize
  },
  description_text_container: {
    width: "100%",
    height: "100%",
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    justifyContent: "center",
    alignItems: "center"
  },
  description_text: {
    color: "#fcfcfc"
  },
  cancel_text: {
    color: "#fcfcfc"
  },
  cancel_container: {
    position: "absolute",
    left: 0,
    bottom: 60,
    right: 0,
    paddingLeft: 25
  }
};

const styles = StyleSheet.create(style);

export default GuardianQRCode;
