import React, { PureComponent } from "react";
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  AsyncStorage,
  Alert,
  Linking,
  StatusBar,
  Modal,
  TouchableHighlight,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  NativeModules
} from "react-native";

var RCTNetworking = require("RCTNetworking");
import { Permissions, Notifications, Constants } from "expo";
import Images from "@assets/images";
import { TabView, TabBar } from "react-native-tab-view";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import PolygonButton from "@m1/shared/components/PolygonButton";
import FloatingLabel from "react-native-floating-labels";
import AppColors from "@assets/theme/colors";
import AppSize from "@assets/theme/sizes";
import Color from "color";
import _ from "lodash";
import moment from "moment";
import { Image as CacheImage } from "react-native-expo-image-cache";
import CommonStyles from "@m1/shared/theme/styles";
import FontIcon from "@m1/shared/components/FontIcon";
import { getUserAndConversations } from "@m1/shared/screens/tab/Chat/graphql";
import { API, Auth, graphqlOperation } from "aws-amplify";
const API_URL = "https://test-connect.vnnsports.net";
import { Avatar, Badge, Icon, withBadge } from "react-native-elements";

const Grey = "#D8D8D8";
const INPUT_PHONE_NUMBER = 1;

const INPUT_PARENT_FIRST_NAME = 2;
const INPUT_PARENT_LAST_NAME = 3;
const INPUT_PARENT_EMAIL = 4;
const INPUT_EMERGENCY_PHONENUMBER = 5;
var RCTNetworking = require("RCTNetworking");
var readChatTimer = -1;

export default class Home extends PureComponent {
  static navigationOptions = ({ navigation }) => {
    var bShowAddButton = true;
    var unReadChatCount = 0;
    let params = navigation.state.params;

    if (params && params.onAdd) {
      onAdd = params.onAdd;
    }

    if (params) {
      bShowAddButton = params.bShowAddButton;
    }

    if (params && params.unReadChatCount) {
      unReadChatCount = params.unReadChatCount;
    }

    var appContext =
      navigation.state.params && navigation.state.params.appContext
        ? navigation.state.params.appContext
        : {};
    return {
      headerTitle: (
        <Image
          style={{ height: 22, width: 160 }}
          resizeMode="contain"
          source={Images.logoHeader}
        />
      ),
      headerTitleStyle: { flex: 1, textAlign: "center" },
      headerLeft: null,
      headerRight: bShowAddButton ? (
        <View style={{ flexDirection: "row" }}>
          {appContext.isCoach ||
          appContext.isOwner ||
          appContext.isHeadCoach ? (
            <TouchableOpacity
              onPress={() => navigation.navigate("MESSAGES")}
              style={CommonStyles.navRightContainer}
            >
              <FontIcon name="send" size={20} color={"#fff"} />
            </TouchableOpacity>
          ) : null}
          {appContext.id !== "" && (
            <TouchableOpacity
              onPress={() => navigation.navigate("Conversations")}
            >
              <View style={CommonStyles.navRightContainer}>
                <FontIcon name="chat1" size={20} color={"#fff"} />
              </View>
              {unReadChatCount > 0 && (
                <Badge
                  value={unReadChatCount}
                  status="error"
                  containerStyle={[
                    styles.badge,
                    { right: unReadChatCount > 9 ? 5 : 8 }
                  ]}
                />
              )}
            </TouchableOpacity>
          )}
        </View>
      ) : null
    };
  };

  state = {
    index: 0,
    requiresAdditionalInfo: false,
    routes: [
      { key: "school_news", title: "SCHOOL NEWS" },
      { key: "team_news", title: "TEAM NEWS" }
    ],
    username: "",
    phoneNumber: "",
    parentFirstName: "",
    parentLastName: "",
    parentEmail: "",
    emergencyContactPhone: "",
    currentTeam: {},
    loading: false,
    showLinkParent: false,
    school_news: [],

    team_news: []
  };

  refresh = async () => {};

