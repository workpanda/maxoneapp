import React from "react";
import { Text, View, Platform } from "react-native";
import { Calendar } from "react-native-calendars";
import { StyleSheet } from "react-native";
import moment from "moment";

import AppColors from "@assets/theme/colors";
import CommonStyles from "@m1/shared/theme/styles";
import CommonColors from "@m1/shared/theme/colors";
import { getStatusBarHeight } from 'react-native-status-bar-height'
// set default selection date as today
function getTodayString() {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth()).padStart(2, "0"); //January is 0!
  var yyyy = today.getFullYear();
  var strToday = yyyy + "-" + mm + "-" + dd;
  return strToday;
}

class CustomCalendar extends React.Component {
  constructor(props) {
    super(props);

    const strToday = moment().format("YYYY-MM-DD");
    this.state = {
      selectedDate: strToday,
      loading:true
    };
    this.mount = true;
  }

  componentWillUnmount() {
    this.mount = false;
  }

  _onDayPressed = day => {
    if (!this.mount) return;

    console.log(day);

    let strSelectedDate = moment(day.dateString).format("YYYY-MM-DD");
    this.setState({
      selectedDate: strSelectedDate
    });

    // callback processing
    let { dayPressCallback } = this.props;
    if (dayPressCallback) {
      dayPressCallback(day);
    }
  };

  _onMonthChange = async month => {
    this.setState({loading:true})

    
    await this.props.onMonthChanged(month);
    this.setState({loading:false})
    };

  render() {
    let { selectedDate } = this.state;

    // console.log(selectedDate, this.props.eventsKey);
    return (
      <View style={{marginTop: Platform.OS === 'ios' ?  40 : 40 + getStatusBarHeight()}}>
        <Calendar
          theme={calendarTheme}
          onDayPress={this._onDayPressed}
          onDayLongPress={this._onDayPressed}
          onMonthChange={this._onMonthChange}
          monthFormat={"MMMM"}
          markedDates={{
            ...this.props.eventsKey,
            [selectedDate]: {
              marked: this.props.eventsKey[selectedDate] ? true : false,
              selected: true,
              disableTouchEvent: true,
              selectedColor: CommonColors.calendarSelectedDayColor,
              dotColor: "#fff"
            }
          }}
        />
      </View>
    );
  }
}

export default CustomCalendar;

const calendarTheme = {
  backgroundColor: AppColors.app.dark,
  calendarBackground: AppColors.app.dark,
  monthTextColor: "white",
  arrowColor: "gray",
  dayTextColor: "white",
  textDisabledColor: "gray",
  dotColor: "#fff",
  selectedDayTextColor: AppColors.button.text,
  selectedDotColor: AppColors.button.text,
  arrowLeft: {
    position: "relative",
    top: 0,
    left: 0
  },
  arrowRight: {
    position: "relative",
    top: 0,
    right: 0
  }
};
