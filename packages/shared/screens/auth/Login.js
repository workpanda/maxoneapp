import React, { Component } from "react";
import {
  View,
  KeyboardAvoidingView,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Platform,
  AsyncStorage,
  Alert,
  ActivityIndicator,
  Dimensions,
  Text,
  Keyboard
} from "react-native";
import CommonStyles from "@m1/shared/theme/styles";
import PolygonButton from "@m1/shared/components/PolygonButton";
import Modal from "react-native-modal";

import { Permissions, Notifications, Constants, Linking } from "expo";

import ContextService from "@m1/shared/services/context";
import _ from "lodash";
import { Auth, API } from "aws-amplify";
import AppColors from "@assets/theme/colors";

import FloatingLabel from "react-native-floating-labels";

import { Feather } from "@expo/vector-icons";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

const INPUT_USERNAME = 1;
const INPUT_PASSWORD = 2;
const INPUT_CONFIRMATION_CODE = 3;

class Login extends Component {
  static navigationOptions = ({ navigation }) => {
    var isFromSignup = navigation.getParam("isFromSignup", false);
    console.log("isFromSignup ", isFromSignup);
    return {
      title: "LOG IN",
      headerStyle: CommonStyles.lightNavbarBackground,
      headerTitleStyle: CommonStyles.lightNavbarTitle,
      headerLeft: isFromSignup ? (
        <TouchableOpacity
          onPress={() => navigation.navigate("AuthLanding")}
          style={{ marginLeft: 10 }}
        >
          <Feather name="arrow-left" size={24} color="#454545" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginLeft: 10 }}
        >
          <Feather name="arrow-left" size={24} color="#454545" />
        </TouchableOpacity>
      ),
      headerRight: <View />
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      user: null,
      username: "",
      password: "",
      loading: false,
      newPassword: "",
      confirmationCode: "",
      showNewPassword: false,
      showCode: false,
      message: ""
    };

    this.mount = true;
  }

  componentWillUnmount() {
    this.mount = false;
  }

  componentWillReceiveProps(props) {
    if (!this.mount) return;
  }

  componentDidMount() {
    var message = this.props.navigation.getParam("message", "");
    this.setState({ message });
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('Initial url is: ' + url);
      }
    }).catch(err => console.error('An error occurred', err));

  }

  _onChangeInputValue = (value, key) => {
    if (!this.mount) return false;

    switch (key) {
      case INPUT_USERNAME:
        this.setState({ username: value });
        break;
      case INPUT_PASSWORD:
        this.setState({ password: value });
        break;
      case INPUT_CONFIRMATION_CODE:
        this.setState({ confirmationCode: value });
        break;
    }
    return true;
  };
  handleForgotPassword = async () => {
    Keyboard.dismiss();
    this.props.navigation.navigate("AuthForgotPassword");
  };

  handleSignIn = async () => {
    const { username, password } = this.state;
    Keyboard.dismiss();
    if (username.trim() == "") {
      Alert.alert("Error", `Please input username.`);

      return;
    }

    if (password.trim() == "") {
      Alert.alert("Error", `Please input password.`);

      return;
    }

    this.setState({ loading: true });
    try {
      await Auth.signIn(username, password)
        // If we are successful, navigate to Home screen
        .then(async user => {
          console.log("user", user);
          if (user.challengeName === "NEW_PASSWORD_REQUIRED") {
            this.setState({
              user: user,
              showNewPassword: true,
              loading: false,
              password: ""
            });
          } else {
            // console.log('Resetting password')
            var user = await this.setSessionInfo(username);
            const { status: existingStatus } = await Permissions.getAsync(
              Permissions.NOTIFICATIONS
            );
            let finalStatus = existingStatus;
            let expoToken = null;

            if(Platform.OS === 'android') {
                let channel = {
                    name: Constants.manifest.slug,
                    description: Constants.manifest.slug,
                    sound: true,
                    vibrate: true,
                    badge: true
                }
                console.log(channel);

                var result = await Notifications.createChannelAndroidAsync('chat-badge', channel);

                console.log(result);
            }

            // if (existingStatus !== "granted") {
            //   // Android remote notification permissions are granted during the app
            //   // install, so this will only ask on iOS
            //   const { status } = await Permissions.askAsync(
            //     Permissions.NOTIFICATIONS
            //   );
            //   finalStatus = status;
            //   expoToken = await Notifications.getExpoPushTokenAsync();
            //   let newTokenObject = {
            //     installationId: Constants.installationId,
            //     token: expoToken
            //   };
            //   user.pushNotificationTokens = user.pushNotificationTokens
            //     ? user.pushNotificationTokens
            //     : [];
            //   user.pushNotificationTokens = [
            //     ...user.pushNotificationTokens,
            //     newTokenObject
            //   ];

            //   // save user with push token
            //   const savedUser = await this.saveUser(user);
            //   userContext.user = user;
            //   await this._storeUserContext(userContext);
            // }

            console.log("completed set context");
            await AsyncStorage.setItem("@M1:userToken", JSON.stringify(user));
            console.log("completed set user token");
            this.setState({ loading: false });
            this.props.navigation.navigate("App");
          }
        })
        // On failure, display error in console
        .catch(err => {
            this.setState({ loading: false });
          if (err.code === "PasswordResetRequiredException") {

            Alert.alert("Error", err.message);
            this.handleForgotPassword();
          } else if (
            err.code === "UserNotFoundException" ||
            err.code === "NotAuthorizedException"
          ) {

            Alert.alert("Error", err.message);
            throw Error(`Username or Password is incorrect.`);
          }
        });
    } catch (e) {
      console.log("error === ", e);
    }
  };

  handleNewPasswordSubmit = async () => {
    this.setState({ loading: true });

    try {
      if (this.state.forgotPasswordVisible) {
        await Auth.forgotPasswordSubmit(
          this.state.username,
          this.state.confirmationCode,
          this.state.password
        )
          .then(data => {
            console.log("Forgot password submitted ", data);
            this.setState({
              password: this.state.password,
              forgotPasswordVisible: false
            });
          })
          .catch(e => console.log("ERROR => ", e));
      } else {
        console.log("this.state.newPassword ", this.state.password);
        console.log("this.state.user ", this.state.user);
        console.log("Auth.completeNewPassword ");

        await Auth.completeNewPassword(this.state.user, this.state.password)
          .then(async () => {
            this.setState({
              password: this.state.password,
              showNewPassword: false
            });
            await this.handleSignIn();
          })
          .catch(e => {
            console.log("ERROR => ", e);
          });
      }
    } catch (e) {
      alert(e.message);
      this.setState({ loading: false });
    }
  };

  handleConfirmationCode = () => {
    const { username, confirmationCode } = this.state;
    Auth.confirmSignUp(username, confirmationCode, {})
      .then(() => {
        console.log("Success - ");
        this.setState({ modalVisible: false, selectedIndex: 1 });
        // this.props.navigation.navigate('AuthLoading')
      })
      .catch(err => {
        alert("Error", err.message);
        console.log(err);
      });
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
      console.log("newAppContext == ", newAppContext);
      appContext = newAppContext;
      // if not, then store the current appContext idea
    } else {
      console.log("appContext ===== ", appContext);
      if (appContext.id) {
        await this._storeAppContext(appContext);
      }
    }
    return userContext.user;
  };

  async saveUser(user) {
    return API.post("users", "/users", {
      body: user
    });
  }

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

  render() {
    return (
      <SafeAreaView style={CommonStyles.container}>
        <StatusBar barStyle="dark-content" translucent={false} />
        <KeyboardAvoidingView
          behavior={Platform.OS == "android" ? undefined : "padding"}
          style={CommonStyles.container}
        >
          {!this.state.showNewPassword ? (
            <View style={styles.loginContainer}>
              <Text style={styles.label}>{this.state.message}</Text>
              <FloatingLabel
                labelStyle={styles.labelInput}
                inputStyle={styles.input}
                style={styles.formInput}
                value={this.state.username}
                autoCapitalize={false}
                autoCorrect={false}
                onChangeText={text =>
                  this._onChangeInputValue(text, INPUT_USERNAME)
                }
              >
                {"Username"}
              </FloatingLabel>
              <FloatingLabel
                autoCapitalize={"none"}
                autoCorrect={false}
                labelStyle={styles.labelInput}
                inputStyle={styles.input}
                style={styles.formInput}
                value={this.state.password}
                password
                onChangeText={text =>
                  this._onChangeInputValue(text, INPUT_PASSWORD)
                }
              >
                {"Password"}
              </FloatingLabel>
              <View style={styles.buttonGroupContainer}>
                <PolygonButton
                  title={"FORGOT PASSWORD"}
                  onPress={() => this.handleForgotPassword()}
                />
                <PolygonButton
                  title={"LOG IN"}
                  customColor={AppColors.button.background}
                  textColor={AppColors.button.text}
                  onPress={() => this.handleSignIn()}
                />
              </View>
            </View>
          ) : (
            <View
              visible={this.state.showNewPassword}
              onClose={() => this.setState({ showNewPassword: false })}
              animationType={"slide"}
            >
              <View style={styles.loginContainer}>
                <View style={styles.heading}>
                  <Text style={styles.headingText}>{"New Password Required"}</Text>
                  <Text style={styles.label}>{this.state.message}</Text>
                  <View style={styles.logo} />
                </View>
                {this.state.showCode ? (
                  <View
                    style={[
                      styles.inputContainer,
                      styles.usernameInputContainer
                    ]}
                  >
                    <FloatingLabel
                      autoCapitalize={"none"}
                      autoCorrect={false}
                      labelStyle={styles.labelInput}
                      inputStyle={styles.input}
                      style={styles.formInput}
                      value={this.state.confirmationCode}
                      type="phone"
                      onChangeText={text =>
                        this._onChangeInputValue(text, INPUT_CONFIRMATION_CODE)
                      }
                    >
                      {"Enter Code"}
                    </FloatingLabel>
                  </View>
                ) : null}
                <View
                  style={[styles.inputContainer, styles.passwordInputContainer]}
                >
                  <FloatingLabel
                    autoCapitalize={"none"}
                    autoCorrect={false}
                    labelStyle={styles.labelInput}
                    inputStyle={styles.input}
                    style={styles.formInput}
                    value={this.state.password}
                    password
                    onChangeText={text =>
                      this._onChangeInputValue(text, INPUT_PASSWORD)
                    }
                  >
                    {"Password"}
                  </FloatingLabel>
                </View>
                <View style={styles.primaryButton}>
                  <PolygonButton
                    disabled={this.state.loading}
                    customColor={AppColors.button.background}
                    textColor={AppColors.button.text}
                    onPress={() => this.handleNewPasswordSubmit()}
                    title="LET'S GO"
                  />
                </View>
              </View>
            </View>
          )}

          {this.state.loading && (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                position: 'absolute',
                width: '100%',
                height: '100%',
                left: 0,
                top: 0
              }}
            >
              <ActivityIndicator size="large" />
              <StatusBar barStyle="default" />
            </View>
          )}
        </KeyboardAvoidingView>

      </SafeAreaView>
    )
  }
}

let style = {
  labelInput: {
    color: AppColors.text.dark,
    fontSize: 15,
    marginLeft: 0,
    paddingLeft: 0
  },
  formInput: {
    borderBottomWidth: 1,
    borderColor: AppColors.text.dark,
    fontSize: 15
  },
  input: {
    borderWidth: 0,
    fontSize: 15,
    paddingVertical: 0,
    height: 30,
    marginLeft: 0,
    paddingLeft: 0
  },
  buttonGroupContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: 35
  },
  loginContainer: {
    width: "100%",
    height: "100%",
    paddingLeft: 17,
    paddingRight: 17
  },
  loginInfo: {
    width: "100%",
    marginTop: 50
  },
  username_container: {
    height: 60
  }
};

const styles = StyleSheet.create(style);

export default Login;
