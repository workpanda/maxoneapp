import React from "react";
import {
  ActivityIndicator,
  AsyncStorage,
  StatusBar,
  View,
  Text
} from "react-native";
import { API, Auth } from "aws-amplify";

export default class AuthLoading extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      needMoreInfo: false,
      image: null,
      nameFirst: "",
      nameLast: "",
      birthday: "2019-01-01",
      gender: "",
      weight: "",
      height: "",
      playingHand: ""
    };
    this._bootstrapAsync();
  }

  _bootstrapAsync = async () => {
    var userToken = await this._retrieveData();
    // console.log('User token ', userToken)
    if (userToken) {
      try {
        var username = userToken.username;
        // console.log('username', username)

        var userData = await this.getUserData(username);
        // console.log('User Data', userData)
        if (userData.error) {
          // SET FLAG NO USER
          console.log("NO USER DATA");
        } else {
          await this._storeData(JSON.stringify(userData));
          // console.log("stored data");
          // This will switch to the App screen or Auth screen and this loading
          // screen will be unmounted and thrown away.
          // console.log('User Data id', userData[0].id)

          this.props.navigation.navigate(
            "App",
            {},
            {
              type: "Navigate",
              routeName: "App",
              action: {
                type: "Navigate",
                routeName: "Home",
                params: {
                  userContext: userData[0],
                  username,
                  userId: userData[0].id,
                  avatarUrl: userData[0].avatarUrl
                }
              }
            }
          );
        }
      } catch (e) {
        console.log("error = ", e);
      }
    } else {
      this.props.navigation.navigate("AuthLanding");
    }
  };

  handleSignOut = async () => {
    console.log("Signing out");
    await Auth.signOut()
      .then(async () => {
        await AsyncStorage.removeItem("@M1:user");
        await AsyncStorage.removeItem("@M1:userToken");
        this._bootstrapAsync();
      })
      .catch(err => console.log(err));
  };

  async getUserData(username) {
    return API.get("users", `/users/username/${username}`);
  }

  componentDidMount = async () => {
    console.log("Auth Loading.......");
    await this._bootstrapAsync();
  };

  _storeData = async userData => {
    try {
      await AsyncStorage.setItem("@M1:user", userData[0]);
    } catch (error) {
      console.error("error in store data", error);
      // Error saving data
    }
  };

  _retrieveData = async () => {
    try {
      var value = await AsyncStorage.getItem("@M1:userToken");
      // console.log('Value ==== ', value)
      if (value !== null) {
        // We have data!!
        // console.log(value);
        value = JSON.parse(value);
        return value;
      }
    } catch (error) {
      // Error retrieving data
      console.error("error in retrieving data", error);
    }
  };
  // Render any loading content that you like here
  render() {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
        <StatusBar barStyle="default" />
        {/* <Text style={{ marginTop: 50 }}>Loading...</Text> */}
      </View>
    );
  }
}
