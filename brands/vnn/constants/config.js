/**
 * Global App Config
 */
/* global __DEV__ */
import { Platform } from "react-native";
import { AppColors } from "@assets/theme";
// import Config from 'react-native-config';

export default {
  // App Details
  appName: "VWC",

  // Build Configuration - eg. Debug or Release?
  DEV: __DEV__,

  // Google Analytics - uses a 'dev' account while we're testing
  // gaTrackingId: Config.GOOGLE_ANALYTICS,

  // URLs
  urls: {
    // resetPassword: ''
  },
  navigationOptions: {
    headerStyle: {
      backgroundColor: AppColors.app.dark,
      borderBottomWidth: 0,
      borderBottomColor: "transparent"
    },
    headerTintColor: "#fff",
    headerTitleStyle: {
      // ...AppFonts.openSans.semiBold,
      color: "#fff",
      fontSize: 13,
      flex: 1
      // textAlign: 'center',
      // alignItems: 'center',
      // marginLeft: Platform.OS === 'ios' ? 0 : 30,
    },
    headerBackTitleVisible: false,
    headerBackTitle: null
  },
  whiteNavigationOptions: {
    headerStyle: {
      backgroundColor: "white",
      borderBottomWidth: 1,
      borderBottomColor: "#DFDFDF"
    },
    headerTintColor: AppColors.text.dark,
    headerTitleStyle: {
      // ...AppFonts.openSans.semiBold,
      color: AppColors.text.dark,
      fontSize: 13,
      flex: 1
      // textAlign: 'center',
      // alignItems: 'center',
      // marginLeft: Platform.OS === 'ios' ? 0 : 30,
    },
    headerBackTitleVisible: false,
    headerBackTitle: null
  },
  tabBarOptions: {
    activeTintColor: "#000",
    showLabel: true,
    labelStyle: {
      textTransform: "uppercase",
      fontSize: 10,
      color: "#454545",
      fontWeight: "500"
    },
    style: {
      backgroundColor: "#fff"
    }
  },
  s3: {
    REGION: "us-east-1",
    BUCKET: "programax-videos-production"
  },
  s3Legacy: {
    REGION: "us-east-1",
    BUCKET: "programax-videos-production"
  },
  apiGatewayChat: {
    REGION: "us-east-1",
    URL: "https://qhd12rnmxf.execute-api.us-east-1.amazonaws.com/ops"
  },
  apiGatewayActivities: {
    REGION: "us-east-1",
    URL: "https://00ourugj6a.execute-api.us-east-1.amazonaws.com/ops"
  },
  apiGatewayAuth: {
    REGION: "us-east-1",
    URL: "https://qlrngbwkna.execute-api.us-east-1.amazonaws.com/ops"
  },
  apiGatewayAdmin: {
    REGION: "us-east-1",
    URL: "https://ybp19yxqc3.execute-api.us-east-1.amazonaws.com/ops"
  },
  apiGatewayBilling: {
    REGION: "us-east-1",
    URL: "https://xfgbeb5j5f.execute-api.us-east-1.amazonaws.com/ops"
  },
  apiGatewayEvents: {
    REGION: "us-east-1",
    URL: "https://6tjx5uda5g.execute-api.us-east-1.amazonaws.com/ops"
  },
  apiGatewayFeedItems: {
    REGION: "us-east-1",
    URL: "https://fl0iff9fs0.execute-api.us-east-1.amazonaws.com/ops"
  },
  apiGatewayGroups: {
    REGION: "us-east-1",
    URL: "https://omfzy8cwa3.execute-api.us-east-1.amazonaws.com/ops"
  },
  apiGatewayLeaderboards: {
    REGION: "us-east-1",
    URL: "https://70e827e37i.execute-api.us-east-1.amazonaws.com/ops"
  },
  apiGatewayMessages: {
    REGION: "us-east-1",
    URL: "https://z09y2ga8ch.execute-api.us-east-1.amazonaws.com/ops"
  },
  apiGatewayOrganizations: {
    REGION: "us-east-1",
    URL: "https://wluo8vthul.execute-api.us-east-1.amazonaws.com/ops"
  },
  apiGatewayProducts: {
    REGION: "us-east-1",
    URL: "https://chjam2wbc1.execute-api.us-east-1.amazonaws.com/ops"
  },
  apiGatewayPrograms: {
    REGION: "us-east-1",
    URL: "https://onjsgowu0e.execute-api.us-east-1.amazonaws.com/ops"
  },
  apiGatewaySchedules: {
    REGION: "us-east-1",
    URL: "https://v7mpmsoz4f.execute-api.us-east-1.amazonaws.com/ops"
  },
  apiGatewayScheduledMessages: {
    REGION: "us-east-1",
    URL: "https://1vvs7cvnjh.execute-api.us-east-1.amazonaws.com/ops"
  },
  apiGatewayUsers: {
    REGION: "us-east-1",
    URL: "https://734xt8l4s6.execute-api.us-east-1.amazonaws.com/ops"
  },
  apiGatewayWorkoutPrograms: {
    REGION: "us-east-1",
    URL: "https://tvlspbyg1l.execute-api.us-east-1.amazonaws.com/ops"
  },
  apiGatewayWorkouts: {
    REGION: "us-east-1",
    URL: "https://q0maq0ph8d.execute-api.us-east-1.amazonaws.com/ops"
  },
  apiGatewayWorkoutSchedules: {
    REGION: "us-east-1",
    URL: "https://bhdiwcphmd.execute-api.us-east-1.amazonaws.com/ops"
  },
  apiGatewayWorkoutSessions: {
    REGION: "us-east-1",
    URL: "https://80gh1dcix5.execute-api.us-east-1.amazonaws.com/ops"
  },
  apiGatewayTags: {
    REGION: "us-east-1",
    URL: "https://1bwljpdz0e.execute-api.us-east-1.amazonaws.com/ops"
  },
  apiGatewayTaggings: {
    REGION: "us-east-1",
    URL: "https://793zhz4pee.execute-api.us-east-1.amazonaws.com/ops"
  },
  apiGatewayChatNotifications: {
    REGION: "us-east-1",
    URL: "https://i595638lhe.execute-api.us-east-1.amazonaws.com/ops"
  },
  apiGatewayUserStatus: {
    REGION: "us-east-1",
    URL:"https://o48e6vcdbf.execute-api.us-east-1.amazonaws.com/ops"
  },
  apiGatewayChatNotificationSetting: {
    REGION: "us-east-1",
    URL:"https://oqcwh2bio0.execute-api.us-east-1.amazonaws.com/ops"
  },
  apiGatewayEventNotificationSetting: {
    REGION: "us-east-1",
    URL:"https://jqy84sftih.execute-api.us-east-1.amazonaws.com/ops"
  },
  cognito: {
    REGION: "us-east-1",
    USER_POOL_ID: "us-east-1_vVfBbvViH",
    APP_CLIENT_ID: "5nqasit6a60qfgibejnonldugq",
    IDENTITY_POOL_ID: "us-east-1:9c2be610-ca5a-4bab-a152-b950357779a3"
  }
};
