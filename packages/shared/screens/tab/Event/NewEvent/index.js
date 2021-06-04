import React from "react";
import PropTypes from "prop-types";
import {
  Alert,
  SafeAreaView,
  Text,
  TouchableOpacity,
  Keyboard,
  View,
  ScrollView,
  StyleSheet,
  AsyncStorage
} from "react-native";
import { API } from "aws-amplify";
import _ from "lodash";
import moment from "moment";
import { AppColors } from "@assets/theme";
import CustomInput from "@m1/shared/components/Input";
import CommonStyles from "@m1/shared/theme/styles";
import CustomFloatingLabel from "@m1/shared/components/CustomFloatingLabel";
import PolygonButton from "@m1/shared/components/PolygonButton";
const INPUT_CALENDAR_NAME = 1;
const INPUT_EVENT_TITLE = 2;
const INPUT_START_DATE = 3;
const INPUT_END_DATE = 4;
const INPUT_START_TIME = 5;
const INPUT_END_TIME = 6;
const INPUT_LOCATION = 7;
const INPUT_DESCRIPTION = 8;
const INPUT_REMINDER = 9;

const INPUT_GAP = 20;

const REMINDER_LIST = [
  "60 minutes before",
  "30 minutes before",
  "15 minutes before",
  "10 minutes before",
  "5 minutes before",
  "no remind"
];
const REMINDER_VALUE = [60, 30, 15, 10, 5, 0];

class NewEventScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: (
      <View
        style={{
          width: "100%",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Text style={{ color: AppColors.text.white }}>
          {navigation.state.params.edit == true ? "Edit Event" : "New Event"}
        </Text>
      </View>
    ),
    headerTitleStyle: { flex: 1, textAlign: "center" }
  });

  constructor(props) {
    super(props);

    const { navigation } = this.props;

    const edit = navigation.getParam("edit", false);
    const event = navigation.getParam("event", false);
    var schedules = navigation.getParam("schedules");
    const date = navigation.getParam(
      "date",
      moment(new Date()).format("YYYY-MM-DD")
    );

    const currentScheduleID = navigation.getParam("currentScheduleID", 0);

    if (event && edit) {
      var calendar = _.find(schedules, pe => pe.id == event.scheduleId);

      var calendar_name = calendar.name;

      console.log("calendar_name", calendar_name);

      var reminderName = "no remind";

      if (event.reminderTime) {
        var reminderIndex = _.findIndex(
          REMINDER_VALUE,
          pe => pe == event.reminderTime
        );

        var reminderName =
          reminderIndex > -1 ? REMINDER_LIST[reminderIndex] : "";
      }

      console.log("reminderName", reminderName);

      let startDate = new Date(event.startDate);
      var endDate = new Date(event.endDate);

      console.log("Event", startDate);
      this.state = {
        calendar_name: calendar_name,
        calendar_id: event.scheduleId,
        event_id: event.id,
        event_title: event.title,
        start_date: startDate,
        end_date: endDate,
        start_time: startDate,
        end_time: endDate,
        location: event.location,
        description: event.description,
        reminder: reminderName,

        schedules,
        edit: edit,
        appContext: {}
      };
    } else {
      let startDate = new Date(date);
      var endDate = new Date(date);

      var endTime = new Date(date);
      endTime.setHours(endTime.getHours() + 1);


      if (currentScheduleID != 0) {
        var calendar = _.find(schedules, pe => pe.id == currentScheduleID);
      }

      console.log("Start Date", startDate);
      console.log('schedules ', schedules)
      this.state = {
        calendar_name: calendar ? calendar.name: undefined,
        calendar_id: calendar ? calendar.id: 0,
        event_id: event.id,
        event_title: null,
        start_date: moment(date).toDate(),
        end_date: moment(date)
          .add(1, "hours")
          .toDate(),
        start_time: moment(date).toDate(),
        end_time: moment(date)
          .add(1, "hours")
          .toDate(),
        location: null,
        description: null,
        reminder: "no remind",
        schedules,
        edit: edit,
        appContext: {}
      };
    }

    this.mount = true;
  }

  componentDidMount = async () => {
    const appContextString = await AsyncStorage.getItem("@M1:appContext");

    const appContext = JSON.parse(appContextString);
    console.log('APP CONTESXT ==== ', appContext)
    this.setState({ appContext });
    var filteredSchedules = [];
    await this.asyncForEach(this.state.schedules, schedule =>{
      if(!schedule.isReadOnly){
        filteredSchedules.push(schedule)
      }
    })
    this.setState({schedules: filteredSchedules})
  };

  componentWillUnmount() {
    this.mount = false;
  }

  componentWillReceiveProps(props) {
    if (!this.mount) return;
  }

  _onChangeInputValue = (value, key) => {
    if (!this.mount) return false;

    // if(JSON.stringify(this.state.appContext) == JSON.stringify({}) )
    //     return;
    // if (this.state.appContext.isAthlete == true) return;
    // console.log("this.state.appContext.isAthlete", this.state.appContext)

    // console.log(value);
    switch (key) {
      case INPUT_CALENDAR_NAME:
        console.log("calendar_id", value);
        this.setState({ calendar_id: value });

        var calendarItem = _.find(this.state.schedules, pe => pe.id == value);

        if (calendarItem) {
          console.log("Name", calendarItem.name);
          this.setState({ calendar_name: calendarItem.name });
        }

        break;
      case INPUT_EVENT_TITLE:
        this.setState({ event_title: value });
        break;
      case INPUT_START_DATE:
        var startTime = new Date(value);

        startTime.setHours(this.state.start_time.getHours());
        startTime.setMinutes(this.state.start_time.getMinutes());

        console.log("startTime", startTime);

        var endTime = new Date(startTime.getTime());
        endTime.setHours(endTime.getHours() + 1);
        console.log(endTime);

        this.setState({ end_date: endTime, end_time: endTime });
        this.setState({ start_date: value });
        break;
      case INPUT_END_DATE:
        if (value >= this.state.start_date) {
          this.setState({ end_date: value });
        } else {
          this.setState({ end_date: value });
        }
        break;
      case INPUT_START_TIME:
        var startTime = new Date(this.state.start_date);

        startTime.setHours(value.getHours());
        startTime.setMinutes(value.getMinutes());

        console.log("startTime", startTime);

        this.setState({ start_time: value });

        var endTime = new Date(startTime.getTime());
        endTime.setHours(endTime.getHours() + 1);
        console.log(endTime);

        this.setState({ end_date: endTime, end_time: endTime });

        break;
      case INPUT_END_TIME:
        var endTime = new Date(this.state.end_date);
        endTime.setTime(value.getTime());
        if (endTime >= this.state.start_time) {
          this.setState({ end_time: endTime });
        } else {
          this.setState({ end_time: endTime });
        }
        break;
      case INPUT_LOCATION:
        this.setState({ location: value });
        break;
      case INPUT_DESCRIPTION:
        this.setState({ description: value });
        break;
      case INPUT_REMINDER:
        this.setState({ reminder: value });
        break;
    }
    return true;
  };

  async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array)
    }
  }

  _saveNewEvent = async () => {
    // TODO: save event

    const {
      calendar_name,
      event_title,
      calendar_id,
      start_date,
      end_date,
      start_time,
      end_time,
      location,
      description,
      reminder,
      event_id,
      edit
    } = this.state;

    var reminderIndex = _.findIndex(REMINDER_LIST, pe => pe == reminder);

    start_date.setHours(start_time.getHours());
    start_date.setMinutes(start_time.getMinutes());
    start_date.setSeconds(0);

    end_date.setHours(end_time.getHours());
    end_date.setMinutes(end_time.getMinutes());
    end_date.setSeconds(0);

    var isAfter = moment(
      moment(end_date)
        .utc()
        .format()
    ).isAfter(
      moment(start_date)
        .utc()
        .format()
    );

    if (isAfter == false) {
      Alert.alert("Please input correct date.");
      return;
    }

    var eventData = {
      endDate: moment(end_date)
        .utc()
        .format(),
      startDate: moment(start_date)
        .utc()
        .format(),
      scheduleId: calendar_id,
      title: event_title,
      location: location,
      description: description,
      reminderTime: REMINDER_VALUE[reminderIndex]
    };

    console.log(eventData);

    Keyboard.dismiss();
     console.log('event_title ', event_title)
    if (calendar_id == 0) {
      Alert.alert("Please choose a calendar.");
      return;
    } else if (!event_title) {
      Alert.alert("Please enter an event title.");
      return;
    } else if (!reminder) {
      Alert.alert("Please set a reminder.");
      return;
    }
    console.log("Edited ID", event_id);
    // update existing
    if (edit) {
      await API.put("schedules", `/scheduleEvents/${event_id}`, {
        body: { id: event_id, ...eventData }
      });
      if (
        this.props.navigation &&
        this.props.navigation.state.params.updateEvent
      ) {
        eventData.id = event_id;
        var selectedSchedule = _.find(
          this.state.schedules,
          pe => pe.id == calendar_id
        );
        eventData.color = selectedSchedule.color;
        eventData.date = moment(eventData.startDate).format("YYYY-MM-DD");
        this.props.navigation.state.params.updateEvent(eventData);

        this.props.navigation.setParams({
          updateEvent: null,
          removeEvent: null
        });
      }

      // back to previous screen
      this.props.navigation.goBack();

      return;
    }

    // create new
    const newEvent = await API.post(
      "schedules",
      `/schedules/${calendar_id}/scheduleEvents`,
      {
        body: eventData
      }
    );
    // return newEvent;

    console.log(newEvent);

    if (this.props.navigation && this.props.navigation.state.params.addEvent) {
      var selectedSchedule = _.find(
        this.state.schedules,
        pe => pe.id == calendar_id
      );
      newEvent.color = selectedSchedule.color;
      newEvent.date = moment(newEvent.startDate).format("YYYY-MM-DD");

      this.props.navigation.state.params.addEvent(newEvent);

      this.props.navigation.setParams({
        addEvent: null
      });
    }

    // back to previous screen
    this.props.navigation.goBack();
  };

  _removeNewEvent = async () => {
    // TODO: remove event

    // back to previous screen

    let params = this.props.navigation.state.params;

    await API.del("schedules", `/scheduleEvents/${this.state.event_id}`);

    if (params && params.removeEvent) {
      params.removeEvent(this.state.event_id);

      this.props.navigation.setParams({
        updateEvent: null,
        removeEvent: null
      });
    }

    this.props.navigation.goBack();
  };

  render() {
    let { start_date, end_date, start_time, end_time } = this.state;
    let { bEdit } = this.props;

    var labels = this.state.schedules.map(item => item.name);

    labels = labels.slice(1);
    var ids = this.state.schedules.map(item => item.id);
    ids = ids.slice(1);
    console.log(labels, ids);

    return (
      <SafeAreaView>
        <ScrollView>
          <View style={CommonStyles.newEventDialog}>
            <View style={CommonStyles.newEventRow}>
              <CustomInput
                placeholder="Calendar Name*"
                onChangeValue={text =>
                  this._onChangeInputValue(text, INPUT_CALENDAR_NAME)
                }
                editable={this.state.appContext.isAthlete == false}
                bRightDropDown={true}
                type="picker"
                defaultValue={this.state.calendar_name}
                labels={labels}
                items={ids}
              />
            </View>
            <View
              style={[
                CommonStyles.newEventRow,
                { paddingLeft: 5, paddingRight: 5 }
              ]}
            >
              <CustomFloatingLabel
                autoCapitalize={"none"}
                autoCorrect={false}
                labelStyle={styles.labelInput}
                inputStyle={styles.input}
                style={styles.formInput}
                value={this.state.event_title}
                editable={this.state.appContext.isCoach}
                onChangeText={text => {
                  console.log(text);
                  this._onChangeInputValue(text, INPUT_EVENT_TITLE);
                }}
              >
                {"Event Title*"}
              </CustomFloatingLabel>
            </View>
            <View style={CommonStyles.newEventRow}>
              <CustomInput
                placeholder="Start Date*"
                bRightBorder={false}
                type="date"
                bRightDropDown={true}
                containerStyle={CommonStyles.padding_right_5}
                defaultValue={start_date}
                editable={this.state.appContext.isCoach}
                onChangeValue={value =>
                  this._onChangeInputValue(value, INPUT_START_DATE)
                }
              />
              <CustomInput
                placeholder="End Date*"
                type="date"
                bRightDropDown={true}
                containerStyle={CommonStyles.padding_left_5}
                defaultValue={end_date}
                editable={this.state.appContext.isCoach}
                onChangeValue={value =>
                  this._onChangeInputValue(value, INPUT_END_DATE)
                }
              />
            </View>
            <View style={CommonStyles.newEventRow}>
              <CustomInput
                placeholder="Start Time*"
                type="time"
                bRightDropDown={true}
                containerStyle={CommonStyles.padding_right_5}
                bRightBorder={false}
                editable={this.state.appContext.isCoach}
                defaultValue={start_time}
                onChangeValue={value =>
                  this._onChangeInputValue(value, INPUT_START_TIME)
                }
              />
              <CustomInput
                placeholder="End Time*"
                type="time"
                bRightDropDown={true}
                containerStyle={CommonStyles.padding_left_5}
                defaultValue={end_time}
                editable={this.state.appContext.isCoach}
                onChangeValue={value =>
                  this._onChangeInputValue(value, INPUT_END_TIME)
                }
              />
            </View>
            <View
              style={[
                CommonStyles.newEventRow,
                { paddingLeft: 5, paddingRight: 5 }
              ]}
            >
              <CustomFloatingLabel
                autoCapitalize={"none"}
                autoCorrect={false}
                labelStyle={styles.labelInput}
                inputStyle={styles.input}
                style={styles.formInput}
                editable={this.state.appContext.isCoach}
                value={this.state.location}
                onChangeText={text =>
                  this._onChangeInputValue(text, INPUT_LOCATION)
                }
              >
                {"Location(optional)"}
              </CustomFloatingLabel>
            </View>
            <View
              style={[
                CommonStyles.newEventRow,
                { paddingLeft: 5, paddingRight: 5 }
              ]}
            >
              <CustomFloatingLabel
                autoCapitalize={"none"}
                autoCorrect={false}
                labelStyle={styles.labelInput}
                inputStyle={styles.input}
                style={styles.formInput}
                editable={this.state.appContext.isCoach}
                value={this.state.description}
                onChangeText={text =>
                  this._onChangeInputValue(text, INPUT_DESCRIPTION)
                }
              >
                {"Description(optional)"}
              </CustomFloatingLabel>
            </View>
            <View style={CommonStyles.newEventRow}>
              <CustomInput
                placeholder="Reminder*"
                onChangeValue={text =>
                  this._onChangeInputValue(text, INPUT_REMINDER)
                }
                bRightDropDown={true}
                defaultValue={this.state.reminder}
                editable={this.state.appContext.isCoach}
                type="picker"
                labels={REMINDER_LIST}
                items={REMINDER_LIST}
              />
            </View>
            {(this.state.appContext.isCoach) && (
              <PolygonButton
                title={"Save"}
                customColor={AppColors.button.background}
                textColor={AppColors.button.text}
                onPress={() => this._saveNewEvent()}
              />
            )}

            {(this.state.appContext.isCoach) && (
              <TouchableOpacity
                onPress={this._removeNewEvent}
                style={[
                  CommonStyles.dialogRemoveBottomButon,
                  CommonStyles.commonRowCenter,
                  { paddingBottom: 10, height: 50 }
                ]}
              >
                {this.state.edit && (
                  <Text style={CommonStyles.dialogRemoveButtonTitle}>
                    {"REMOVE EVENT"}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

export default NewEventScreen;

let style = {
  labelInput: {
    color: AppColors.text.dark,
    marginLeft: 0,
    paddingLeft: 0,
    fontSize: 14
  },
  formInput: {
    borderBottomWidth: 1,
    borderColor: AppColors.text.dark,
    width: "100%",
    paddingLeft: 5,
    paddingRight: 5
  },
  input: {
    borderWidth: 0,
    fontSize: 14,
    paddingVertical: 0,
    height: 30,
    marginLeft: 0,
    paddingLeft: 0
  },
  dialogButtonTitle: {
    color: "white",
    fontWeight: "bold"
  }
};

const styles = StyleSheet.create(style);

NewEventScreen.propTypes = {
  date: PropTypes.object,
  edit: PropTypes.bool,
  eventInfo: PropTypes.any
};

NewEventScreen.defaultProps = {
  date: new Date(),
  edit: false,
  eventInfo: null
};
