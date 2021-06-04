import React from "react";
import {
  ActivityIndicator,
  View,
  AppState,
  StyleSheet,
  Linking,
  Alert
} from "react-native";

import * as Expo from "expo";
// import Apollo from './apollo';
import Nav from "@m1/navigation";
import Amplify from "aws-amplify";

import { API, Auth, graphqlOperation } from "aws-amplify";
// import config from './aws-exports'
import AppConfig from "@m1/constants/config";


import appSyncConfig from "@m1/constants/appsync"; // OPS
import { Rehydrated } from "aws-appsync-react"; // 4
import { ApolloProvider } from "react-apollo"; // 2
import { ApolloLink } from "apollo-link";
import { AsyncStorage } from "react-native";
import { NavigationActions } from "react-navigation";
import AWSAppSyncClient, {
  createAppSyncLink,
  createLinkWithCache
} from "aws-appsync";

import {
  KeepAwake,
  registerRootComponent,
  Notifications,
  Permissions
} from "expo";
import ContextService from "@m1/shared/services/context";
import _ from "lodash";

import storage from "@m1/shared/services/storage";

import { Snackbar } from "react-native-paper";
if (__DEV__) {
  KeepAwake.activate();
}
import { getUserAndConversations } from "@m1/shared/screens/tab/Chat/graphql";

const prefix = Expo.Linking.makeUrl("/");

Amplify.debug = true;
Amplify.configure({
  Auth: {
    mandatorySignIn: false,
    region: AppConfig.cognito.REGION,
    userPoolId: AppConfig.cognito.USER_POOL_ID,
    identityPoolId: AppConfig.cognito.IDENTITY_POOL_ID,
    userPoolWebClientId: AppConfig.cognito.APP_CLIENT_ID
  },
  Storage: {
    region: AppConfig.s3Legacy.REGION,
    bucket: AppConfig.s3Legacy.BUCKET,
    identityPoolId: AppConfig.cognito.IDENTITY_POOL_ID
  },
  API: {
    aws_appsync_graphqlEndpoint: appSyncConfig.graphqlEndpoint,
    aws_appsync_region: appSyncConfig.region,
    aws_appsync_authenticationType: appSyncConfig.authenticationType,
    endpoints: [
      {
        name: "chat",
        endpoint: AppConfig.apiGatewayChat.URL,
        region: AppConfig.apiGatewayChat.REGION
      },
      {
        name: "activities",
        endpoint: AppConfig.apiGatewayActivities.URL,
        region: AppConfig.apiGatewayActivities.REGION
      },
      {
        name: "auth",
        endpoint: AppConfig.apiGatewayAuth.URL,
        region: AppConfig.apiGatewayAuth.REGION
      },
      {
        name: "events",
        endpoint: AppConfig.apiGatewayEvents.URL,
        region: AppConfig.apiGatewayEvents.REGION
      },
      {
        name: "feedItems",
        endpoint: AppConfig.apiGatewayFeedItems.URL,
        region: AppConfig.apiGatewayFeedItems.REGION
      },
      {
        name: "groups",
        endpoint: AppConfig.apiGatewayGroups.URL,
        region: AppConfig.apiGatewayGroups.REGION
      },
      {
        name: "leaderboards",
        endpoint: AppConfig.apiGatewayLeaderboards.URL,
        region: AppConfig.apiGatewayLeaderboards.REGION
      },
      {
        name: "messages",
        endpoint: AppConfig.apiGatewayMessages.URL,
        region: AppConfig.apiGatewayMessages.REGION
      },
      {
        name: "organizations",
        endpoint: AppConfig.apiGatewayOrganizations.URL,
        region: AppConfig.apiGatewayOrganizations.REGION
      },
      {
        name: "products",
        endpoint: AppConfig.apiGatewayProducts.URL,
        region: AppConfig.apiGatewayProducts.REGION
      },
      {
        name: "programs",
        endpoint: AppConfig.apiGatewayPrograms.URL,
        region: AppConfig.apiGatewayPrograms.REGION
      },
      {
        name: "schedules",
        endpoint: AppConfig.apiGatewaySchedules.URL,
        region: AppConfig.apiGatewaySchedules.REGION
      },
      {
        name: "scheduledMessages",
        endpoint: AppConfig.apiGatewayScheduledMessages.URL,
        region: AppConfig.apiGatewayScheduledMessages.REGION
      },
      {
        name: "users",
        endpoint: AppConfig.apiGatewayUsers.URL,
        region: AppConfig.apiGatewayUsers.REGION
      },
      {
        name: "workoutPrograms",
        endpoint: AppConfig.apiGatewayWorkoutPrograms.URL,
        region: AppConfig.apiGatewayWorkoutPrograms.REGION
      },
      {
        name: "workoutSessions",
        endpoint: AppConfig.apiGatewayWorkoutSessions.URL,
        region: AppConfig.apiGatewayWorkoutSessions.REGION
      },
      {
        name: "workouts",
        endpoint: AppConfig.apiGatewayWorkouts.URL,
        region: AppConfig.apiGatewayWorkouts.REGION
      },
      {
        name: "workoutSchedules",
        endpoint: AppConfig.apiGatewayWorkoutSchedules.URL,
        region: AppConfig.apiGatewayWorkoutSchedules.REGION
      },
      {
        name: "chatNotifications",
        endpoint: AppConfig.apiGatewayChatNotifications.URL,
        region: AppConfig.apiGatewayChatNotifications.REGION
      },
      {
        name: "updateUserStatus",
        endpoint: AppConfig.apiGatewayUserStatus.URL,
        region: AppConfig.apiGatewayUserStatus.REGION
      },
      {
        name: "chatNotificationSetting",
        endpoint: AppConfig.apiGatewayChatNotificationSetting.URL,
        region: AppConfig.apiGatewayChatNotificationSetting.REGION
      },
      {
        name: "eventNotificationSetting",
        endpoint: AppConfig.apiGatewayEventNotificationSetting.URL,
        region: AppConfig.apiGatewayEventNotificationSetting.REGION
      }
    ]
  }
});

