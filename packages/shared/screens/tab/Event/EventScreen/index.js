import React from "react";
import {
  AsyncStorage,
  SafeAreaView,
  Text,
  TouchableHighlight,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  ActivityIndicator
} from "react-native";
import Modal from "react-native-modal";
import { white } from "ansi-colors";
import { API } from "aws-amplify";
import _ from "lodash";
import Moment from "moment";
import { extendMoment } from "moment-range";
const moment = extendMoment(Moment);
import ActionButton from "react-native-action-button";
import { NavigationEvents } from "react-navigation";
import { Avatar, Badge, Icon, withBadge } from "react-native-elements";
import AppColors from "@assets/theme/colors";

import EventContext from "@m1/shared/screens/tab/Event/event-context";

import Calendar from "@m1/shared/screens/tab/Event/EventScreen/components/Calendar";
import CalendarHeaderRow from "@m1/shared/screens/tab/Event/EventScreen/components/CalendarHeaderRow";
import EventList from "@m1/shared/screens/tab/Event/EventScreen/components/EventList";
import AddEventButton from "@m1/shared/screens/tab/Event/EventScreen/components/AddEventButton";
import NewSchedule from "@m1/shared/screens/tab/Event/EventScreen/components/NewSchedule";

import CommonStyles from "@m1/shared/theme/styles";
import CommonSizes from "@m1/shared/theme/sizes";
import CommonColors from "@m1/shared/theme/colors";
import Spacer from "@m1/shared/components/Spacer";

import FontIcon from "@m1/shared/components/FontIcon";
import Images from "@assets/images";

import ContextService from "@m1/shared/services/context";

