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
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Platform
} from "react-native";
import { Constants } from "expo";
import CommonStyles from "@m1/shared/theme/styles";
import SimplePicker from "react-native-simple-picker";
import PolygonButton from "@m1/shared/components/PolygonButton";
import FloatingLabel from "react-native-floating-labels";
import { Auth, API } from "aws-amplify";
import AppColors from "@assets/theme/colors";

const iconBackArrow = require("@m1/shared/assets/ic_back_dark.png");
const imgDownArrow = require("@m1/shared/assets/drop_down_arrow.png");

const INPUT_FIRSTNAME = 1;
const INPUT_LASTNAME = 2;
const INPUT_USERNAME = 3;
const INPUT_PASSWORD = 4;
const INPUT_PHONE_NUMBER = 5;
const INPUT_EMAIL = 6;
const INPUT_EMERGENCY_PHONENUMBER = 7;
const INPUT_PARENT_FIRST_NAME = 8;
const INPUT_PARENT_LAST_NAME = 10;
const INPUT_PARENT_EMAIL = 9;
const INPUT_GENDER = 11;

class AthleteSignup extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: "CREATE ACCOUNT",
    headerStyle: CommonStyles.lightNavbarBackground,
    headerTitleStyle: CommonStyles.lightNavbarTitle,
    headerLeft: (
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={CommonStyles.navBackContainer}
      >
        <Image
          source={iconBackArrow}
          style={CommonStyles.lightNavBackImg}
          resizeMode="contain"
        />
      </TouchableOpacity>
    ),
    headerRight: <View />
  });

  constructor(props) {
    super(props);

    this.state = {
      error: "",
      loading: false,

      nameFirst: "",
      nameLast: "",
      username: "",
      password: "",
      phoneNumber: "",
      email: "",
      gender: 'M',
      parentEmail: "",
      parentFirstName: "",
      parentLastName: "",
      emergencyContactPhone: "",

      currentTeam: undefined
    };

    this.mount = true;
  }

  componentWillUnmount() {
    this.mount = false;
  }

  componentDidMount() {
    const { navigation } = this.props;
    var currentTeam = navigation.state.params.team;
    this.setState({ currentTeam });
  }

  componentWillReceiveProps(props) {
    if (!this.mount) return;
  }

  _onChangeInputValue = (value, key) => {
    if (!this.mount) return false;
    this.setState({ error: "" });

    switch (key) {
      case INPUT_FIRSTNAME:
        this.setState({ nameFirst: value });
        break;
      case INPUT_LASTNAME:
        this.setState({ nameLast: value });
        break;
      case INPUT_USERNAME:
        this.setState({ username: value });
        break;
      case INPUT_PASSWORD:
        this.setState({ password: value });
        break;
      case INPUT_PHONE_NUMBER:
        this.setState({ phoneNumber: value });
        break;
      case INPUT_EMAIL:
        this.setState({ email: value });
        break;
      case INPUT_EMERGENCY_PHONENUMBER:
        this.setState({ emergencyContactPhone: value });
        break;
      case INPUT_PARENT_FIRST_NAME:
        this.setState({ parentFirstName: value });
        break;
      case INPUT_PARENT_LAST_NAME:
        this.setState({ parentLastName: value });
        break;
      case INPUT_PARENT_EMAIL:
        this.setState({ parentEmail: value });
        break;
      case INPUT_GENDER:
        this.setState({ gender: value });
        break;
    }
    return true;
  };

  submit = async () => {
    // validate all fields are complete
    if(!this.state.nameFirst) return alert('oops, we need a first name')
    if(!this.state.nameLast) return alert('oops, we need a last name')
    if(!this.state.username) return alert('oops, we need a username')
    if(!this.state.password) return alert('oops, we need a password')
    if(!this.state.phoneNumber) return alert('oops, we need a phone number')
    if(!this.state.email) return alert('oops, we need an email')
    if(!this.state.parentFirstName || !this.state.parentLastName) return alert('oops, we need a parent\'s full name')
    if(!this.state.emergencyContactPhone) return alert('oops, we need a parent\'s phone number')
    if(!this.state.parentEmail) return alert('oops, we need a parent\'s email')

    this.setState({ loading: true });

    // check that username doesnt exist already
    var gotUser = await this.checkUsername(this.state.username);

    if (gotUser.length !== 0) {
      this.setState({ error: "A user with this username already exists." });
      this.setState({ loading: false });
      return;
    }

    var username = await this.verifyUsername(this.state.username);
    if (!username) {
      this.setState({
        error:
          "Username Invalid.  Username must be at least 5 characters long and contain no spaces."
      });
      this.setState({ loading: false });
      return;
    }

    var phoneNumber = await this.cleansePhone(this.state.phoneNumber);
    if (!phoneNumber) {
      this.setState({ error: "Phone Number Invalid" });
      this.setState({ loading: false });
      return;
    }

    var email = await this.verifyEmail(this.state.email);
    if (!email) {
      this.setState({ error: "Email Invalid" });
      this.setState({ loading: false });
      return;
    }

    var password = await this.verifyPassword(this.state.password);
    if (!password) {
      this.setState({
        error:
          "Password Invalid.  Password must be at least 8 characters long, contain 1 uppercase and 1 lowercase."
      });
      this.setState({ loading: false });
      return;
    }

    // Create cognito user with password
    // Create User
    // Create Roles

    var parentName = this.state.parentFirstName + " " + this.state.parentLastName;

    if(parentName.trim() == "") {
        parentName = undefined;
    }

    var user = {
      nameFirst: this.state.nameFirst,
      nameLast: this.state.nameLast,
      username: username,
      email: email,
      gender: this.state.gender,
      phoneNumber: phoneNumber.toString(),
      emergencyContactPhone: this.state.emergencyContactPhone
        ? this.state.emergencyContactPhone.toString()
        : undefined,
      parentName: parentName,
      parentEmail: this.state.parentEmail ? this.state.parentEmail : undefined,
      tenant: Constants.manifest.slug
    };

    var cognitoUser = await this.createCognitoUser(user, password);

    if (user.parentEmail) {
      user.currentTeam = this.state.currentTeam;
    }

    var userData = await this.createUser(user);

    if (userData) {
      var role = {
        userId: userData.id,
        parentId: this.state.currentTeam.id,
        role: "player",
        sport: this.state.currentTeam.sport,
        isTeam: true
      };
      var roleData = await this.createRole(userData.id, role);
      if (roleData) {
        // on success, route to Login Screen.
        this.props.navigation.navigate("AuthConfirmUser", {
          team: this.state.currentTeam,
          user: userData
        });
      } else {
        this.setState({
          error: "Whoops, something went wrong.  Please try again."
        });
        this.setState({ loading: false });
      }
    } else {
      this.setState({
        error: "Whoops, something went wrong.  Please try again."
      });
      this.setState({ loading: false });
    }
  };

  cleansePhone = async phoneNumber => {
    console.log("phoneNumber", phoneNumber);
    if (!phoneNumber) {
      return false;
    }
    var phoneString = phoneNumber.toString();
    // return correct phone, fail if invalid phone.
    if (phoneString.length !== 10) {
      return false;
    }
    return phoneNumber;
  };

  verifyEmail = async email => {
    if (!email) {
      return false;
    }
    // return correct email, fail if invalid email.
    var re = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
    if (re.test(email)) {
      return email;
    } else {
      return false;
    }
  };

  verifyPassword = async password => {
    // Password must be at least 8 characters long, contain 1 uppercase and 1 lowercase.
    console.log("password ", password);
    if (!password) {
      return false;
    }
    if (password.length < 8) {
      alert("Your password needs a minimum of 8 characters");
    } else if (password.search(/[a-z]/) < 0) {
      alert("Your password needs a lower case letter");
    } else if (password.search(/[A-Z]/) < 0) {
      alert("Your password needs an upper case letter");
    } else if (password.search(/[0-9]/) < 0) {
      alert("Your password needs a number");
    } else {
      // Pass is OK
      return password;
    }
  };

  verifyUsername = async username => {
    if (!username) {
      return false;
    }
    // make sure there are no spaces in the username and that it is at least 5 characters long
    var hasWhiteSpace = this.hasWhiteSpace(username);
    if (hasWhiteSpace) {
      return false;
    }
    if (username.length < 5) {
      return false;
    }

    return username;
  };

  hasWhiteSpace(s) {
    return s.indexOf(" ") >= 0;
  }

  createCognitoUser = async (user, password) => {
    try{
      var phoneNumber = "+1" + user.phoneNumber.toString();
      console.log("phoneNumber", phoneNumber);

      return await Auth.signUp({
        username: user.username || user.email,
        password: password,
        attributes: {
          email: user.email,
          phone_number: phoneNumber,
          given_name: user.nameFirst,
          family_name: user.nameLast
        }
      });
    }
    catch(e){
      console.log('createCognitoUser e ', e)
      this.setState({loading: false, error: e && e.message ? e.message : e})
    }
  };

  createUser = async user => {
    return API.post("users", `/users`, {
      body: user
    });
  };

  createRole = async (userId, role) => {
    return API.post("users", `/users/${userId}/roles`, {
      body: role
    });
  };

  checkUsername = async username => {
    return API.get("users", `/users/username/${username}`);
  };

  _showGenderPicker = () => {
    if (this.genderPicker == null || this.genderPicker == undefined) return;

    this.genderPicker.show();
  };

  render() {
    return (
      <SafeAreaView style={CommonStyles.container}>
        <StatusBar barStyle="dark-content" translucent={false} />
        <KeyboardAvoidingView
          behavior={Platform.OS == "android" ? undefined : "padding"}
          style={CommonStyles.container}
        >
          {this.state.loading && (
            <View style={styles.loading}>
              <ActivityIndicator size="large" />
            </View>
          )}
          <ScrollView style={styles.paddingContainer}>
            {this.state.error ? (
              <Text style={{ color: "red" }}> {this.state.error} </Text>
            ) : null}
            <View style={[styles.firstInfo, styles.row_container]}>
              <FloatingLabel
                autoCapitalize={"none"}
                autoCorrect={false}
                type="text"
                labelStyle={styles.labelInput}
                inputStyle={styles.input}
                style={styles.formInput}
                value={this.state.nameFirst}
                onChangeText={text =>
                  this._onChangeInputValue(text, INPUT_FIRSTNAME)
                }
              >
                {"First Name"}
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
                value={this.state.nameLast}
                onChangeText={text =>
                  this._onChangeInputValue(text, INPUT_LASTNAME)
                }
              >
                {"Last Name"}
              </FloatingLabel>
            </View>
            <View style={[styles.otherInfo, styles.helper_row_container]}>
              <FloatingLabel
                autoCapitalize={"none"}
                autoCorrect={false}
                type="text"
                labelStyle={styles.labelInput}
                inputStyle={styles.input}
                style={styles.formInput}
                value={this.state.username}
                onChangeText={text =>
                  this._onChangeInputValue(text, INPUT_USERNAME)
                }
              >
                {"Username"}
              </FloatingLabel>
              <Text style={styles.helperText}>
                * remember your username to login
              </Text>
            </View>
            <View style={[styles.otherInfo, styles.helper_row_container]}>
              <FloatingLabel
                autoCapitalize={"none"}
                autoCorrect={false}
                type="password"
                labelStyle={styles.labelInput}
                inputStyle={styles.input}
                style={styles.formInput}
                value={this.state.password}
                onChangeText={text =>
                  this._onChangeInputValue(text, INPUT_PASSWORD)
                }
              >
                {"Password"}
              </FloatingLabel>
              <Text style={styles.helperText}>
                * remember your password to login
              </Text>
            </View>
            <View style={[styles.otherInfo, styles.helper_row_container]}>
              <FloatingLabel
                autoCapitalize={"none"}
                autoCorrect={false}
                keyboardType={"phone-pad"}
                labelStyle={styles.labelInput}
                inputStyle={styles.input}
                style={styles.formInput}
                value={this.state.phoneNumber}
                onChangeText={text =>
                  this._onChangeInputValue(text, INPUT_PHONE_NUMBER)
                }
              >
                {"Phone Number"}
              </FloatingLabel>
              <Text style={styles.helperText}>
                000-000-0000
              </Text>
            </View>
            <View style={[styles.otherInfo, styles.row_container]}>

              <FloatingLabel
                autoCapitalize={"none"}
                autoCorrect={false}
                keyboardType={"email-address"}
                labelStyle={styles.labelInput}
                inputStyle={styles.input}
                style={styles.formInput}
                value={this.state.email}
                onChangeText={text =>
                  this._onChangeInputValue(text, INPUT_EMAIL)
                }
              >
                {"Email"}
              </FloatingLabel>
            </View>
            <View style={[styles.otherInfo, styles.row_container, {borderBottomColor: 'black', borderBottomWidth: 1}]}>
              <View style={CommonStyles.customInputCell}>
                <View style={CommonStyles.customInputCellInnerPart}>
                  <TouchableOpacity
                    style={[
                      CommonStyles.customInputField,
                      CommonStyles.customInputPicker,
                      CommonStyles.customInputFieldRow
                    ]}
                    onPress={this._showGenderPicker}
                  >
                    <Text
                      style={[
                        CommonStyles.customInputFieldVerticalCenter,
                        CommonStyles.customInputFieldRightDown
                      ]}
                      ellipsizeMode={"tail"}
                      numberOfLines={1}
                    >
                      {this.state.gender == 'M' ? 'Male' : 'Female'}
                    </Text>

                    <Image
                      source={imgDownArrow}
                      style={CommonStyles.customInputFieldDropDown}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={[styles.otherInfo, styles.row_container]}>
              <FloatingLabel
                autoCapitalize={"none"}
                autoCorrect={false}
                type="text"
                labelStyle={styles.labelInput}
                inputStyle={styles.input}
                style={styles.formInput}
                value={this.state.parentFirstName}
                onChangeText={text =>
                  this._onChangeInputValue(text, INPUT_PARENT_FIRST_NAME)
                }
              >
                {"Parent First Name"}
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
                value={this.state.parentLastName}
                onChangeText={text =>
                  this._onChangeInputValue(text, INPUT_PARENT_LAST_NAME)
                }
              >
                {"Parent Last Name"}
              </FloatingLabel>
            </View>
            <View style={[styles.otherInfo, styles.helper_row_container]}>
              <FloatingLabel
                autoCapitalize={"none"}
                autoCorrect={false}
                keyboardType={"phone-pad"}
                labelStyle={styles.labelInput}
                inputStyle={styles.input}
                style={styles.formInput}
                value={this.state.emergencyContactPhone}
                onChangeText={text =>
                  this._onChangeInputValue(text, INPUT_EMERGENCY_PHONENUMBER)
                }
              >
                {"Parent Phone Number"}
              </FloatingLabel>
              <Text style={styles.helperText}>
                000-000-0000
              </Text>
            </View>
            <View style={[styles.otherInfo, styles.row_container]}>
              <FloatingLabel
                autoCapitalize={"none"}
                autoCorrect={false}
                keyboardType={"email-address"}
                labelStyle={styles.labelInput}
                inputStyle={styles.input}
                style={styles.formInput}
                value={this.state.parentEmail}
                onChangeText={text =>
                  this._onChangeInputValue(text, INPUT_PARENT_EMAIL)
                }
              >
                {"Parent Email"}
              </FloatingLabel>
            </View>
            <View style={[styles.otherInfo, styles.row_container]}>
              <SimplePicker
                options={['M', 'F']}
                labels={['Male', 'Female']}
                onSubmit={value =>
                  this._onChangeInputValue(value, INPUT_GENDER)
                }
                style={pickerSelectStyles.remind_picker}
                selectedValue={this.state.gender}
                cancelText={"Cancel"}
                confirmText={"Done"}
                ref={picker => (this.genderPicker = picker)}
              />
            </View>
            <View style={styles.buttonGroupContainer}>
              <PolygonButton
                title={"CREATE ACCOUNT"}
                onPress={() => this.submit()}
                customColor={AppColors.button.background}
                textColor={AppColors.button.text}
              />
            </View>
            <View style={{minHeight:150, height:150}}>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
}

let style = {
  loading: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000000000
  },
  buttonGroupContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 20,
    marginRight: 20,
    marginTop: 35
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
  helperText: {
    fontSize: 10,
    marginTop: 0,
    color: 'grey'
  },
  helper_row_container: {
    width: "100%"
  },
  row_container: {
    flexDirection: "row",
    width: "100%"
  },
  otherInfo: {
    width: "100%",
    marginTop: 30
  },
  labelInput: {
    color: "#454545",
    fontSize: 15
  },
  formInput: {
    borderBottomWidth: 1,
    borderColor: "#4e4d52",
    fontSize: 15,
    width: "100%"
  },
  input: {
    borderWidth: 0,
    fontSize: 15,
    paddingVertical: 0,
    height: 30
  }
};

const styles = StyleSheet.create(style);

const pickerSelectStyles = StyleSheet.create({
  remind_picker: {
    height: 250
  },

  remind_picker_container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0
  }
});

export default AthleteSignup;