  componentWillUnmount() {
    this.mount = false;
    clearInterval(readChatTimer);
  }

  componentDidMount = async () => {
    try {
      this.mount = true;
      RCTNetworking.clearCookies(cleared => {
        console.log("Cookies cleared, had cookies=" + cleared.toString());
      });
      
      this.setState({ loading: true });
      var userContextString = await AsyncStorage.getItem("@M1:userContext");
      var appContextString = await AsyncStorage.getItem("@M1:appContext");
      var userTokenString = await AsyncStorage.getItem("@M1:userToken");
      var userContext = JSON.parse(userContextString);
      if (userContext.user && !userContext.user.phoneNumber) {
        this.setState({ requiresAdditionalInfo: true });
      }

      if (Platform.OS === "android") {
        let channel = {
          name: Constants.manifest.slug,
          description: Constants.manifest.slug,
          sound: true,
          vibrate: true,
          badge: true
        };

        var result = await Notifications.createChannelAndroidAsync(
          "chat-badge",
          channel
        );
      }

      var appContext = JSON.parse(appContextString);
      var userToken = JSON.parse(userTokenString);

      this.setState({ userContext, appContext });

      const currentTeam = _.find(
        userContext.appContextList,
        c => c.id === appContext.id
      );

      clearInterval(readChatTimer);
      readChatTimer = setInterval(async () => {
        if (!this.state.showLinkParent) {
          await this.checkForGuardianLink();
        }
        var unReadChatCount = await AsyncStorage.getItem("unReadMessageCount");

        if (unReadChatCount) {
          var totalCount = JSON.parse(unReadChatCount);
          this.props.navigation.setParams({
            unReadChatCount: totalCount.length
          });
        }
      }, 1000);

      var user = userContext && userContext.user ? userContext.user : {};

      var notification_data = await AsyncStorage.getItem("notification_data");

      if (notification_data) {
        let notification_selected = JSON.parse(notification_data);

        if (user.id == notification_selected.userId) {
          let navigation = this.props.navigation;

          try {
            this.setState({ loading: true });
            var usersConvos = await API.graphql(
              graphqlOperation(getUserAndConversations, { id: user.id })
            );

            if (usersConvos) {
              if (
                usersConvos.data.getUser &&
                usersConvos.data.getUser.userConversations.items
              ) {
                var conversation = _.find(
                  _.filter(
                    usersConvos.data.getUser.userConversations.items,
                    r => r.conversation != null
                  ),
                  pe =>
                    pe.conversation.id ==
                    notification_selected.messageConversationId
                );

                if (conversation) {
                  if (conversation.status !== "DELETED") {
                    this.props.navigation.navigate("Conversation", {
                      conversation: conversation,
                      userId: user.id,
                      currentTeam: currentTeam,
                      backToConversations: false
                    });
                  }
                }
              }
              this.setState({ loading: false });
            }
          } catch (e) {
            console.log("usersConvos e ", e);
          }

          await AsyncStorage.removeItem("notification_data");
        }
      }

      await AsyncStorage.setItem("currentStage", "landing");

      const { status: existingStatus } = await Permissions.getAsync(
        Permissions.NOTIFICATIONS
      );
      let finalStatus = existingStatus;

      user.pushNotificationTokens = user.pushNotificationTokens
        ? user.pushNotificationTokens
        : [];

      let alreadyHasToken = _.find(
        user.pushNotificationTokens,
        tokenObject => tokenObject.installationId == Constants.installationId
      );

      if (alreadyHasToken) {
        await API.post("updateUserStatus", `/userStatusUpdate/${user.id}`, {
          body: { expoToken: alreadyHasToken.token, isLive: true }
        });
      }

      this.props.navigation.setParams({
        onAdd: this._clickRightNavigation,
        bShowAddButton: true,
        appContext,
        userContext
      });

      const orgId = currentTeam.organizationId;
      const jwtToken = userToken.signInUserSession.idToken.jwtToken;

      var AUTH_FORM = {
        grant_type: "client_credentials",
        client_id: "MaxOne",
        client_secret: "VTNSaFoybHVaem9nVkdWaGJTQmhjSEE9"
      };

      let formBody = [];
      for (let property in AUTH_FORM) {
        let encodedKey = encodeURIComponent(property);
        let encodedValue = encodeURIComponent(AUTH_FORM[property]);
        formBody.push(encodedKey + "=" + encodedValue);
      }
      formBody = formBody.join("&");

      var request = {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formBody
      };
      var newToken = await fetch(API_URL + "/oauth/token", request).then(
        response => response.json()
      );

     

      let schoolNews = [];
      if (orgId) {
        schoolNews = await fetch(
          `https://test-connect.vnnsports.net/integrations/v2/school/${orgId.replace(
            "vnn-",
            ""
          )}/wordpress-posts`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",

              Authorization: `Bearer ${newToken.access_token}`
            }
          }
        ).then(response => response.json());
      }

