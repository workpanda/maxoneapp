import React from "react";
import {
  AsyncStorage,
  Image,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Button
} from "react-native";

import _ from "lodash";
import { Auth, API } from "aws-amplify";
// import Carousel from 'react-native-banner-carousel';

// assets
// import Images from '@assets/images';
// import { AppColors, AppStyles, AppSizes, AppFonts } from '@assets/theme';

// components
// import Button from '@components/ui/Button';
// import Spacer from '@components/ui/Spacer';
// import Text from '@components/ui/Text';

const styles = StyleSheet.create({
  background: {
    flex: 1
  },
  carouselTitle: {
    // ...AppFonts.lora.regular,
    color: "white",
    paddingBottom: 10,
    fontSize: 28
  },
  carouselDescription: {
    // ...AppFonts.openSans.bold,
    fontSize: 14,
    lineHeight: 24,
    color: "white"
  }
});

class AuthLanding extends React.Component {
  constructor(props) {
    super(props);

    this.mount = true;
    this.state = {
      username: "",
      currentTeam: {}
    };
  }

  componentWillUnmount() {
    this.mount = false;
  }

  componentDidMount = async () => {
    var userContextString = await AsyncStorage.getItem("@M1:userContext");
    var appContextString = await AsyncStorage.getItem("@M1:appContext");
    var userContext = JSON.parse(userContextString);
    var appContext = JSON.parse(appContextString);
    this.setState({ username: userContext.user.username });
    //   console.log('userContextString = ', userContextString)
    //   console.log('userContext = ', userContext)
    //   console.log('username = ', userContext.user.username)
    const currentTeam = _.find(
      userContext.appContextList,
      c => c.id === appContext.id
    );
    this.setState({ currentTeam: currentTeam });

    var result = await this.getAthletes(currentTeam.id);

    // console.log("=========*****=========");
    // console.log(result);
    // console.log("=========*****=========");
  };

  getAthletes = async id => {
    return API.get("programs", `/programs/${id}/players`);
  };

  onPressGoToGroup = () => {
    this.props.navigation.navigate("GROUP");
  };
  handleSignOut = async () => {
    await Auth.signOut()
      .then(async () => {
        try {
          await AsyncStorage.removeItem("@M1:user");
          await AsyncStorage.removeItem("@M1:userToken");
        } catch (e) {
          console.log("e ", e);
        }
        this.props.navigation.navigate("Auth");
      })
      .catch(err => console.log(err));
  };

  render() {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Hello {this.state.username}</Text>
        <Text>
          Current Team Id:{" "}
          {this.state.currentTeam && this.state.currentTeam.id
            ? this.state.currentTeam.id
            : ""}
        </Text>
        <Text>
          Current Team Name:{" "}
          {this.state.currentTeam && this.state.currentTeam.name
            ? this.state.currentTeam.name
            : ""}
        </Text>
        <Button
          onPress={() => this.onPressGoToGroup()}
          title="Go to Group"
          color="#000"
        />
        <Button
          onPress={() => this.handleSignOut()}
          title="Logout"
          color="#000"
        />
      </View>
    );
  }
}

export default AuthLanding;
