import React, { Component } from "react";
import {
  View,
  ImageBackground,
  StyleSheet,
  Text,
  StatusBar,
  Linking
} from "react-native";
import CommonStyles from "@m1/shared/theme/styles";
import PolygonButton from "@m1/shared/components/PolygonButton";
import { Constants } from "expo";
import Images from "@assets/images";
import AppColors from "@assets/theme/colors";

const privacyPolicyUrl = 'http://www.gomaxone.com/privacy/'
const serviceTermsUrl = 'http://www.gomaxone.com/terms-of-service/'

class CreateAccount extends Component {
  constructor(props) {
    super(props);

    this.mount = true;
  }

  componentWillUnmount() {
    this.mount = false;
  }

  componentWillReceiveProps(props) {
    if (!this.mount) return;
  }

  gotoAthlete = () => {
    this.props.navigation.navigate("AuthAthlete");
  };

  gotoParentSignup = () => {
      
    // this.props.navigation.navigate("AuthParentSignup");
    let signUpUrlForParent =
    Constants.manifest.slug == "pgc"
        ? `https://pgc.gomaxone.com/signup/parent`
        : Constants.manifest.slug == "osb"
        ? `https://onesoftball.gomaxone.com/signup/parent`
        : Constants.manifest.slug == "vnn"
        ? `https://app.gomaxone.com/signup/parent` //need to replace this with real, VNN signup link
        : `https://app.gomaxone.com/signup/parent`;

    Linking.openURL(signUpUrlForParent)

  };

  gotoCoach = () => {
    this.props.navigation.navigate("AuthCoach");
  };

  gotoBack = () => {
    this.props.navigation.goBack();
  };

  render() {
    return (
      <ImageBackground
        style={CommonStyles.container}
        source={Images.bgLogin}
        imageStyle={CommonStyles.imageBackground}
        blurRadius={30}
      >
        <StatusBar barStyle="light-content" translucent={false} />
        <View style={styles.logoContainer}>
          <View style={styles.buttonGroupContainer}>
            <Text style={styles.agreement}>
              {"By tapping Sign Up you agree to the"}
            </Text>
            <Text style={styles.agreement}>
              <Text style={styles.agreement_yellow} onPress={() => Linking.openURL(serviceTermsUrl)}>{"Terms of Service "}</Text>&
              <Text style={styles.agreement_yellow} onPress={() => Linking.openURL(privacyPolicyUrl)}>{" Privacy Policy"}</Text>
            </Text>
            <PolygonButton title={"ATHLETE"} onPress={this.gotoAthlete} />
            
            <PolygonButton title={"COACH"} onPress={this.gotoCoach} />
            <PolygonButton title={"PARENT"} onPress={this.gotoParentSignup} />
            <PolygonButton
              title={"CANCEL"}
              customColor={"transparent"}
              onPress={this.gotoBack}
              textColor="white"
            />
          </View>
        </View>
      </ImageBackground>
    );
  }
}

let style = {
  logoContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.4)"
  },
  buttonGroupContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    left: 20,
    right: 20,
    position: "absolute",
    bottom: 40
  },
  agreement: {
    color: "white",
    lineHeight: 25
  },
  agreement_yellow: {
    color: AppColors.brand.alpha
  }
};

const styles = StyleSheet.create(style);

export default CreateAccount;
