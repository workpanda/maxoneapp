import React from "react";
import PropTypes from "prop-types";

import {
  AsyncStorage,
  SafeAreaView,
  Image,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  Linking
} from "react-native";

import { API } from "aws-amplify";
import _ from "lodash";
import CommonStyles from "@m1/shared/theme/styles";
import Athletes from "@m1/shared/screens/Rosters/Tab/Athletes";
import Coaches from "@m1/shared/screens/Rosters/Tab/Coaches";
import Groups from "@m1/shared/screens/Rosters/Tab/Groups";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import ActionButton from "react-native-action-button";
import { Avatar, Badge, Icon, withBadge } from "react-native-elements";
import { NavigationEvents } from "react-navigation";
import { Constants } from "expo";

import FontIcon from "@m1/shared/components/FontIcon";
import Images from "@assets/images";

import AppColors from "@assets/theme/colors";
var readChatTimer = -1;
const SCREEN_WIDTH = Dimensions.get("window").width;

class RostersView extends React.Component {
  static navigationOptions = ({ navigation }) => {
    var onAdd = () => {};
    var unReadChatCount = 0;
    var bShowAddButton = true;
    let params = navigation.state.params;

    if (params && params.onAdd) {
      onAdd = params.onAdd;
    }

    if (params && params.unReadChatCount) {
        unReadChatCount = params.unReadChatCount;
    }

    if (params) {
      bShowAddButton = params.bShowAddButton;
    }

    var appContext =
      navigation.state.params && navigation.state.params.appContext
        ? navigation.state.params.appContext
        : {};

    return {
      headerTitle: (
        <View
          style={{
            width: "100%",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <Image
            style={{ height: 22, width: 50 }}
            resizeMode="contain"
            source={Images.logoHeader}
          />
        </View>
      ),
      headerTitleStyle: { flex: 1, textAlign: "center" },
      headerLeft: <View />,
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

  constructor(props) {
    super(props);

    this.state = {
      index: 0,
      routes: [
        { key: "Athletes", title: "Athletes" },
        { key: "Coaches", title: "Coaches" },
        { key: "Groups", title: "Groups" }
      ],
      athletesList: [],
      coachesList: [],
      groupsList: [],
      username: "",
      currentTeam: {},
      loading: true
    };

    this.mount = true;
  }

  renderScene = ({ route }) => {
    switch (route.key) {
      case "Athletes":
        return (
          <Athletes
            athletes={this.state.athletesList}
            addNewAthlete = {() => this.addNewAthlete()}
            onRef={ref => (this.athleteView = ref)}
          />
        );
      case "Coaches":
        return (
          <Coaches
            coaches={this.state.coachesList}
            onRef={ref => (this.coachView = ref)}
            addNewCoach = {() => this.addNewCoach()}
          />
        );
      case "Groups":
        return (
          <Groups
            groups={this.state.groupsList}
            groupClick={groupId => this.groupClick(groupId)}
            groupAdd={group => {
              this.onAddNewGroup(group);
            }}
            checkExpand={(groupId) => (this.checkExpand(groupId))}
            addNewRosterGroup = {() => this.addNewRosterGroup()}

          />
        );

      default:
        return null;
    }
  };

  componentDidMount = async () => {
    this.setState({ loading: true });
    this.mount = true;

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
      var userContextString = await AsyncStorage.getItem("@M1:userContext");
      var appContextString = await AsyncStorage.getItem("@M1:appContext");
      var userContext = JSON.parse(userContextString);
      var appContext = JSON.parse(appContextString);

      this.props.navigation.setParams({
        onAdd: this._clickRightNavigation,
        bShowAddButton: true,
        appContext
      });

      this.setState({ username: userContext.user.username , appContext});

      const currentTeam = _.find(
        userContext.appContextList,
        c => c.id === appContext.id
      );

      this.setState({ currentTeam: currentTeam });

      athletes = await this.getAthletes(currentTeam.id);
      coaches = await this.getCoaches(currentTeam.id);
      groups = await this.getGroups(currentTeam.id);

      groups = await this.groupSortByName(groups);
      groups = await this.groupAvatarConvert(groups, athletes, coaches);

      this.setState({ athletesList: athletes });
      this.setState({ coachesList: coaches });

      groups = await this.groupSortByName(groups);
      groups = await this.groupAvatarConvert(groups, athletes, coaches);
      groups = groups.map((item, index) => {
        item.isExpand = false;

        return item;
      })

      this.setState({ groupsList: groups });

      this.setState({ loading: false });

  };

  groupClick = groupId => {
    var selectedGroup = this.state.groupsList.find(item => item.id == groupId);

    if (selectedGroup) {
      this.props.navigation.navigate("RosterGroupView", {
        athletes: this.state.athletesList,
        coaches: this.state.coachesList,
        selectedGroup: selectedGroup,
        groupTitle: selectedGroup.groupName
          ? selectedGroup.groupName
          : selectedGroup.name,
        groupRemove: group => {
          this.groupRemove(group);
        },
        groupEdit: group => {
          this.groupEdit(group);
        }
      });
    }
  };

  checkExpand = (groupId) => {
    var selectedGroupIndex = this.state.groupsList.findIndex(item => item.id == groupId);
    var cloneObj = this.state.groupsList.slice(0);

    var selectedGroup = cloneObj[selectedGroupIndex];

    if (selectedGroup) {
      selectedGroup.isExpand = !selectedGroup.isExpand;

      cloneObj[selectedGroupIndex] = selectedGroup;

      this.setState({groupsList: cloneObj});

      console.log(cloneObj);
    }
  }

  addNewRosterGroup() {
    this.props.navigation.navigate("AddNewRosterGroup", {
        athletes: this.state.athletesList,
        coaches: this.state.coachesList,
        groupAdd: group => {
          this.onAddNewGroup(group);
        }
      });
  }

  addNewCoach() {
    if(Constants.manifest.slug === "vnn"){
      Linking.canOpenURL("https://teammate.getvnn.com").then(supported => {
        if (supported) {
          Linking.openURL("https://teammate.getvnn.com");
        } else {
          console.log("Don't know how to open URI: " + "https://teammate.getvnn.com");
        }
      });
    }
    else{
      this.props.navigation.navigate("AddCoach", {
          addCoach: coach => {
            this.addCoach(coach);
          }
        });
      }
  }

  addNewAthlete() {
    if(Constants.manifest.slug === "vnn"){
      Linking.canOpenURL("https://teammate.getvnn.com").then(supported => {
        if (supported) {
          Linking.openURL("https://teammate.getvnn.com");
        } else {
          console.log("Don't know how to open URI: " + "https://teammate.getvnn.com");
        }
      });
    }
    else{
      this.props.navigation.navigate("AddAthlete", {
          addAthlete: athlete => {
            this.addAthlete(athlete);
          }
      });
    }
  }

  async groupAvatarConvert(groups, athletes, coaches) {
    var mResult = groups;
    for (var i = 0; i < mResult.length; i++) {
      var filterGroup = [];
      for (var j = 0; j < mResult[i].participants.length; j++) {
        var currentItems = mResult[i].participants;

        var find = _.find(
          athletes,
          pe => pe.id == currentItems[j].userId || pe.id == currentItems[j].id
        );

        if (find) {
          currentItems[j].avatarUrl = this.getGeneralImageURL(
            find.legacyId,
            find.avatarUrl
          );
          filterGroup.push(currentItems[j]);
        } else {
          find = _.find(
            coaches,
            pe => pe.id == currentItems[j].userId || pe.id == currentItems[j].id
          );

          if (find) {
            currentItems[j].avatarUrl = this.getGeneralImageURL(
              find.legacyId,
              find.avatarUrl
            );

            filterGroup.push(currentItems[j]);
          }
        }
      }

      mResult[i].participants = filterGroup;
    }

    return mResult;
  }

  async groupSortByName(groups) {
    var mResult = groups;
    mResult.sort(function(x, y) {
      if (x.name < y.name) {
        return -1;
      }

      if (x.name > y.name) {
        return 1;
      }

      return 0;
    });

    return mResult;
  }

  getGeneralImageURL = (legacyId, avatarURL) => {
    var avatarPath = avatarURL;
    if (avatarPath) {
      if (!avatarPath.includes("https://")) {
        avatarPath = `https://s3.amazonaws.com/programax-videos-production/uploads/user/avatar/${legacyId}/${avatarPath}`;
      }
    }

    return avatarPath;
  };

  componentWillUnmount() {
    this.mount = false;
    this.props.navigation.setParams({
      onAdd: null
    });
    clearInterval(readChatTimer);
  }

  componentWillReceiveProps(props) {}

  async getAthletes(id) {
    return API.get("programs", `/programs/${id}/players`);
  }

  async getCoaches(id) {
    return API.get("programs", `/programs/${id}/coaches`);
  }

  async getGroups(id) {
    return API.get("groups", `/programs/${id}/groups`);
  }

  async checkAppContextChanged() {
    var appContextString = await AsyncStorage.getItem("@M1:appContext");
    var appContext = JSON.parse(appContextString);

    if (this.state.appContext && appContext !== this.state.appContext) {
      await this.componentDidMount();
    }
  }

  onChangeTab = index => {
    if (index == -1) {
      this.props.navigation.setParams({ bShowAddButton: false });
    } else {
      this.props.navigation.setParams({ bShowAddButton: true });
    }

    this.setState({ index: index });

    if(this.athleteView) {
        this.athleteView.hideQrCode();
    }

    if(this.coachView) {
        this.coachView.hideQrCode();
    }
  };

  _clickRightNavigation = () => {
    if (this.state.index == 0) {
      this.props.navigation.navigate("AddAthlete", {
        addAthlete: athlete => {
          this.addAthlete(athlete);
        }
      });
    } else if (this.state.index == 1) {
      this.props.navigation.navigate("AddCoach", {
        addCoach: coach => {
          this.addCoach(coach);
        }
      });
    } else if (this.state.index == 2) {
      this.props.navigation.navigate("AddNewRosterGroup", {
        athletes: this.state.athletesList,
        coaches: this.state.coachesList,
        groupAdd: group => {
          this.onAddNewGroup(group);
        }
      });
    }
  };

  addAthlete = async athlete => {

    var athletes = await this.getAthletes(this.state.currentTeam.id);
    // var athletes = this.state.athletesList;

    // athletes.push(athlete);

    athletes.sort(function(x, y) {
      if (x.graduationYear == undefined && y.graduationYear != undefined) {
        return 1;
      }

      if (y.graduationYear == undefined && x.graduationYear != undefined) {
        return -1;
      }

      if (x.graduationYear < y.graduationYear) {
        return -1;
      }

      if (x.graduationYear > y.graduationYear) {
        return 1;
      }

      return 0;
    });

    this.setState({ athletesList: athletes });
  };

  addCoach = async coach => {
    var coaches = await this.getCoaches(this.state.currentTeam.id);

    this.setState({ coachesList: coaches });
  };

  onAddNewGroup = async group => {
    var groups = this.state.groupsList;
    group.isExpand = false;
    groups.push(group);

    groups = await this.groupSortByName(groups);
    groups = await this.groupAvatarConvert(
      groups,
      this.state.athletesList,
      this.state.coachesList
    );

    this.setState({ groupsList: groups });
  };

  groupEdit = async group => {
    var groups = this.state.groupsList;

    var elementPos = this.state.groupsList
      .map(function(x) {
        return x.id;
      })
      .indexOf(group.id);

    groups[elementPos] = group;

    groups = await this.groupSortByName(groups);
    groups = await this.groupAvatarConvert(
      groups,
      this.state.athletesList,
      this.state.coachesList
    );

    this.setState({ groupsList: groups });
  };
  groupRemove = groupId => {
    console.log("ElementPos", elementPos);
    var elementPos = this.state.groupsList
      .map(function(x) {
        return x.id;
      })
      .indexOf(groupId);

    var groupList = this.state.groupsList.slice(0);
    console.log("ElementPos", elementPos);
    groupList.splice(elementPos, 1);

    this.setState({ groupsList: groupList });
  };

  _renderTabBar = props => (
    <View>
      <TabBar
        {...props}
        scrollEnabled
        indicatorStyle={styles.indicator}
        style={styles.tabBar}
        tabStyle={styles.tab}
        labelStyle={styles.label}
      />
    </View>
  );

  render() {
    return (
      <SafeAreaView style={styles.topContainer}>
        <StatusBar barStyle="light-content" translucent={false} />
        <NavigationEvents onDidFocus={() => this.checkAppContextChanged()} />
        <View style={styles.top_parent}>
          <TabView
            navigationState={this.state}
            renderScene={this.renderScene}
            onIndexChange={index => this.onChangeTab(index)}
            initialLayout={style.initial_layout}
            style={styles.background_white}
            renderTabBar={this._renderTabBar}
          />
        </View>
        {/* {this.state.loading && (
          <View style={styles.loading}>
            <ActivityIndicator size="large" />
          </View>
        )}
        <ActionButton
          buttonColor={AppColors.brand.orange}
          onPress={this._clickRightNavigation}
        />*/}
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
  top_parent: {
    width: "100%",
    height: "100%"
  },
  background: {
    backgroundColor: "#DFDFDF"
  },
  qr_code_container: {
    width: "100%",
    height: 90,
    backgroundColor: "transparent"
  },
  qr_code_sub_container: {
    flexDirection: "row",
    flex: 1
  },
  qr_code_image: {
    width: 28,
    height: 28
  },
  add_button: {
    color: "white"
  },
  tab: {
    width: SCREEN_WIDTH / 3
  },
  tabBar: {
    backgroundColor: "#ffffff"
  },
  indicator: {
    backgroundColor: AppColors.brand.alpha,
    height: 3
  },
  label: {
    color: "#454545"
  },
  background_white: {
    backgroundColor: "#ffffff"
  },
  initial_layout: {
    width: SCREEN_WIDTH
  },
  badge: {
    position: "absolute",
    top: -5
  }
};

const styles = StyleSheet.create(style);

export default RostersView;

RostersView.propTypes = {};

RostersView.defaultProps = {};