// Chat Appsync Configuration //
const client = new AWSAppSyncClient({
  // 5
  url: appSyncConfig.graphqlEndpoint,
  region: appSyncConfig.region,
  auth: {
    type: appSyncConfig.authenticationType,
    credentials: () => Auth.currentCredentials(),
    jwtToken: async () =>
      (await Auth.currentSession()).getIdToken().getJwtToken()
  },
  complexObjectsCredentials: () => Auth.currentCredentials()
});
// End Chat Appsync Configuration //

if (typeof GLOBAL !== "undefined") {
  GLOBAL.XMLHttpRequest =
    GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest;
  GLOBAL.Blob = GLOBAL.originalBlob || GLOBAL.Blob;
  GLOBAL.FileReader = GLOBAL.originalFileReader || GLOBAL.FileReader;
}

global.XMLHttpRequest = global.originalXMLHttpRequest
  ? global.originalXMLHttpRequest
  : global.XMLHttpRequest;
global.FormData = global.originalFormData
  ? global.originalFormData
  : global.FormData;

fetch; // Ensure to get the lazy property

if (window.__FETCH_SUPPORT__) {
  window.__FETCH_SUPPORT__.blob = false;
} else {
  global.Blob = global.originalBlob ? global.originalBlob : global.Blob;
  global.FileReader = global.originalFileReader
    ? global.originalFileReader
    : global.FileReader;
}
var chatMessageInterval = -1;
class App extends React.PureComponent {
  state = {
    visible: false,
    text: "",
    notificationData: {}
  };
  constructor(props) {
    super(props);
  }

  async getActivity(activityId) {
    return API.get("activities", `/activities/${activityId}`);
  }

  handleNotification = async notification => {
    // handle external urls from push notifications
   

    if (
      notification &&
      notification.data &&
      notification.data.isChatNotification == true
    ) {
      if (notification.origin == "selected") {
        var userContextString = await AsyncStorage.getItem("@M1:userContext");

        if (userContextString) {
          var userContext = JSON.parse(userContextString);

          if (userContext) {
            var user = userContext.user;

            if (user) {
              if (user.id == notification.data.userId) {
                await AsyncStorage.setItem(
                  "notification_data",
                  JSON.stringify(notification.data)
                );
              }
            }
          }
        }
      } else {
        if (
          this.currentPageName == "Conversations" ||
          this.currentPageName == "Conversation"
        ) {
        } else {
          if (notification.origin === "received") {
            //   this.navigator.dispatch(
            //     NavigationActions.navigate({ routeName: "CHAT" })
            //   );

            this.setState({
              text: `# ${notification.data.conversationName}  ${notification.data.userName} : ${notification.data.body}`,
              notificationData: notification.data,
              visible: true
            });
          }
        }
      }
    }
  };


  componentWillReceiveProps(props) {
    let subscription = Notifications.addListener(this.handleNotification);
  }

  async componentDidMount() {
    Linking.getInitialURL()
      .then(url => {
        if (url) {
          console.log("Initial url is: " + url);
        }
      })
      .catch(err => console.error("An error occurred", err));
  

    let subscription = Notifications.addListener(this.handleNotification);

    this.chatMessageInterval = setInterval(async () => {
      try {
        
        var userContextString = await AsyncStorage.getItem("@M1:userContext");

        if (userContextString == null) {
          return;
        }
        var userContext = JSON.parse(userContextString);

        var usersConvos = await API.graphql(
          graphqlOperation(getUserAndConversations, { id: userContext.user.id })
        );
        this.usersConvos = usersConvos;
        var datas = [];
        if (usersConvos) {
          if (
            usersConvos.data.getUser &&
            usersConvos.data.getUser.userConversations.items
          ) {
            for (
              var i = 0;
              i < usersConvos.data.getUser.userConversations.items.length;
              i++
            ) {
              var conversation =
                usersConvos.data.getUser.userConversations.items[i];

              if (conversation.status !== "DELETED") {
                var conversationData = conversation.conversation;

                if (conversationData != null) {
                  datas.push(conversationData.id);
                }
              }
            }
          }
        }

        Linking.addEventListener("url", this.handleDeepLink);

        var unReadMessages = await API.post(
          "chatNotifications",
          "/chatNotifications/unReadNotification",
          {
            body: { userId: userContext.user.id }
          }
        );

        var filteredUnReadMessages = _.filter(
          unReadMessages,
          pe => datas.indexOf(pe.messageConversationId) != -1
        );

        await AsyncStorage.setItem(
          "unReadMessageCount",
          JSON.stringify(filteredUnReadMessages)
        );
      } catch (e) {
        console.log(e);
      }
    }, 5000);

    AppState.addEventListener("change", this.handleAppStateChange);
  }

