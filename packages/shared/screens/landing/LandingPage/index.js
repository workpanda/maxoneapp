import React, { PureComponent } from "react";
import {
  Text,
  View,
  Linking,
  FlatList,
  StyleSheet,
  Image,
  Alert,
  AsyncStorage,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
  Platform,
  ScrollView,
  ActivityIndicator
} from "react-native";
import _ from "lodash";
import uuid from "uuid/v4";
import moment from "moment";
import Images from "@assets/images";
import AppColors from "@assets/theme/colors";
import storage from "@m1/shared/services/storage";
import CommonStyles from "@m1/shared/theme/styles";
import FontIcon from "@m1/shared/components/FontIcon";
import ContextService from "@m1/shared/services/context";
import { API, Auth, graphqlOperation } from "aws-amplify";
import { Permissions, Notifications, Constants } from "expo";
import { Badge } from "react-native-elements";
import { getUserAndConversations } from "@m1/shared/screens/tab/Chat/graphql";

const { height } = Dimensions.get("window");

var readChatTimer = -1;

class LandingPage extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      appContext: {},
      unReadChatCount: 0,
      loading: false,
      showLinkParent: false,
      guardianId: null,
      guardianNameFirst: null,
      guardianNameLast: null
    };
  }

  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: (
        <Image
          style={{ height: 22, width: 160 }}
          resizeMode="contain"
          source={Images.logoHeader}
        />
      ),
      headerLeft: null,
      headerRight: null
    };
  };

  // APIS //
  getAthletes = async teamId => {
    return API.get("programs", `/programs/${teamId}/players`);
  };

  getCoaches = async teamId => {
    return API.get("programs", `/programs/${teamId}/coaches`);
  };

  getTeamConversations = async teamId => {
    return API.get("chat", `/parent/${teamId}/conversation`);
  };
  // END APIS //

  // CHAT LOGIC FOR DEFAULT CONVERSATION //
  createDefaultConversation = async (currentTeam, currentUser) => {
    const teamId = currentTeam.id;

    // set name
    const conversationName = currentTeam.customName
      ? `All ${currentTeam.customName}`
      : `All ${currentTeam.name} ${currentTeam.sport}`;

    // create users list for conversation members
    const coaches = (await this.getCoaches(currentTeam.id)) || [];
    const athletes = (await this.getAthletes(currentTeam.id)) || [];
    const users = _.map(athletes, a => a.id).concat(_.map(coaches, c => c.id));
    users.push(currentUser.id);
    const members = _.uniqBy(users).sort();

    // create conversation
    const convo = {
      input: {
        teamId,
        id: uuid(),
        name: conversationName,
        createdAt: moment()
      }
    };

    try {
      await API.graphql(graphqlOperation(createConvo, convo)).then(
        async conversation => {
          const {
            data: {
              createConvo: { id: convoLinkConversationId }
            }
          } = conversation;

          try {
            await Promise.all(
              members.map(async member => {
                var id = uuid();
                var relation = {
                  input: {
                    convoLinkConversationId: convoLinkConversationId,
                    convoLinkUserId: member,
                    id: id,
                    name: conversationName,
                    status: "READY"
                  }
                };
                await API.graphql(graphqlOperation(createConvoLink, relation));
              })
            );
          } catch (e) {
            console.log("Error creating conversation link");
          }
        }
      );
    } catch (e) {
      console.log("Error creating conversation");
    }
    return;
  };
  // END CHAT LOGIC FOR DEFAULT CONVERSATION //

  async handleNotification(notification) {
    // handle external urls from push notifications

    if (notification.data.externalUrl)
      Linking.openURL(notification.data.externalUrl);

    // handle linked activities from push notifications
    if (notification.data.activityId) {
      const activity = await this.getActivity(notification.data.activityId);
      this.props.navigation.navigate("VideoDetail", {
        title: activity.name,
        data: activity
      });
    }
  }

  componentWillReceiveProps(props) {
    let subscription = Notifications.addListener(this.handleNotification);
  }

  async componentDidMount() {
    try {
      var appContextString = await AsyncStorage.getItem("@M1:appContext");
      var appContext = JSON.parse(appContextString);
      var userContextString = await AsyncStorage.getItem("@M1:userContext");
      var userContext = JSON.parse(userContextString);
      let subscription = Notifications.addListener(this.handleNotification);

      if (!appContext || !appContext.id || appContext.id === "") {
        // set app context

        var { userContext, appContext } = await this.setSessionInfo(
          userContext.user.username
        );
      }
      this.setState({ appContext, userContext });
      this.props.navigation.setParams({
        bShowAddButton: true,
        appContext
      });

      // set app context

      var user = userContext.user;

      var currentTeam = _.find(
        userContext.appContextList,
        c => c.id === appContext.id
      );

      // DETERMINE IF WE SHOULD CREATE DEFAULT CONVERSATION
      this.setState({ loading: true });

      // get all team conversations
      let teamConversations = [];
      if (currentTeam) {
        teamConversations = await this.getTeamConversations(currentTeam.id);
      }
      // check if default conversation already exists
      let defaultConversation =
        _.find(
          teamConversations,
          convo => convo.name == `All ${currentTeam.customName}`
        ) || null;

      // if not create it
      if (!defaultConversation && appContext.isCoach && appContext.id) {
        let newDefaultConversation = await this.createDefaultConversation(
          currentTeam,
          user
        );
      }

      this.setState({ loading: false });
      // END OF CONVERSATION LOGIC

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
                this.setState({ loading: false });
              }
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

      clearInterval(readChatTimer);
      readChatTimer = setInterval(async () => {
        var unReadChatCount = await AsyncStorage.getItem("unReadMessageCount");
        if (!this.state.showLinkParent) {
          await this.checkForGuardianLink();
        }
        if (unReadChatCount) {
          var nReadChatCount = JSON.parse(unReadChatCount);

          this.setState({ unReadChatCount: nReadChatCount.length });
        }
      }, 1000);

      if (!alreadyHasToken || existingStatus !== "granted") {
        // Android remote notification permissions are granted during the app
        // install, so this will only ask on iOS

        const { status } = await Permissions.askAsync(
          Permissions.NOTIFICATIONS
        );
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
    } catch (e) {
      console.log("ERROR = ", e);
    }
  }

  async saveUser(user) {
    return API.post("users", "/users", {
      body: user
    });
  }

  componentWillUnmount() {
    clearInterval(readChatTimer);
  }

  setSessionInfo = async username => {
    const contextService = new ContextService();
    var { userContext, appContext } = await contextService.buildUserContext(
      username
    );
    // console.log("USER CONTEXT =====``= ", userContext);
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
      await this._storeAppContext(appContext);
    }
    return { userContext, appContext };
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
        // console.log(value);
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
        // console.log(value);
        return value;
      }
    } catch (error) {
      // Error retrieving data
      console.error("error in retrieving data", error);
    }
  };
  _retrieveUserContext = async () => {
    try {
      const value = await AsyncStorage.getItem("@M1:userContext");
      if (value !== null) {
        // We have data!!
        // console.log(value);
        return value;
      }
    } catch (error) {
      // Error retrieving data
      console.error("error in retrieving data", error);
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

  render() {
    const { appContext } = this.state;
    let navigation = this.props.navigation;
    return (
      <ImageBackground
        style={styles.contentContainer}
        source={require("@assets/images/background/Home.png")}
        imageStyle={CommonStyles.imageBackground}
      >
        <StatusBar barStyle="light-content" translucent={false} />
        <ScrollView
          style={{ flex: 1, padding: 20, width: "100%" }}
          contentContainerStyle={{
            justifyContent: "center",
            minHeight: height - (Platform.OS !== "ios" ? 54 : 64)
          }}
        >
          <View style={styles.contentParentContainer}>
            <View style={styles.rowContainer}>
              {appContext && appContext.isCoach && (
                <TouchableOpacity
                  onPress={() => navigation.navigate("MESSAGES")}
                  style={styles.iconTextContaner}
                >
                  <FontIcon name="send" size={65} color={"#fff"} />
                  <Text style={styles.styledText}>Messages</Text>
                </TouchableOpacity>
              )}
              {appContext &&
                (appContext.isAthlete || appContext.isGuardian) &&
                Constants.manifest.slug === "pgc" &&
                appContext.id !== "" && (
                  <TouchableOpacity
                    onPress={() => navigation.navigate("REWARDS")}
                    style={styles.iconTextContaner}
                  >
                    <FontIcon name="trophy" size={65} color={"#fff"} />
                    <Text style={styles.styledText}>Alumni Rewards</Text>
                  </TouchableOpacity>
                )}
              {appContext && appContext.id !== "" && (
                <TouchableOpacity
                  onPress={() => navigation.navigate("Conversations")}
                  style={styles.iconTextContaner}
                >
                  <FontIcon name="chat1" size={65} color={"#fff"} />
                  <Text style={styles.styledText}>Chat</Text>
                  {this.state.unReadChatCount > 0 && (
                    <Badge
                      value={this.state.unReadChatCount}
                      status="error"
                      containerStyle={{
                        position: "absolute",
                        top: 0,
                        right: 0
                      }}
                    />
                  )}
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.rowContainer}>
              {appContext && appContext.id !== "" && (
                <TouchableOpacity
                  onPress={() => navigation.navigate("CALENDAR")}
                  style={styles.iconTextContaner}
                >
                  <FontIcon name="events" size={65} color={"#fff"} />
                  <Text style={styles.styledText}>Calendar</Text>
                </TouchableOpacity>
              )}
              {appContext && (appContext.isAthlete || appContext.isCoach) && (
                <TouchableOpacity
                  onPress={() => navigation.navigate("TRAIN")}
                  style={styles.iconTextContaner}
                >
                  <FontIcon
                    name="play_circle_outline"
                    size={65}
                    color={"#fff"}
                  />
                  <Text style={styles.styledText}>Train</Text>
                </TouchableOpacity>
              )}
              {appContext && appContext.isGuardian && (
                <TouchableOpacity
                  onPress={() => navigation.navigate("CHILD")}
                  style={styles.iconTextContaner}
                >
                  <FontIcon name="face" size={65} color={"#fff"} />
                  <Text style={styles.styledText}>Child</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.rowContainer}>
              {appContext && appContext.isCoach && (
                <TouchableOpacity
                  onPress={() => navigation.navigate("RostersView")}
                  style={styles.iconTextContaner}
                >
                  <FontIcon name="people_outline" size={65} color={"#fff"} />
                  <Text style={styles.styledText}>Team</Text>
                </TouchableOpacity>
              )}
              {appContext && appContext.id !== "" && (
                <TouchableOpacity
                  onPress={() => navigation.navigate("PROFILE")}
                  style={styles.iconTextContaner}
                >
                  <FontIcon name="profile" size={65} color={"#fff"} />
                  <Text style={styles.styledText}>Profile</Text>
                </TouchableOpacity>
              )}
              {appContext && !appContext.isCoach && appContext.id !== "" && (
                <TouchableOpacity
                  onPress={() => navigation.navigate("MORE")}
                  style={styles.iconTextContaner}
                >
                  <FontIcon name="more" size={65} color={"#fff"} />
                  <Text style={styles.styledText}>More</Text>
                </TouchableOpacity>
              )}
            </View>
            {appContext && (appContext.isCoach || appContext.id === "") && (
              <View style={styles.rowContainer}>
                <TouchableOpacity
                  onPress={() => navigation.navigate("MORE")}
                  style={styles.iconTextContaner}
                >
                  <FontIcon name="more" size={65} color={"#fff"} />
                  <Text style={styles.styledText}>More</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
        {this.state.loading && (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
              width: "100%",
              height: "100%",
              left: 0,
              top: 0
            }}
          >
            <ActivityIndicator size="large" />
          </View>
        )}
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  contentContainer: {
    width: "100%",
    height: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.app.dark
  },
  contentParentContainer: {
    width: "100%",
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent"
  },
  rowContainer: {
    width: "100%",
    display: "flex",
    marginBottom: 30,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-around"
  },
  iconTextContaner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  styledText: {
    fontSize: 15,
    marginTop: 10,
    color: "white"
  }
});

export default LandingPage;
