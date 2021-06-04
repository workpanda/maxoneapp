import React from "react";
import { Platform, TouchableOpacity, Text, View, Image } from "react-native";
import { fromBottom } from "react-navigation-transitions";
import {
  createStackNavigator,
  createSwitchNavigator,
  createBottomTabNavigator,
  createAppContainer,
  createMaterialTopTabNavigator
} from "react-navigation";
import TabBarComponent from "./tabbar";

import FontIcon from "@m1/shared/components/FontIcon";

// config
import { AppConfig } from "@m1/constants";
import AppColors from "@assets/theme/colors";

// components
// import { AppColors, AppFonts } from "@assets/theme";

// auth
import AuthLanding from "@m1/screens/auth/AuthLanding";
import AuthLoading from "@m1/screens/auth/AuthLoading";

import Landing from "@m1/shared/screens/auth/Landing";
import Login from "@m1/shared/screens/auth/Login";
import ParentSignup from "@m1/shared/screens/auth/ParentSignup";
import ConfirmUser from "@m1/shared/screens/auth/ConfirmUser";
import ForgotPassword from "@m1/shared/screens/auth/ForgotPassword";
import CreateAccount from "@m1/shared/screens/auth/CreateAccount";
import AthleteSignup from "@m1/shared/screens/auth/AthleteSignup";
import CoachSignup from "@m1/shared/screens/auth/CoachSignup";
import Athlete from "@m1/shared/screens/auth/Athlete";
import Coach from "@m1/shared/screens/auth/Coach";
import QRCode from "@m1/shared/screens/auth/QRCode";
import MyCode from "@m1/shared/screens/auth/MyCode";
import VideoLibrary from "@m1/shared/screens/VideoLibrary/VideoLibrary";
import CommonStyles from "@m1/shared/theme/styles";
import VideoDetail from "@m1/shared/screens/VideoLibrary/VideoDetail";
import ConversationWithData from "@m1/shared/screens/tab/Chat/ConversationView";
import ChatSelectView from "@m1/shared/screens/tab/Chat/ChatSelectView";
import ConversationsWithData from "@m1/shared/screens/tab/Chat/Conversations";
import AddNewConversationWithData from "@m1/shared/screens/tab/Chat/AddNewConversation";
import ViewMembers from "@m1/shared/screens/tab/Chat/ViewMembers";
import UpdateConversation from "@m1/shared/screens/tab/Chat/UpdateConversation";
import DashboardScreen from "@m1/shared/screens/tab/Dashboard/DashboardScreen";
// events
// import EventScreen from "@m1/screens/events/EventScreen";
import EventNavigator from "@m1/screens/events/EventScreen";
import ViewGroupList from "@m1/shared/screens/tab/Group/ViewGroupList";
import AddNewGroup from "@m1/shared/screens/tab/Group/AddNewGroup";
import GroupView from "@m1/shared/screens/tab/Group/GroupView";
import EditGroup from "@m1/shared/screens/tab/Group/EditGroup";

import ProfileScreen from "@m1/shared/screens/Profile";
import ProfileEditScreen from "@m1/shared/screens/ProfileEdit";
//Rosters
import RostersView from "@m1/shared/screens/Rosters/RostersView";
import AddAthlete from "@m1/shared/screens/Rosters/AddAthlete";
import AddCoach from "@m1/shared/screens/Rosters/AddCoach";
import AddNewRosterGroup from "@m1/shared/screens/Rosters/AddNewRosterGroup";
import RosterGroupView from "@m1/shared/screens/Rosters/RosterGroupView";
import MessagesView from "@m1/shared/screens/Messages";
import CreateMessages from "@m1/shared/screens/Messages/CreateMessages";
// more
import MoreView from "@m1/shared/screens/More";
import LinkParent from "@m1/shared/screens/LinkParent";
import GuardianQRCode from "@m1/shared/screens/GuardianQRCode";
// parents

