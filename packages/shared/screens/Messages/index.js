import React, { PureComponent } from "react";
import {
  AsyncStorage,
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Alert,
  ScrollView
} from "react-native";
import { Constants } from "expo";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import moment from "moment";
import { API } from "aws-amplify";
import _ from "lodash";
import FontIcon from "@m1/shared/components/FontIcon";
import HTMLView from "react-native-htmlview";
import AppColors from "@assets/theme/colors";
import AppSize from "@assets/theme/sizes";
import Color from "color";
import { NavigationEvents } from "react-navigation";
import ContextService from "@m1/shared/services/context";
import getRNDraftJSBlocks from "react-native-draftjs-render";
import CreateMessages from "@m1/shared/screens/Messages/CreateMessages";

const Grey = "#D8D8D8";
const contextService = new ContextService();

export default class Messages extends PureComponent {
  static navigationOptions = ({ navigation }) => {
    var onAdd = () => {};

    let params = navigation.state.params;

    if (params && params.onAdd) {
      onAdd = params.onAdd;
    }
    return {
      headerTitle: (
        <View
          style={{
            width: "100%",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <Text style={{ color: AppColors.text.white }}>{"Messages"}</Text>
        </View>
      ),
      headerTitleStyle: { flex: 1, textAlign: "center" },
      headerLeft: null
    };
  };

  state = {
    index: 0,
    routes: [
      { key: "compose", title: "Compose" },
      { key: "drafts", title: "Drafts" },
      { key: "sent", title: "Sent" },
      { key: "scheduled", title: "SCHEDULED" }
    ],
    username: "",
    currentTeam: {},
    loading: false,
    drafts: [],
    sentMessages: [],
    scheduled: [],
    selectedData: {},
    athletes: [],
    coaches: [],
    events: [],
    activities: [],
    entityGroups: []
  };

  async getScheduledMessages(teamId) {
    return API.get("scheduledMessages", `/team/${teamId}/scheduled`);
  }

  refresh = async () => {
    var messages = await this.getMessages(this.state.currentTeam.id);

    messages = this.messageSort(messages);

    console.log(messages);

    var drafts = [];
    var sentMessages = [];
    // console.log("XXXX")
    var scheduledMessages = await this.getScheduledMessages(
      this.state.currentTeam.id
    );

    console.log(scheduledMessages);
    var scheduledMessagesArray = [];
    for (var i = 0; i < scheduledMessages.length; i++) {
      var isJson = false;
      var description = scheduledMessages[i].message;
      if (this.isJson(description) && description) {
        isJson = true;
      }

      scheduledMessages[i].isJson = isJson;

      scheduledMessagesArray.push(scheduledMessages[i]);
    }

    scheduledMessagesArray = scheduledMessagesArray.sort(function(x, y){
        if (x.createdAt < y.createdAt) {
          return 1;
        }

        if (x.createdAt > y.createdAt) {
          return -1;
        }
        return 0;
    })

    this.setState({ scheduled: scheduledMessagesArray });

    for (var i = 0; i < messages.length; i++) {
      messages[i].messageType = messages[i].messageType.toLowerCase();
      if (messages[i].isDraft == true) {
        messages[i].isOpen = false;
        if (messages[i].recipientType && messages[i].recipientType.length > 0) {
          if (messages[i].recipientType == "guardian") {
            messages[i].recipientType = "Parents";
          } else if (messages[i].recipientType == "athlete") {
            messages[i].recipientType = "Athletes";
          } else {
            messages[i].recipientType =
              messages[i].recipientType.charAt(0).toUpperCase() +
              messages[i].recipientType.slice(1);
          }
        }

        if (messages[i].messageType && messages[i].messageType.length > 0) {
          if (messages[i].messageType != "email") {
            if (
              messages[i].messageType == "sms" ||
              messages[i].messageType == "text"
            ) {
              messages[i].messageType = "sms";
            } else {
              messages[i].messageType = "notification";
            }
          } else {
            messages[i].messageType = "email";
          }
        }
        var isJson = false;
        var description = messages[i].message;

        if (this.isJson(description) && description) {
          isJson = true;
        }

        messages[i].isJson = isJson;

        drafts.push(messages[i]);
      } else {
        messages[i].isOpen = false;

        if (messages[i].recipientType && messages[i].recipientType.length > 0) {
          if (messages[i].recipientType == "guardian") {
            messages[i].recipientType = "Parents";
          } else if (messages[i].recipientType == "athlete") {
            messages[i].recipientType = "Athletes";
          } else {
            messages[i].recipientType =
              messages[i].recipientType.charAt(0).toUpperCase() +
              messages[i].recipientType.slice(1);
          }
        }

        if (messages[i].messageType && messages[i].messageType.length > 0) {
          if (messages[i].messageType != "email") {
            if (
              messages[i].messageType == "sms" ||
              messages[i].messageType == "text"
            ) {
              messages[i].messageType = "sms";
            } else {
              messages[i].messageType = "notification";
            }
          } else {
            messages[i].messageType = "email";
          }
        }

        var isJson = false;
        var description = messages[i].message;

        if (this.isJson(description) && description) {
          isJson = true;
        }

        messages[i].isJson = isJson;

        sentMessages.push(messages[i]);
      }
    }

    if (
      this.state.appContext &&
      this.state.appContext.isStaff &&
      !contextService.isStaffPermitted(
        this.state.currentTeam,
        "canSendMessages"
      )
    ) {
      let routes = [{ key: "sent", title: "Sent" }];
      this.setState({ routes: routes });
    }

    this.setState({ drafts: _.uniqBy(drafts), sentMessages: _.uniqBy(sentMessages) });
  };

  componentWillUnmount() {
    this.mount = false;

    this.props.navigation.setParams({
      onAdd: null
    });
  }

  componentDidMount = async () => {
    this.mount = true;

    this.props.navigation.setParams({
      onAdd: this._clickRightNavigation
    });

    this.setState({ loading: true });

    var userContextString = await AsyncStorage.getItem("@M1:userContext");
    var appContextString = await AsyncStorage.getItem("@M1:appContext");
    var userContext = JSON.parse(userContextString);
    var appContext = JSON.parse(appContextString);
    this.setState({
      username: userContext.user.username,
      appContext: appContext
    });

    const currentTeam = _.find(
      userContext.appContextList,
      c => c.id === appContext.id
    );

    var userContext = null;
    if (userContextString !== null) {
      userContext = JSON.parse(userContextString);
    }

    var athletesData = await this.getAthletes(currentTeam.id);
    athletesList = [];

    athletesList.push({
      name: `All Athletes`,
      id: "allAthletes",
      orgId: currentTeam.id
    });

    _.forEach(athletesData, athlete => {
      if (athlete) {
        if (athlete.avatarUrl && !athlete.avatarUrl.includes("http")) {
          athlete.avatarUrl = `https://s3.amazonaws.com/programax-videos-production/uploads/user/avatar/${
            athlete.legacyId ? athlete.legacyId : athlete.id
          }/${athlete.avatarUrl}`;
        }

        athlete.name = athlete.nameFirst + " " + athlete.nameLast;
        athletesList.push(athlete);
      }
    });

    this.setState({ athletes: athletesList });

    var coachesData = await this.getCoaches(currentTeam.id);

    coachesList = [];

    coachesList.push({
      name: `All Coaches`,
      id: "allCoaches",
      teamId: currentTeam.id
    });

    _.forEach(coachesData, coach => {
      if (coach) {
        if (coach.avatarUrl && !coach.avatarUrl.includes("http")) {
          coach.avatarUrl = `https://s3.amazonaws.com/programax-videos-production/uploads/user/avatar/${
            coach.legacyId ? coach.legacyId : coach.id
          }/${coach.avatarUrl}`;
        }

        coach.name = coach.nameFirst + " " + coach.nameLast;
        coachesList.push(coach);
      }
    });

    this.setState({ coaches: coachesList });

    var groupsData = await this.getGroups(currentTeam.id);

    var activities = await this.getActivities(currentTeam.id);

    var activityData = [];
    activities.sort(function(a, b) {
      if (a.name < b.name) {
        return -1;
      }

      if (a.name > b.name) {
        return 1;
      }

      return 0;
    });
    activityData.push({ name: "", id: 0 });

    _.forEach(activities, activity => {
      if (activity) {
        activityData.push(activity);
      }
    });

    if (this.mount) {
      this.setState({
        entityGroups: groupsData,
        activities: activityData
      });
    }

    this.setState({ currentTeam: currentTeam });

    await this.refresh();

    this.setState({ loading: false });
  };

  async checkAppContextChanged() {
    var appContextString = await AsyncStorage.getItem("@M1:appContext");
    var appContext = JSON.parse(appContextString);

    if (this.state.appContext && appContext !== this.state.appContext) {
      await this.componentDidMount();
    }
  }

  async getMessages(id) {
    return API.get("messages", `/programs/${id}/messages`);
  }

  async getAthletes(id) {
    return API.get("programs", `/programs/${id}/players`);
  }

  async getCoaches(id) {
    return API.get("programs", `/programs/${id}/coaches`);
  }

  async getGroups(id) {
    return API.get("groups", `/programs/${id}/groups`);
  }

  async getEvents(id) {
    return API.get("events", `/programs/${id}/events`);
  }

  async getScheduledMessages(teamId) {
    return API.get("scheduledMessages", `/team/${teamId}/scheduled`);
  }

  async getActivities(currentTeamID) {
    return API.get("activities", `/programs/${currentTeamID}/activities`);
  }

  async getEventInfo(id) {
    return API.get("events", `/events/${id}/enrollments`);
  }

  onChangeTab = index => {
    this.setState({ index: index, selectedData: {} });
  };

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
  toggle = item => {
    if (this.state.index == 1) {
      var items = this.state.drafts.slice(0);

      var index = _.findIndex(items, { id: item.id });

      if (index != -1) {
        // items[index].isOpen = !items[index].isOpen;
        this.editMessage(item);
      }
    } else {
      if (this.state.index == 3) {
        this.editScheduleMessage(item);
      }
    }
  };

  messageSort = item => {
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

  updateData = async param => {
    var item = Object.assign({}, param);

    // var isJson = false;
    // var description = item.message;

    // if (this.isJson(description) && description) {
    //   isJson = true;
    // }

    // item.isJson = isJson;

    // if (item.messageType.length > 0) {
    //   if (item.messageType.toLowerCase() != "email") {
    //     item.messageType = "text";
    //   }

    //   if (item.messageType.messageType != "email") {
    //     if (item.messageType == "sms" || item.messageType == "text") {
    //       item.messageType = "sms";
    //     } else {
    //       item.messageType = "notification";
    //     }
    //   } else {
    //     item.messageType = "email";
    //   }
    // }

    // if (item && item.recipientType && item.messageType) {
    //   if (item.recipientType.length > 0) {
    //     if (item.recipientType == "guardian") {
    //       item.recipientType = "Parents";
    //     } else {
    //       item.recipientType =
    //         item.recipientType.charAt(0).toUpperCase() +
    //         item.recipientType.slice(1);
    //     }
    //   }

    //   if (item.isDraft == true) {
    //     var items = this.state.drafts.slice(0);

    //     var index = _.findIndex(items, { id: item.id });

    //     if (index != -1) {
    //       items[index] = item;
    //       items = this.messageSort(items);
    //       this.setState({ drafts: items });
    //     } else {
    //       items.push(item);
    //       items = this.messageSort(items);

    //       this.setState({ drafts: items });
    //     }
    //   } else {
    //     var items = this.state.sentMessages.slice(0);

    //     items.push(item);

    //     items = this.messageSort(items);

    //     this.setState({ sentMessages: items });
    //   }

    await this.refresh();

    if (item.isDraft == true) {
      this.setState({ index: 1 });
    } else if (item.sendWhenTime) {
      this.setState({ index: 3 });
    } else {
      this.setState({ index: 2 });
    }
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

  editScheduleMessage = item => {
    var scheduledMessage = {};

    scheduledMessage.id = item.id;
    scheduledMessage.recipientType = "Athletes";
    scheduledMessage.messageType = item.type;
    scheduledMessage.message = item.message;
    scheduledMessage.createdAt = item.createdAt;
    scheduledMessage.parentId = item.parentId;
    scheduledMessage.sendWhenTime = item.activationTime;
    scheduledMessage.recipients = [];
    scheduledMessage.sendWhen = "Send Later";
    scheduledMessage.activityId = item.activityId ? item.activityId : "";
    scheduledMessage.externalUrl = item.externalUrl ? item.externalUrl : "";
    scheduledMessage.isFromSchedule = true;
    var itemRecipient = {};
    var athlete = _.find(this.state.athletes, pe => pe.id == item.sendTo);
    itemRecipient.id = item.sendTo;

    if (athlete) {
      if (athlete.name) {
        itemRecipient.name = athlete.name;
      } else {
        itemRecipient.name = athlete.nameFirst + " " + athlete.nameLast;
      }

      itemRecipient.recipientType = "player";

      scheduledMessage.recipients.push(itemRecipient);
    } else {
      var coach = _.find(this.state.coaches, pe => pe.id == item.sendTo);
      if (coach) {
        if (coach.name) {
          itemRecipient.name = coach.name;
        } else {
          itemRecipient.name = coach.nameFirst + " " + coach.nameLast;
        }

        itemRecipient.recipientType = "coach";

        scheduledMessage.recipients.push(itemRecipient);
      }
    }

    this.setState({ selectedData: scheduledMessage }, () => {
      this.setState({ index: 0 });
    });
  };

  editMessage = item => {
    var cloneObj = Object.assign({}, item);

    if (cloneObj.recipients) {
      for (var i = 0; i < cloneObj.recipients.length; i++) {
        if (cloneObj.recipients[i].id) {
        } else {
          cloneObj.recipients[i].id = cloneObj.recipients[i].user_id;
        }
      }
    }
    cloneObj.isFromSchedule = false;
    this.setState({ selectedData: cloneObj }, () => {
      this.setState({ index: 0 });
    });
  };

  _onDiscard = () => {
    this.setState({ selectedData: {} });
  };

  updatedSchedule = async items => {
    var scheduledMessages = await this.getScheduledMessages(
      this.state.currentTeam.id
    );

    var scheduledMessagesArray = [];
    for (var i = 0; i < scheduledMessages.length; i++) {
      var isJson = false;
      var description = scheduledMessages[i].message;
      if (this.isJson(description) && description) {
        isJson = true;
      }

      scheduledMessages[i].isJson = isJson;

      scheduledMessagesArray.push(scheduledMessages[i]);
    }

    scheduledMessagesArray = scheduledMessagesArray.sort(function(x, y){
      if (x.createdAt < y.createdAt) {
        return 1;
      }

      if (x.createdAt > y.createdAt) {
        return -1;
      }
      return 0;
    })

    this.setState({ scheduled: scheduledMessagesArray, index: 3 });
  };

  onPressDelete = async item => {
    if (item) {
      Alert.alert(
        "Are you sure?",
        "You are about to delete a drafted message. This cannot be undone.",
        [
          {
            text: "OK",
            onPress: async () => {
              var result = await this.deleteMessage(item.id);

              var items = this.state.drafts.slice(0);

              var index = _.findIndex(items, { id: item.id });

              if (index != -1) {
                items.splice(index, 1);

                this.setState({ drafts: items });
              }
            }
          },
          { text: "Cancel", onPress: () => {} }
        ],
        { cancelable: false }
      );
    }
  };

  onPressScheduledDelete = item => {
    if (item) {
      Alert.alert(
        "Are you sure?",
        "You are about to delete a scheduled message. This cannot be undone.",
        [
          {
            text: "OK",
            onPress: async () => {
              var result = await this.deleteScheduledMessage(item);

              var items = this.state.scheduled.slice(0);

              var index = _.findIndex(items, { id: item.id });

              if (index != -1) {
                items.splice(index, 1);

                this.setState({ scheduled: items });
              }
            }
          },
          { text: "Cancel", onPress: () => {} }
        ],
        { cancelable: false }
      );
    }
  };

  async deleteMessage(messageId) {
    return API.del("messages", `/messages/${messageId}/`);
  }

  async deleteScheduledMessage(data) {
    return API.del("scheduledMessages", `/scheduled/${data.id}/`);
  }
  _renderItem = ({ item, index }) => {
    const recipientsText =
      item && item.recipients
        ? _.map(item.recipients, r =>
            r.name ? r.name : r.nameFirst + " " + r.nameLast
          ).join(", ")
        : "";
    const hasRecipients = !!recipientsText;

    var message = item.message;
    if (item.isJson && item.isJson == true) {
      message = getRNDraftJSBlocks({
        contentState: JSON.parse(message)
      });
    }

    var isGeneral = true;

    if (item.activationTime) {
      isGeneral = false;
    }

    return (
      <TouchableOpacity
        style={{
          flexDirection: "column",
          borderTopWidth: 1,
          borderTopColor: "#ccc"
        }}
        onPress={() => this.toggle(item)}
      >
        <View
          style={{
            flexDirection: "row",
            borderTopWidth: 1,
            borderTopColor: "#ccc",
            paddingHorizontal: 20
          }}
        >
          <View
            style={{
              paddingRight: 10,
              alignItems: "center",
              justifyContent: "center",
              flex: 0.15
            }}
          >
            {item.messageType &&
              (item.messageType == "sms" ||
                item.messageType == "email" ||
                item.messageType == "text") && (
                <FontIcon
                  name={item.messageType === "email" ? "email" : "sms"}
                  size={24}
                  color={"#000"}
                />
              )}

            {item.messageType && item.messageType == "notification" && (
              <Feather
                name="bell"
                size={24}
                color={"#000"}
                containerStyle={{ paddingTop: 15 }}
              />
            )}

            {!item.messageType &&
              (item.type == "sms" ||
                item.type == "email" ||
                item.type == "text") && (
                <FontIcon
                  name={item.type === "email" ? "email" : "sms"}
                  size={24}
                  color={"#000"}
                />
              )}

            {!item.messageType && item.type == "notification" && (
              <Feather
                name="bell"
                size={24}
                color={"#000"}
                containerStyle={{ paddingTop: 15 }}
              />
            )}
          </View>
          <View style={{ flexDirection: "column", padding: 10, flex: 0.75 }}>
            <View style={{ flexDirection: "column", marginBottom: 5 }}>
              {hasRecipients && recipientsText.trim() !== "," && (
                <Text style={{ fontSize: 12, marginRight: 10 }}>
                  {hasRecipients ? recipientsText : ""}
                </Text>
              )}

              {isGeneral && (
                <Text style={{ fontSize: 12, color: "#7d7d7d" }}>
                  Created {moment(item.createdAt).fromNow()}
                </Text>
              )}

              {!isGeneral && (
                <Text style={{ fontSize: 12, color: "#7d7d7d" }}>
                  {moment(item.activationTime).format("MMMM DD YYYY h:mm a")}
                </Text>
              )}
            </View>
            {item.isJson == true && (
              <ScrollView style={{ flex: 1 }}>{message}</ScrollView>
            )}

            {item.isJson == false && (
              <HTMLView value={message ? message : "[Empty]"} />
            )}
          </View>
          <TouchableOpacity
            style={{
              flexDirection: "column",
              padding: 10,
              flex: 0.1,
              justifyContent: "center",
              alignItems: "center"
            }}
            onPress={() => {
              this.state.index == 1
                ? this.onPressDelete(item)
                : this.state.index == 3
                ? this.onPressScheduledDelete(item)
                : this.void();
            }}
          >
            {(this.state.index == 1 || this.state.index == 3) && (
              <MaterialIcons name="delete" size={24} color={"#000"} />
            )}
          </TouchableOpacity>
        </View>

        {item.isOpen && (
          <View style={styles.drawerContainer}>
            <TouchableOpacity
              style={[styles.drawerItem, styles.drawerItemBorder]}
              onPress={() => {
                this.editMessage(item);
              }}
            >
              <Text style={styles.drawerItemLabel}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.drawerItem}
              onPress={() => {
                this.onPressDelete(item);
              }}
            >
              <Text style={styles.drawerItemLabel}>Discard</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  renderScene = ({ route }) => {
    const { appContext, currentTeam, loading } = this.state;
    const currentRoute = route.key;

    if (
      appContext &&
      appContext.isStaff &&
      !contextService.isStaffPermitted(currentTeam, "canSendMessages")
    )
      return (
        <FlatList
          data={this.state.sentMessages}
          renderItem={this._renderItem}
          keyExtractor={item => item.id}
          style={{ backgroundColor: "white" }}
        />
      );
    else if (currentRoute === "compose" && !loading)
      return (
        <CreateMessages
          updateData={item => {
            this.updateData(item);
          }}
          selectedData={this.state.selectedData}
          onDiscard={() => {
            this._onDiscard();
          }}
          updatedSchedule={item => {
            this.updatedSchedule(item);
          }}
          athletes={this.state.athletes}
          coaches={this.state.coaches}
          events={this.state.events}
          activities={this.state.activities}
          entityGroups={this.state.entityGroups}
        />
      );
    else if (!loading)
      return (
        <FlatList
          data={
            currentRoute === "drafts"
              ? this.state.drafts
              : currentRoute === "sent"
              ? this.state.sentMessages
              : this.state.scheduled
          }
          renderItem={this._renderItem}
          keyExtractor={item => item.id}
          style={{ backgroundColor: "white" }}
        />
      );
    else return null;
  };

  deleteMessages = item => {
    if (this.state.index == 1) {
      this.onPressDelete(item);

      return;
    }

    if (this.state.index == 3) {
      this.onPressScheduledDelete(item);

      return;
    }
  };

  void() {}

  render() {
    const { loading } = this.state;
    return (
      <View style={{ width: "100%", height: "100%" }}>
        {!loading && (
          <TabView
            navigationState={this.state}
            renderScene={this.renderScene}
            onIndexChange={index => this.onChangeTab(index)}
            initialLayout={styles.initial_layout}
            style={styles.background_white}
            renderTabBar={this._renderTabBar}
          />
        )}

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
  initial_layout: {
    width: AppSize.screen.width
  },
  tab: {
    width: (AppSize.screen.width * 1.2) / 4
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
  }
});
