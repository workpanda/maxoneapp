import { registerRootComponent } from "expo";
import React from "react";
import {
  StyleSheet,
  View,
  Platform,
  Linking,
  ActivityIndicator,
  AsyncStorage,
  AppState
} from "react-native";
import { API, Auth, graphqlOperation } from "aws-amplify";

import * as Expo from "expo";

import Nav from "@vnn/navigation";
import { KeepAwake, Constants, WebBrowser, Linking as ExpoLinking } from "expo";
import Amplify from "aws-amplify";
import { withOAuth } from "aws-amplify-react-native";
import AppConfig from "@vnn/constants/config";
import _ from "lodash";
import appSyncConfig from "@vnn/constants/appsync"; // OPS
import { Rehydrated } from "aws-appsync-react"; // 4
import { ApolloProvider } from "react-apollo"; // 2
import { ApolloLink } from "apollo-link";
import AWSAppSyncClient from "aws-appsync";
import { getUserAndConversations } from "@m1/shared/screens/tab/Chat/graphql";
import { Snackbar } from "react-native-paper";
import ContextService from "@m1/shared/services/context";
const { manifest } = Constants;

import { Notifications } from "expo";

if (__DEV__) {
  KeepAwake.activate();
}
// import storage from "@components/storage";

const prefix = Expo.Linking.makeUrl("/");

const urlOpener = async (url, redirectUrl) => {
  // On Expo, use WebBrowser.openAuthSessionAsync to open the Hosted UI pages.
  const { type, url: newUrl } = await WebBrowser.openAuthSessionAsync(
    url,
    redirectUrl
  );

  if (type === "success") {
    await WebBrowser.dismissBrowser();

    if (Platform.OS === "ios") {
      return Linking.openURL(newUrl);
    }
  }
};

// var __DEV__ = true
// your Cognito Hosted UI configuration
const api =
  __DEV__ &&
  typeof manifest.packagerOpts === `object` &&
  manifest.packagerOpts.dev
    ? "exp://" +
      manifest.debuggerHost
        .split(`:`)
        .shift()
        .concat(`:19000/--/auth/landing/`)
    : `m1-vnn://auth/landing/`;
const logoutApi =
  __DEV__ &&
  typeof manifest.packagerOpts === `object` &&
  manifest.packagerOpts.dev
    ? "exp://" +
      manifest.debuggerHost
        .split(`:`)
        .shift()
        .concat(`:19000/--/auth/login/`)
    : `m1-vnn://auth/login/`;

const oauth = {
  domain: "maxone-vnn.auth.us-east-1.amazoncognito.com",

  scope: ["openid"],
  redirectSignIn: api,
  redirectSignOut: logoutApi,

  responseType: "token",
  options: {
    AdvancedSecurityDataCollectionFlag: true
  },

  urlOpener: urlOpener
};

// Amplify.configure(awsmobile);
Amplify.configure({
  Auth: {
    mandatorySignIn: false,
    region: "us-east-1",
    userPoolId: "us-east-1_vVfBbvViH",
    identityPoolId: "us-east-1:9c2be610-ca5a-4bab-a152-b950357779a3",
    userPoolWebClientId: "5nqasit6a60qfgibejnonldugq",
    oauth: oauth
  },
  Storage: {
    region: AppConfig.s3Legacy.REGION,
    bucket: AppConfig.s3Legacy.BUCKET,
    identityPoolId: "us-east-1:9c2be610-ca5a-4bab-a152-b950357779a3"
  },
  API: {
    // aws_appsync_graphqlEndpoint: appSyncConfig.graphqlEndpoint,
    // aws_appsync_region: appSyncConfig.region,
    // aws_appsync_authenticationType: appSyncConfig.authenticationType,
    aws_appsync_graphqlEndpoint:
      "https://7554vgwmwngefbi2vdkoqandoi.appsync-api.us-east-1.amazonaws.com/graphql",
    aws_appsync_region: "us-east-1",
    aws_appsync_authenticationType: "AMAZON_COGNITO_USER_POOLS",
    aws_appsync_apiKey: "null",
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
Auth.configure({ oauth });

// Chat Appsync Configuration //
const client = new AWSAppSyncClient({
  // 5
  url:
    "https://7554vgwmwngefbi2vdkoqandoi.appsync-api.us-east-1.amazonaws.com/graphql",
  region: "us-east-1",
  auth: {
    type: "AMAZON_COGNITO_USER_POOLS",
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

class App extends React.PureComponent {
  state = {
    visible: false,
    text: "",
    notificationData: {}
  };
  constructor(props) {
    super(props);

    // this._handleNotification = this.handleNotification.bind(this);
    // this._handleAppStateChange = this.handleAppStateChange.bind(this);
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
    let subscription = Notifications.addListener(this.handleNotification);
    Linking.addEventListener("url", this.handleDeepLink);

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

  handleAppStateChange = nextAppState => {
    console.log("nextApp State", nextAppState);
  };
  async handleDeepLink(event) {
    const url = event.url;
    const parsed = Expo.Linking.parse(url);
    console.log("url ", url);
    console.log("parsed.queryParams", parsed.queryParams);
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
    Linking.removeEventListener("url", this._handleOpenURL);
  }

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