  async handleDeepLink(event) {
    const url = event.url;
    const parsed = Expo.Linking.parse(url);

    if (parsed.queryParams && parsed.queryParams.nameFirst) {
      await AsyncStorage.setItem(
        "@M1:guardianNameFirst",
        parsed.queryParams.nameFirst
      );
    }
    if (parsed.queryParams && parsed.queryParams.nameLast) {
      await AsyncStorage.setItem(
        "@M1:guardianNameLast",
        parsed.queryParams.nameLast
      );
    }
    if (parsed.queryParams && parsed.queryParams.guardianId) {
      console.log(
        "parsed.queryParams.guardianId ",
        parsed.queryParams.guardianId
      );
      await AsyncStorage.setItem(
        "@M1:guardianId",
        parsed.queryParams.guardianId.toString()
      );
      this.setState({ guardianId: parsed.queryParams.guardianId });
    }
    // Linking.openURL(url).catch((err) => console.error('An error occurred', err));
  }

  componentWillUnmount() {
    this._notificationSubscription && this._notificationSubscription.remove();

    AppState.removeEventListener("change", this.handleAppStateChange);
    Linking.removeEventListener("url", this._handleOpenURL);
    clearInterval(chatMessageInterval);

    chatMessageInterval = -1;
  }

  handleAppStateChange = nextAppState => {
    console.log("nextApp State", nextAppState);
  };
  handleNavigationChange = (prevState, newState, action) => {
    
    this.currentPageName = this.getActiveRouteName(newState);
    
  };

  getActiveRouteName(navigationState) {
    if (!navigationState) {
      return null;
    }
    const route = navigationState.routes[navigationState.index];
    // dive into nested navigators
    if (route.routes) {
      return this.getActiveRouteName(route);
    }
    return route.routeName;
  }

  handleSnackBar = async () => {
    
    var appContextString = await AsyncStorage.getItem("@M1:appContext");
    var userContext = await this._retrieveUserContext();
    
    if (appContextString == null) {
      return;
    }

    var appContext = JSON.parse(appContextString);
    
    var currentTeam = _.find(
      userContext.appContextList,
      c => c.id === appContext.id
    );

    
    if (userContext != null) {
      if (this.state.notificationData && this.state.notificationData.team) {

        
        if (this.state.notificationData.team != currentTeam.id) {
            
          const contextService = new ContextService();
          const newAppContext = await contextService.changeAppContext(
            userContext,
            this.state.notificationData.team
          );



          appContext = newAppContext;
          currentTeam = _.find(
            userContext.appContextList,
            a => a.id === appContext.id
          );

          await this._storeAppContext(appContext);
        }
        var user = userContext.user;
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
                this.state.notificationData.messageConversationId
            );

            if (conversation) {
              if (conversation.status !== "DELETED") {
                if (this.navigator) {
                  this.navigator.dispatch(
                    NavigationActions.navigate({
                      routeName: "Conversation",
                      params: {
                        conversation: conversation,
                        userId: user.id,
                        currentTeam: currentTeam,
                        backToConversations: false
                      }
                    })
                  );
                }
              }
            }
          }
        }
      }
    }
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

  render = () => {
    return (
      <ApolloProvider client={client}>
        <Rehydrated
          render={({ rehydrated }) =>
            rehydrated ? (
              <View style={styles.full_screen}>
                <Nav
                  ref={nav => {
                    this.navigator = nav;
                  }}
                  onNavigationStateChange={this.handleNavigationChange}
                  uriPrefix={prefix}
                />
                <Snackbar
                  visible={this.state.visible}
                  onDismiss={() => this.setState({ visible: false })}
                  duration={2000}
                  action={{
                    label: "Open",
                    onPress: async () => {
                      await this.handleSnackBar();
                    }
                  }}
                >
                  {this.state.text}
                </Snackbar>
              </View>
            ) : (
              <View style={styles.loading_container}>
                <ActivityIndicator size="large" />
              </View>
            )
          }
        />
      </ApolloProvider>
    );
  };
}

const styles = StyleSheet.create({
  full_screen: {
    width: "100%",
    height: "100%"
  },
  loading_container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});

export default registerRootComponent(App);
