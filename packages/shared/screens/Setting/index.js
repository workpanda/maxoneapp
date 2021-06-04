import React from "react";
import PropTypes from "prop-types";

import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  StatusBar,
  WebView,
  ScrollView,
  AsyncStorage,
  Switch,
  ActivityIndicator
} from "react-native";
import _ from "lodash";
import { API } from "aws-amplify";
import { Feather } from "@expo/vector-icons";
import { AppColors, AppSizes } from "@assets/theme";

class Setting extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    title: "Settings",
    headerLeft: (
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{ marginLeft: 10 }}
      >
        <Feather name="arrow-left" size={24} color="white" />
      </TouchableOpacity>
    ),
    headerRight: <View />
  });

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      chatNotificationStatus: false,
      eventNotificationStatus: false
    };
  }

  componentDidMount = async () => {
    this.setState({ loading: true });
    var userContextString = await AsyncStorage.getItem("@M1:userContext");
    var userContext = JSON.parse(userContextString);

    var user = userContext.user;

    user.pushNotificationTokens = user.pushNotificationTokens
      ? user.pushNotificationTokens
      : [];

    let userId = user.id;

    this.mount = true;

    var chatNotificationStatus = await this.getChatNotificationSetting(userId);
    var eventNotificationStatus = await this.getEventNotificationSetting(
      userId
    );

    this.setState({
      chatNotificationStatus: chatNotificationStatus.isActive,
      eventNotificationStatus: eventNotificationStatus.isActive,
      userId: userId
    });

    this.setState({ loading: false });
  };

  componentWillUnmount() {
    this.mount = false;
  }

  componentWillReceiveProps(props) {}
  changeEventNotificationStatus = () => {
    this.setState(
      {
        eventNotificationStatus: !this.state.eventNotificationStatus
      },
      async () => {
        await this.updateEventNotificationStatus(
          this.state.userId,
          this.state.eventNotificationStatus
        );
      }
    );
  };
  changeChatNotificationStatus = () => {
    this.setState(
      {
        chatNotificationStatus: !this.state.chatNotificationStatus
      },
      async () => {
        var data = await this.updateChatNotificationStatus(
          this.state.userId,
          this.state.chatNotificationStatus
        );
      }
    );
  };

  updateEventNotificationStatus = async (userId, status) => {
    var data = { isActive: status };
    return API.post("eventNotificationSetting", `/updateSetting/${userId}`, {
      body: data
    });
  };

  updateChatNotificationStatus = async (userId, status) => {
    var data = { isActive: status };

    return API.post("chatNotificationSetting", `/updateSetting/${userId}`, {
      body: data
    });
  };

  async getChatNotificationSetting(userId) {
    return API.get("chatNotificationSetting", `/getSetting/${userId}`);
  }

  async getEventNotificationSetting(userId) {
    return API.get("eventNotificationSetting", `/getSetting/${userId}`);
  }
  render() {
    return (
      <View style={styles.container}>
        {!this.state.loading ? (
          <View style={styles.sub_container}>
            <TouchableOpacity style={styles.chat_notification_container}>
              <View style={styles.text_container}>
                <Text style={styles.menuItem}>{"Chat Notification"}</Text>
              </View>
              <View style={styles.switch_container}>
                <Switch
                  value={this.state.chatNotificationStatus}
                  onValueChange={() => {
                    this.changeChatNotificationStatus();
                  }}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.event_notification_container}>
              <View style={styles.text_container}>
                <Text style={styles.menuItem}>{"Event Notification"}</Text>
              </View>
              <View style={styles.switch_container}>
                <Switch
                  value={this.state.eventNotificationStatus}
                  onValueChange={() => {
                    this.changeEventNotificationStatus();
                  }}
                />
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.loading}>
            <ActivityIndicator size="large" />
          </View>
        )}
      </View>
    );
  }
}

let style = {
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center"
  },
  sub_container: {
    flex: 1,
    flexDirection: "column"
  },
  switch_container: {
    flex: 0.1,
    alignItems: "flex-end"
  },
  text_container: {
    paddingLeft: 0,
    flex: 0.9,
    height: 50,
    justifyContent: "center"
  },
  loading: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    width: "100%",
    left: 0,
    top: 0,
    width: "100%",
    height: "100%"
  },
  chat_notification_container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    borderTopWidth: 0,
    borderColor: "#D8D8D8",
    width: AppSizes.screen.width - 40,
    marginTop: 30
  },
  event_notification_container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    borderTopWidth: 0,
    borderColor: "#D8D8D8",
    width: AppSizes.screen.width - 40
  },
  menuItem: {
    fontSize: 18,
    color: AppColors.text.dark
  }
};

const styles = StyleSheet.create(style);

export default Setting;
