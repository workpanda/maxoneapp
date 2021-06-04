import _ from "lodash";
import React from "react";
import { Video } from "expo";
import Images from "@assets/images";
import { API } from "aws-amplify";
import { AppColors } from "@assets/theme";
import { Constants } from "expo";
import Spacer from "@m1/shared/components/Spacer";
import CommonStyles from "@m1/shared/theme/styles";
import FontIcon from "@m1/shared/components/FontIcon";
import { Image as CacheImage } from "react-native-expo-image-cache";
import { Avatar, Badge, Icon, withBadge } from "react-native-elements";
import {
  MaterialIcons,
  FontAwesome,
  MaterialCommunityIcons,
  Ionicons,
  Octicons
} from "@expo/vector-icons";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  StyleSheet,
  ScrollView,
  AsyncStorage
} from "react-native";

const default_avatar = require("@m1/shared/assets/avatar-default.png");
const iconBackArrow = require("@m1/shared/assets/ic_back_white.png");
import { NavigationEvents } from "react-navigation";
const SCREEN_WIDTH = Dimensions.get("window").width;
import {
  FullscreenEnterIcon,
  FullscreenExitIcon,
  PauseIcon,
  PlayIcon,
  ReplayIcon,
  Spinner
} from "@m1/shared/assets/icons";
var readChatTimer = -1;
class Profile extends React.Component {
  static navigationOptions = ({ navigation }) => {
    var onAdd = () => {};
    var bShowAddButton = true;
    let params = navigation.state.params;
    var unReadChatCount = 0;
    if (params && params.onAdd) {
      onAdd = params.onAdd;
    }

    if (params) {
      bShowAddButton = params.bShowAddButton;
    }

    var showBack = params && params.user ? true : false;

    var appContext = params && params.appContext ? params.appContext : {};
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
      headerLeft: showBack ? (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={CommonStyles.navBackContainer}
        >
          <Image
            source={iconBackArrow}
            style={CommonStyles.chatNavBackImgWhite}
            resizeMode="contain"
          />
        </TouchableOpacity>
      ) : null,
      headerRight: (
        <View style={{ flexDirection: "row" }}>
          {(appContext && appContext.isCoach) ||
          (appContext && appContext.isOwner) ||
          (appContext && appContext.isHeadCoach) ? (
            <TouchableOpacity
              onPress={() => navigation.navigate("MESSAGES")}
              style={CommonStyles.navRightContainer}
            >
              <FontIcon name="send" size={20} color={"#fff"} />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("Conversations");
            }}
            style={CommonStyles.navRightContainer}
          >
            <FontIcon name="chat1" size={20} color={"#fff"} />
            {unReadChatCount > 0 && (
                <Badge value={unReadChatCount} status="error" containerStyle={{position: 'absolute', top: -5, right: -5}}/>
            )}
          </TouchableOpacity>
        </View>
      )
    };
  };
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      currentTeam: {},
      athlete: {},
      loading: true,
      appContext: {},
      shouldPlay: false
    };

    this.mount = true;
  }

  componentDidMount = async () => {
    var userContextString = await AsyncStorage.getItem("@M1:userContext");
    var appContextString = await AsyncStorage.getItem("@M1:appContext");
    var userContext = JSON.parse(userContextString);
    var appContext = JSON.parse(appContextString);
    this.setState({ username: userContext ? userContext.user.username : "" });
    // console.log('Mounted ', userContext)

    clearInterval(readChatTimer);
    var unReadChatCount = await AsyncStorage.getItem("unReadMessageCount");

    if (unReadChatCount) {
        var totalCount = JSON.parse(unReadChatCount);
      this.props.navigation.setParams({
        unReadChatCount: totalCount.length
      });
    }

    readChatTimer = setInterval(async () => {
      var unReadChatCount = await AsyncStorage.getItem("unReadMessageCount");

      if (unReadChatCount) {
        var totalCount = JSON.parse(unReadChatCount);
      this.props.navigation.setParams({
        unReadChatCount: totalCount.length
      });
      }
    }, 1000);

    var params = this.props.navigation.state.params
      ? this.props.navigation.state.params
      : {};
    params.appContext = appContext;
    params.userContext = userContext;
    this.props.navigation.setParams(params);

    var athlete = userContext.user;
    if (params && params.user) {
      athlete = params.user;
    }
    const currentTeam = _.find(
      userContext.appContextList,
      c => c.id === appContext.id
    );

    this.setState({ currentTeam: currentTeam, athlete: athlete, appContext });
  };

  async checkAppContextChanged() {
    var appContextString = await AsyncStorage.getItem("@M1:appContext");
    var appContext = JSON.parse(appContextString);

    if (this.state.appContext && appContext !== this.state.appContext) {
      await this.componentDidMount();
    }
  }

  componentWillUnmount() {
    clearInterval(readChatTimer);
  }

  gotoProfileEdit() {
    this.props.navigation.push("ProfileEditScreen", {
      athlete: this.state.athlete
    });
  }
  render() {
    const { athlete, currentTeam } = this.state;

    return (
      <View style={{ flex: 1 }}>
        <NavigationEvents onDidFocus={() => this.checkAppContextChanged()} />
        <StatusBar barStyle="light-content" translucent={false} />
        <ScrollView style={{width: '100%', flex: 1}}>


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
              onPress={() => this.gotoProfileEdit()}
              style={styles.avatar_edit}
            >
              <MaterialIcons name="edit" size={13} color={"white"} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.username_container}>
          <Text style={styles.username_text}>
            {athlete.nameFirst} {athlete.nameLast}
          </Text>
        </View>

        <View style={styles.team_container}>
          <Text style={styles.team_text}>
            {currentTeam && currentTeam.customName ? `${currentTeam.customName}` : `${currentTeam.name} ${currentTeam.sport}` }
          </Text>
        </View>
        {/* {(this.state.appContext.isPlayer || this.state.appContext.isAthlete) ? (
          <View style={styles.info_container}>
            <View style={styles.info_sub_container}>
              <Text style={styles.info_number}>{"82"}</Text>
              <Text style={styles.info_text}>{"FT's / 100"}</Text>
            </View>
            <View style={styles.info_sub_container}>
              <Text style={styles.info_number}>{"48"}</Text>
              <Text style={styles.info_text}>{"52 Point Drill"}</Text>
            </View>
            <View style={styles.info_sub_container}>
              <Text style={styles.info_number}>{"63s"}</Text>
              <Text style={styles.info_text}>{"All Star Drill"}</Text>
            </View>
          </View>
        ) : null} */}
        {/* <Video
                source={require("@assets/images/videos/registration-player-480.mov")}
                rate={1.0}
                volume={1.0}
                isMuted={false}
                resizeMode={Video.RESIZE_MODE_CONTAIN}
                useNativeControls={true}
                style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}
                shouldPlay={this.state.shouldPlay}
                useNativeControls={true}
              /> */}
        {/* <Video
                source={require("@assets/images/videos/registration-coach-480.mov")}
                rate={1.0}
                volume={1.0}
                isMuted={false}
                resizeMode={Video.RESIZE_MODE_CONTAIN}
                useNativeControls={true}
                style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}
                shouldPlay={this.state.shouldPlay}
              /> */}

          <View style={styles.navigation_container}>

            {/* <TouchableOpacity style={{ position: "absolute", alignSelf:'center' }}>
              <FontAwesome name="play-circle" size={70} />
            </TouchableOpacity> */}
            {/* <TouchableOpacity style={styles.navigation_item}>
                    <Text style={styles.navigation_title}>{"Activity"}</Text>
                    <FontAwesome name="star-o" size={22} color={"#454545"} />
                </TouchableOpacity>
                <Spacer/>
                <TouchableOpacity style={styles.navigation_item}>
                    <Text style={styles.navigation_title}>{"Leaderboards"}</Text>
                    <Ionicons name="ios-trending-up" size={22} color={"#454545"} />
                </TouchableOpacity>
                <Spacer/>
                <TouchableOpacity style={styles.navigation_item}>
                    <Text style={styles.navigation_title}>{"Events & Camps"}</Text>
                    <MaterialCommunityIcons name="calendar-star" size={22} color={"#454545"} />
                </TouchableOpacity>
                <Spacer/> */}
          </View>
        </ScrollView>
      </View>
    );
  }
}

let style = {
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
    color: AppColors.text.white,
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
    width: "100%",
    justifyContent: 'center',
    alignItems: 'center'
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

const styles = StyleSheet.create(style);

export default Profile;