import ParentView from "@m1/shared/screens/Parent";

import AddTeamView from "@m1/shared/screens/ProfileEdit/AddTeam/AddTeam";
import AddTeamCodeView from "@m1/shared/screens/ProfileEdit/AddTeam/AddTeamCode";
import AddTeamQRCodeView from "@m1/shared/screens/ProfileEdit/AddTeam/AddTeamQRCode";

//Alumni Rewards
import AlumniRewards from "@m1/screens/rewards/AlumniRewards";
import LandingPage from "@m1/shared/screens/landing/LandingPage";
import Setting from "@m1/shared/screens/Setting";
console.disableYellowBox = true;
/**
 * Auth Navigation
 */
const AuthNavigation = createStackNavigator(
  {
    AuthLanding: {
      screen: Landing,
      navigationOptions: {
        header: null
      }
    },
    AuthLogin: { screen: Login },
    AuthLoading: {
      screen: AuthLoading,
      navigationOptions: {
        header: null
      }
    },
    AuthParentSignup: { screen: ParentSignup },
    AuthCoachSignup: { screen: CoachSignup },
    AuthAthleteSignup: { screen: AthleteSignup },
    AuthConfirmUser: { screen: ConfirmUser },
    AuthForgotPassword: { screen: ForgotPassword },
    AuthCreateAccount: {
      screen: CreateAccount,
      navigationOptions: {
        header: null
      }
    },
    AuthMyCode: { screen: MyCode },
    AuthQRCode: { screen: QRCode },
    AuthAthlete: { screen: Athlete },
    AuthCoach: { screen: Coach }
  },
  {
    initialRouteName: "AuthLoading",
    headerMode: "screen",
    defaultNavigationOptions: AppConfig.navigationOptions,
    transitionConfig: nav => {
      const { scenes } = nav;
      const prevScene = scenes[scenes.length - 2];
      const nextScene = scenes[scenes.length - 1];

      if (nextScene.route.routeName === "Signup") return fromBottom();
      if (nextScene.route.routeName === "Login") return fromBottom();
    }
  }
);

const ActivitiesNavigation = createStackNavigator(
  {
    VideoLibrary: {
      screen: VideoLibrary
    },
    VideoDetail: {
      screen: VideoDetail
    }
  },
  {
    initialRouteName: "VideoLibrary",
    headerMode: "screen",
    defaultNavigationOptions: AppConfig.navigationOptions,
    transitionConfig: nav => {
      const { scenes } = nav;
      const prevScene = scenes[scenes.length - 2];
      const nextScene = scenes[scenes.length - 1];

      if (nextScene.route.routeName === "Signup") return fromBottom();
      if (nextScene.route.routeName === "Login") return fromBottom();
    }
  }
);

const AddTeamNavigation = createStackNavigator(
  {
    AddTeam: {
      screen: AddTeamView
    },
    AddTeamQRCode: {
      screen: AddTeamQRCodeView
    },
    AddTeamCode: {
      screen: AddTeamCodeView
    }
  },
  {
    initialRouteName: "AddTeam",
    headerMode: "screen",
    defaultNavigationOptions: AppConfig.navigationOptions,
    transitionConfig: nav => {
      const { scenes } = nav;
      const prevScene = scenes[scenes.length - 2];
      const nextScene = scenes[scenes.length - 1];

      if (nextScene.route.routeName === "Signup") return fromBottom();
      if (nextScene.route.routeName === "Login") return fromBottom();
    }
  }
);

