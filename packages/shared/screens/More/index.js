import React from "react";
import {
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  View,
  Image,
  AsyncStorage,
  Picker,
  NativeModules
} from "react-native";
import AWS from "aws-sdk/global";

import { AppColors, AppSizes } from "@assets/theme";
import { Auth, API } from "aws-amplify";
import { WebBrowser } from "expo";
import { Constants, ForwardingCookieHandler } from "expo";
var RCTNetworking = require("RCTNetworking");

import storage from "@m1/shared/services/storage";
import SimplePicker from "react-native-simple-picker";

import Button from "@m1/shared/components/Button";
import FontIcon from "@m1/shared/components/FontIcon";
import Spacer from "@m1/shared/components/Spacer";
import ContextService from "@m1/shared/services/context";
import CommonStyles from "@m1/shared/theme/styles";
import CommonSizes from "@m1/shared/theme/sizes";
import CommonColors from "@m1/shared/theme/colors";
import _ from "lodash";
import Images from "@assets/images";
import { Avatar, Badge, Icon, withBadge } from "react-native-elements";
const imgDownArrow = require("@m1/shared/assets/down_arrow.png");

var readChatTimer = -1;
const styles = StyleSheet.create({
  card: {
    width: AppSizes.screen.width - 40,
    backgroundColor: "white",
    borderTopWidth: 0,
    borderBottomWidth: 0
  },
  userName: {
    fontSize: 24,
    lineHeight: 25,
    fontWeight: "600",
    color: AppColors.text.dark
  },
  userEmail: {
    fontSize: 12,
    color: AppColors.text.light
  },
  menuItem: {
    fontSize: 18,
    color: AppColors.text.dark
  },
  accountNameWrapper: {
    height: 70,
    justifyContent: "center",
    alignItems: "flex-start"
  },
  accountName: {
    color: "#333",
    fontSize: 24,
    fontWeight: "800",
    alignItems: "flex-end",
    justifyContent: "flex-end"
  },
  editProfileWrapper: {
    flexDirection: "column",
    justifyContent: "flex-start"
  },
  badge: {
    position: "absolute",
    top: -5
  }
});

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
class Profile extends React.Component {
  static navigationOptions = ({ navigation }) => {
    let params = navigation.state.params;
    var unReadChatCount = 0;
    var appContext =
      navigation.state.params && navigation.state.params.appContext
        ? navigation.state.params.appContext
        : {};
    if (params && params.unReadChatCount) {
      unReadChatCount = params.unReadChatCount;
    }
    return {
      headerTitle: (
        <Image
          style={{ height: 22, width: 160 }}
          resizeMode="contain"
          source={Images.logoHeader}
        />
      ),
      headerLeft: null,
      headerRight: (
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
              onPress={() => navigation.navigate("CHAT")}
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
      )
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      user: {},
      appContext: {},
      userContext: {},
      appContextList: [],
      showTeamSwitcher: false,
      menu: [
        {
          id: 4,
          name: "Settings",
          icon: "settings",
          iconSize: 25,
          // change the on press
          onPress: () => this.handleSetting()
        },
        {
          id: 5,
          name: "Log out",
          icon: "lock",
          iconSize: 25,
          // change the on press
          onPress: () => this.handleSignOut()
        }
      ]
    };

    this.mount = true;
  }

  handleSetting = () => {
    this.props.navigation.navigate("SETTING");
  };

  handleSignOut = async () => {
    var userContextString = await AsyncStorage.getItem("@M1:userContext");
    var userContext = JSON.parse(userContextString);

    var user = userContext.user;

    user.pushNotificationTokens = user.pushNotificationTokens
      ? user.pushNotificationTokens
      : [];

    let alreadyHasToken = _.find(
      user.pushNotificationTokens,
      tokenObject => tokenObject.installationId == Constants.installationId
    );

    if (alreadyHasToken) {
      await API.post("updateUserStatus", `/userStatusUpdate/${user.id}`, {
        body: { expoToken: alreadyHasToken.token, isLive: false }
      });
    }

    await Auth.signOut()
      .then(async () => {
        try {
          await AsyncStorage.removeItem("@M1:user");
          await AsyncStorage.removeItem("@M1:userContext");
          await AsyncStorage.removeItem("@M1:appContext");
          await AsyncStorage.removeItem("@M1:userToken");
        } catch (e) {}
        if (Constants.manifest.slug === "vnn") {
          try {
            // clear cookie for VNN.
            // await RCTNetworking.clearCookies((cleared) => {
            //     console.log('Cleared Cookies.' + cleared.toString())
            // })

            let { type, url: newUrl } = await WebBrowser.openBrowserAsync(
              "https://maxone-vnn.auth.us-east-1.amazoncognito.com/logout?response_type=token&client_id=5nqasit6a60qfgibejnonldugq&redirect_uri=m1-vnn://auth/login/"
            );
            console.log("type", type);
            console.log("newUrl", newUrl);
            // // On Expo, use WebBrowser.openAuthSessionAsync to open the Hosted UI pages.
            // const { type, url: newUrl } = await WebBrowser.openAuthSessionAsync(
            //   url,
            //   redirectUrl
            // );
            //
            // if (type === "success") {
            //   await WebBrowser.dismissBrowser();
            //
            //   if (Platform.OS === "ios") {
            //     return Linking.openURL(newUrl);
            //   }
            // }

            // await ForwardingCookieHandler.clearCookies(cleared =>{
            //   console.log('ForwardingCookieHandler === ', cleared)
            // })
            // //
            // const Networking = NativeModules.Networking;
            // await Networking.clearCookies((cleared) => {
            //     console.debug('cleared hadCookies: ' + cleared.toString());
            // });
          } catch (e) {
            console.log("e ", e);
          }
        }
        this.props.navigation.navigate("Auth");
      })
      .catch(err => console.log(err));
  };

