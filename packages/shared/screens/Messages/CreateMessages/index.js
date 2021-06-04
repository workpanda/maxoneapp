import React, { PureComponent } from "react";
import {
  AsyncStorage,
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Dimensions,
  Image,
  TextInput,
  ScrollView,
  Keyboard,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  StatusBar,
  Platform
} from "react-native";

import { API } from "aws-amplify";
import _ from "lodash";
import { Feather } from "@expo/vector-icons";
import moment from "moment";
import DateTimePicker from "react-native-modal-datetime-picker";
import SimplePicker from "react-native-simple-picker";
import FloatingLabel from "react-native-floating-labels";
import CommonStyles from "@m1/shared/theme/styles";
import AppColors from "@assets/theme/colors";
import AppSize from "@assets/theme/sizes";
import TagSelect from "@m1/shared/components/Tag/TagSelect";
import Spacer from "@m1/shared/components/Spacer";
import { Constants } from 'expo';
import RecipientsDialog from "@m1/shared/screens/Messages/CreateMessages/RecipientsDialog";
import CustomFloatingLabel from "@m1/shared/components/CustomFloatingLabel";
const imgDownArrow = require("@m1/shared/assets/drop_down_arrow.png");
const SCREEN_WIDTH = Dimensions.get("window").width;
const DELIVERY_LIST = ["SMS", "Email", "Push Notification"];
const DELIVERY_VALUE = ["sms", "email", "notification"];
const RECEIPT_TYPE_LIST = ["Athletes", "Parents", "Both"];
const SEND_WHEN = ["Send Now", "Send Later"];
var athletesList = [];
var coachesList = [];
import PolygonButton from '@m1/shared/components/PolygonButton'

