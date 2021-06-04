import React, { Component } from "react";
import {
  AsyncStorage,
  View,
  KeyboardAvoidingView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Text,
  StatusBar,
  SafeAreaView,
  Platform,
  Alert
} from "react-native";
import { API } from "aws-amplify";
import _ from "lodash";
import { Feather } from "@expo/vector-icons";
import AppColors from "@assets/theme/colors";
import CommonStyles from "../../theme/styles";

import FloatingLabel from "react-native-floating-labels";

const INPUT_FIRST_NAME = 1;
const INPUT_LAST_NAME = 2;
const INPUT_EMAIL = 3;
const INPUT_PHONE_NUMBER = 4;

class AddCoach extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: "ADD COACH",
    headerLeft: (
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{ marginLeft: 10 }}
      >
        <Feather name="arrow-left" size={24} color="white" />
      </TouchableOpacity>
    ),
    headerRight: <View />
  });

  constructor(props) {
    super(props);

    this.state = {
      first_name: "",
      last_name: "",
      phone_number: "",
      email: "",
      username: "",
      currentTeam: {}
    };

    this.mount = true;
  }

  componentDidMount = async () => {
    var userContextString = await AsyncStorage.getItem("@M1:userContext");
    var appContextString = await AsyncStorage.getItem("@M1:appContext");
    var userContext = JSON.parse(userContextString);
    var appContext = JSON.parse(appContextString);
    this.setState({ username: userContext.user.username });

    const currentTeam = _.find(
      userContext.appContextList,
      c => c.id === appContext.id
    );

    this.setState({ currentTeam: currentTeam });
  };

  componentWillUnmount() {
    this.mount = false;
  }

  componentWillReceiveProps(props) {
    if (!this.mount) return;
  }

  _onChangeInputValue = (value, key) => {
    if (!this.mount) return false;

    switch (key) {
      case INPUT_FIRST_NAME:
        this.setState({ first_name: value });
        break;
      case INPUT_LAST_NAME:
        this.setState({ last_name: value });
        break;
      case INPUT_PHONE_NUMBER:
        this.setState({ phone_number: value });
        break;
      case INPUT_EMAIL:
        this.setState({ email: value });
        break;
    }
    return true;
  };

  render() {
    return (
      <SafeAreaView style={CommonStyles.container}>
        <StatusBar barStyle="light-content" translucent={false} />
        <KeyboardAvoidingView
          behavior={Platform.OS == "android" ? undefined : "padding"}
          style={CommonStyles.container}
        >
          <View style={styles.paddingContainer}>
            <View style={[styles.firstInfo, styles.row_container]}>
              <FloatingLabel
                autoCapitalize={"none"}
                autoCorrect={false}
                type="text"
                labelStyle={styles.labelInput}
                inputStyle={styles.input}
                style={styles.formInput}
                value={this.state.first_name}
                onChangeText={text =>
                  this._onChangeInputValue(text, INPUT_FIRST_NAME)
                }
              >
                {"First Name*"}
              </FloatingLabel>
            </View>
            <View style={[styles.otherInfo, styles.row_container]}>
              <FloatingLabel
                autoCapitalize={"none"}
                autoCorrect={false}
                type="text"
                labelStyle={styles.labelInput}
                inputStyle={styles.input}
                style={styles.formInput}
                value={this.state.last_name}
                onChangeText={text =>
                  this._onChangeInputValue(text, INPUT_LAST_NAME)
                }
              >
                {"Last Name*"}
              </FloatingLabel>
            </View>

            <View style={[styles.otherInfo, styles.row_container]}>
              <FloatingLabel
                autoCapitalize={"none"}
                autoCorrect={false}
                type="email"
                labelStyle={styles.labelInput}
                inputStyle={styles.input}
                style={styles.formInput}
                value={this.state.email}
                onChangeText={text =>
                  this._onChangeInputValue(text, INPUT_EMAIL)
                }
              >
                {"Email*"}
              </FloatingLabel>
            </View>
            <View style={[styles.otherInfo, styles.row_container]}>
              <FloatingLabel
                autoCapitalize={"none"}
                autoCorrect={false}
                type="phone"
                labelStyle={styles.labelInput}
                inputStyle={styles.input}
                style={styles.formInput}
                value={this.state.phone_number}
                onChangeText={text =>
                  this._onChangeInputValue(text, INPUT_PHONE_NUMBER)
                }
              >
                {"Phone Number"}
              </FloatingLabel>
            </View>

            <TouchableOpacity
              style={[
                styles.buttonGroupContainer,
                {
                  backgroundColor: AppColors.brand.alpha,
                  justifyContent: "center"
                }
              ]}
              onPress={() => this.submit()}
            >
              <Text style={{color: AppColors.text.white}}>{"SAVE"}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  submit = async () => {
    if (this.state.first_name.trim() === "") {
      Alert.alert(
        "Error",
        "Please input first name",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }],
        { cancelable: false }
      );

      return;
    }

    if (this.state.last_name.trim() === "") {
      Alert.alert(
        "Error",
        "Please input last name",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }],
        { cancelable: false }
      );

      return;
    }

    if (this.state.phone_number.trim() === "") {
      Alert.alert(
        "Error",
        "Please input phone number",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }],
        { cancelable: false }
      );

      return;
    } else {
      var phone_number = /^\d{10}$/;

      if (!this.state.phone_number.match(phone_number)) {
        Alert.alert(
          "Error",
          "Please input correct phone number",
          [{ text: "OK", onPress: () => console.log("OK Pressed") }],
          { cancelable: false }
        );

        return;
      }
    }

    if (this.state.email.trim() === "") {
      Alert.alert(
        "Error",
        "Please input email",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }],
        { cancelable: false }
      );

      return;
    }

    if (!this.validateEmail(this.state.email.trim())) {
      Alert.alert(
        "Error",
        "Please input correct email",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }],
        { cancelable: false }
      );

      return;
    }

    var user = {
      nameFirst: this.state.first_name.trim(),
      nameLast: this.state.last_name.trim(),
      email: this.state.email.trim(),
      phoneNumber: this.state.phone_number.trim()
    };

    var checkStatusResult = await API.get(
      "users",
      `/users/username/${user.email}`
    );

    if (checkStatusResult.length > 0) {
      Alert.alert(
        "Warning",
        "We found an existing user that matches those credentials, does this information look correct? If not, no problem, We will put them into the system.",
        [
          {
            text: "YES",
            onPress: async () => {
              var userId = checkStatusResult[0].id;

              var newRole = await API.post("users", `/users/${userId}/roles`, {
                body: { role: "coach", parentId: this.state.currentTeam.id }
              });

              // if (result.id != null && result.id != undefined) {
              let params = this.props.navigation.state.params;

              if (params && params.addCoach) {
                params.addCoach(result);

                this.props.navigation.goBack();
              }
              // }
            }
          },
          {
            text: "NO",
            onPress: async () => {
              var result = await API.post("users", "/users/coaches", {
                body: { contact: user, currentTeam: this.state.currentTeam }
              });

              let params = this.props.navigation.state.params;

              if (params && params.addCoach) {
                params.addCoach(result);

                this.props.navigation.goBack();
              }
            }
          }
        ],
        { cancelable: false }
      );

      return;
    } else {
      var result = await API.post("users", "/users/coaches", {
        body: { contact: user, currentTeam: this.state.currentTeam }
      });

      let params = this.props.navigation.state.params;

      if (params && params.addCoach) {
        params.addCoach(result);

        this.props.navigation.goBack();
      }
    }
  };

  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return re.test(String(email).toLowerCase());
  }
}

let style = {
  buttonGroupContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 35,
    height: 40
  },
  labelInput: {
    color: AppColors.text.dark,
    marginLeft: 0,
    paddingLeft: 0,
    fontSize: 14,
  },
  formInput: {
    borderBottomWidth: 1,
    borderColor: AppColors.text.dark,
    width: '100%'
  },
  input: {
    borderWidth: 0,
    fontSize: 14,
    paddingVertical: 0,
    height: 30,
    marginLeft: 0,
    paddingLeft: 0
  },
  paddingContainer: {
    width: "100%",
    height: "100%",
    paddingLeft: 17,
    paddingRight: 17
  },
  firstInfo: {
    width: "100%",
    marginTop: 50
  },
  row_container: {
    flexDirection: "row",
    width: "100%"
  },
  otherInfo: {
    width: "100%",
    marginTop: 30
  }
};

const styles = StyleSheet.create(style);

export default AddCoach;