const RostersNavigation = createStackNavigator(
  {
    RostersView: {
      screen: RostersView
    },
    AddAthlete: {
      screen: AddAthlete
    },
    AddNewRosterGroup: {
      screen: AddNewRosterGroup
    },
    RosterGroupView: {
      screen: RosterGroupView
    },
    AddCoach: {
      screen: AddCoach
    },
    AddAthlete: {
      screen: AddAthlete
    },
    AddNewRosterGroup: {
      screen: AddNewRosterGroup
    },
    MESSAGES: {
      screen: MessagesView
    },
    CreateMessages: {
      screen: CreateMessages
    }
  },
  {
    headerMode: "screen",
    initialRouteName: "RostersView",
    defaultNavigationOptions: AppConfig.navigationOptions,
    transitionConfig: nav => {
      const { scenes } = nav;
      const prevScene = scenes[scenes.length - 2];
      const nextScene = scenes[scenes.length - 1];

      if (nextScene.route.routeName === "Signup") return fromBottom();
      if (nextScene.route.routeName === "Login") return fromBottom();
    }
  }
);

const DashboardNavigator = createStackNavigator(
  {
    Dashboard: {
      screen: DashboardScreen
    }
  },

  {
    headerMode: "screen",
    defaultNavigationOptions: AppConfig.navigationOptions,
    headerLayoutPreset: "center",
    transitionConfig: nav => {
      const { scenes } = nav;
      const prevScene = scenes[scenes.length - 2];
      const nextScene = scenes[scenes.length - 1];

      // if (nextScene.route.routeName === "NewRoute") return fromBottom();
    }
  }
);

/**
 * Home Tab
 */

const MoreNavigator = createStackNavigator(
  {
    MoreView: {
      screen: MoreView
    },
    REWARDS: {
      screen: AlumniRewards
    },
    LinkParent: {
      screen: LinkParent
    },
    SETTING: {
        screen: Setting
    }
  },
  {
    headerMode: "screen",
    defaultNavigationOptions: AppConfig.navigationOptions,
    headerLayoutPreset: "center",
    transitionConfig: nav => {
      const { scenes } = nav;
      const prevScene = scenes[scenes.length - 2];
      const nextScene = scenes[scenes.length - 1];

      // if (nextScene.route.routeName === "NewRoute") return fromBottom();
    }
  }
);
const ParentNavigator = createStackNavigator(
  {
    ParentView: {
      screen: ParentView,
      navigationOptions: {}
    },
    ProfileScreen: {
      screen: ProfileScreen
    },
    ProfileEditScreen: {
      screen: ProfileEditScreen
    },
    GuardianQRCode: {
      screen: GuardianQRCode
    }
  },
  {
    headerMode: "screen",
    defaultNavigationOptions: AppConfig.navigationOptions,
    headerLayoutPreset: "center",
    transitionConfig: nav => {
      const { scenes } = nav;
      const prevScene = scenes[scenes.length - 2];
      const nextScene = scenes[scenes.length - 1];
    }
  }
);

const GroupNavigator = createStackNavigator(
  {
    ViewGroupList: {
      screen: ViewGroupList
    },
    AddNewGroup: {
      screen: AddNewGroup
    },
    GroupView: {
      screen: GroupView
    },
    EditGroup: {
      screen: EditGroup
    }
  },
  {
    headerMode: "screen",
    initialRouteName: "ViewGroupList",
    defaultNavigationOptions: AppConfig.navigationOptions,
    headerLayoutPreset: "center",
    transitionConfig: nav => {
      const { scenes } = nav;
      const prevScene = scenes[scenes.length - 2];
      const nextScene = scenes[scenes.length - 1];

      // if (nextScene.route.routeName === "NewRoute") return fromBottom();
    }
  }
);

const ProfileNavigator = createStackNavigator(
  {
    ProfileScreen: {
      screen: ProfileScreen
    }
  },
  {
    headerMode: "screen",
    defaultNavigationOptions: AppConfig.navigationOptions,
    headerLayoutPreset: "center",
    transitionConfig: nav => {
      const { scenes } = nav;
      const prevScene = scenes[scenes.length - 2];
      const nextScene = scenes[scenes.length - 1];

      // if (nextScene.route.routeName === "NewRoute") return fromBottom();
    }
  }
);
const AlumniNavigator = createStackNavigator(
  {
    ALUMNI: {
      screen: AlumniRewards
    }
  },
  {
    headerMode: "screen",
    defaultNavigationOptions: AppConfig.navigationOptions,
    headerLayoutPreset: "center",
    transitionConfig: nav => {
      const { scenes } = nav;
      const prevScene = scenes[scenes.length - 2];
      const nextScene = scenes[scenes.length - 1];
    }
  }
);

