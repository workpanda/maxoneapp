import React, { PureComponent, Fragment } from "react";
import PropTypes from "prop-types";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TouchableHighlight,
  ScrollView
} from "react-native";

import Spacer from "@m1/shared/components/Spacer";
import CommonStyles from "@m1/shared/theme/styles";
import CommonColors from "@m1/shared/theme/colors";
import CommonSizes from "@m1/shared/theme/sizes";

const imgDownArrow = require("@m1/shared/assets/down_arrow.png");

import EventContext from "@m1/shared/screens/tab/Event/event-context";

import { getStatusBarHeight } from "react-native-status-bar-height";
import { Feather } from "@expo/vector-icons";
class CalendarHeaderRow extends PureComponent {
  state = {
    showOptions: false
  };

  renderScheduleRows = arrSchedule => {
    let { showOptions } = this.state;
    const { currentSchedule, isAddable } = this.props;
    if (showOptions) {
      return (
        <View style={[CommonStyles.calendarScheduleRowsContainer]}>
          {arrSchedule.map((schedule, index) => {
            return (
              <Fragment key={index.toString()}>
                {currentSchedule.name !== schedule.name &&
                  this.renderRow(schedule.color, schedule.name, schedule.id)}
              </Fragment>
            );
          })}
          {isAddable == true && (
            <TouchableHighlight onPress={this.props.onPressNewSchedule}>
              <View
                style={[
                  CommonStyles.calendarHeaderRow,
                  CommonStyles.commonRowCenter,
                  { backgroundColor: CommonColors.scheduleItemBackground }
                ]}
              >
                <Text style={CommonStyles.calendarHeaderRowTitle}>
                  {"+ New Schedule"}
                </Text>
              </View>
            </TouchableHighlight>
          )}
        </View>
      );
    } else {
      return null;
    }
  };

  toggleOptions = () => this.setState({ showOptions: !this.state.showOptions });

  changeOption = (color, name, id) => {
    this.props.changeSchedule({ color, name, id });
    this.setState({ showOptions: false });
  };

  close() {
    this.setState({ showOptions: false });
  }

  renderRow = (color, name, id, isTop = false, isBottom, backgroundColor) => {
    return (
      <TouchableOpacity
        onPress={() =>
          isTop ? this.toggleOptions() : this.changeOption(color, name, id)
        }
        activeOpacity={1}
        style={{ backgroundColor: "red" }}
      >
        <View
          style={[
            CommonStyles.calendarHeaderRow,
            { backgroundColor: this.props.backgroundColor }
          ]}
        >
          <View
            style={[
              CommonStyles.scheduleLeftColorShape,
              { borderTopColor: color }
            ]}
          />
          <View
            style={[
              CommonStyles.absoluteFullContainer,
              CommonStyles.commonRowCenter
            ]}
          >
            <Text
              style={[
                CommonStyles.calendarHeaderRowTitle,
                { textAlign: "center" }
              ]}
            >
              {name ? name.trim() : ""}
            </Text>
          </View>
          {isTop && (
            <TouchableOpacity
              style={[
                CommonStyles.calendarHeaderRowDownArrowContainer,
                CommonStyles.commonRowCenter
              ]}
              onPress={this.toggleOptions}
            >
              <Image
                source={imgDownArrow}
                style={CommonStyles.calendarHeaderRowDownArrowImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </View>
        <Spacer
          size={CommonSizes.spacerHeight}
          height={CommonSizes.spacerHeight}
          color={CommonColors.spacer}
        />
      </TouchableOpacity>
    );
  };

  render() {
    const { currentSchedule } = this.props;

    return (
      <EventContext.Consumer>
        {scheduleContext => {
          return (
            <View
              style={{
                position: "absolute",
                overflow: "visible",
                top: 0,
                width: "100%",
                zIndex: 9999,
                backgroundColor: this.props.backgroundColor
              }}
            >
              {this.renderRow(
                currentSchedule.color,
                currentSchedule.name,
                currentSchedule.id,
                true
              )}
              <ScrollView style={{ width: "100%" }}>
                {this.renderScheduleRows(scheduleContext.schedules)}
              </ScrollView>
            </View>
          );
        }}
      </EventContext.Consumer>
    );
  }
}

CalendarHeaderRow.propTypes = {
  color: PropTypes.string,
  title: PropTypes.string,
  isTop: PropTypes.bool,
  onPressDownArrow: PropTypes.func,
  isBottom: PropTypes.bool,
  backgroundColor: PropTypes.string
};

CalendarHeaderRow.defaultProps = {
  color: "transparent",
  title: "",
  isTop: false,
  onPressDownArrow: () => {},
  isBottom: false,
  backgroundColor: CommonColors.scheduleItemBackground
};

CalendarHeaderRow.componentName = "CalendarHeaderRow";

/* Export Component ============================================== */
export default CalendarHeaderRow;
