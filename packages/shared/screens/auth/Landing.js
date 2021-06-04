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
  Platform,
  Alert
} from "react-native";
import CommonStyles from "@m1/shared/theme/styles";
import PolygonButton from "@m1/shared/components/PolygonButton";
import { Notifications } from "expo";
import Images from "@assets/images";
import AppColors from "@assets/theme/colors";

const { height, width } = Dimensions.get('window')

const DESIGN_SIZE = {
	WIDTH: 750,
	HEIGHT: 1334
}

class Landing extends Component {
  constructor(props) {
    super(props);

    this.mount = true;
  }

  componentDidMout(){
    // let subscription = Notifications.addListener(this.handleNotification);    
  }

  componentWillUnmount() {
    this.mount = false;
  }

  componentWillReceiveProps(props) {
    if (!this.mount) return;
  }

  gotoLogin = () => {
    this.props.navigation.navigate('AuthLogin', {isFromSignup: true})
  };

  gotoSignup = () => {
    this.props.navigation.navigate("AuthCreateAccount");
  };

  getFlexibleWidth(param) {
    return param * width / DESIGN_SIZE.WIDTH
  }

  getFlexibleHeight(param) {
    return param * height / DESIGN_SIZE.HEIGHT
  }

  render() {
    return (
      <ImageBackground
        style={CommonStyles.container}
        source={Images.bgLogin}
        imageStyle={CommonStyles.imageBackground}
      >
        <StatusBar barStyle="light-content" translucent={false} />
        {/* <OverlayStripe style={styles.overlay} />
                <Header navigation={navigation} navState={nav} />
                */}
        <View style={styles.logoContainer}>
          <View>
            <Image style={[styles.logoImage, {width: this.getFlexibleWidth(600)}]} source={Images.logoSplash} />
          </View>

        </View>
        <View style={[styles.buttonGroupContainer, {bottom: this.getFlexibleHeight(230)}]}>
          <PolygonButton
            title={"CREATE ACCOUNT"}
            customColor={AppColors.button.background}
            textColor={AppColors.button.text}
            onPress={this.gotoSignup}
          />
          <PolygonButton title={"LOG IN"} onPress={this.gotoLogin} />
        </View>
        <View style={[styles.maxoneContainer, {height: this.getFlexibleHeight(230)}]}>
          <Image style={{width:this.getFlexibleWidth(300), resizeMode: "contain"}} source={Images.poweredByMaxOne} />
        </View>
      </ImageBackground>
    );
  }
}

let btnStyles = {
  logoContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.3)"
  },
  logoImage: {
    marginBottom: 80,
    resizeMode: "contain"
  },
  buttonGroupContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    left: 20,
    right: 20,
    position: "absolute",
    
    zIndex:1000000000
  },
  maxoneContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    position:"absolute",
    bottom:0,
    
    width: "100%",
  },
};

const styles = StyleSheet.create(btnStyles);

export default Landing;