const contextService = new ContextService();
var readChatTimer = -1;
class EventScreenShared extends React.Component {
  static navigationOptions = ({ navigation }) => {
    let params = navigation.state.params;
    var unReadChatCount = 0;

    var appContext =
      navigation.state.params && navigation.state.params.appContext
        ? navigation.state.params.appContext
        : {};
    if (params && params.unReadChatCount) {
      unReadChatCount = params.unReadChatCount;
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
          <Image
            style={{ height: 22, width: 160 }}
            resizeMode="contain"
            source={Images.logoHeader}
          />
        </View>
      ),
      headerTitleStyle: { flex: 1, textAlign: "center" },
      headerLeft: <View />,
      headerRight: (
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
      )
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      selected_date: { dateString: moment(new Date()).format("YYYY-MM-DD") },
      show_event_menu: false,
      isOpenNewScheduleModal: false,
      currentTeam: {},
      currentEvent: null,
      schedules: [],
      events: [],
      filteredEvents: [],
      selectedEvents: [],
      eventsKey: {},
      currentMonth: new Date(),
      startOfMonth: moment(new Date())
        .startOf("month")
        .format("YYYY-MM-DD"),
      endOfMonth: moment(new Date())
        .endOf("month")
        .format("YYYY-MM-DD"),
      currentSchedule: { name: "All", color: "deeppink", id: 0 },
      loading: true,
      appContext: {}
    };
    this.mount = true;
  }

  componentDidMount = async () => {
    const userContextString = await AsyncStorage.getItem("@M1:userContext");
    const appContextString = await AsyncStorage.getItem("@M1:appContext");
    const userContext = JSON.parse(userContextString);
    const appContext = JSON.parse(appContextString);

    this.props.navigation.setParams({
      appContext
    });

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

    const currentTeam = _.find(
      userContext.appContextList,
      c => c.id === appContext.id
    );
    this.setState({ currentTeam: currentTeam, appContext });

    const scheduleList = await this.loadSchedules(currentTeam.id);
    const eventsList = await this.loadEvents(scheduleList, currentTeam.id);

    const filteredEvents = await this.filterEvents(
      eventsList,
      this.state.currentSchedule.id
    );

    this._onPressDay(this.state.selected_date);

    this.setState({ loading: false });
  };

  // fetch all schedules
  loadSchedules = async programId => {
    const schedulesResponse = await API.get(
      "schedules",
      `/schedules/parent/${programId}`,
      this.options
    );

    const schedules = [
      { id: 0, color: "deeppink", name: "All" },
      ...schedulesResponse
    ];
    this.setState({ schedules });

    return schedules;
  };

  // fetch all scheduled events
  loadEvents = async (schedules, programId) => {
    let events = [];

    await Promise.all(
      schedules.map(async s => {
        const scheduleEvents = await API.get(
          "schedules",
          `/schedules/${s.id}/scheduleEvents`,
          this.options
        );

        const mappedEvents = scheduleEvents.map(item => {
          return {
            color: s.color,
            date: moment(item.startDate).format("YYYY-MM-DD"),

            ...item
          };
        });

        events.push(mappedEvents);
      })
    );

    events = this.flat(events);
    await this.setState({ events });

    return events;
  };

  // filter events by month
  filterEvents = async (events, scheduleId = 0) => {
    let filteredSchedules = [];
    let eventsKey = {};

    const { currentMonth, startOfMonth, endOfMonth } = this.state;

    const range = moment().range(startOfMonth, endOfMonth);

    await Promise.all(
      events.map(async e => {
        const startDate = moment(e.startDate, "YYYY-MM-DD");
        const isWithin = startDate.within(range);

        if (scheduleId == 0) {
          if (isWithin) {
            filteredSchedules.push(e);
          }

          for (
            var m = moment(e.startDate);
            m.isBefore(e.endDate);
            m.add(1, "days")
          ) {
            eventsKey[m.format("YYYY-MM-DD")] = {
              marked: true,
              dotColor: e.color
            };
          }
        } else {
          if (isWithin) {
            if (scheduleId == e.scheduleId) {
              filteredSchedules.push(e);

              for (
                var m = moment(e.startDate);
                m.isBefore(e.endDate);
                m.add(1, "days")
              ) {
                eventsKey[m.format("YYYY-MM-DD")] = {
                  marked: true,
                  dotColor: e.color
                };
              }
            }
          }
        }
      })
    );

    await this.setState({ eventsKey, filteredEvents: filteredSchedules });
  };

  flat(arr) {
    return Array.prototype.concat(...arr);
  }

  filterFirstMonthEvents = async (events, scheduleName) => {
    let filteredSchedules = [];
    let eventsKey = {};
    const eventsLoops = this.flat(events);
    const { startOfMonth, endOfMonth } = this.state;

    // const sDay = moment(startOfMonth)
    //   .subtract(1, "month")
    //   .format("YYYY-MM-DD");
    // const eDay = moment(endOfMonth)
    //   .subtract(1, "month")
    //   .format("YYYY-MM-DD");

    const range = moment().range(startOfMonth, endOfMonth);

    await Promise.all(
      eventsLoops.map(async e => {
        const startDate = moment(e.startDate, "YYYY-MM-DD");
        const isWithin = startDate.within(range);

        if (isWithin) {
          filteredSchedules.push(e);
        }

        // if (!eventsKey.hasOwnProperty(e.date)) {
        var difference = getDates(e.startDate, e.endDate);

        eventsKey[e.date] = {
          marked: true,
          dotColor: e.color
        };
        // }
      })
    );

    this.setState({ eventsKey, filteredEvents: filteredSchedules });
  };

  getDates = (startDate, endDate) => {
    var dates = [],
      currentDate = startDate,
      addDays = function(days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
      };
    while (currentDate <= endDate) {
      dates.push(currentDate);
      currentDate = addDays.call(currentDate, 1);
    }
    return dates;
  };

  _changeSchedule = currentSchedule => {
    this.setState(
      {
        currentSchedule
      },
      async () => {
        await this.filterEvents(this.state.events, currentSchedule.id);
        this._onPressDay(this.state.selected_date);
      }
    );
  };

  _onPressNewSchedule = () => {
    this.setState({ loading: true });
    this.headerView.close();
    this.showNewScheduleModal(true);
    this.setState({ loading: false });
  };

  showNewScheduleModal = bShow => {
    if (!this.mount) return;

    this.headerView.close();

    this.setState({ isOpenNewScheduleModal: bShow });
  };

  _handleMonthChange = async month => {
    this.setState({ loading: true });

    try {
      const startOfMonth = moment(month.dateString)
        .startOf("month")
        .format("YYYY-MM-DD hh:mm");
      const endOfMonth = moment(month.dateString)
        .endOf("month")
        .format("YYYY-MM-DD hh:mm");

      this.setState(
        {
          currentMonth: month,
          startOfMonth,
          endOfMonth
        },
        async () => {
          await this.filterEvents(
            this.state.events,
            this.state.currentSchedule.id
          );
        }
      );
    } catch (e) {}

    this.setState({ loading: false });
  };

  _onPressDay = async date => {
    if (!this.mount) return;

    this.setState({ loading: true });
    this.headerView.close();

    if (
      this.state.selected_date.dateString.split("-")[1] !=
      date.dateString.split("-")[1]
    ) {
      try {
        const startOfMonth = moment(date.dateString)
          .startOf("month")
          .format("YYYY-MM-DD hh:mm");
        const endOfMonth = moment(date.dateString)
          .endOf("month")
          .format("YYYY-MM-DD hh:mm");

        this.setState(
          {
            currentMonth: date,
            startOfMonth,
            endOfMonth
          },
          async () => {
            await this.filterEvents(
              this.state.events,
              this.state.currentSchedule.id
            );

            let { filteredEvents } = this.state;

            console.log(filteredEvents);

            let eventsFiltered;
            let selectedEvents = await filteredEvents.filter(item => {
              const range = moment().range(
                moment(item.startDate),
                moment(item.endDate)
              );
              const startDate = moment(date.dateString);
              const isWithin = startDate.within(range);

              return item.date === date.dateString || isWithin;
            });

            selectedEvents = await _.orderBy(
              selectedEvents,
              "startDate",
              "asc"
            );

            if (this.state.currentSchedule.id !== 0)
              eventsFiltered = await selectedEvents.filter(
                item => item.scheduleId === this.state.currentSchedule.id
              );
            else eventsFiltered = selectedEvents;

            this.setState(
              {
                selectedEvents: eventsFiltered,
                selected_date: date
              },
              () => {
                this.forceUpdate();
              }
            );
          }
        );
      } catch (e) {}
    } else {
      console.log("On Click Day", this.state.events);
      let { filteredEvents } = this.state;

      console.log(filteredEvents);

      let eventsFiltered;
      let selectedEvents = await filteredEvents.filter(item => {
        const range = moment().range(
          moment(item.startDate),
          moment(item.endDate)
        );
        const startDate = moment(date.dateString);
        const isWithin = startDate.within(range);

        return item.date === date.dateString || isWithin;
      });

      selectedEvents = await _.orderBy(selectedEvents, "startDate", "asc");

      if (this.state.currentSchedule.id !== 0)
        eventsFiltered = await selectedEvents.filter(
          item => item.scheduleId === this.state.currentSchedule.id
        );
      else eventsFiltered = selectedEvents;

      this.setState(
        {
          selectedEvents: eventsFiltered,
          selected_date: date
        },
        () => {
          this.forceUpdate();
        }
      );
    }

    this.setState({ loading: false });
  };

  _viewEventItem = () => {
    if (
      this.state.appContext.isStaff &&
      !contextService.isStaffPermitted(
        this.state.currentTeam,
        "canEditSchedules"
      )
    )
      return;

    this.setState({ show_event_menu: false }, () => {
      this.props.navigation.navigate("NewEventPage", {
        date: this.state.selected_date.dateString,
        event: this.state.currentEvent,
        schedules: this.state.schedules,
        edit: true,
        updateEvent: event => {
          this.updateEvent(event);
        },
        removeEvent: event => {
          this.removeEvent(event);
        }
      });
    });
  };

  async checkAppContextChanged() {
    var appContextString = await AsyncStorage.getItem("@M1:appContext");
    var appContext = JSON.parse(appContextString);

    if (this.state.appContext && appContext !== this.state.appContext) {
      this.setState({ loading: true });
      await this.componentDidMount();
    }
  }

  componentWillUnmount() {
    clearInterval(readChatTimer);
  }

  _sendReminderEventItem() {
    this.setState({ show_event_menu: false }, () => {});
  }

  _cancelEventItem() {
    this.setState({ show_event_menu: false }, () => {});
  }

  setCurrentEvent = event => {
    this.setState({ currentEvent: event });
  };

  _onPressAddEventButton = () => {
    this.headerView.close();

    this.props.navigation.navigate("NewEventPage", {
      date: this.state.selected_date.dateString,
      edit: false,
      schedules: this.state.schedules,
      currentScheduleID: this.state.currentSchedule.id,
      addEvent: event => {
        this.addEvent(event);
      }
    });
  };

  addEvent = event => {
    var events = this.state.events.slice(0);

    events.push(event);

    this.setState({ events: events }, async () => {
      await this.filterEvents(this.state.events, this.state.currentSchedule.id);
      this._onPressDay(this.state.selected_date);
    });
  };

  removeEvent = eventid => {
    var events = this.state.events.slice(0);
    var index = _.findIndex(events, pe => pe.id == eventid);

    var findIndex = _.findIndex(events, pe => pe.id == eventid);

    events.splice(findIndex, 1);

    this.setState({ events: events }, async () => {
      await this.filterEvents(this.state.events, this.state.currentSchedule.id);
      this._onPressDay(this.state.selected_date);
    });
  };

  updateEvent = event => {
    var events = this.state.events.slice(0);

    var index = _.findIndex(events, pe => pe.id == event.id);

    if (index > -1) {
      events[index] = event;

      this.setState({ events: events }, async () => {
        await this.filterEvents(
          this.state.events,
          this.state.currentSchedule.id
        );
        this._onPressDay(this.state.selected_date);
      });
    }
  };

  _onPressEventItem = itemInfo => {
    this.headerView.close();
    this.setState({
      currentEvent: itemInfo
    });

    this.setState({ show_event_menu: true });
  };

  addNewSchedule = newSchedule => {
    var schedules = this.state.schedules.slice(0);

    schedules.push(newSchedule);

    this.setState({ schedules: schedules });
  };

  renderEventMenuModal = () => {
    let { show_event_menu } = this.state;
    var mMenuList = [];

    if(this.state.currentEvent) {
        if(this.state.currentEvent.startDate) {
            mMenuList.push(moment
                .utc(this.state.currentEvent.startDate)
                .local()
                .format("MMM Do, YYYY"));

            mMenuList.push(moment
                .utc(this.state.currentEvent.startDate)
                .local()
                .format("hh:mm a"));
        }

        if(this.state.currentEvent.endDate) {
            mMenuList.push("to");

            if(moment
                .utc(this.state.currentEvent.endDate)
                .local()
                .format("MMM Do, YYYY") != moment
                .utc(this.state.currentEvent.startDate)
                .local()
                .format("MMM Do, YYYY")){
                    mMenuList.push(moment
                        .utc(this.state.currentEvent.endDate)
                        .local()
                        .format("MMM Do, YYYY"));
                }

            mMenuList.push(moment
                .utc(this.state.currentEvent.endDate)
                .local()
                .format("hh:mm a"));
        }
    }

    return (
      <Modal
        isVisible={show_event_menu}
        style={EventScreenStyles.menu_modal_position}
      >
        <View style={EventScreenStyles.menu_modal_dialog}>
          <View style={EventScreenStyles.menu_modal_dialog_header}>
            {show_event_menu && (
              <Text style={EventScreenStyles.menu_modal_dialog_header_text}>
                {this.state.currentEvent.title}
              </Text>
            )}
          </View>

          {
              mMenuList.map((item, key) => {
                  return (<TouchableOpacity key={'event_menu' + key} style={EventScreenStyles.menu_modal_dialog_item}>
                            <Text style={EventScreenStyles.menu_modal_dialog_item_text}>
                                {item}
                            </Text>
                        </TouchableOpacity>);
              })
          }
          {/* {this.state.currentEvent && this.state.currentEvent.startDate && (
            <TouchableOpacity style={EventScreenStyles.menu_modal_dialog_item}>
              <Text style={EventScreenStyles.menu_modal_dialog_item_text}>
                {moment
                  .utc(this.state.currentEvent.startDate)
                  .local()
                  .format("YYYY-MM-DD hh:mm")}
              </Text>
            </TouchableOpacity>
          )}

          {this.state.currentEvent && this.state.currentEvent.endDate && (
            <TouchableOpacity style={EventScreenStyles.menu_modal_dialog_item}>
              <Text style={EventScreenStyles.menu_modal_dialog_item_text}>
                {moment
                  .utc(this.state.currentEvent.endDate)
                  .local()
                  .format("YYYY-MM-DD hh:mm")}
              </Text>
            </TouchableOpacity>
          )} */}

          {this.state.currentEvent && this.state.currentEvent.location && (
            <TouchableOpacity style={EventScreenStyles.menu_modal_dialog_item}>
              <Text style={EventScreenStyles.menu_modal_dialog_item_text}>
                <Text style={{fontWeight:'bold'}}>{"Location:"}</Text>
                <Text>{this.state.currentEvent.location}</Text>

              </Text>
            </TouchableOpacity>
          )}

          {this.state.currentEvent && this.state.currentEvent.description && (
            <TouchableOpacity style={EventScreenStyles.menu_modal_dialog_item}>
              <Text style={EventScreenStyles.menu_modal_dialog_item_text}>
                <Text style={{fontWeight:'bold'}}>{"Description:"}</Text>
                <Text>{this.state.currentEvent.description}</Text>

              </Text>
            </TouchableOpacity>
          )}

          {this.state.currentEvent && this.state.currentEvent.isReadOnly && (
            <TouchableOpacity style={EventScreenStyles.menu_modal_dialog_item}>
              <Text style={EventScreenStyles.menu_modal_dialog_item_text}>
                <Text style={{fontWeight:'bold'}} color="gray">{"Read Only"}</Text>
              </Text>
            </TouchableOpacity>
          )}

          {this.state.appContext.isAthlete == false &&
            (!this.state.appContext.isStaff ||
              (this.state.appContext.isStaff &&
                contextService.isStaffPermitted(
                  this.state.currentTeam,
                  "canEditSchedules"
                ))) && <View style={{width: '100%', paddingTop: 5, paddingBottom: 5}}><Spacer /></View>}

          {(this.state.appContext.isAthlete == false &&
            (!this.state.appContext.isStaff ||
              (this.state.appContext.isStaff &&
                contextService.isStaffPermitted(
                  this.state.currentTeam,
                  "canEditSchedules"
                ))) && this.state.currentEvent && !this.state.currentEvent.isReadOnly) && (
              <TouchableOpacity
                style={EventScreenStyles.menu_modal_dialog_item}
                onPress={this._viewEventItem}
              >
                <Text style={EventScreenStyles.menu_modal_dialog_item_text}>
                  {"Edit"}
                </Text>
              </TouchableOpacity>
            )}
          {(this.state.appContext.isAthlete == false &&
            (!this.state.appContext.isStaff ||
              (this.state.appContext.isStaff &&
                contextService.isStaffPermitted(
                  this.state.currentTeam,
                  "canEditSchedules"
                ))) && this.state.currentEvent && !this.state.currentEvent.isReadOnly) && <View style={{width: '100%', paddingTop: 5, paddingBottom: 5}}><Spacer /></View>}

          <TouchableOpacity
            style={EventScreenStyles.menu_modal_dialog_item}
            onPress={this._cancelEventItem.bind(this)}
          >
            <Text style={EventScreenStyles.menu_modal_dialog_item_text}>
              {"Done"}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  };

  render() {
    const { schedules, events, selectedEvents } = this.state;
    let { selected_date, isOpenNewScheduleModal } = this.state;
    return (
      <EventContext.Provider value={{ schedules, events, selectedEvents }}>
        <NavigationEvents onDidFocus={() => this.checkAppContextChanged()} />

        <SafeAreaView style={[CommonStyles.container, CommonStyles.navHeader]}>
          <StatusBar barStyle="light-content" translucent={false} />
          {this.state.loading && (
            <View style={EventScreenStyles.loading}>
              <ActivityIndicator size="large" />
            </View>
          )}
          {/* Header */}
          <CalendarHeaderRow
            backgroundColor={AppColors.app.dark}
            onPressNewSchedule={this._onPressNewSchedule}
            changeSchedule={this._changeSchedule}
            currentSchedule={this.state.currentSchedule}
            ref={header => {
              this.headerView = header;
            }}
            isAddable={this.state.appContext.isAthlete == false}
          />

          <Calendar
            dayPressCallback={this._onPressDay}
            onMonthChanged={this._handleMonthChange}
            eventsKey={this.state.eventsKey}
          />

          {/* overlay schedule rows */}
          <EventList
            date={selected_date}
            schedules={this.state.schedules}
            events={this.state.selectedEvents}
            onPress={this._onPressEventItem}
            setCurrentEvent={this.setCurrentEvent}
          />
          {/* <AddEventButton onPress={this._onPressAddEventButton} /> */}
          {(this.state.appContext.isAthlete == false &&
            (!this.state.appContext.isStaff ||
              (this.state.appContext.isStaff &&
                contextService.isStaffPermitted(
                  this.state.currentTeam,
                  "canEditSchedules"
                ))) && !this.state.currentSchedule.isReadOnly) && (
              <ActionButton
                buttonColor={AppColors.app.dark}
                onPress={this._onPressAddEventButton}
              />
            )}

          <NewSchedule
            isOpen={isOpenNewScheduleModal}
            currentTeam={this.state.currentTeam}
            saveSchedule={schedule => {
              this.addNewSchedule(schedule);
            }}
            onClose={() => this.showNewScheduleModal(false)}
          />
          {this.renderEventMenuModal()}
        </SafeAreaView>
      </EventContext.Provider>
    );
  }
}

const EventScreenStyles = StyleSheet.create({
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
    height: 60,

    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "white"
  },
  menu_modal_dialog_header_text: {
    fontWeight: "bold",
    fontSize: 20,
    backgroundColor: "white"
  },
  menu_modal_dialog_item: {
    width: "100%",
    height: 40,
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
  badge: {
    position: "absolute",
    top: -5
  }
});

export default EventScreenShared;
