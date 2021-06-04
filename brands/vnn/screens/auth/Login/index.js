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
  StatusBar,
  Dimensions,
  AsyncStorage,
  ActivityIndicator
} from "react-native";
import Expo, { WebBrowser, Linking as ExpoLinking } from "expo";
import Amplify, { Auth, Hub } from "aws-amplify";
import { withOAuth } from "aws-amplify-react-native";
import AppConfig from "@vnn/constants/config";

import appSyncConfig from "@vnn/constants/appsync"; // OPS
import { Rehydrated } from "aws-appsync-react"; // 4
import { ApolloProvider } from "react-apollo"; // 2
import { ApolloLink } from "apollo-link";
import AWSAppSyncClient, {
  createAppSyncLink,
  createLinkWithCache
} from "aws-appsync";
import ContextService from "@m1/shared/services/context";
import _ from "lodash";
import { API } from "aws-amplify";

// assets
import Images from "@assets/images";

// components
import Button from "@vnn/components/Button";
import CommonStyles from "@m1/shared/theme/styles";
import PolygonButton from "@m1/shared/components/PolygonButton";
import AppColors from "@assets/theme/colors";
var RCTNetworking = require('RCTNetworking')

const { height, width } = Dimensions.get('window')

const IS_ANDROID = Platform.OS === 'android'

const DESIGN_SIZE = {
	WIDTH: 750,
	HEIGHT: 1334
}

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
  },
  logoContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.3)"
  },
  logoImage: {
    marginBottom: 250,
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
});

class Login extends PureComponent {
  constructor(props) {
    super(props);
    Hub.listen('auth', (data) => {
      // The Auth module will emit events when user signs in, signs out, etc
      const { channel, payload, source } = data;
      if (channel === "auth") {
        switch (payload.event) {
          case "signIn":
              Auth.currentAuthenticatedUser()
                .then(user => {
                  var username = user.username;
                  try {
                    var idToken = user.signInUserSession.idToken
                    var identities = idToken.payload.identities
                    var userInfo = identities[0]
                    this.getUserData(userInfo.userId).then(userData =>{
                      var username = userData.username ? userData.username : ""

                      this.setSessionInfo(userInfo.userId, "vnn").then(() =>{
                        AsyncStorage.setItem('@M1:userToken', JSON.stringify(user)).then(()=>{
                          this.setState({ authState: "signedIn" });
                          this.props.navigation.navigate("App");
                        });
                      })
                    }).catch(e =>{
                      console.log('Failed = ', e)
                      Auth.signOut()
                        .then(() => {
                          try {
                            AsyncStorage.removeItem("@M1:user");
                            AsyncStorage.removeItem("@M1:userToken");
                            Linking.canOpenURL("https://teammate.getvnn.com").then(supported => {
                              if (supported) {
                                Linking.openURL("https://teammate.getvnn.com");
                              } else {
                                console.log("Don't know how to open URI: " + "https://teammate.getvnn.com");
                              }
                            });
                          } catch (e) {
                            console.log("e ", e);
                          }
                        })
                        .catch(err => console.log(err));
                    })
                  } catch (e) {
                    console.log("e ", e);
                  }
                })
                .catch(e => {
                  console.log("Error ====>", e);
                  this.setState({ authState: "signIn" });
                });
            break;
          case "implicitFlow":
            this.setState({loading:true})
            break;
          case "signIn_failure":
            this.setState({ authState: "signIn" });
            this.setState({loading:false})
            break;
          default:
            break;
        }
      }
    })
    this.state = {
      authState: "loading",
      loading:false
    };
  }