const LandingNavigator = createStackNavigator(
  {
    LANDING: {
      screen: LandingPage
    }
  },
  {
    headerMode: "screen",
    defaultNavigationOptions: AppConfig.navigationOptions,
    headerLayoutPreset: "center",
    transitionConfig: nav => {
      const { scenes } = nav;
      const prevScene = scenes[scenes.length - 2];
      const nextScene = scenes[scenes.length - 1];
    }
  }
);

LandingNavigator.navigationOptions = ({ navigation }) => {
  let tabBarVisible = false;
  return {
    tabBarVisible
  };
};

const ChatNavigator = createStackNavigator(
  {
    Conversations: {
      screen: ConversationsWithData
    },
    AddNewConversation: {
      screen: AddNewConversationWithData
    },
    ViewMembers: {
      screen: ViewMembers
    },
    Conversation: {
      screen: ConversationWithData
    },
    ChatSelectView: {
        screen: ChatSelectView
    },
    UpdateConversation: {
        screen: UpdateConversation
    }
  },
  {
    headerMode: "screen",
    initialRouteName: "Conversations",
    defaultNavigationOptions: AppConfig.navigationOptions,
    headerLayoutPreset: "center",
    transitionConfig: nav => {
      const { scenes } = nav;
      const prevScene = scenes[scenes.length - 2];
      const nextScene = scenes[scenes.length - 1];

      // if (nextScene.route.routeName === "NewRoute") return fromBottom();
    }
  }
);

ChatNavigator.navigationOptions = ({ navigation }) => {
  let tabBarVisible;
  if (navigation.state.routes.length > 1) {
    navigation.state.routes.map(route => {
      if (route.routeName === "Conversation" || route.routeName === "LANDING") {
        tabBarVisible = false;
      } else {
        tabBarVisible = true;
      }
    });
  }
  return {
    tabBarVisible
  };
};

/**
 * Tab Navigation
 */
