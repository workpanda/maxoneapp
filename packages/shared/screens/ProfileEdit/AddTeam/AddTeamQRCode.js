import React, { Component } from "react";
import {
  View,
  KeyboardAvoidingView,
  TouchableOpacity,
  Image,
  ImageBackground,
  StyleSheet,
  Dimensions,
  Linking,
  Text,
  StatusBar,
  Vibration,
  AsyncStorage
} from "react-native";
// import QRCodeScaner from "react-native-qrcode-scanner";
// import {RNCamera, FaceDetector} from 'react-native-camera'
import ContextService from "@m1/shared/services/context";

import AppColors from "@assets/theme/colors";
import { BarCodeScanner, Permissions, Constants } from "expo";
import CommonStyles from "@m1/shared/theme/styles";
import { API } from "aws-amplify";

const focusImage = require("@m1/shared/assets/qr_focus.png");

const SCREEN_WIDTH = Dimensions.get("window").width;
const qrSize = SCREEN_WIDTH * 0.7;

class AddTeamQRCode extends Component {
  static navigationOptions = {
    header: null
  };
  constructor(props) {
    super(props);

    this.state = {
      invite_code: "",
      error: "",
      isScanned: false
    };

    this.mount = true;

    this.state = { hasCameraPermission: null };
  }

  componentWillUnmount() {
    this.mount = false;
  }

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);

    this.setState({ hasCameraPermission: status === "granted" });
  }

  componentWillReceiveProps(props) {
    if (!this.mount) return;
  }

  gotoBack = () => {
    this.props.navigation.goBack();
  };

  onSuccess = async ({ type, data }) => {
    await this.getTeamByInviteCode(data);
  };

  getTeamByInviteCode = async inviteCode => {
    if (this.state.isScanned) {
      return;
    }
    this.setState({ error: "" });
    var type = this.props.navigation.state.params.type;
    console.log("type = ", type);
    console.log("inviteCode = ", inviteCode);
    var team = null;
    try {
      if (type === "coach") {
        team = await this.getByCoachCode(inviteCode);
      } else {
        team = await this.getByPlayerCode(inviteCode);
      }
    } catch (e) {
      console.log("Error === ", e);
      alert(
        "We are experiencing a connectivity issue.  Please check your internet connection and try again."
      );
    }
    console.log("team ", team);
    if (!team || team.length === 0) {
      // try checking if its an athlete code.
      var checkTeam = null;

      if (type === "coach") {
        checkTeam = await this.getByPlayerCode(inviteCode);
      } else {
        checkTeam = await this.getByCoachCode(inviteCode);
      }

      if (!checkTeam || checkTeam.length === 0) {
        this.setState({
          error:
            "Sorry, we couldn't find a team with that code.  Please try again."
        });
      } else {
        this.setState({
          error: `Whoops. Looks like you're trying to use an ${
            type === "coach" ? "athlete" : "coach"
          } code.`
        });
      }
    } else {
      Vibration.vibrate(100);
      this.setState({ isScanned: true });
      var userContextString = await AsyncStorage.getItem("@M1:userContext");
      var userContext = JSON.parse(userContextString);
      var user = userContext.user;
      await this.createRole(team[0], user);
      alert(
        `Successfully added to team: ${
          team[0].customName ? team[0].customName : team[0].name
        }`
      );

      // get updated userContext

      await this.setSessionInfo(user.username);

      this.props.navigation.goBack();
    }
  };

  async createRole(team, user) {
    var type = this.props.navigation.state.params.type
    var role = {
      parentId: team.id,
      role: type,
      isTeam: true,
      tenant: Constants.manifest.slug
    };
    console.log("role ", role);

    return API.post("users", `/users/${user.id}/roles`, { body: role });
  }
  async getByPlayerCode(inviteCode) {
    return API.get("programs", `/programs/playerCode/${inviteCode}`);
  }
  async getByCoachCode(inviteCode) {
    return API.get("programs", `/programs/coachCode/${inviteCode}`);
  }

  _storeUserContext = async userContext => {
    try {
      if (userContext !== {}) {
        await AsyncStorage.setItem(
          "@M1:userContext",
          JSON.stringify(userContext)
        );
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
    return { user: userContext.user };
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

export default AddTeamQRCode;
