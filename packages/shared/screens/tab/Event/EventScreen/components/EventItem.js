import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";

import Spacer from "@m1/shared/components/Spacer";

import CommonStyles from "@m1/shared/theme/styles";
import CommonColors from "@m1/shared/theme/colors";
import CommonSizes from "@m1/shared/theme/sizes";

const EventItem = ({ color, time, am_pm, title, id, onPress }) => {
  
  return (
    <TouchableOpacity onPress={() => onPress()}>
      <View style={[CommonStyles.calendarHeaderRow, CommonStyles.eventItemRow]}>
        <View
          style={[CommonStyles.eventLeftColorShape, { backgroundColor: color }]}
        />
        <Text style={CommonStyles.eventTimeValue}>{time}</Text>
        <Text style={CommonStyles.eventAMValue}>{am_pm}</Text>
        <Text style={CommonStyles.eventTitleValue}>{title}</Text>
      </View>
      <Spacer
        size={CommonSizes.spacerHeight}
        height={CommonSizes.spacerHeight}
        color={CommonColors.spacer}
      />
    </TouchableOpacity>
  );
};

EventItem.propTypes = {
  color: PropTypes.string,
  time: PropTypes.string,
  am_pm: PropTypes.string,
  title: PropTypes.string,
  onPress: PropTypes.func
};

EventItem.defaultProps = {
  color: "transparent",
  time: null,
  am_pm: null,
  title: null,
  onPress: () => {}
};

EventItem.componentName = "EventItem";

export default EventItem;