      var unReadChatCount = await AsyncStorage.getItem("unReadMessageCount");

      if (unReadChatCount) {
        var totalCount = JSON.parse(unReadChatCount);
        this.props.navigation.setParams({
          unReadChatCount: totalCount.length
        });
      }

      if (schoolNews instanceof Array) {
        this.setState({ school_news: schoolNews });
      }

      const { status: existingStatus } = await Permissions.getAsync(
        Permissions.NOTIFICATIONS
      );
      let finalStatus = existingStatus;

      let user = userContext.user;
      
      user.pushNotificationTokens = user.pushNotificationTokens
        ? user.pushNotificationTokens
        : [];

      let alreadyHasToken = _.find(
        user.pushNotificationTokens,
        tokenObject => tokenObject.installationId == Constants.installationId
      );

      if (!alreadyHasToken || existingStatus !== "granted") {
        // Android remote notification permissions are granted during the app
        // install, so this will only ask on iOS

        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        let expoToken = await Notifications.getExpoPushTokenAsync();
        let newTokenObject = {
          installationId: Constants.installationId,
          token: expoToken
        };

        await API.post("updateUserStatus", `/userStatusUpdate/${user.id}`, {
          body: { expoToken: expoToken, isLive: true }
        });

        console.log("newTokenObject ", newTokenObject);

        finalStatus = status;
        user.pushNotificationTokens = [
          ...user.pushNotificationTokens,
          newTokenObject
        ];

        var unReadChatCount = await AsyncStorage.getItem("unReadMessageCount");

        if (unReadChatCount) {
          var nReadChatCount = JSON.parse(unReadChatCount);
          console.log(unReadChatCount);
          this.setState({ unReadChatCount: nReadChatCount.length });
        }

        const savedUser = await this.saveUser(user);
      }