  async componentDidMount() {
    try{


      clearInterval(readChatTimer);
      var unReadChatCount = await AsyncStorage.getItem("unReadMessageCount");

      if (unReadChatCount) {
        var totalCount = JSON.parse(unReadChatCount);
        this.props.navigation.setParams({
          unReadChatCount: totalCount.length
        });
      }
      var appContext = await this._retrieveAppContext();
      var userContext = await this._retrieveUserContext();
      this.props.navigation.setParams({
        appContext
      });

      readChatTimer = setInterval(async () => {
        var unReadChatCount = await AsyncStorage.getItem("unReadMessageCount");

        if (unReadChatCount) {
          var totalCount = JSON.parse(unReadChatCount);
          this.props.navigation.setParams({
            unReadChatCount: totalCount.length
          });
        }
      }, 1000);

      var user = userContext ? userContext.user : {};
      var name = "";
      if (user && user.nameFirst) {
        name = name + user.nameFirst + " ";
      }
      if (user && user.nameLast) {
        name = name + user.nameLast;
      } else if (user && user.name) {
        name = user.name;
      }
      var avatarUrl = "";
      if (user && user.avatarUrl) {
        if (user.avatarUrl.includes("http")) {
          avatarUrl = user.avatarUrl;
        } else {
          avatarUrl = `https://s3.amazonaws.com/programax-videos-production/uploads/user/avatar/${
            user.legacyId ? user.legacyId : user.id
          }/${user.avatarUrl}`;
        }
      }
      var appContextList = userContext.appContextList
        ? _.filter(userContext.appContextList, a => {
            return a.isTeam;
          })
        : [];

      appContextList.sort(function(a, b) {
        var firstName = `${a.name} ${a.sport ? a.sport : ""}`;
        var secondName = `${b.name} ${b.sport ? b.sport : ""}`;

        if (firstName > secondName) {
          return 1;
        }

        if (firstName < secondName) {
          return -1;

          return 0;
        }
      });

      var currentTeam = _.find(
        userContext.appContextList,
        a => a.id === appContext.id
      );

      let menu = this.state.menu;

      if (appContext && appContext.isAthlete && Constants.manifest.slug !== "vnn") {
        menu.unshift({
          id: 2,
          name: "Alumni Rewards",
          icon: "trophy",
          iconSize: 26,
          onPress: () => this.props.navigation.navigate("REWARDS")
        });
        menu.unshift({
          id: 1,
          name: "Link to Parent",
          icon: "people_outline",
          iconSize: 26,
          onPress: () => this.props.navigation.navigate("LinkParent")
        });
      }

      if (appContext.isGuardian && appContext.id !== "" && Constants.manifest.slug !== "vnn") {
        menu.unshift({
          id: 2,
          name: "Alumni Rewards",
          icon: "trophy",
          iconSize: 26,
          onPress: () => this.props.navigation.navigate("REWARDS")
        });
      }
      if (appContext.isGuardian && Constants.manifest.slug !== "vnn") {
        menu.unshift({
          id: 1,
          name: "Add Child",
          icon: "people_outline",
          iconSize: 26,
          onPress: () => this.props.navigation.navigate("GuardianQRCode")
        });
      }

      this.setState({
        menu,
        name,
        avatarUrl,
        appContext,
        userContext,
        currentTeam,
        appContextList
      });
    }
    catch(e){
      console.log('Error => ', e)
    }


  }
  componentWillUnmount() {
    clearInterval(readChatTimer);
  }
  _retrieveAppContext = async () => {
    try {
      const value = await AsyncStorage.getItem("@M1:appContext");
      if (value !== null) {
        // We have data!!

        return JSON.parse(value);
      }
    } catch (error) {
      // Error retrieving data
      console.error("error in retrieving data", error);
    }
  };

