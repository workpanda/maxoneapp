import React from "react";
import PropTypes from "prop-types";
import { Text, View, ScrollView } from "react-native";
import moment from "moment";
import { getCustomizedDateString } from "@m1/shared/utils";

import EventContext from "@m1/shared/screens/tab/Event/event-context";
import Spacer from "@m1/shared/components/Spacer";

import CommonStyles from "@m1/shared/theme/styles";
import EventItem from "@m1/shared/screens/tab/Event/EventScreen/components/EventItem";


class EventList extends React.Component {
  constructor(props) {
    super(props);

    let { date, onPress, events } = this.props;

    this.state = {
        date: date,
        events: events
    }

    this.mount = true;
  }

  componentWillReceiveProps(props) {
      if(!this.mount) return

      let { date, onPress, events } = this.props;

      this.setState({
        date: date,
        events: events
    })
  }

  render() {
    let { onPress } = this.props;

    return (
      <ScrollView style={CommonStyles.background_white}>
        <EventContext.Consumer>
          {scheduleContext => {
            return (
              <View style={[CommonStyles.eventListContainer]}>
                <View style={CommonStyles.calendarHeaderRow}>
                  <Text style={CommonStyles.eventListHeaderRowTitle}>
                    {moment(this.state.date.dateString).format("MMM Do, YYYY")}
                  </Text>
                </View>
                <Spacer />
                {this.state.events.map((item, index) => {
                  
                  return (
                    <EventItem
                      key={item.id}
                      color={item.color}
                      time={moment.utc(item.startDate).local().format("hh:mm")}
                      am_pm={moment.utc(item.startDate).local().format("a")}
                      title={item.title}
                      id={item.id}
                      onPress={() => {
                        this.props.setCurrentEvent(item);
                        onPress(item);
                      }}
                    />
                  );
                })}
              </View>
            );
          }}
        </EventContext.Consumer>
      </ScrollView>
    );
  }
}

export default EventList;

EventList.propTypes = {
  date: PropTypes.object,
  onPress: PropTypes.func,
  events: PropTypes.array
};

EventList.defaultProps = {
  date: new Date(),
  onPress: () => {},
  events: []
};