      this.setState({ loading: false });
    } catch (e) {
      console.log("error ==> ", e);
      this.setState({ loading: false });
    }

    if (!alreadyHasToken || existingStatus !== "granted") {
      // Android remote notification permissions are granted during the app
      // install, so this will only ask on iOS
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      let expoToken = await Notifications.getExpoPushTokenAsync();
      let newTokenObject = {
        installationId: Constants.installationId,
        token: expoToken
      };

      await API.post("updateUserStatus", `/userStatusUpdate/${user.id}`, {
        body: { expoToken: expoToken, isLive: true }
      });

      console.log("newTokenObject ", newTokenObject);

      finalStatus = status;
      user.pushNotificationTokens = [
        ...user.pushNotificationTokens,
        newTokenObject
      ];

      var unReadChatCount = await AsyncStorage.getItem("unReadMessageCount");

      if (unReadChatCount) {
        var nReadChatCount = JSON.parse(unReadChatCount);
        console.log(unReadChatCount);
        this.setState({ unReadChatCount: nReadChatCount.length });
      }

      const savedUser = await this.saveUser(user);
    }
  };

  async saveUser(user) {
    return API.post("users", "/users", {
      body: user
    });
  }

  submitAdditionalData = async () => {
    if (
      this.state.appContext &&
      this.state.appContext.isAthlete &&
      !this.state.parentFirstName
    )
      return alert("oops, we need a parent first name");
    if (
      this.state.appContext &&
      this.state.appContext.isAthlete &&
      !this.state.parentLastName
    )
      return alert("oops, we need a parent last name");
    if (
      this.state.appContext &&
      this.state.appContext.isAthlete &&
      !this.state.parentEmail
    )
      return alert("oops, we need a parent email");
    if (
      this.state.appContext &&
      this.state.appContext.isAthlete &&
      !this.state.emergencyContactPhone
    )
      return alert("oops, we need a parent phone number");

    if (!this.state.phoneNumber) return alert("oops, we need a phone number");

    this.setState({ loading: true });

    var phoneNumber = await this.cleansePhone(this.state.phoneNumber);
    if (!phoneNumber) {
      this.setState({ error: "Phone Number Invalid" });
      this.setState({ loading: false });
      return;
    }

    // Create cognito user with password
    // Create User
    // Create Roles

    var user = this.state.userContext.user;

    user.phoneNumber = phoneNumber.toString();

    if (this.state.appContext && this.state.appContext.isAthlete) {
      var emergencyContactPhone = await this.cleansePhone(
        this.state.emergencyContactPhone
      );
      if (!emergencyContactPhone) {
        this.setState({ error: "Parent Phone Number Invalid" });
        this.setState({ loading: false });
        return;
      }

      var parentEmail = await this.verifyEmail(this.state.parentEmail);
      if (!parentEmail) {
        this.setState({ error: "Email Invalid" });
        this.setState({ loading: false });
        return;
      }
      user.emergencyContactPhone = emergencyContactPhone.toString();
      user.parentEmail = parentEmail;
      user.parentName =
        this.state.parentFirstName + " " + this.state.parentLastName;
    }

    if (user.parentEmail) {
      user.currentTeam = this.state.currentTeam;
    }

    var userData = await this.createUser(user);

    if (userData) {
      // on success, remove "needs more data" and update userContext
      var userContext = this.state.userContext;
      userContext.user = user;
      await this._storeUserContext(userContext);
      this.setState({ requiresAdditionalInfo: false, loading: false });
    } else {
      this.setState({
        error: "Whoops, something went wrong.  Please try again."
      });
      this.setState({ loading: false });
    }
  };

  async saveUser(user) {
    return API.post("users", "/users", {
      body: user
    });
  }


  async checkAppContextChanged() {}
  onChangeTab = index => {
    this.setState({ index: index });
  };

  cleansePhone = async phoneNumber => {
    // console.log('phoneNumber', phoneNumber)
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

  createUser = async user => {
    return API.post("users", `/users`, {
      body: user
    });
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

  checkForGuardianLink = async () => {
    try {
      const guardianId = await AsyncStorage.getItem("@M1:guardianId", null);
      if (guardianId) {
        const guardianNameLast = await AsyncStorage.getItem(
          "@M1:guardianNameLast",
          null
        );
        const guardianNameFirst = await AsyncStorage.getItem(
          "@M1:guardianNameFirst",
          null
        );

        this.setState({
          showLinkParent: true,
          guardianId,
          guardianNameFirst,
          guardianNameLast
        });
        Alert.alert(
          "Parent Link Request",
          `${guardianNameFirst} ${guardianNameLast} has requested to link to your account.`,
          [
            { text: "Accept", onPress: () => this.acceptParentRequest() },
            {
              text: "Deny",
              onPress: () => this.denyParentRequest(),
              style: "cancel"
            }
          ],
          { cancelable: false }
        );
      }
    } catch (error) {
      // Error retrieving data
      console.error("error in retrieving data", error);
    }
  };

  async denyParentRequest() {
    console.log("Removing request");
    await AsyncStorage.removeItem("@M1:guardianNameLast");
    await AsyncStorage.removeItem("@M1:guardianNameFirst");
    await AsyncStorage.removeItem("@M1:guardianId");
  }

  async acceptParentRequest() {
    console.log("Accepting request");
    try {
      await this.createGuardianLink(
        this.state.guardianId,
        this.state.userContext.user.id
      );
      await AsyncStorage.removeItem("@M1:guardianNameLast");
      await AsyncStorage.removeItem("@M1:guardianNameFirst");
      await AsyncStorage.removeItem("@M1:guardianId");
      this.setState({
        showLinkParent: false,
        guardianId: null,
        guardianNameFirst: null,
        guardianNameLast: null
      });
      alert("Successfully Linked");
    } catch (e) {
      console.log("Error = e", e);
    }
  }

  async createGuardianLink(parentId, athleteId) {
    return API.post("users", `/guardian/${parentId}/athlete/${athleteId}`);
  }

  _renderTabBar = props => (
    <TabBar
      {...props}
      scrollEnabled
      indicatorStyle={styles.indicator}
      style={styles.tabBar}
      tabStyle={styles.tab}
      labelStyle={styles.label}
    />
  );

  newsSort = item => {
    return item.sort(function(x, y) {
      if (x.createdAt < y.createdAt) {
        return 1;
      }

      if (x.createdAt > y.createdAt) {
        return -1;
      }

      return 0;
    });
  };

  _onChangeInputValue = (value, key) => {
    if (!this.mount) return false;

    switch (key) {
      case INPUT_PHONE_NUMBER:
        this.setState({ phoneNumber: value });
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
      case INPUT_EMERGENCY_PHONENUMBER:
        this.setState({ emergencyContactPhone: value });
        break;
    }
    return true;
  };
  isJson(item) {
    item = typeof item !== "string" ? JSON.stringify(item) : item;

    try {
      item = JSON.parse(item);
    } catch (e) {
      return false;
    }

    if (typeof item === "object" && item !== null) {
      return true;
    }

    return false;
  }

  _renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity
        style={{
          flexDirection: "column"
        }}
        onPress={() => {
          Linking.openURL(item.link);
        }}
      >
        <View
          style={{
            flexDirection: "row",
            borderBottomWidth: 1,
            borderBottomColor: "#f4f4f4",
            paddingHorizontal: 20,
            padding: 10
          }}
        >
          <View
            style={{
              paddingRight: item.logo == "" || item.logo == null ? 0 : 10,
              flex: item.logo == "" || item.logo == null ? 0 : 0.25
            }}
          >
            {item.logo != "" && item.logo != null && (
              <CacheImage
                {...{
                  uri: item.logo
                }}
                style={{ width: "100%", height: 75 }}
              />
            )}
          </View>
          <View
            style={{
              flexDirection: "column",
              flex: item.logo == "" || item.logo == null ? 1 : 0.75,
              paddingLeft: item.logo == "" || item.logo == null ? 0 : 10,
              paddingTop: 5
            }}
          >
            <View style={{ flexDirection: "column", marginBottom: 15 }}>
              <Text style={styles.type}>
                {moment(item.published_date).format("MMM DD")}
              </Text>
            </View>
            <View style={{ flexDirection: "column", marginBottom: 5 }}>
              <Text style={styles.title}>{item.title}</Text>
            </View>
            <View style={{ flexDirection: "column", marginBottom: 5 }}>
              <Text
                style={styles.detail}
                numberOfLines={2}
                ellipsizeMode={"tail"}
              >
                {item.description}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  renderScene = ({ route }) => {
    const currentRoute = route.key;

    return (
      <View style={{ flex: 1 }}>
        <View style={styles.top_spacer} />
        <FlatList
          data={
            currentRoute === "school_news"
              ? this.state.school_news
              : this.state.team_news
          }
          renderItem={this._renderItem}
          keyExtractor={item => item.title + item.description}
          style={{ backgroundColor: "white" }}
        />
      </View>
    );
  };

  render() {
    const { loading } = this.state;
    return (
      <View style={{ width: "100%", height: "100%" }}>
        <StatusBar barStyle="light-content" translucent={false} />
        <TabView
          navigationState={this.state}
          renderScene={this.renderScene}
          onIndexChange={index => this.onChangeTab(index)}
          initialLayout={styles.initial_layout}
          style={styles.background_white}
          renderTabBar={this._renderTabBar}
        />

        {loading && (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              position: "absolute",
              left: 0,
              top: 0
            }}
          >
            <ActivityIndicator size="large" />
          </View>
        )}
        <Modal
          visible={this.state.requiresAdditionalInfo}
          animationType="slide"
          transparent={false}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS == "android" ? undefined : "padding"}
            style={CommonStyles.container}
          >
            <ScrollView
              contentContainerStyle={{
                marginTop: 22,
                marginLeft: 10,
                marginRight: 10,
                flex: 1,
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {this.state.appContext && this.state.appContext.isAthlete ? (
                <Text>We need just a little more info from you</Text>
              ) : (
                <Text>
                  We just need a little more information from you in order to
                  include you and your parents in team communication
                </Text>
              )}
              {this.state.error ? (
                <Text style={{ color: "red" }}> {this.state.error} </Text>
              ) : null}
              >
              <View style={[styles.otherInfo, styles.row_container]}>
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
              </View>
              {this.state.appContext && this.state.appContext.isAthlete && (
                <View>
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
                  <View style={[styles.otherInfo, styles.row_container]}>
                    <FloatingLabel
                      autoCapitalize={"none"}
                      autoCorrect={false}
                      keyboardType={"phone-pad"}
                      labelStyle={styles.labelInput}
                      inputStyle={styles.input}
                      style={styles.formInput}
                      value={this.state.emergencyContactPhone}
                      onChangeText={text =>
                        this._onChangeInputValue(
                          text,
                          INPUT_EMERGENCY_PHONENUMBER
                        )
                      }
                    >
                      {"Parent Phone Number"}
                    </FloatingLabel>
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
                </View>
              )}
              <View style={styles.buttonGroupContainer}>
                <PolygonButton
                  title={"SUBMIT"}
                  onPress={() => this.submitAdditionalData()}
                  customColor={AppColors.button.background}
                  textColor={AppColors.button.text}
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  scene: {
    flex: 1
  },
  background_white: {
    backgroundColor: "#fff"
  },
  buttonGroupContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 20,
    marginRight: 20,
    marginTop: 35
  },
  initial_layout: {
    width: AppSize.screen.width
  },
  tab: {
    width: AppSize.screen.width / 2
  },
  tabBar: {
    backgroundColor: "#ffffff"
  },
  indicator: {
    backgroundColor: "#A4242A",
    height: 2
  },
  label: {
    color: "#454545",
    fontWeight: "bold"
  },
  drawerItemBorder: {
    borderRightWidth: 1,
    borderRightColor: "#454545"
  },
  drawerItem: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    padding: 5
  },
  drawerItemLabel: {
    fontSize: 12
  },
  drawerContainer: {
    backgroundColor: Color(Grey)
      .alpha(0.3)
      .toString(),
    flexDirection: "row",
    //justifyContent: 'space-around',
    alignItems: "stretch",
    padding: 5
  },
  top_spacer: {
    width: "100%",
    height: 3,
    backgroundColor: "#D7D7D7"
  },
  type: {
    color: "#A5A6A7",
    fontSize: 13,
    letterSpacing: -0.8
  },
  title: {
    color: "#1c66ad",
    fontSize: 14,
    fontWeight: "bold"
  },
  detail: {
    lineHeight: 22
  },
  helperText: {
    fontSize: 10,
    marginTop: 0,
    color: "grey"
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
  },
  badge: {
    position: "absolute",
    top: -5
  }
});
