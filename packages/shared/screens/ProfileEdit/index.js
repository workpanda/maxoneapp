import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  AsyncStorage,
  ScrollView,
  Linking,
  KeyboardAvoidingView
} from "react-native";
import Images from "@assets/images";
import { API, Storage } from "aws-amplify";
import _ from "lodash";
import CommonStyles from "@m1/shared/theme/styles";
import FontIcon from "@m1/shared/components/FontIcon";
import { AppColors } from "@assets/theme";
import { Image as CacheImage } from "react-native-expo-image-cache";
import {
  MaterialIcons,
  FontAwesome,
  MaterialCommunityIcons,
  Ionicons,
  Feather
} from "@expo/vector-icons";
import PolygonButton from "@m1/shared/components/PolygonButton";
import Modal from "react-native-modal";

import { Permissions, ImagePicker } from "expo";

import { Constants } from "expo";
import moment from "moment";
import Spacer from "@m1/shared/components/Spacer";
import FloatingLabel from "react-native-floating-labels";
import DateTimePicker from "react-native-modal-datetime-picker";
import SimplePicker from "react-native-simple-picker";
const default_avatar = require("@m1/shared/assets/avatar-default.png");

const INPUT_FIRST_NAME = 1;
const INPUT_LAST_NAME = 2;
const INPUT_PHONE_NUMBER = 3;
const INPUT_GENDER = 4;
const INPUT_GRADUATIONYEAR = 5;
const INPUT_PARENT_NAME = 6;
const INPUT_PARENT_EMAIL = 7;
const INPUT_EMERGENCY_PHONENUMBER = 8;
const INPUT_USER_NAME = 9;
const INPUT_EMAIL = 10;
const imgDownArrow = require("@m1/shared/assets/drop_down_arrow.png");
const GENDER_LIST = ["Male", "Female"];
const RECEIPT_TYPE_LIST = ["Both", "Athletes", "Parents"];