  _showContextPicker = () => {
    if (this.contextPicker == null || this.contextPicker == undefined) return;

    this.contextPicker.show();
  };

  _retrieveUserContext = async () => {
    try {
      const value = await AsyncStorage.getItem("@M1:userContext");
      if (value !== null) {
        // We have data!!

        return JSON.parse(value);
      }
    } catch (error) {
      // Error retrieving data
      console.error("error in retrieving data", error);
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

  changeAppContext = async newAppContextId => {
    const contextService = new ContextService();

    const newAppContext = await contextService.changeAppContext(
      this.state.userContext,
      newAppContextId
    );
    appContext = newAppContext;
    var currentTeam = _.find(
      this.state.userContext.appContextList,
      a => a.id === appContext.id
    );
    this.setState({ appContext, showTeamSwitcher: false, currentTeam });

    await this._storeAppContext(appContext);
  };

  render() {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: "#fff" }}>
        <SafeAreaView style={{ paddingHorizontal: 20 }}>
          <View style={{ flex: 1, flexDirection: "row", marginTop: 45 }}>
            <Avatar
              rounded
              source={{
                uri: this.state.avatarUrl
              }}
              size={70}
            />
            <View style={[styles.accountNameWrapper, { paddingLeft: 15 }]}>
              <Text style={[styles.accountName]}>{this.state.name}</Text>
              {this.state.appContext && this.state.appContext.id !== "" && (
                <TouchableOpacity
                  onPress={() =>
                    this.props.navigation.push("ProfileEditScreen")
                  }
                >
                  <Text
                    style={{
                      fontWeight: "300",
                      color: "#333",
                      fontSize: 12,
                      fontWeight: "600"
                    }}
                  >
                    Edit Profile
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {this.state.appContext && this.state.appContext.id !== "" && (
            <TouchableOpacity
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-start",
                paddingVertical: 20,
                borderTopWidth: 0,
                borderColor: "#D8D8D8"
              }}
              onPress={this._showContextPicker}
            >
              <View style={{ paddingLeft: 0, flex: 0.9 }}>
                <Text style={styles.menuItem}>
                  Current{" "}
                  {Constants.manifest.slug === "pgc" ? "Session" : "Team"}:{" "}
                  {this.state.currentTeam && this.state.currentTeam.customName
                    ? this.state.currentTeam.customName
                    : this.state.currentTeam && this.state.currentTeam.name
                    ? `${this.state.currentTeam.name} ${this.state.currentTeam.sport}`
                    : ""}
                </Text>
              </View>

              <View style={{ flex: 0.1, alignItems: "flex-end" }}>
                { this.state.appContextList && this.state.appContextList.length ?<Image
                  source={imgDownArrow}
                  style={CommonStyles.moreDownArrowImage}
                  resizeMode="contain"
                /> : null }
              </View>
            </TouchableOpacity>
          )}
          {/*this.state.showTeamSwitcher ? (
            <Picker
              selectedValue={this.state.appContext.id}
              style={{ height: 90, width: "100%" }}
              onValueChange={async (itemValue, itemIndex) =>
                await this.changeAppContext(itemValue)
              }
            >
              {this.state.appContextList.map((item, i) => (
                <Picker.Item
                  key={item.id}
                  //   label={`${item.name} ${item.sport ? item.sport : ""}`}
                  label={
                    item.customName
                      ? item.customName
                      : item.name
                      ? `${item.name} ${item.sport}`
                      : ""
                  }
                  value={item.id}
                />
              ))}
            </Picker>
          ) : null */}

          <Spacer size={65} color="transparent" />
          <View style={[styles.card]}>
            {this.state.menu.map((item, i) => (
              <TouchableOpacity
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  paddingVertical: 20,
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderColor: "#D8D8D8"
                }}
                key={item.id}
                onPress={() => item.onPress()}
              >
                <View style={{ paddingLeft: 0, flex: 0.9 }}>
                  <Text style={styles.menuItem}>{item.name}</Text>
                </View>

                <View style={{ flex: 0.1, alignItems: "flex-end" }}>
                  <FontIcon
                    name={item.icon}
                    size={item.iconSize}
                    color={"#767676"}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <SimplePicker
            options={_.uniq(_.map(this.state.appContextList, item => item.id))}
            labels={_.uniq(
              _.map(this.state.appContextList, item =>
                item.customName
                  ? item.customName
                  : item.name
                  ? `${item.name} ${item.sport}`
                  : ""
              )
            )}
            ref={picker => (this.contextPicker = picker)}
            onSubmit={async (itemValue, itemIndex) =>
              await this.changeAppContext(itemValue)
            }
            style={pickerSelectStyles.remind_picker}
            selectedValue={this.state.appContext.id}
            cancelText={"Cancel"}
            confirmText={"Done"}
          />
        </SafeAreaView>
      </ScrollView>
    );
  }
}

export default Profile;
