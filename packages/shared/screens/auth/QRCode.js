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
  StatusBar
} from "react-native";
// import QRCodeScaner from "react-native-qrcode-scanner";
// import {RNCamera, FaceDetector} from 'react-native-camera'

import AppColors from "@assets/theme/colors";
import { BarCodeScanner, Permissions } from "expo";
import CommonStyles from "@m1/shared/theme/styles";
import { API } from "aws-amplify"

const focusImage = require("@m1/shared/assets/qr_focus.png");

const SCREEN_WIDTH = Dimensions.get("window").width;
const qrSize = SCREEN_WIDTH * 0.7;

class QRCode extends Component {
  static navigationOptions = {
    header: null
  };
  constructor(props) {
    super(props);

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

  onSuccess = async({ type, data }) => {
    await this.getTeamByInviteCode(data);
  };

  getTeamByInviteCode = async(inviteCode)  => {
    this.setState({error: ""})
    var type = this.props.navigation.state.params.type;
    console.log('type = ', type)
    console.log('inviteCode = ', inviteCode)
    var team = null;
    if(type === "coach"){
      try{
        team = await this.getByCoachCode(inviteCode)
      }
      catch(e){
        console.log('Error === ', e)
        alert("We are experiencing a connectivity issue.  Please check your internet connection and try again.")
      }
      console.log('team ', team)
      if(!team || team.length === 0){
        // try checking if its an athlete code.
        var athleteTeam = await this.getByPlayerCode(inviteCode)
        if(!athleteTeam || athleteTeam.length === 0){
          alert("Sorry, we couldn't find a team with that code.  Please try again.")
        }
        else{
          alert("Whoops. Looks like you're trying to use an athlete code.")
        }
      }
      else{
        this.props.navigation.navigate("AuthCoachSignup", {team: team[0]})
      }
    }
    else{
      try{
        team = await this.getByPlayerCode(inviteCode)
      }
      catch(e){
        console.log('Error === ', e)
        alert("We are experiencing a connectivity issue.  Please check your internet connection and try again.")
      }
      console.log('team ', team)
      if(!team || team.length === 0){
        // try checking if its a coach code.
        var coachTeam = await this.getByCoachCode(inviteCode)
        if(!coachTeam || coachTeam.length === 0){
          alert("Sorry, we couldn't find a team with that code.  Please try again.")
        }
        else{
          alert("Whoops. Looks like you're trying to use a coach code.")
        }
      }
      else{
        this.props.navigation.navigate("AuthAthleteSignup", {team: team[0]})
      }
    }
  }

  async getByPlayerCode(inviteCode){
    return API.get('programs', `/programs/playerCode/${inviteCode}`);
  }
  async getByCoachCode(inviteCode){
    return API.get('programs', `/programs/coachCode/${inviteCode}`);
  }


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

export default QRCode;