class ProfileEdit extends React.Component {
  static navigationOptions = ({ navigation }) => {
    var onAdd = () => {};
    var bShowAddButton = true;
    let params = navigation.state.params;

    if (params && params.onAdd) {
      onAdd = params.onAdd;
    }

    if (params) {
      bShowAddButton = params.bShowAddButton;
    }

    var appContext =
      navigation.state.params && navigation.state.params.appContext
        ? navigation.state.params.appContext
        : {};

    var goToUser =
      navigation.state.params && navigation.state.params.athlete
        ? navigation.state.params.athlete
        : navigation.state.params &&
          navigation.state.params.userContext &&
          navigation.state.params.userContext.user
        ? navigation.state.params.userContext.user
        : {};
    console.log("go to user", goToUser);
    return {
      headerTitle: "Edit Profile",
      headerLeft: (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("ProfileScreen", { athlete: goToUser })
          }
          style={{ marginLeft: 10 }}
        >
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
      ),
      headerRight: <View />
    };
  };
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      file: null,
      showMenu: false,
      currentTeam: {},
      loading: true,
      firstName: "",
      lastName: "",
      email: "",
      userName: "",
      phoneNumber: "",
      gender: "Male",
      graduationYear: "",
      parentName: "",
      parentEmail: "",
      emergencyPhoneNumber: "",
      isDateTimePickerVisible: false,
      birthDate: "",
      athlete: {},
      changedValue: null,
      appContext: {},
      appName: "maxone",
      error: null,
      original: {}
    };

    this.mount = true;
  }

  componentDidMount = async () => {
    var userContextString = await AsyncStorage.getItem("@M1:userContext");
    var appContextString = await AsyncStorage.getItem("@M1:appContext");
    var userContext = JSON.parse(userContextString);
    var appContext = JSON.parse(appContextString);
    this.setState({ username: userContext.user.username });
    // console.log('Mounted ', userContext)
    var params = this.props.navigation.state.params
      ? this.props.navigation.state.params
      : {};
    params.appContext = appContext;
    params.userContext = userContext;
    this.props.navigation.setParams(params);

    var athlete = userContext.user;
    if (params && params.athlete) {
      athlete = params.athlete;
    }

    this.setState({ appName: Constants.manifest.slug });

    try {
      athlete.phoneNumber = athlete.phoneNumber
        ? athlete.phoneNumber.toString()
        : athlete.phoneNumber;
    } catch (e) {
      console.log("error parsing athlete phone number", e);
    }
    try {
      athlete.emergencyContactPhone = athlete.emergencyContactPhone
        ? athlete.emergencyContactPhone.toString()
        : null;
    } catch (e) {
      console.log("error parsing athlete emergencyContactPhone", e);
    }

    console.log("Athlete == ", athlete);
    const currentTeam = _.find(
      userContext.appContextList,
      c => c.id === appContext.id
    );

    this.setState({
      currentTeam: currentTeam,
      athlete: athlete,
      appContext,
      user: userContext.user,
      userContext,
      changedValue: new Date(athlete.birthday)
    });
  };

  async checkAppContextChanged() {
    var appContextString = await AsyncStorage.getItem("@M1:appContext");
    var appContext = JSON.parse(appContextString);

    if (this.state.appContext && appContext !== this.state.appContext) {
      await this.componentDidMount();
    }
  }

  _onChangeMessage = (type, text) => {
    this.setState({ error: false, saved: false });
    var athlete = Object.assign({}, this.state.athlete);

    if (type == INPUT_FIRST_NAME) {
      athlete.nameFirst = text;
      this.setState({ athlete });
    }

    if (type == INPUT_LAST_NAME) {
      athlete.nameLast = text;
      this.setState({ athlete });
    }
    if (type == INPUT_PHONE_NUMBER) {
      athlete.phoneNumber = text;
      this.setState({ athlete });
    }

    if (type == INPUT_GRADUATIONYEAR) {
      athlete.graduationYear = text;
      this.setState({ athlete });
    }
    if (type == INPUT_PARENT_NAME) {
      athlete.parentName = text;
      this.setState({ athlete });
    }

    if (type == INPUT_PARENT_EMAIL) {
      athlete.parentEmail = text;
      this.setState({ athlete });
    }

    if (type == INPUT_EMERGENCY_PHONENUMBER) {
      athlete.emergencyContactPhone = text;
      this.setState({ athlete });
    }

    if (type == INPUT_USER_NAME) {
      this.setState({ userName: text });
    }
    if (type == INPUT_EMAIL) {
      athlete.email = text;

      this.setState({ athlete });
    }
  };

  async _takePhoto() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    if (status === "granted") {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: "Images",
        allowsEditing: true,
        aspect: [1, 1],
        base64: true
      });
      console.log("Result = ", result);
      this.handleImageResult(result);
    } else {
      throw new Error("Camera roll permission not granted");
    }
  }

  async _choosePhoto() {
    const { user } = this.state;
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (status === "granted") {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "Images",
        allowsEditing: true,
        aspect: [1, 1],
        base64: true
      });
      console.log("Result = ", result);
      this.handleImageResult(result);
    } else {
      throw new Error("Camera roll permission not granted");
    }
  }

  async handleImageResult(result) {
    const { athlete } = this.state;
    if (!result.cancelled) {
      var nameArr = result.uri.split("/");
      const idForS3 =
        athlete.legacyId && athlete.legacyId !== "0"
          ? athlete.legacyId
          : athlete.id;
      // this.file = event.target.files[0];
      const fileStructure = `uploads/user/avatar/${idForS3}/`;
      try {
        var buf = new Buffer.from(result.base64, "base64");
        const customPrefix = { public: "", private: "", protected: "" };
        const access = {
          level: "public",
          contentType: "image/jpeg",
          customPrefix: customPrefix
        };

        await Storage.put(
          `${fileStructure}${nameArr.slice(-1)[0]}`,
          buf,
          access
        )
          .then(async succ => {
            console.log("SUCCESS === ", succ);
            // now save user
            athlete.avatarUrl =
              "https://programax-videos-production.s3.amazonaws.com/" +
              succ.key;
            this.setState({ athlete });
            this._cancelMenuItem();
            // console.log('User Data === ', userData);
            // var newUserData = await mapToOld(userData)
            // console.log('newUserData ', newUserData)
            // await this.saveAthlete(newUserData)
            // this.props.signAvatarFile(newUserData)
          })
          .catch(err => console.log("ERRORS FO DAYS", err));
      } catch (e) {
        console.log("Big ol error, ", e);
      }

      this.setState({ file: file }, () => {});
    } else {
      console.log("Cancelled!!!");
    }
  }
  _cancelMenuItem() {
    this.setState({ showMenu: false }, () => {});
  }
  editPhoto() {}
  async handleSave() {
    var athlete = this.state.athlete;
    console.log("Saving ", athlete);

    var original = this.state.original;

    var phoneNumber = athlete.phoneNumber
      ? await this.cleansePhone(athlete.phoneNumber)
      : null;

    var email = athlete.email ? await this.verifyEmail(athlete.email) : null;

    if (!phoneNumber) {
      this.setState({
        error: "Invalid Phone Number.  \n Must enter a valid phone numebr."
      });
      return;
    }
    if (!email) {
      this.setState({ error: "Invalid Email.  \n  Must enter a valid email." });
      return;
    }

    try {
      await this.updateUser(athlete);
      if (athlete.id === this.state.user.id) {
        // update async storage with updated data
        var userContext = this.state.userContext;
        userContext.user = athlete;
        await this._storeUserContext(userContext);
        console.log("done");
      }
      this.setState({ saved: true });
    } catch (e) {
      this.setState({ error: e });
    }
  }

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

  updateUser = async athlete => {
    return API.post("users", "/users", {
      body: athlete
    });
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

  _onChangeGender = value => {
    if (!this.mount) return false;

    if (value == this.state.athlete.gender) {
      return;
    }
    var athlete = Object.assign({}, this.state.athlete);
    athlete.gender = value;
    this.setState({ athlete });
  };

  _showGenderPicker = () => {
    if (this.genderPicker == null || this.genderPicker == undefined) return;

    this.genderPicker.show();
  };
  showDateTimePicker = () => {
    this.setState({ isDateTimePickerVisible: true });
  };

  hideDateTimePicker = () => {
    this.setState({ isDateTimePickerVisible: false });
  };

  handleDatePicked = date => {
    console.log("A date has been picked: ", date);
    this.hideDateTimePicker();

    let strSelectedDate = moment(date).format("YYYY-MM-DD");

    var athlete = Object.assign({}, this.state.athlete);
    athlete.birthday = strSelectedDate;
    this.setState({
      athlete,
      changedValue: date
    });
  };
  renderMenuModal = () => {
    let { showMenu } = this.state;

    return (
      <Modal isVisible={showMenu} style={styles.menu_modal_position}>
        <View style={styles.menu_modal_dialog}>
          <TouchableOpacity
            style={styles.menu_modal_dialog_item}
            onPress={this._takePhoto.bind(this)}
          >
            <Text style={styles.menu_modal_dialog_item_text}>
              {"Take Photo"}
            </Text>
          </TouchableOpacity>
          <Spacer />
          <TouchableOpacity
            style={styles.menu_modal_dialog_item}
            onPress={this._choosePhoto.bind(this)}
          >
            <Text style={styles.menu_modal_dialog_item_text}>
              {"Use Camera Role"}
            </Text>
          </TouchableOpacity>
          <Spacer />
          <TouchableOpacity
            style={styles.menu_modal_dialog_item}
            onPress={this._cancelMenuItem.bind(this)}
          >
            <Text style={styles.menu_modal_dialog_item_text}>{"Close"}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  };

  onPressSave() {
    alert("Save");
  }

  _onPressAddNewTeam = async () => {
    if(Constants.manifest.slug === "vnn"){
      Linking.canOpenURL("https://admin.getvnn.com/teams/add").then(supported => {
        if (supported) {
          Linking.openURL("https://admin.getvnn.com/teams/add");
        } else {
          console.log("Don't know how to open URI: " + "https://admin.getvnn.com/teams/add");
        }
      });
    }
    else{
            var type = "coach";

      if (this.state.appContext.isCoach !== true) {
        if (this.state.appContext.isAthlete === true) {
          type = "player";
        }
      }

      await AsyncStorage.setItem("Profile_Select_Type", type);

      this.props.navigation.navigate("ADDTEAM");
    }
  };
  render() {
    const { athlete, currentTeam } = this.state;

    return (
      <View style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" translucent={false} />
        <KeyboardAvoidingView style={{ flex: 1 }}
                keyboardVerticalOffset={100} behavior={"position"}>
        <ScrollView style={{ paddingLeft: 17, paddingRight: 17 }}>
          <View style={styles.avatar_container}>
            <View style={styles.avatar_image_container}>
              {!athlete.avatarUrl && (
                <Image style={styles.avatar_img} source={default_avatar} />
              )}
              {athlete.avatarUrl &&
                athlete.avatarUrl !== null &&
                athlete.avatarUrl !== undefined &&
                !athlete.avatarUrl.includes("http") &&
                !athlete.legacyId && (
                  <CacheImage
                    style={styles.avatar_img}
                    {...{
                      uri:
                        "https://s3.amazonaws.com/programax-videos-production/uploads/user/avatar/" +
                        athlete.id +
                        "/" +
                        athlete.avatarUrl
                    }}
                  />
                )}
              {athlete.avatarUrl &&
                athlete.avatarUrl !== null &&
                athlete.avatarUrl !== undefined &&
                !athlete.avatarUrl.includes("http") &&
                athlete.legacyId && (
                  <CacheImage
                    style={styles.avatar_img}
                    {...{
                      uri:
                        "https://s3.amazonaws.com/programax-videos-production/uploads/user/avatar/" +
                        athlete.legacyId +
                        "/" +
                        athlete.avatarUrl
                    }}
                  />
                )}
              {athlete.avatarUrl &&
                athlete.avatarUrl !== null &&
                athlete.avatarUrl !== undefined &&
                athlete.avatarUrl.includes("http") && (
                  <CacheImage
                    style={styles.avatar_img}
                    {...{ uri: athlete.avatarUrl }}
                  />
                )}
              <TouchableOpacity
                onPress={() => this.setState({ showMenu: true })}
                style={styles.avatar_edit}
              >
                <Ionicons name="ios-camera" size={13} color="black" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={[styles.full_width, { marginTop: 20 }]}>
            {this.state.error ? (
              <Text style={{ color: "red", textAlign: "center" }}>
                {" "}
                {this.state.error}{" "}
              </Text>
            ) : null}
            {this.state.saved ? (
              <Text style={{ color: "green", textAlign: "center" }}>
                {" "}
                Successfully Saved!{" "}
              </Text>
            ) : null}
            {((this.state.appContext.isCoach === true ||
              (this.state.appContext.isAthlete && Constants.manifest.slug !== "vnn")) ) && (
              <View style={{ width: "100%", alignItems: "center" }}>
                <PolygonButton
                  title={
                    this.state.appName == "pgc" ? "ADD A SESSION" : "ADD A TEAM"
                  }
                  customColor={AppColors.brand.gamma}
                  textColor={AppColors.button.text}
                  onPress={() => this._onPressAddNewTeam()}
                />
              </View>
            )}
            <View
              style={[
                styles.full_width,
                {
                  marginTop:
                    (this.state.appContext.isCoach === true ||
                      this.state.appContext.isAthlete) == true
                      ? 10
                      : 20
                }
              ]}
            >
              <FloatingLabel
                labelStyle={styles.labelInput}
                inputStyle={styles.input}
                style={styles.formInput}
                value={this.state.athlete.username}
                editable={false}
              >
                {"Username"}
              </FloatingLabel>
            </View>
            <View style={[styles.full_width, { marginTop: 20 }]}>
              <FloatingLabel
                labelStyle={styles.labelInput}
                inputStyle={styles.input}
                style={styles.formInput}
                value={this.state.athlete.nameFirst}
                editable={Constants.manifest.slug !== "vnn"}
                onChangeText={msg =>
                  this._onChangeMessage(INPUT_FIRST_NAME, msg)
                }
              >
                {"First Name"}
              </FloatingLabel>
            </View>
            <View style={[styles.full_width, { marginTop: 20 }]}>
              <FloatingLabel
                labelStyle={styles.labelInput}
                inputStyle={styles.input}
                style={styles.formInput}
                value={this.state.athlete.nameLast}
                editable={Constants.manifest.slug !== "vnn"}
                onChangeText={msg =>
                  this._onChangeMessage(INPUT_LAST_NAME, msg)
                }
              >
                {"Last Name"}
              </FloatingLabel>
            </View>
            <View style={[styles.full_width, { marginTop: 20 }]}>
              <FloatingLabel
                labelStyle={styles.labelInput}
                inputStyle={styles.input}
                style={styles.formInput}
                value={this.state.athlete.email}
                editable={Constants.manifest.slug !== "vnn"}
                onChangeText={msg => this._onChangeMessage(INPUT_EMAIL, msg)}
              >
                {"Email"}
              </FloatingLabel>
            </View>
            <View style={[styles.full_width, { marginTop: 20 }]}>
              <FloatingLabel
                labelStyle={styles.labelInput}
                inputStyle={styles.input}
                style={styles.formInput}
                value={this.state.athlete.phoneNumber}
                onChangeText={msg =>
                  this._onChangeMessage(INPUT_PHONE_NUMBER, msg)
                }
                keyboardType={"phone-pad"}
              >
                {"Phone Number"}
              </FloatingLabel>
            </View>
            {!this.state.appContext.isCoach &&
            !this.state.appContext.isHeadCoach &&
            !this.state.appContext.isOwner &&
            !this.state.appContext.isStaff ? (
              <View>
                <View
                  style={[
                    styles.full_width,
                    { marginTop: 50, flexDirection: "row" }
                  ]}
                >
                  <View style={{ width: "50%", paddingRight: 5 }}>
                    <View>
                      <Text style={{ color: AppColors.text.dark }}>
                        {"Gender"}
                      </Text>
                    </View>
                    <View>
                      <View>
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
                            {this.state.athlete.gender}
                          </Text>

                          <Image
                            source={imgDownArrow}
                            style={CommonStyles.customInputFieldDropDown}
                            resizeMode="contain"
                          />
                        </TouchableOpacity>
                        <Spacer />
                      </View>
                    </View>
                  </View>
                  <View style={{ width: "50%", paddingLeft: 5 }}>
                    <View>
                      <Text style={{ color: AppColors.text.dark }}>
                        Birthday
                      </Text>
                    </View>
                    <View>
                      <View>
                        <TouchableOpacity
                          style={[
                            CommonStyles.customInputField,
                            CommonStyles.customInputPicker,
                            CommonStyles.customInputFieldRow
                          ]}
                          onPress={this.showDateTimePicker}
                        >
                          <Text
                            style={[
                              CommonStyles.customInputFieldVerticalCenter,
                              CommonStyles.customInputFieldRightDown
                            ]}
                          >
                            {moment(this.state.athlete.birthday).format(
                              "YYYY-MM-DD"
                            )}
                          </Text>

                          <Image
                            source={imgDownArrow}
                            style={CommonStyles.customInputFieldDropDown}
                            resizeMode="contain"
                          />
                        </TouchableOpacity>
                        <Spacer />
                      </View>
                    </View>
                  </View>
                </View>
                <View style={[styles.full_width, { marginTop: 20 }]}>
                  <FloatingLabel
                    labelStyle={styles.labelInput}
                    inputStyle={styles.input}
                    style={styles.formInput}
                    value={this.state.athlete.graduationYear}
                    onChangeText={msg =>
                      this._onChangeMessage(INPUT_GRADUATIONYEAR, msg)
                    }
                  >
                    {"Graduation Year"}
                  </FloatingLabel>
                </View>
                <View style={[styles.full_width, { marginTop: 20 }]}>
                  <FloatingLabel
                    labelStyle={styles.labelInput}
                    inputStyle={styles.input}
                    style={styles.formInput}
                    value={this.state.athlete.parentName}
                    onChangeText={msg =>
                      this._onChangeMessage(INPUT_PARENT_NAME, msg)
                    }
                  >
                    {"Parent's Name"}
                  </FloatingLabel>
                </View>
                <View style={[styles.full_width, { marginTop: 20 }]}>
                  <FloatingLabel
                    labelStyle={styles.labelInput}
                    inputStyle={styles.input}
                    style={styles.formInput}
                    value={this.state.athlete.parentEmail}
                    onChangeText={msg =>
                      this._onChangeMessage(INPUT_PARENT_EMAIL, msg)
                    }
                  >
                    {"Parent's Email"}
                  </FloatingLabel>
                </View>
                <View style={[styles.full_width, { marginTop: 20 }]}>
                  <FloatingLabel
                    labelStyle={styles.labelInput}
                    inputStyle={styles.input}
                    style={styles.formInput}
                    value={this.state.athlete.emergencyContactPhone}
                    keyboardType={"phone-pad"}
                    onChangeText={msg =>
                      this._onChangeMessage(INPUT_EMERGENCY_PHONENUMBER, msg)
                    }
                  >
                    {"Emergency Phone Number"}
                  </FloatingLabel>
                </View>
              </View>
            ) : null}
            <View style={{ width: "100%", alignItems: "center" }}>
              <PolygonButton
                title={"SAVE"}
                customColor={AppColors.brand.alpha}
                textColor={AppColors.button.text}
                onPress={() => this.handleSave()}
              />
            </View>
          </View>
          <View style={{flex:1}} />
        </ScrollView>
        </KeyboardAvoidingView>
        {this.renderMenuModal()}
        <View style={pickerSelectStyles.remind_picker_container}>
          <SimplePicker
            options={GENDER_LIST}
            labels={GENDER_LIST}
            ref={picker => (this.genderPicker = picker)}
            onSubmit={this._onChangeGender}
            style={pickerSelectStyles.remind_picker}
            selectedValue={this.state.gender}
            cancelText={"Cancel"}
            confirmText={"Done"}
          />
          <DateTimePicker
            isVisible={this.state.isDateTimePickerVisible}
            onConfirm={this.handleDatePicked}
            onCancel={this.hideDateTimePicker}
            date={
              this.state.changedValue == null
                ? new Date()
                : this.state.changedValue
            }
          />
        </View>
      </View>
    );
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
  menu_modal_position: {
    justifyContent: "flex-end",
    width: "100%",
    // paddingHorizontal: 0,
    marginHorizontal: 0,
    marginVertical: 0
  },
  menu_modal_dialog: {
    backgroundColor: "white",
    width: "100%",
    paddingBottom: 25
  },
  menu_modal_dialog_header: {
    width: "100%",
    height: 70,

    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "white"
  },
  menu_modal_dialog_header_text: {
    fontWeight: "bold",
    fontSize: 20,
    backgroundColor: "white"
  },
  menu_modal_dialog_item: {
    width: "100%",
    height: 60,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white"
  },
  menu_modal_dialog_item_text: {
    fontSize: 16
  },
  input: {
    borderWidth: 0,
    fontSize: 15,
    paddingVertical: 0,
    height: 30,
    marginLeft: 0,
    paddingLeft: 0
  },
  teamButton: {
    width: "100%",
    height: 35,
    backgroundColor: AppColors.button.background,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10
  },
  avatar_container: {
    flexDirection: "row",
    alignItems: "center",
    height: 80,
    justifyContent: "center",
    marginTop: 15
  },
  avatar_image_container: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center"
  },
  avatar_img: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderColor: AppColors.brand.alpha,
    borderWidth: 2.5
  },
  avatar_edit: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: AppColors.brand.alpha,
    position: "absolute",
    right: 2.5,
    bottom: 2.5,
    justifyContent: "center",
    alignItems: "center"
  },
  username_container: {
    marginTop: 15,
    justifyContent: "center",
    alignItems: "center"
  },
  username_text: {
    fontSize: 21,
    color: AppColors.text.black,
    fontWeight: "bold"
  },
  team_container: {
    marginTop: 5,
    justifyContent: "center",
    alignItems: "center"
  },
  team_text: {
    fontSize: 15,
    color: AppColors.text.black
  },
  info_container: {
    marginTop: 5,
    justifyContent: "space-between",
    height: 70,
    backgroundColor: AppColors.brand.dark,
    alignItems: "center",
    flexDirection: "row",
    paddingLeft: 50,
    paddingRight: 50
  },
  info_text: {
    color: AppColors.text.lightdark,
    fontSize: 13,
    fontWeight: "300"
  },
  info_number: {
    color: AppColors.text.white,
    fontSize: 19,
    fontWeight: "bold"
  },
  info_sub_container: {
    alignItems: "center"
  },
  navigation_container: {
    marginTop: 10,
    paddingLeft: 25,
    paddingRight: 25,
    paddingBottom: 10,
    width: "100%"
  },
  navigation_item: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 50,
    alignItems: "center"
  },
  navigation_title: {
    fontSize: 17,
    color: AppColors.text.black
  },
  navigation_icon: {}
};

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

const styles = StyleSheet.create(style);

export default ProfileEdit;