export default class CreateMessages extends PureComponent {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: (
        <View
          style={{
            width: "100%",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <Text style={{ color: AppColors.text.white }}>
            {"COMPOSE MESSAGE"}
          </Text>
        </View>
      ),
      headerTitleStyle: { flex: 1, textAlign: "center" },
      headerLeft: (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginLeft: 10 }}
        >
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
      ),
      headerRight: <View />
    };
  };

  constructor(props) {
    super(props);

    let {
      selectedData,
      athletes,
      coaches,
      activities,
      entityGroups,
      events
    } = props;
    var data = selectedData ? selectedData : {};
    var receiptArray = [];

    if (JSON.stringify(data) !== JSON.stringify({})) {
      if (data && data.recipients) {
        for (var i = 0; i < data.recipients.length; i++) {
          var item = {};

          item["id"] = data.recipients[i].name;
          item["label"] = data.recipients[i].name
            ? data.recipients[i].name
            : data.recipients[i].nameFirst + " " + data.recipients[i].nameLast;

          receiptArray.push(item);
        }
      }
    }

    var messageType = "sms";

    if (JSON.stringify(data) !== JSON.stringify({})) {
      if (data.messageType == "text" || data.messageType == "sms") {
        messageType = "sms";
      } else {
        if (data.messageType.toLowerCase() == "email") {
          messageType = "email";
        } else {
          messageType = "notification";
        }
      }
    }

    this.state = {
      athletes: athletes,
      coaches: coaches,
      username: "",
      currentTeam: {},
      currentUser: {},
      mData: {},
      selectedRoster: "Athletes",
      showRecipientsDialog: false,
      activities: activities,
      entityGroups: entityGroups,
      events: events,
      id: JSON.stringify(data) === JSON.stringify({}) ? null : data.id,
      isFromSchedule:
        JSON.stringify(data) === JSON.stringify({})
          ? false
          : data.isFromSchedule,
      sendWhenTime:
        JSON.stringify(data) === JSON.stringify({})
          ? new Date()
          : data.sendWhenTime
          ? new Date(data.sendWhenTime)
          : new Date(),
      recipientType:
        JSON.stringify(data) === JSON.stringify({})
          ? "Athletes"
          : data.recipientType,
      messageType: messageType,
      recipients:
        JSON.stringify(data) === JSON.stringify({}) ? [] : data.recipients,
      message: JSON.stringify(data) === JSON.stringify({}) ? "" : data.message,
      receiptArray: receiptArray,
      removedRecipients: [],

      sendWhen:
        JSON.stringify(data) === JSON.stringify({})
          ? "Send Now"
          : data.sendWhen
          ? data.sendWhen
          : "Send Now",
      isDateTimePickerVisible: false,
      externalUrl:
        JSON.stringify(data) === JSON.stringify({}) ? "" : data.externalUrl,
      activityId:
        JSON.stringify(data) === JSON.stringify({}) ? "" : data.activityId,
      appContext: {}
    };

    this.mount = true;
  }

  componentWillReceiveProps(props) {
    if (!this.mount) return;
    let {
      selectedData,
      athletes,
      coaches,
      events,
      activities,
      entityGroups
    } = props;
    var data = selectedData ? selectedData : {};
    var receiptArray = [];

    if (JSON.stringify(data) !== JSON.stringify({})) {
      if (data && data.recipients) {
        for (var i = 0; i < data.recipients.length; i++) {
          var item = {};

          item["id"] = data.recipients[i].name;
          item["label"] = data.recipients[i].name
            ? data.recipients[i].name
            : data.recipients[i].nameFirst + " " + data.recipients[i].nameLast;

          receiptArray.push(item);
        }
      }
    }

    var messageType = "sms";

    if (JSON.stringify(data) !== JSON.stringify({})) {
      if (
        data.messageType.toLowerCase() == "text" ||
        data.messageType.toLowerCase() == "sms"
      ) {
        messageType = "sms";
      } else {
        if (data.messageType.toLowerCase() == "email") {
          messageType = "email";
        } else {
          messageType = "notification";
        }
      }
      console.log("selected message Type", data.messageType);
    }

    this.setState({
      athletes: athletes,
      coaches: coaches,
      events,
      activities,
      entityGroups,
      id: JSON.stringify(data) === JSON.stringify({}) ? null : data.id,
      isFromSchedule:
        JSON.stringify(data) === JSON.stringify({})
          ? false
          : data.isFromSchedule,
      sendWhen:
        JSON.stringify(data) === JSON.stringify({})
          ? "Send Now"
          : data.sendWhen
          ? data.sendWhen
          : "Send Now",
      sendWhenTime:
        JSON.stringify(data) === JSON.stringify({})
          ? new Date()
          : data.sendWhenTime
          ? new Date(data.sendWhenTime)
          : new Date(),
      recipientType:
        JSON.stringify(data) === JSON.stringify({})
          ? "Athletes"
          : data.recipientType,
      messageType: messageType,
      recipients:
        JSON.stringify(data) === JSON.stringify({}) ? [] : data.recipients,
      message: JSON.stringify(data) === JSON.stringify({}) ? "" : data.message,
      receiptArray: receiptArray,
      removedRecipients: [],
      externalUrl:
        JSON.stringify(data) === JSON.stringify({}) ? "" : data.externalUrl,
      activityId:
        JSON.stringify(data) === JSON.stringify({}) ? "" : data.activityId
    });
  }

  componentWillUnmount() {
    this.mount = false;
  }

  componentDidMount = async () => {
    this.mount = true;

    var userContextString = await AsyncStorage.getItem("@M1:userContext");
    var appContextString = await AsyncStorage.getItem("@M1:appContext");
    var userContext = JSON.parse(userContextString);
    var appContext = JSON.parse(appContextString);
    this.setState({ username: userContext.user.username });

    const currentTeam = _.find(
      userContext.appContextList,
      c => c.id === appContext.id
    );

    this.setState({
      appContext,
      currentTeam: currentTeam,
      currentUser: userContext
    });

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

    var eventsData = await this.getEvents(currentTeam.id);

    for (var i = 0; i < eventsData.length; i++) {
      var eventData = await this.getEventInfo(eventsData[i].id);
      eventsData[i].participants = eventData;
    }

    if (this.mount && eventsData) {
      this.setState({ events: eventsData });
    }
  };

  getActivities(currentTeamID) {
    return API.get("activities", `/programs/${currentTeamID}/activities`);
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

  async getEventInfo(id) {
    return API.get("events", `/events/${id}/enrollments`);
  }

  open_modal = () => {
    this.setState({ showRecipientsDialog: true });
  };

  _onPressClose = () => {
    this.setState({ showRecipientsDialog: false });
  };

  onPressSend = async () => {
    let {
      recipientType,
      messageType,
      recipients,
      message,
      removedRecipients,
      currentTeam
    } = this.state;

    Keyboard.dismiss();
    if (!recipients || !recipients.length) {
      Alert.alert("Please select at least one recipient.");
      return;
    }
    if (!messageType) {
      Alert.alert("Please select a delivery preference.");
      return;
    }
    if (!recipientType) {
      Alert.alert("Please select a recipient type preference.");
      return;
    }

    if (!message) {
      Alert.alert("Please enter a message to be sent.");
      return;
    }

    if (messageType == "sms") {
      if (message.length > 340) {
        Alert.alert("Sms has 340 limits for length.");

        return;
      }
    } else {
      if (messageType == "notification") {
        if (
          this.state.externalUrl.length != 0 &&
          !(
            this.state.externalUrl.startsWith("http://") ||
            this.state.externalUrl.startsWith("https://")
          )
        ) {
          Alert.alert("Please input correct external Url");

          return;
        }
      }
    }

    if (messageType === DELIVERY_LIST[2]) {
    }

    let { updateData, updatedSchedule } = this.props;

    // mark things to be deleted in API
    removedRecipients.forEach(rr => (rr._destroy = true));

    var cloneObj = {};

    cloneObj.recipients = [...recipients, ...removedRecipients];

    cloneObj.recipientType = recipientType;

    cloneObj.messageType = messageType;

    cloneObj.message = message;

    cloneObj.tenant = Constants.manifest.slug;

    cloneObj.domain = Constants.manifest.slug;

    var result = await this.saveMessage(currentTeam.id, cloneObj, true);

    if (this.state.sendWhen == "Send Later") {
      updatedSchedule(result);
    } else {
      updateData(result);
    }

    this._onClickDiscard();
  };

  onPressSaveDraft = async () => {
    let {
      recipientType,
      messageType,
      recipients,
      message,
      removedRecipients,
      currentTeam
    } = this.state;

    if (!message) {
      Alert.alert("Please enter a message to be sent.");
      return;
    }

    let { updateData } = this.props;

    removedRecipients.forEach(rr => (rr._destroy = true));

    var cloneObj = {};

    cloneObj.isDraft = true;

    cloneObj.recipients = [...recipients, ...removedRecipients];

    cloneObj.recipientType = recipientType;

    cloneObj.messageType = messageType;

    cloneObj.message = message;

    cloneObj.externalUrl =
      this.state.externalUrl == "" ? null : this.state.externalUrl;
    cloneObj.activityId =
      this.state.activityId == "" ? null : this.state.activityId;
    cloneObj.sendWhen = this.state.sendWhen;

    cloneObj.sendWhenTime = null;

    if (this.state.sendWhen === "Send Later") {
      cloneObj.sendWhenTime = this.state.sendWhenTime;
    }

    var result = await this.saveMessage(currentTeam.id, cloneObj, false);

    updateData(result);
  };

  async deleteMessage(messageId) {
    return API.del("messages", `/messages/${messageId}/`);
  }
  buildMessage(messageData) {
    var mResultMessage = {};

    if (messageData.messageType.toLowerCase() == "email") {
      mResultMessage.messageType = "email";
    } else {
      if (
        messageData.messageType.toLowerCase() == "text" ||
        messageData.messageType.toLowerCase() == "sms"
      ) {
        mResultMessage.messageType = "sms";
      } else {
        mResultMessage.messageType = "notification";
      }
    }

    if (messageData.id) {
      mResultMessage.id = messageData.id;
    }

    if (messageData.message) {
      mResultMessage.message = messageData.message;
    }

    if (messageData.recipientType == "Athletes") {
      mResultMessage.recipientType = "athlete";
    }

    if (messageData.recipientType == "Parents") {
      mResultMessage.recipientType = "guardian";
    }

    mResultMessage.parentId = this.state.currentTeam.id;

    var mRecipient = [];

    var isAllAthletes = _.find(
      messageData.recipients,
      pe => pe.id === "allAthletes"
    );
    var isAllCoaches = _.find(
      messageData.recipients,
      pe => pe.id === "allCoaches"
    );

    if (isAllAthletes) {
      for (var i = 0; i < this.state.athletes.length; i++) {
        var cloneObj = Object.assign({}, this.state.athletes[i]);

        if (!cloneObj.name) {
          cloneObj.name = cloneObj.nameFirst + " " + cloneObj.nameLast;
        }

        mRecipient.push(cloneObj);
      }
    }

    if (isAllCoaches) {
      for (var i = 0; i < this.state.coaches.length; i++) {
        var cloneObj = Object.assign({}, this.state.coaches[i]);

        if (!cloneObj.name) {
          cloneObj.name = cloneObj.nameFirst + " " + cloneObj.nameLast;
        }

        mRecipient.push(cloneObj);
      }
    }

    for (var i = 0; i < messageData.recipients.length; i++) {
      var item = messageData.recipients[i];

      if (item.id == "allAthletes" || item.id == "allCoaches") {
        continue;
      }

      if (item.recipientType == "player" || item.recipientType == "coach") {
        if (isAllAthletes) {
          if (item.recipientType == "player") {
            continue;
          }
        }

        if (isAllCoaches) {
          if (item.recipientType == "coach") {
            continue;
          }
        }

        const findItem = _.find(
          this.state.athletes,
          pe => pe.id === item.id || pe.userId === item.id
        );

        if (findItem) {
          if (mRecipient.length > 0) {
            const findInRecipient = _.find(
              mRecipient,
              pe => pe.id === item.id || pe.userId === item.id
            );

            if (findInRecipient) {
              continue;
            } else {
              if (!findItem.name) {
                var cloneObj = Object.assign({}, findItem);
                cloneObj.name = cloneObj.nameFirst + " " + cloneObj.nameLast;
                mRecipient.push(cloneObj);
              } else {
                mRecipient.push(findItem);
              }
            }
          } else {
            if (!findItem.name) {
              var cloneObj = Object.assign({}, findItem);
              cloneObj.name = cloneObj.nameFirst + " " + cloneObj.nameLast;
              mRecipient.push(cloneObj);
            } else {
              mRecipient.push(findItem);
            }
          }
        } else {
          const findItemInCoach = _.find(
            this.state.coaches,
            pe => pe.id === item.id || pe.userId === item.id
          );

          if (findItemInCoach) {
            if (mRecipient.length > 0) {
              const findInRecipient = _.find(
                mRecipient,
                pe => pe.id === item.id || pe.userId === item.id
              );

              if (findInRecipient) {
                continue;
              } else {
                if (!findItemInCoach.name) {
                  var cloneObj = Object.assign({}, findItemInCoach);
                  cloneObj.name = cloneObj.nameFirst + " " + cloneObj.nameLast;
                  mRecipient.push(cloneObj);
                } else {
                  mRecipient.push(findItemInCoach);
                }
              }
            } else {
              if (!findItemInCoach.name) {
                var cloneObj = Object.assign({}, findItemInCoach);
                cloneObj.name = cloneObj.nameFirst + " " + cloneObj.nameLast;
                mRecipient.push(cloneObj);
              } else {
                mRecipient.push(findItemInCoach);
              }
            }
          }
        }
      }

      if (item.recipientType == "group") {
        const findItem = _.find(
          this.state.entityGroups,
          pe => pe.id === item.entity_group_id && pe.name === item.name
        );

        if (findItem && findItem.participants) {
          if (findItem.participants.length > 0) {
            for (var j = 0; j < findItem.participants.length; j++) {
              var groupChildItem = findItem.participants[j];

              const findInAthlete = _.find(
                this.state.athletes,
                pe =>
                  pe.id === groupChildItem.userId || pe.id === groupChildItem.id
              );

              const findInCoaches = _.find(
                this.state.coaches,
                pe =>
                  pe.id === groupChildItem.userId || pe.id === groupChildItem.id
              );
              if (findInAthlete) {
                if (mRecipient.length > 0) {
                  const findInRecipient = _.find(
                    mRecipient,
                    pe =>
                      pe.id === findInAthlete.id ||
                      pe.userId === findInAthlete.id
                  );

                  if (findInRecipient) {
                    continue;
                  } else {
                    if (!findInAthlete.name) {
                      var cloneObj = Object.assign({}, findInAthlete);
                      cloneObj.name =
                        cloneObj.nameFirst + " " + cloneObj.nameLast;
                      mRecipient.push(cloneObj);
                    } else {
                      mRecipient.push(findInAthlete);
                    }
                  }
                } else {
                  if (!findInAthlete.name) {
                    var cloneObj = Object.assign({}, findInAthlete);
                    cloneObj.name =
                      cloneObj.nameFirst + " " + cloneObj.nameLast;
                    mRecipient.push(cloneObj);
                  } else {
                    mRecipient.push(findInAthlete);
                  }
                }
              } else if (findInCoaches) {
                if (mRecipient.length > 0) {
                  const findInRecipient = _.find(
                    mRecipient,
                    pe =>
                      pe.id === findInCoaches.id ||
                      pe.userId === findInCoaches.id
                  );

                  if (findInRecipient) {
                    continue;
                  } else {
                    if (!findInCoaches.name) {
                      var cloneObj = Object.assign({}, findInCoaches);
                      cloneObj.name =
                        cloneObj.nameFirst + " " + cloneObj.nameLast;
                      mRecipient.push(cloneObj);
                    } else {
                      mRecipient.push(findInCoaches);
                    }
                  }
                } else {
                  if (!findInCoaches.name) {
                    var cloneObj = Object.assign({}, findInCoaches);
                    cloneObj.name =
                      cloneObj.nameFirst + " " + cloneObj.nameLast;
                    mRecipient.push(cloneObj);
                  } else {
                    mRecipient.push(findInCoaches);
                  }
                }
              }
            }
          }
        }
      }

      if (item.recipientType == "graduationYear") {
        var dynamic = {};
        if (item.dynamic && typeof item.dynamic === "string")
          dynamic = JSON.parse(item.dynamic);
        else if (item.dynamic) dynamic = item.dynamic;

        if (dynamic.value) {
          var filterResult = _.filter(
            this.state.athletes,
            r => r.graduationYear == dynamic.value
          );

          if (filterResult) {
            for (var j = 0; j < filterResult.length; j++) {
              var selectedItem = filterResult[j];

              if (mRecipient.length > 0) {
                const findInRecipient = _.find(
                  mRecipient,
                  pe =>
                    pe.id === selectedItem.id || pe.userId === selectedItem.id
                );

                if (findInRecipient) {
                  continue;
                } else {
                  if (!selectedItem.name) {
                    var cloneObj = Object.assign({}, selectedItem);
                    cloneObj.name =
                      cloneObj.nameFirst + " " + cloneObj.nameLast;
                    mRecipient.push(cloneObj);
                  } else {
                    mRecipient.push(selectedItem);
                  }
                }
              } else {
                if (!selectedItem.name) {
                  var cloneObj = Object.assign({}, selectedItem);
                  cloneObj.name = cloneObj.nameFirst + " " + cloneObj.nameLast;
                  mRecipient.push(cloneObj);
                } else {
                  mRecipient.push(selectedItem);
                }
              }
            }
          }
        }
      }

      if (item.recipientType == "event") {
        var dynamic = {};
        if (item.dynamic && typeof item.dynamic === "string")
          dynamic = JSON.parse(item.dynamic);
        else if (item.dynamic) dynamic = item.dynamic;

        if (dynamic.value) {
          var filterResult = _.find(
            this.state.events,
            r => r.id == dynamic.value
          );

          if (filterResult && filterResult.participants) {
            for (var j = 0; j < filterResult.participants.length; j++) {
              var selectedItem = filterResult.participants[j];

              const findInAthletes = _.find(
                this.state.athletes,
                pe => pe.id == selectedItem.userId
              );

              if (findInAthletes) {
                if (mRecipient.length > 0) {
                  const findInRecipient = _.find(
                    mRecipient,
                    pe =>
                      pe.id === findInAthletes.id ||
                      pe.userId === findInAthletes.id
                  );

                  if (findInRecipient) {
                    continue;
                  } else {
                    if (!findInAthletes.name) {
                      var cloneObj = Object.assign({}, findInAthletes);
                      cloneObj.name =
                        cloneObj.nameFirst + " " + cloneObj.nameLast;
                      mRecipient.push(cloneObj);
                    } else {
                      mRecipient.push(findInAthletes);
                    }
                  }
                } else {
                  if (!findInAthletes.name) {
                    var cloneObj = Object.assign({}, findInAthletes);
                    cloneObj.name =
                      cloneObj.nameFirst + " " + cloneObj.nameLast;
                    mRecipient.push(cloneObj);
                  } else {
                    mRecipient.push(findInAthletes);
                  }
                }
              } else {
                const findInCoaches = _.find(
                  this.state.coaches,
                  pe => pe.id == selectedItem.userId
                );

                if (findInCoaches) {
                  if (mRecipient.length > 0) {
                    const findInRecipient = _.find(
                      mRecipient,
                      pe.id == findInCoaches.id ||
                        pe.userId === findInCoaches.id
                    );

                    if (findInRecipient) {
                      continue;
                    } else {
                      if (!findInCoaches.name) {
                        var cloneObj = Object.assign({}, findInCoaches);
                        cloneObj.name =
                          cloneObj.nameFirst + " " + cloneObj.nameLast;
                        mRecipient.push(cloneObj);
                      } else {
                        mRecipient.push(findInCoaches);
                      }
                    }
                  } else {
                    if (!findInCoaches.name) {
                      var cloneObj = Object.assign({}, findInCoaches);
                      cloneObj.name =
                        cloneObj.nameFirst + " " + cloneObj.nameLast;
                      mRecipient.push(cloneObj);
                    } else {
                      mRecipient.push(findInCoaches);
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    mResultMessage.recipients = mRecipient;

    return mResultMessage;
  }

  handleScheduleMessage = async (messageData, sendToId, sendToType) => {
    const { currentUser } = this.state;

    // return Alert.alert(this.state.messageType)

    var data = {
      isSent: "false",
      sendTo: sendToId,
      sendToType: sendToType,
      externalUrl: this.state.externalUrl == "" ? null : this.state.externalUrl,
      createdBy: currentUser.user.id,
      message: this.state.message,
      type: this.state.messageType,
      parentId: this.state.currentTeam.id,
      createdAt: new Date().getTime(),
      activityId: this.state.activityId == "" ? null : this.state.activityId,
      activationTime: new Date(this.state.sendWhenTime).getTime(),
      parentType: "team",
      domain: Constants.manifest.slug
    };

    console.log("Schedule Message", data);

    if(this.state.id != null) {
        data.id = this.state.id;
    }

    return API.post("scheduledMessages", "/scheduled", {
      body: data
    });
  };

  handleNotificationSend(userId, includeGuardians, onlyGuardians) {
    const { currentTeam } = this.state;

    return API.post("messages", `/messages/pushNotification`, {
      body: {
        userId: userId,
        organizationId: null,
        sendingBySport: null,
        teamId: currentTeam.id,
        message: this.state.message,
        externalUrl: this.state.externalUrl,
        sendingByUser: "Single User",
        onlyGuardians: onlyGuardians,
        activityId: this.state.activityId == "" ? null : this.state.activityId,
        includeGuardians: includeGuardians,
        sendingFrom:
          currentTeam.sport == "Softball" ? "One Softball" : "MaxOne",
        title:
          this.state.isOwner == true
            ? `Message from ${currentTeam.name}`
            : "Message from your coach"
      }
    });
  }
  async saveMessage(programId, messageData, send = false) {
    let reqBody = { message: messageData };

    messageData.parentId = programId;

    if (send) {
      var result = this.buildMessage(messageData);
      result.currentTeam = this.state.currentTeam;
      if (
        messageData.messageType == "Push Notification" ||
        messageData.messageType == "notification"
      ) {
        let onlyGuardians = this.state.recipientType.toLowerCase() == "parent";
        let includeGuardians = this.state.recipientType.toLowerCase() == "both";
        await Promise.all(
          result.recipients.map(async chip => {
            let sentPushNotification = null;
            if (chip && chip.id)
              sentPushNotification = await this.handleNotificationSend(
                chip.id,
                includeGuardians,
                onlyGuardians
              );
            parentId = this.state.currentTeam.id;
          })
        );

        return { isDraft: false };
      } else {
        if (this.state.sendWhen == "Send Later") {
          await Promise.all(
            result.recipients.map(async chip => {
              let sendToId = chip.id;
              let sendToType = "user";

              if (sendToId)
                scheduledMessage = await this.handleScheduleMessage(
                  result,
                  sendToId,
                  sendToType
                );

                console.log(scheduledMessage);
            })
          );

          return { isDraft: false };
        } else {
          if (messageData.messageType.toLowerCase() == "email") {
              console.log("Message result============>", result);
            return API.post("messages", `/messages/email`, { body: result });
          } else {
            return API.post("messages", `/messages/sms`, { body: result });
          }
        }
      }
    } else {
      if (this.state.id != null) {
        messageData.id = this.state.id;
        return API.post("messages", `/messages/draft`, { body: messageData });
      } else {
        return API.post("messages", `/messages/draft`, { body: messageData });
      }
    }
  }

  _showDateTimePicker = () => {
    const { isFromSchedule } = this.state;

    if (isFromSchedule) {
      return;
    }

    this.setState({ isDateTimePickerVisible: true });
  };

  _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });
  _showActivityPicker = () => {
    if (this.activityPicker == null || this.activityPicker == undefined) return;
    this.activityPicker.show();
  };
  onRecipientsModalDone = (recipients, removedRecipients) => {
    this.setState({
      recipients: recipients,
      removedRecipients,
      showRecipientsDialog: false
    });

    var receiptArray = [];

    if (recipients && recipients) {
      for (var i = 0; i < recipients.length; i++) {
        var item = {};

        item["id"] = recipients[i].id;
        item["label"] = recipients[i].name
          ? recipients[i].name
          : recipients[i].nameFirst + " " + recipients[i].nameLast;

        receiptArray.push(item);
      }
    }

    this.setState({ receiptArray: receiptArray });
  };
  _onChangeMessage = value => {
    this.setState({ message: value });
  };

  _onChangeExternalURL = value => {
    this.setState({ externalUrl: value });
  };

  _onChangeSendWhen = value => {
    const { isFromSchedule } = this.state;

    if (isFromSchedule) {
      return;
    }

    this.setState({ sendWhen: value });
  };

  _onChangeActivity = value => {
    this.setState({ activityId: value });
  };

  _showDeliveryPicker = () => {
    if (this.deliveryPicker == null || this.deliveryPicker == undefined) return;

    this.deliveryPicker.show();
  };

  _showShowWhenPicker = () => {
    if (this.send_when == null || this.send_when == undefined) return;

    const { isFromSchedule } = this.state;

    if (isFromSchedule) {
      return;
    }

    this.send_when.show();
  };

  _showReceiptTypePicker = () => {
    if (this.receiptTypePicker == null || this.receiptTypePicker == undefined)
      return;

    this.receiptTypePicker.show();
  };

  _showRosterPicker = () => {
    if (this.rosterPicker == null || this.rosterPicker == undefined) return;

    this.rosterPicker.show();
  };

  _onChangeDelivery = value => {
    if (!this.mount) return false;

    if (value == this.state.messageType) {
      return;
    }

    this.setState({ messageType: value });
  };

  _onChangeReceiptType = value => {
    if (!this.mount) return false;

    if (value == this.state.recipientType) {
      return;
    }

    this.setState({ recipientType: value });
  };

  _onChangeRosterType = value => {
    if (!this.mount) return false;

    if (value == this.state.selectedRoster) {
      return;
    }
    this.setState({ selectedRoster: value });
  };

  _onClickDiscard = () => {
    var { onDiscard } = this.props;

    onDiscard();

    this.setState({
      recipientType: "Athletes",
      messageType: "sms",
      recipients: [],
      message: "",
      receiptArray: [],
      sendWhen: "Send Now",
      externalUrl: "",
      activityId: 0,
      isFromSchedule: false,
      id: null
    });
  };

  _handleDatePicked = dateTime => {
    this._hideDateTimePicker();
    this.setState({
      sendWhenTime: dateTime
    });
  };
  render() {
    const { message } = this.state;
    const selectedActivity = _.find(
      this.state.activities,
      r => r.id == this.state.activityId
    );

    var selectedActivityText = "";
    if (selectedActivity) {
      selectedActivityText = selectedActivity.name;
    }

    var typeIndex = _.findIndex(
      DELIVERY_VALUE,
      pe =>
        pe == (this.state.messageType == "" ? "sms" : this.state.messageType)
    );

    var messageType = DELIVERY_LIST[typeIndex];

    var bShowableDraft = true;

    if (this.state.messageType == "notification") {
      bShowableDraft = false;
    }

    if (this.state.isFromSchedule == true) {
      bShowableDraft = false;
    }

    return (
      <SafeAreaView
        style={[CommonStyles.container, { backgroundColor: "#F5F5F5" }]}
      >
        <StatusBar barStyle="light-content" translucent={false} />
        <KeyboardAvoidingView

          behavior={Platform.OS == "android" ? undefined : "position"}
          style={[
            CommonStyles.container,
            {
              flexDirection: "column",
              width: "100%",
              flex: 1
            }
          ]}
          enabled
          keyboardVerticalOffset={0}
        >
          <ScrollView style={{ paddingLeft: 17, paddingRight: 17 }}>
            <View>
              <View style={[styles.full_width, { marginTop: 15 }]}>

                <TouchableOpacity
                  style={[styles.full_width, styles.growableInputContainer]}
                  onPress={this.open_modal}
                  activeOpacity={0}
                >
                  <Text style={{ color: "#454545" }}>{this.state.recipients.length ? "Recipients" : "Add Recipients +"}</Text>
                  <View
                    style={[
                      styles.full_width,
                      { marginTop: this.state.recipients.length > 0 ? 5 : 0 },
                      styles.growableInputContainer
                    ]}
                  >
                    <TagSelect
                      data={this.state.receiptArray}
                      itemStyle={styles.item}
                      itemLabelStyle={styles.label}
                      itemStyleSelected={styles.itemSelected}
                      itemLabelStyleSelected={styles.labelSelected}
                    />
                  </View>
                </TouchableOpacity>
                <View style={{ marginTop: 5 }}>
                  <Spacer />
                </View>
              </View>
              <View
                style={[
                  styles.full_width,
                  { marginTop: 15, flexDirection: "row" }
                ]}
              >
                <View style={{ width: "50%", paddingRight: 5 }}>
                  <View>
                    <Text style={{ color: "#454545" }}>Delivery</Text>
                  </View>
                  <View>
                    <View>
                      <TouchableOpacity
                        style={[
                          CommonStyles.customInputField,
                          CommonStyles.customInputPicker,
                          CommonStyles.customInputFieldRow
                        ]}
                        onPress={this._showDeliveryPicker}
                      >
                        <Text
                          style={[
                            CommonStyles.customInputFieldVerticalCenter,
                            CommonStyles.customInputFieldRightDown
                          ]}
                          ellipsizeMode={"tail"}
                          numberOfLines={1}
                        >
                          {messageType}
                        </Text>

                        <Image
                          source={imgDownArrow}
                          style={CommonStyles.customInputFieldDropDown}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                      <Spacer />
                    </View>
                  </View>
                </View>
                <View style={{ width: "50%", paddingLeft: 5 }}>
                  <View>
                    <Text style={{ color: "#454545" }}>Recipient Type</Text>
                  </View>
                  <View>
                    <View>
                      <TouchableOpacity
                        style={[
                          CommonStyles.customInputField,
                          CommonStyles.customInputPicker,
                          CommonStyles.customInputFieldRow
                        ]}
                        onPress={this._showReceiptTypePicker}
                      >
                        <Text
                          style={[
                            CommonStyles.customInputFieldVerticalCenter,
                            CommonStyles.customInputFieldRightDown
                          ]}
                        >
                          {this.state.recipientType}
                        </Text>

                        <Image
                          source={imgDownArrow}
                          style={CommonStyles.customInputFieldDropDown}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                      <Spacer />
                    </View>
                  </View>
                </View>
              </View>

              <View
                style={[
                  styles.full_width,
                  { marginTop: 15, flexDirection: "row" }
                ]}
              >
                <View style={{ width: "50%", paddingRight: 5 }}>
                  <View>
                    <Text style={{ color: "#454545" }}>{"When"}</Text>
                  </View>
                  <View>
                    <View>
                      <TouchableOpacity
                        style={[
                          CommonStyles.customInputField,
                          CommonStyles.customInputPicker,
                          CommonStyles.customInputFieldRow
                        ]}
                        onPress={this._showShowWhenPicker}
                      >
                        <Text
                          style={[
                            CommonStyles.customInputFieldVerticalCenter,
                            CommonStyles.customInputFieldRightDown
                          ]}
                          ellipsizeMode={"tail"}
                          numberOfLines={1}
                        >
                          {this.state.sendWhen}
                        </Text>

                        <Image
                          source={imgDownArrow}
                          style={CommonStyles.customInputFieldDropDown}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                      <Spacer />
                    </View>
                  </View>
                </View>
                {this.state.sendWhen === "Send Later" && (
                  <View style={{ width: "50%", paddingLeft: 5 }}>
                    <View>
                      <Text style={{ color: "#454545" }}>{"Time"}</Text>
                    </View>
                    <View>
                      <View>
                        <TouchableOpacity
                          style={[
                            CommonStyles.customInputField,
                            CommonStyles.customInputPicker,
                            CommonStyles.customInputFieldRow
                          ]}
                          onPress={this._showDateTimePicker}
                        >
                          <Text
                            style={[
                              CommonStyles.customInputFieldVerticalCenter,
                              CommonStyles.customInputFieldRightDown
                            ]}
                          >
                            {moment(this.state.sendWhenTime).format(
                              "MM/DD/YYYY h:mm a"
                            )}
                          </Text>

                          <Image
                            source={imgDownArrow}
                            style={CommonStyles.customInputFieldDropDown}
                            resizeMode="contain"
                          />
                        </TouchableOpacity>
                        <Spacer />
                      </View>
                    </View>
                  </View>
                )}
              </View>
              <View style={[styles.full_width, { marginTop: 5 }]}>
                <CustomFloatingLabel
                  labelStyle={styles.labelInput}
                  inputStyle={styles.input}
                  style={styles.formInput}
                  value={message}
                  maxLength={
                    this.state.messageType.toLowerCase() == "text" ||
                    this.state.messageType.toLowerCase() == "sms"
                      ? 340
                      : 9999999999999
                  }
                  onChangeText={msg => this._onChangeMessage(msg)}
                  multiline
                >
                  {"Message"}
                </CustomFloatingLabel>
                {this.state.messageType === "sms" && (
                  <Text style={{ color: AppColors.text.dark, fontSize: 10 }}>
                    {"340 character limit"}
                  </Text>
                )}
              </View>
              {this.state.messageType === "notification" && (
                <View style={[styles.full_width, { marginTop: 15 }]}>
                  <CustomFloatingLabel
                    labelStyle={styles.labelInput}
                    inputStyle={styles.input}
                    style={styles.formInput}
                    value={this.state.externalUrl}
                    onChangeText={msg => this._onChangeExternalURL(msg)}
                  >
                    {"External Url"}
                  </CustomFloatingLabel>
                  <Text style={{ color: AppColors.text.dark, fontSize: 10 }}>
                    {"including 'http://' or 'https://'"}
                  </Text>
                </View>
              )}
              {this.state.messageType === "notification" && (
                <View style={{ width: "100%", marginTop: 15 }}>
                  <View>
                    <Text style={{ color: "#454545" }}>{"Link Activity"}</Text>
                  </View>
                  <View>
                    <View>
                      <TouchableOpacity
                        style={[
                          CommonStyles.customInputField,
                          CommonStyles.customInputPicker,
                          CommonStyles.customInputFieldRow
                        ]}
                        onPress={this._showActivityPicker}
                      >
                        <Text
                          style={[
                            CommonStyles.customInputFieldVerticalCenter,
                            CommonStyles.customInputFieldRightDown
                          ]}
                        >
                          {selectedActivityText}
                        </Text>

                        <Image
                          source={imgDownArrow}
                          style={CommonStyles.customInputFieldDropDown}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                      <Spacer />
                    </View>
                  </View>
                </View>
              )}
            </View>

            <View
              style={{
                width: SCREEN_WIDTH - 34
              }}
            >

              <View style={{width: SCREEN_WIDTH - 34, alignItems:"center"}}>
                <PolygonButton title={ "Send" } customColor={AppColors.brand.gamma}
                            textColor={"#000"} onPress={() => this.onPressSend()}/>
              </View>
              {bShowableDraft && (

                <View style={{width: SCREEN_WIDTH - 34, alignItems:"center"}}>
                <PolygonButton title={ "Save Draft" } customColor={"#DFDFDF"}
                            textColor={"#000"} onPress={() => this.onPressSaveDraft()}/>
              </View>
              )}
              <View style={{width: SCREEN_WIDTH - 34, alignItems:"center"}}>
                <PolygonButton title={ "Cancel" } customColor={"white"}
                            textColor={"#000"} onPress={() => this._onClickDiscard()}/>
              </View>

            </View>

          </ScrollView>

        </KeyboardAvoidingView>
        <View style={pickerSelectStyles.remind_picker_container}>
          <SimplePicker
            options={DELIVERY_VALUE}
            labels={DELIVERY_LIST}
            ref={picker => (this.deliveryPicker = picker)}
            onSubmit={this._onChangeDelivery}
            style={pickerSelectStyles.remind_picker}
            selectedValue={this.state.messageType}
            initialOptionIndex={_.findIndex(DELIVERY_VALUE, pe=> pe == this.state.messageType)}
            cancelText={"Cancel"}
            confirmText={"Done"}
          />
          <SimplePicker
            options={RECEIPT_TYPE_LIST}
            labels={RECEIPT_TYPE_LIST}
            ref={picker => (this.receiptTypePicker = picker)}
            onSubmit={this._onChangeReceiptType}
            style={pickerSelectStyles.remind_picker}
            selectedValue={this.state.recipientType}
            initialOptionIndex={_.findIndex(RECEIPT_TYPE_LIST, pe=> pe == this.state.recipientType)}
            cancelText={"Cancel"}
            confirmText={"Done"}
          />
          <SimplePicker
            options={SEND_WHEN}
            labels={SEND_WHEN}
            ref={picker => (this.send_when = picker)}
            onSubmit={this._onChangeSendWhen}
            style={pickerSelectStyles.remind_picker}
            selectedValue={this.state.sendWhen}
            initialOptionIndex={_.findIndex(SEND_WHEN, pe=> pe == this.state.sendWhen)}
            cancelText={"Cancel"}
            confirmText={"Done"}
          />

          <SimplePicker
            options={_.uniq(_.map(this.state.activities, r => r.id))}
            labels={_.uniq(_.map(this.state.activities, r => r.name))}
            ref={picker => (this.activityPicker = picker)}
            onSubmit={this._onChangeActivity}
            style={pickerSelectStyles.remind_picker}
            selectedValue={this.state.activityId}
            initialOptionIndex={_.findIndex(_.uniq(_.map(this.state.activities, r => r.id)), pe=> pe == this.state.activityId)}
            cancelText={"Cancel"}
            confirmText={"Done"}

          />
        </View>
        <DateTimePicker
          isVisible={this.state.isDateTimePickerVisible}
          onConfirm={this._handleDatePicked}
          onCancel={this._hideDateTimePicker}
          mode={"datetime"}
          date={this.state.sendWhenTime}
        />
        <RecipientsDialog
          show_menu={this.state.showRecipientsDialog}
          onClose={() => this._onPressClose(false)}
          deliveryType={this.state.messageType}
          messageRecipients={this.state.recipients ? this.state.recipients : []}
          onCancel={this.onRecipientsModalCancel}
          onDone={this.onRecipientsModalDone}
          athletes={this.state.athletes}
          coaches={this.state.coaches}
          entityGroups={this.state.entityGroups}
          events={this.state.events}
          team={this.state.currentTeam}
        />
      </SafeAreaView>
    );
  }
}
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
    width: AppSize.screen.width / 2
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
  container: {
    flex: 1,
    backgroundColor: "#FFF"
  },
  item: {
    borderColor: "#DFDFDF",
    backgroundColor: "#DFDFDF",
    borderRadius: 10,
    height: 25,
    fontSize: 15,
    borderWidth: 0
  },
  label: {
    color: "#000000",
    fontSize: 12
  },
  itemSelected: {
    backgroundColor: "#DFDFDF",
    borderWidth: 0
  },
  labelSelected: {
    color: "#000000"
  },
  paddingContainer: {
    width: "100%",
    paddingLeft: 17,
    paddingRight: 17,
    flex: 1
  },
  full_width: {
    width: "100%"
  },
  buttonGroupContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    height: 40
  },
  menu_modal_position: {
    justifyContent: "flex-end",
    width: "100%",
    // paddingHorizontal: 0,
    marginHorizontal: 0,
    marginVertical: 0
  },
  menu_modal_dialog: {
    backgroundColor: "white",
    width: "100%",
    paddingBottom: 25
  },
  menu_modal_dialog_header: {
    width: "100%",
    height: 70,

    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "white"
  },
  menu_modal_dialog_header_text: {
    fontWeight: "bold",
    fontSize: 20,
    backgroundColor: "white"
  },
  menu_modal_dialog_item: {
    width: "100%",
    height: 50,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white"
  },
  menu_modal_dialog_item_text: {
    fontSize: 16
  },
  main_container: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1
  },

  modalTitleContainer: {
    width: "100%",
    flexDirection: "row",
    height: "100%",
    justifyContent: "center",
    alignItems: "center"
  },
  modalCloseContainer: {
    width: "15%",
    position: "absolute",
    right: 0,
    height: "100%",
    justifyContent: "center",
    alignItems: "center"
  },
  colorClose: {
    position: "absolute",
    right: 5,
    width: 15,
    height: 15
  },
  newScheduleCustomItem: {
    width: "100%",
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 10,
    paddingBottom: 5,
    flexDirection: "row",
    justifyContent: "space-around"
  },
  avatar_img: {
    width: 28,
    height: 28,
    backgroundColor: "white",
    borderRadius: 14
  },
  user_name: {
    marginLeft: 9
  },
  checkBoxImage: {
    width: 17,
    height: 17
  },

  general_text: {
    fontSize: 14
  },
  group_title_container: {
    flexDirection: "row",
    height: 44,
    backgroundColor: "#E9E9E9",
    justifyContent: "space-between",
    alignItems: "center"
  },
  group_child_container: {
    flexDirection: "row",
    width: "100%",
    height: 60,
    alignItems: "center",
    justifyContent: "space-between"
  },
  avatar_container: {
    flexDirection: "row",
    alignItems: "center",
    height: 60
  },
  padding_container: {
    paddingLeft: 20,
    paddingRight: 20
  },
  recipientsButton: {
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 2,
    minHeight: 50,
    position: "relative",
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap"
  },
  growableInputContainer: {
    backgroundColor: "transparent",
    minHeight: 0,

    marginBottom: 0
  },
  labelInput: {
    color: "#454545",
    fontSize: 15
  },
  formInput: {
    borderBottomWidth: 1,
    borderColor: "#4e4d52",
    fontSize: 15
  },
  input: {
    borderWidth: 0,
    fontSize: 15,
    paddingVertical: 0,
    minHeight: 30
  }
});
