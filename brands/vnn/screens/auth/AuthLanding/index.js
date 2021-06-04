import React, { PureComponent } from "react";
import {
  Image,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Platform,
  Linking,
  AsyncStorage
} from "react-native";
import Expo, { WebBrowser, Linking as ExpoLinking } from "expo";
import { Auth } from "aws-amplify";
import { withOAuth } from "aws-amplify-react-native";
import AppConfig from "@vnn/constants/config";

import appSyncConfig from "@vnn/constants/appsync"; // OPS
import { Rehydrated } from "aws-appsync-react"; // 4
import { ApolloProvider } from "react-apollo"; // 2
import { ApolloLink } from 'apollo-link';
import AWSAppSyncClient, { createAppSyncLink, createLinkWithCache } from "aws-appsync";

// assets
import Images from "@assets/images";

// components
import Button from "@vnn/components/Button";

const styles = StyleSheet.create({
  background: {
    flex: 1
  },
  logo: {
    width: 166,
    height: 50
  },
  AuthLandingButtonWrapper: {
    marginBottom: 67,
    paddingHorizontal: 60
  }
});

class AuthLanding extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      authState: "loading"
    };
  }

  componentDidMount() {
    console.log("on component mount");
    // // check the current user when the App component is loaded
    // Auth.currentAuthenticatedUser()
    //   .then(user => {
    //     console.log(user);
    //     this.props.navigation.navigate("App");
    //   })
    //   .catch(e => {
    //     console.log(e);
    //     this.setState({ authState: "signIn" });
    //   });
  }


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

  onPressGoToGroup = () => {
    this.props.navigation.navigate("GROUP");
  };

  render() {
    const { authState } = this.state;
    console.log('authState ', authState)
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
