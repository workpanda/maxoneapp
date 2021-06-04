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
import CommonStyles from "@m1/shared/theme/styles";
import PolygonButton from "@m1/shared/components/PolygonButton";

import Images from "@assets/images";
import AppColors from "@assets/theme/colors";

import { Feather } from "@expo/vector-icons";
class Athlete extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: "",
    headerTransparent: true,
    headerStyle: CommonStyles.athleteNavbarBackground,
    headerTitleStyle: CommonStyles.loginNavbarTitle,
    headerLeft: (
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{ marginLeft: 10 }}
      >
        <Feather name="arrow-left" size={24} color="white" />
      </TouchableOpacity>
    )
  });
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

  gotoQRCode = () => {
    this.props.navigation.navigate("AuthQRCode", { type: "athlete" });
  };

  gotoMyCode = () => {
    this.props.navigation.navigate("AuthMyCode", { type: "athlete" });
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
              {"If you received an invite via email or text message, go find it and click the link again, Otherwise, scan or type your invite code here."}
            </Text>
            
            <PolygonButton
              customColor={AppColors.button.background}
              textColor={AppColors.button.text}
              title={"SCAN QR CODE"}
              onPress={this.gotoQRCode}
            />
            <PolygonButton
              customColor={AppColors.button.background}
              textColor={AppColors.button.text}
              title={"TYPE MY CODE"}
              onPress={this.gotoMyCode}
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
    bottom: 60
  },
  agreement: {
    color: "white",
    lineHeight: 20,
    paddingLeft: 10,
    paddingRight: 10
  }
};

const styles = StyleSheet.create(style);

export default Athlete;