const TabNavigation = createBottomTabNavigator(
  {
    HOME: {
      screen: LandingNavigator,
      navigationOptions: {
        tabBarOptions: {
          activeTintColor: AppColors.tabbar.iconSelected
        },
        tabBarIcon: ({ focused }) => (
          <FontIcon
            name="home"
            color={focused ? AppColors.tabbar.iconSelected : "#454545"}
            size={24}
          />
        )
      }
    },

    PROFILE: {
      screen: ProfileNavigator,
      navigationOptions: ({ navigation }) => ({
        tabBarOptions: {
          activeTintColor: AppColors.tabbar.iconSelected
        },
        tabBarIcon: ({ focused }) => (
          <FontIcon
            name="profile"
            color={focused ? AppColors.tabbar.iconSelected : "#454545"}
            size={24}
          />
        )
      })
    },

    TEAM: {
      screen: RostersNavigation,
      navigationOptions: ({ navigation }) => ({
        tabBarOptions: {
          activeTintColor: AppColors.tabbar.iconSelected
        },
        tabBarIcon: ({ focused }) => (
          <FontIcon
            name="people_outline"
            color={focused ? AppColors.tabbar.iconSelected : "#454545"}
            size={24}
          />
        ),
        tabBarOnPress: ({ previousScene, jumpToIndex }) => {
          navigation.navigate("RostersView");
        }
      })
    },
    CHILD: {
      screen: ParentNavigator,
      navigationOptions: {
        tabBarOptions: {
          activeTintColor: AppColors.tabbar.iconSelected
        },
        tabBarIcon: ({ focused }) => (
          <FontIcon
            name="face"
            color={focused ? AppColors.tabbar.iconSelected : "#454545"}
            size={24}
          />
        )
      }
    },
    TRAIN: {
      screen: ActivitiesNavigation,
      navigationOptions: {
        tabBarOptions: {
          activeTintColor: AppColors.tabbar.iconSelected
        },
        tabBarIcon: ({ focused }) => (
          <FontIcon
            name="play_circle_outline"
            color={focused ? AppColors.tabbar.iconSelected : "#454545"}
            size={24}
          />
        )
      }
    },
    CALENDAR: {
      screen: EventNavigator,
      navigationOptions: {
        tabBarOptions: {
          activeTintColor: AppColors.tabbar.iconSelected
        },
        tabBarIcon: ({ focused }) => (
          <FontIcon
            name="events"
            color={focused ? AppColors.tabbar.iconSelected : "#454545"}
            size={24}
          />
        )
      }
    },
    MORE: {
      screen: MoreNavigator,
      navigationOptions: ({ navigation }) => ({
        tabBarOptions: {
          activeTintColor: AppColors.tabbar.iconSelected
        },
        tabBarIcon: ({ focused }) => (
          <FontIcon
            name="more"
            color={focused ? AppColors.tabbar.iconSelected : "#454545"}
            size={24}
          />
        ),
        tabBarOnPress: ({ previousScene, jumpToIndex }) => {
          navigation.navigate("MoreView");
        }
      })
    },
    CHAT: {
      screen: ChatNavigator,
      navigationOptions: {
        tabBarOptions: {
          activeTintColor: AppColors.tabbar.iconSelected
        },
        tabBarIcon: ({ focused }) => (
          <FontIcon
            name="chat"
            color={focused ? AppColors.tabbar.iconSelected : "#454545"}
            size={24}
          />
        ),
        tabBarOnPress: ({ previousScene, jumpToIndex }) => {
          navigation.navigate("Conversations");
        }
      }
    },
    DASHBOARD: {
      screen: DashboardNavigator,
      navigationOptions: {
        tabBarOptions: {
          activeTintColor: AppColors.tabbar.iconSelected
        },
        tabBarIcon: ({ focused }) => (
          <FontIcon
            name="home"
            color={focused ? AppColors.tabbar.iconSelected : "#454545"}
            size={24}
          />
        )
      }
    }
  },
  {
    initialRouteName: "HOME",
    tabBarOptions: AppConfig.tabBarOptions,
    tabBarVisible: false,
    // tabBarComponent: props => <TabBarComponent {...props} />,
    tabBarComponent: props => {
      const { navigation, navigationState } = props;
      const jumpToIndex = index => {
        const lastPosition = navigationState.index;
        const tab = navigationState.routes[index];
        const tabRoute = tab.routeName;
        const firstTab = tab.routes[0].routeName;

        console.log("TabRoute", tabRoute);

        lastPosition !== index &&
          navigation.dispatch(resetNavigation(firstTab));
        lastPosition === index &&
          navigation.dispatch(resetNavigation(firstTab));
      };
      return <TabBarComponent {...props} jumpToIndex={jumpToIndex} />;
    },
    tabBarPosition: "bottom"
  }
);

const MainNavigator = createSwitchNavigator(
  {
    Auth: AuthNavigation,
    App: TabNavigation,
    AuthLoading: AuthLoading,
    GROUP: GroupNavigator,
    CHAT: ChatNavigator,
    EVENT: EventNavigator,
    CHILD: ParentNavigator,
    ACTIVITIES: ActivitiesNavigation,
    ROSTER: RostersNavigation,
    REWARDS: AlumniNavigator,
    ADDTEAM: AddTeamNavigation
    // Conversation: ConversationNavigator
  },
  {
    initialRouteName: "AuthLoading",
    headerMode: "screen",
    navigationOptions: AppConfig.navigationOptions
  }
);

export default createAppContainer(MainNavigator);