  async componentDidMount() {
    console.log("on component mount");
    // check the current user when the App component is loaded
    RCTNetworking.clearCookies((cleared) => {
      console.log('Cookies cleared, had cookies=' + cleared.toString())
    })
    await Auth.currentAuthenticatedUser()
      .then(async user => {

        try{
          console.log("user", user);
          // var username = user.username;
          var idToken = user.signInUserSession.idToken
          var identities = idToken.payload.identities
          console.log("user idToken  --- ", idToken)
          console.log("user identities  --- ", identities)
          var userInfo = identities[0]
          console.log('USER userInfo === ', userInfo)
          var userData = await this.getUserData(userInfo.userId)
          console.log('USER DATA === ', userData)
          var username = userData.username ? userData.username : ""
          console.log('username ', username)
          await this.setSessionInfo(userData.id, "vnn")
          console.log('completed set context')
          await AsyncStorage.setItem('@M1:userToken', JSON.stringify(user));
          console.log('completed set user token')
          // await this.setSessionInfo(username)
          // console.log('completed set context')
          // await AsyncStorage.setItem('@M1:userToken', JSON.stringify(user));
          // console.log('completed set user token')

          this.props.navigation.navigate("App");
        }
        catch(e){
          console.log('Error ==> ', e)
          await Auth.signOut()
            .then(async () => {
              try {
                await AsyncStorage.removeItem("@M1:user");
                await AsyncStorage.removeItem("@M1:userToken");
                Linking.canOpenURL("https://teammate.getvnn.com").then(supported => {
                  if (supported) {
                    Linking.openURL("https://teammate.getvnn.com");
                  } else {
                    console.log("Don't know how to open URI: " + "https://teammate.getvnn.com");
                  }
                });
              } catch (e) {
                console.log("e ", e);
              }
            })
            .catch(err => console.log(err));
        }
      })
      .catch(e => {
        console.log(e);
        this.setState({ authState: "signIn" });
      });
  }

  async getUserData(userId){
    try{
      console.log('userId ', userId)
      return API.get('users', `/users/vnn-${userId}`)
    }
    catch(e){
      console.log('ERROR ', e)
    }
  }

  setSessionInfo = async (userId, tenant) => {
    try{
      const contextService = new ContextService();
      var { userContext, appContext } = await contextService.buildUserContext(
        userId, tenant
      );
      console.log("USER CONTEXT =====``= ", userContext);
      await this._storeUserContext(userContext);
      appContext = await contextService.buildAppContext(userContext);
      console.log("appContext CONTEXT ====== ", appContext);
      var retrievedAppContext = await this._retrieveAppContext();

      if (
        retrievedAppContext &&
        _.find(userContext.appContextList, c => c.id === retrievedAppContext)
      ) {
        // set the app context to this id.
        const newAppContext = await contextService.changeAppContext(
          userContext,
          retrievedAppContext
        );
        appContext = newAppContext;
        // if not, then store the current appContext idea
      } else {
        await this._storeAppContext(appContext);
      }
      return { user: userContext.user, appContext };
    }
    catch(e){
      console.log('Error = ', e)
    }
  };
  _storeAppContext = async appContext => {
    try {
      if (appContext !== {}) {
        await AsyncStorage.setItem(
          "@M1:appContext",
          JSON.stringify(appContext)
        );
      }
    } catch (error) {
      console.error("error in store data", error);
      // Error saving data
    }
  };
  _retrieveAppContext = async () => {
    try {
      const value = await AsyncStorage.getItem("@M1:appContext");
      if (value !== null) {
        // We have data!!
        console.log(value);
        return value;
      }
    } catch (error) {
      // Error retrieving data
      console.error("error in retrieving data", error);
    }
  };
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
  _retrieveUserContext = async () => {
    try {
      const value = await AsyncStorage.getItem("@M1:userContext");
      if (value !== null) {
        // We have data!!
        console.log(value);
        return value;
      }
    } catch (error) {
      // Error retrieving data
      console.error("error in retrieving data", error);
    }
  };

  getFlexibleWidth(param) {
    return param * width / DESIGN_SIZE.WIDTH
  }

  getFlexibleHeight(param) {
    return param * height / DESIGN_SIZE.HEIGHT
  }

  render() {
    const { authState, loading } = this.state;
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
          {
            loading && <ActivityIndicator size="large" style={{zIndex: 1000000}} color={AppColors.brand.alpha} />
          }
          {
            !loading &&
            <PolygonButton
              customColor={AppColors.button.background}
              textColor={AppColors.button.text}
              title={"LOG IN"}
              onPress={this.props.hostedUISignIn}
            />
          }
          </View>
          {/* <View style={[styles.maxoneContainer, {height: this.getFlexibleHeight(230)}]}>
            <Image style={{width:this.getFlexibleWidth(300), resizeMode: "contain"}} source={Images.poweredByMaxOne} />
          </View> */}
        </ImageBackground>
    );
  }
}

export default withOAuth(Login);
