import React, { Component } from "react";
import {
  View,
  KeyboardAvoidingView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Text,
  TextInput,
  Picker,
  Platform,
  Alert,
  StatusBar,
  FlatList,
  RefreshControl,
  TouchableHighlight,
  ActivityIndicator,
  Dimensions
} from "react-native";
import _ from "lodash";
import moment from "moment";
import PropTypes from "prop-types";
import SimplePicker from "react-native-simple-picker";
import { SearchBar } from "react-native-elements";
import Spacer from "@m1/shared/components/Spacer";
import Modal from "react-native-modal";
import AppSize from "@assets/theme/sizes";
import AppColors from "@assets/theme/colors";
import { Image as CacheImage } from "react-native-expo-image-cache";
import CommonStyles from "@m1/shared/theme/styles";
const imgDownArrow = require("@m1/shared/assets/drop_down_arrow.png");
const imgClose = require("@m1/shared/assets/close.png");
const checkedImage = require("@m1/shared/assets/checked.png");
const unCheckedImage = require("@m1/shared/assets/unchecked.png");
const default_avatar = require("@m1/shared/assets/avatar-default.png");
const SCREEN_WIDTH = Dimensions.get("window").width;

const RosterTypes = {
  All: "All",
  Athletes: "Athletes",
  Coaches: "Coaches",
  Groups: "Groups",
  // Events: "Events",
  // Classes: "Classes"
};

const MODAL_PICKER_ROSTER = [
  "All",
  "Athletes",
  "Coaches",
  "Groups",
  // "Events",
  // "Classes"
];

const rosterPickerItems = [
  { label: "All", value: RosterTypes.All },
  { label: "Athletes", value: RosterTypes.Athletes },
  { label: "Coaches", value: RosterTypes.Coaches },
  { label: "Groups", value: RosterTypes.Groups },
  // { label: "Events", value: RosterTypes.Events },
  // { label: "Classes", value: RosterTypes.Classes }
];
const INPUT_SEARCH = 1;

const classes = _.range(moment().year(), moment().year() + 15).map(y => {
  return { name: `Class of ${y}`, year: y };
});

class RecipientsDialog extends Component {
  state = {
    searchText: "",
    selectedRoster: RosterTypes.All,
    selectedRecipients: [],
    removedRecipients: [],
    rosterIsFocused: false,
    showRosterPicker: false,
    searchIsFocused: false,
    athletes: [],
    coaches: [],
    entityGroups: [],
    events: [],
    showErrorBanner: false,
    loading: false
  };

  constructor(props) {
    super(props);

    const {
      athletes = [],
      coaches = [],
      entityGroups = [],
      events = [],
      messageRecipients = []
    } = props;

    const initialRoster = this.resolveInitialRosterSelection(messageRecipients);
    this.state = _.merge({}, this.state, {
      athletes,
      coaches,
      entityGroups,
      events,
      selectedRecipients: messageRecipients,
      selectedRoster: initialRoster
    });

    this.mount = true;
  }

  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(props) {
    const {
      athletes,
      coaches,
      entityGroups,
      events,
      messageRecipients
    } = props;
    this.setState({
      athletes,
      coaches,
      entityGroups,
      events,
      loading: false,
      selectedRoster: RosterTypes.All,
      selectedRecipients: messageRecipients
    });
  }

  resolveInitialRosterSelection = recipients => {
    const recipientTypes = _.uniq(_.map(recipients, r => r.recipientType));

    if (recipientTypes.length === 1) {
      switch (recipientTypes[0]) {
        case "group":
          return RosterTypes.Groups;
          return;
        // case "event":
        //   return RosterTypes.Events;
        //   return;
        // case "graduationYear":
        //   return RosterTypes.Classes;
        //   return;
      }
    }
    return RosterTypes.All;
  };

  _onChangeInputValue = (value, key) => {
    if (!this.mount) return false;
    switch (key) {
      case INPUT_SEARCH:
        this.setState({ searchText: value });
        break;
    }
    return true;
  };

  _onChangeSearch = value => {
    this.setState({ searchText: value });
  };

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

  refresh = roster => {
    const { team } = this.props;
    if (!roster) {
      roster = this.state.selectedRoster;
    }

    switch (roster) {
      case RosterTypes.All:
        this.setState({ loading: true }, async () => {
          if (!this.state.athletes) {
            this.setState({ athletes: await this.getAthletes(team.id) });
          }
          if (!this.state.coaches) {
            this.setState({ coaches: await this.getCoaches(team.id) });
          }
          this.setState({ loading: false });
        });
        break;
      case RosterTypes.Athletes:
        this.setState({ loading: true }, async () => {
          if (!this.state.athletes) {
            this.setState({ athletes: await this.getAthletes(team.id) });
          }
          this.setState({ loading: false });
        });
        break;
      case RosterTypes.Coaches:
        this.setState({ loading: true }, async () => {
          if (!this.state.coaches) {
            this.setState({ coaches: await this.getCoaches(team.id) });
          }
          this.setState({ loading: false });
        });
        break;
      case RosterTypes.Groups:
        this.setState({ loading: true }, async () => {
          if (!this.state.entityGroups) {
            this.setState({ entityGroups: await this.getGroups(team.id) });
          }
          this.setState({ loading: false });
        });
        break;
      // case RosterTypes.Events:
      //   this.setState({ loading: true }, async () => {
      //     if (!this.state.events) {
      //       this.setState({ events: await this.getEvents(team.id) });
      //     }
      //     this.setState({ loading: false });
      //   });
      //   break;
      // case RosterTypes.Classes:
    }
  };

  onPressDone = () => {
    const { selectedRecipients, removedRecipients } = this.state;
    const { onDone } = this.props;

    onDone(selectedRecipients, removedRecipients);
  };

  onPressCancel = () => {
    this.props.onCancel();
  };

  onRosterChange = roster => {
    switch (roster) {
      case RosterTypes.All:
        if (!this.state.athletes || !this.state.coaches) {
          this.refresh(roster);
        }
        break;
      case RosterTypes.Athletes:
        if (!this.state.athletes) {
          this.refresh(roster);
        }
        break;
      case RosterTypes.Coaches:
        if (!this.state.coaches) {
          this.refresh(roster);
        }
        break;
      case RosterTypes.Groups:
        if (!this.state.entityGroups) {
          this.refresh(roster);
        }
        break;
      // case RosterTypes.Events:
      //   if (!this.state.events) {
      //     this.refresh(roster);
      //   }
      //   break;
      // case RosterTypes.Classes:
    }

    this.setState({ selectedRoster: roster });
  };

  createRecipientFromAthlete = athleteData => {
    return {
      id: athleteData.id,
      name: athleteData.name,
      recipientType: "player",
      user: {
        graduationYear: athleteData.graduationYear,
        phoneNumber: athleteData.phoneNumber,
        email: athleteData.email
      }
    };
  };

  createRecipientFromCoach = coachData => {
    return {
      id: coachData.id,
      name: coachData.name,
      recipientType: "coach",
      user: {
        graduationYear: coachData.graduationYear,
        phoneNumber: coachData.phoneNumber,
        email: coachData.email
      }
    };
  };

  createRecipientFromGroup = groupData => {
    return {
      entity_group_id: groupData.id,
      name: groupData.name,
      recipientType: "group",
      check_for_contact_info: true,
      has_all_emails: this.checkForMissingEmails(groupData) ? false : true,
      has_all_phone_numbers: this.checkForMissingPhoneNumbers(groupData)
        ? false
        : true
    };
  };

  createRecipientFromEvent = eventData => {
    return {
      dynamic: { type: "event", value: eventData.id, display: eventData.name },
      name: eventData.name,
      recipientType: "event",
      program: eventData.program,
      check_for_contact_info: true,
      has_all_emails: this.checkForMissingEmails(eventData) ? false : true,
      has_all_phone_numbers: this.checkForMissingPhoneNumbers(eventData)
        ? false
        : true
    };
  };

  createRecipientFromClass = classData => {
    return {
      dynamic: {
        type: "graduationYear",
        value: classData.year,
        display: classData.name
      },
      name: classData.name,
      recipientType: "graduationYear",
      check_for_contact_info: true,
      has_all_phone_numbers: this.checkForMissingPhoneNumbers(
        classData,
        false,
        true
      )
        ? false
        : true,
      has_all_emails: this.checkForMissingEmails(classData, false, true)
        ? false
        : true
    };
  };

  onAddRecipient = rawRecipientData => {
    const { deliveryType, team } = this.props;
    const { selectedRoster, selectedRecipients } = this.state;

    let recipient, showErrorBanner;
    switch (selectedRoster) {
      case RosterTypes.All:
        const contextEnrollment = _.find(
          rawRecipientData.program_enrollments,
          pe => pe.program_id === team.id
        );
        if (contextEnrollment && contextEnrollment.role === "player") {
          recipient = this.createRecipientFromAthlete(rawRecipientData);
        } else if (contextEnrollment) {
          recipient = this.createRecipientFromCoach(rawRecipientData);
        }
        if (recipient) {
          if (deliveryType === "Text" && !rawRecipientData.phoneNumber)
            showErrorBanner = true;
          if (deliveryType === "Email" && !rawRecipientData.email)
            showErrorBanner = true;
        }
      case RosterTypes.Athletes:
        recipient = this.createRecipientFromAthlete(rawRecipientData);
        if (deliveryType === "Text" && !rawRecipientData.phoneNumber)
          showErrorBanner = true;
        if (deliveryType === "Email" && !rawRecipientData.email)
          showErrorBanner = true;
        break;
      case RosterTypes.Coaches:
        recipient = this.createRecipientFromCoach(rawRecipientData);
        if (deliveryType === "Text" && !rawRecipientData.phoneNumber)
          showErrorBanner = true;
        if (deliveryType === "Email" && !rawRecipientData.email)
          showErrorBanner = true;
        break;
      case RosterTypes.Groups:
        recipient = this.createRecipientFromGroup(rawRecipientData);
        if (
          this.checkForMissingEmails(
            rawRecipientData,
            rawRecipientData.name === "All Athletes"
          )
        )
          showErrorBanner = true;
        if (
          this.checkForMissingPhoneNumbers(
            rawRecipientData,
            rawRecipientData.name === "All Athletes"
          )
        )
          showErrorBanner = true;
        break;
      // case RosterTypes.Events:
      //   recipient = this.createRecipientFromEvent(rawRecipientData);
      //   if (this.checkForMissingEmails(rawRecipientData))
      //     showErrorBanner = true;
      //   if (this.checkForMissingPhoneNumbers(rawRecipientData))
      //     showErrorBanner = true;
      //   break;
      // case RosterTypes.Classes:
      //   recipient = this.createRecipientFromClass(rawRecipientData);
      //   if (this.checkForMissingEmails(rawRecipientData, false, true))
      //     showErrorBanner = true;
      //   if (this.checkForMissingPhoneNumbers(rawRecipientData, false, true))
      //     showErrorBanner = true;
    }

    if (recipient) {
      this.setState({
        selectedRecipients: [...selectedRecipients, recipient],
        showErrorBanner
      });
    }
  };

  onRemoveRecipient = recipient => {
    const { selectedRecipients, removedRecipients } = this.state;

    if (recipient.id) {
      this.setState({
        selectedRecipients: _.without(selectedRecipients, recipient),
        removedRecipients: [...removedRecipients, recipient]
      });
      return;
    }
    this.setState(
      { selectedRecipients: _.without(selectedRecipients, recipient) },
      () => {
        this.checkForMissingData();
      }
    );
  };

  searchTextFilter = (recipients, searchText) => {
    if (!searchText) {
      return recipients;
    }
    return _.filter(
      recipients,
      r => r.name.toLowerCase().indexOf(searchText.toLowerCase()) >= 0
    );
  };

  getFilteredResults = () => {
    const {
      selectedRoster,
      searchText,
      athletes,
      coaches,
      entityGroups,
      events
    } = this.state;

    switch (selectedRoster) {
      case RosterTypes.All:
        return this.searchTextFilter([...athletes, ...coaches], searchText);
      case RosterTypes.Athletes:
        return this.searchTextFilter(athletes, searchText);
      case RosterTypes.Coaches:
        return this.searchTextFilter(coaches, searchText);
      case RosterTypes.Groups:
        return this.searchTextFilter(entityGroups, searchText);
      // case RosterTypes.Events:
      //   return this.searchTextFilter(events, searchText);
      // case RosterTypes.Classes:
      //   return this.searchTextFilter(classes, searchText);
    }

    return [];
  };

  checkForMissingPhoneNumbers = (group, all, byYear) => {
    const { athletes } = this.state;

    if (all) {
      return _.find(athletes, athlete => {
        return !athlete.phoneNumber;
      });
    } else if (byYear) {
      let athletesByYear = _.filter(athletes, athlete => {
        return athlete.graduationYear === group.year;
      });
      return _.find(athletesByYear, athlete => {
        return !athlete.phoneNumber && athlete.graduationYear === group.year;
      });
    }

    if (group.members)
      return _.find(group.members, member => {
        return !member.user.phoneNumber;
      });

    if (group.event_enrollments) {
      return _.find(group.event_enrollments, ee => {
        return !ee.user.phoneNumber;
      });
    }
  };

  checkForMissingEmails = (group, all, byYear) => {
    const { athletes } = this.state;

    if (all) {
      return _.find(athletes, athlete => {
        return !athlete.email;
      });
    } else if (byYear) {
      let athletesByYear = _.filter(athletes, athlete => {
        return athlete.graduationYear === group.year;
      });
      return _.find(athletesByYear, athlete => {
        return !athlete.email && athlete.graduationYear === group.year;
      });
    }

    if (group.members)
      return _.find(group.members, member => {
        return !member.user.email;
      });

    if (group.event_enrollments)
      return _.find(group.event_enrollments, ee => {
        return !ee.user.email;
      });
  };

  checkForMissingData = () => {
    const { deliveryType } = this.props;
    let { selectedRecipients, showErrorBanner } = this.state;

    if (!selectedRecipients.length) {
      this.setState({ showErrorBanner: false });
      return;
    }

    selectedRecipients.forEach(r => {
      if (r.user) {
        if (deliveryType === "Text" && !r.user.phoneNumber) {
          showErrorBanner = true;
        } else if (deliveryType === "Email" && !r.user.email) {
          showErrorBanner = true;
        } else {
          showErrorBanner = false;
        }
      } else if (r.check_for_contact_info) {
        if (deliveryType === "Text" && !r.has_all_phone_numbers) {
          showErrorBanner = true;
        } else if (deliveryType === "Email" && !r.has_all_emails) {
          showErrorBanner = true;
        } else {
          showErrorBanner = false;
        }
      }
    });

    this.setState({ showErrorBanner });
  };

  renderRosterPicker = () => {
    const { selectedRoster } = this.state;

    return (
      <View style={styles.pickerContainer}>
        <TouchableOpacity
          style={styles.doneButtonContainer}
          onPress={() => {
            this.setState({
              showRosterPicker: false,
              calendarNameIsFocused: false
            });
          }}
        >
          <Text style={styles.pickerDoneText}>DONE</Text>
        </TouchableOpacity>
        <Picker
          itemStyle={styles.pickerItem}
          selectedValue={selectedRoster}
          onValueChange={roster => this.onRosterChange(roster)}
        >
          {rosterPickerItems.map(i => (
            <Picker.Item key={i.value} label={i.label} value={i.value} />
          ))}
        </Picker>
      </View>
    );
  };

  renderRecipientItem = ({ item, index }) => {
    const { selectedRecipients, selectedRoster } = this.state;
    const { deliveryType } = this.props;

    let renderedDeliveryType =
      deliveryType == "Text" ? item.phoneNumber : item.email;
    let noData = deliveryType == "Text" ? "no phone number" : "no email";
    let showSubtext = true;

    switch (selectedRoster) {
      case RosterTypes.Groups:
        showSubtext = false;
      // case RosterTypes.Events:
      //   showSubtext = false;
      // case RosterTypes.Classes:
      //   showSubtext = false;
    }

    const match = _.find(selectedRecipients, r => {
      let dynamic = r.dynamic;
      if (dynamic && typeof dynamic === "string") dynamic = JSON.parse(dynamic);

      return (
        (r.id && r.id === item.id) ||
        (r.recipientType === "group" &&
          r.entity_group_id === item.id &&
          r.name === item.name) ||
        (r.recipientType === "event" &&
          dynamic &&
          dynamic.value === item.id &&
          r.name === item.name) ||
        (dynamic && dynamic.value === item.year)
      );
    });

    const isSelected = !!match;

    return (
      <View style={styles.padding_container} key={" " + index}>
        <TouchableOpacity
          style={styles.group_child_container}
          onPress={() =>
            isSelected
              ? this.onRemoveRecipient(match)
              : this.onAddRecipient(item)
          }
        >
          <View style={styles.avatar_container}>
            {item.avatarUrl == null && (
              <Image style={styles.avatar_img} source={default_avatar} />
            )}

            {item.avatarUrl !== null && item.avatarUrl !== undefined && (
              <CacheImage
                style={styles.avatar_img}
                {...{ uri: item.avatarUrl }}
              />
            )}

            <Text style={[styles.user_name, styles.general_text]}>
              {item.name}
            </Text>
          </View>
          {isSelected && (
            <Image source={checkedImage} style={styles.checkBoxImage} />
          )}

          {!isSelected && (
            <Image source={unCheckedImage} style={styles.checkBoxImage} />
          )}
        </TouchableOpacity>
      </View>
    );
  };
  _showRosterPicker = () => {
    if (this.rosterPicker == null || this.rosterPicker == undefined) return;

    this.rosterPicker.show();
  };

  render() {
    const { show_menu, onClose } = this.props;
    const { loading } = this.state;

    const searchResults = this.getFilteredResults();

    return (
      <Modal isVisible={show_menu} style={{ justifyContent: "flex-start" }}>
        <View style={styles.newScheduleDialog}>
          <View style={[CommonStyles.newScheduleCustomItem]}>
            <View style={CommonStyles.newScheduleHeader}>
              <View style={styles.modalTitleContainer}>
                <Text style={CommonStyles.newScheduleTitle}>
                  {"Select Recipients"}
                </Text>
              </View>
              <View style={styles.modalCloseContainer}>
                <TouchableOpacity
                  style={[styles.colorClose, CommonStyles.commonRowCenter]}
                  onPress={onClose}
                >
                  <Image
                    source={imgClose}
                    style={CommonStyles.calendarHeaderRowDownArrowImage}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Spacer />
          <View>
            <View style={CommonStyles.customInputCellInnerPart}>
              <View style={[CommonStyles.newScheduleCustomItem]}>
                <View style={[styles.newScheduleCustomItem]}>
                  <View>
                    <View>
                      <View>
                        <TouchableOpacity
                          style={[
                            CommonStyles.customInputField,
                            CommonStyles.customInputPicker,
                            CommonStyles.customInputFieldRow
                          ]}
                          onPress={this._showRosterPicker}
                        >
                          <Text
                            style={[
                              CommonStyles.customInputFieldVerticalCenter,
                              CommonStyles.customInputFieldRightDown
                            ]}
                          >
                            {this.state.selectedRoster}
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
              </View>
            </View>
          </View>

          <View
            style={{
              width: "100%",
              paddingTop: 10,
              paddingLeft: 20,
              paddingRight: 20,
              paddingBottom: 5
            }}
          >
            <SearchBar
              platform="android"
              placeholder="Search"
              value={this.state.searchText}
              onChangeText={text => this._onChangeSearch(text)}
              style={{ width: "100%" }}
              inputStyle={{ fontSize: 15 }}
              containerStyle={{
                borderBottomColor: "#4e4d52",
                borderBottomWidth: 0.5,
                paddingVertical: 0,
                height: 50
              }}
              cancelButtonProps={{ disabled: true }}
              cancelButtonTitle={""}
              icon={{ name: "search" }}
              cancelIcon={{ name: "search" }}
              leftIconContainerStyle={{
                paddingLeft: 0,
                paddingRight: 0,
                marginRight: 0,
                marginLeft: 0,
                width: 20,
                height: 20
              }}
            />
          </View>
          <FlatList
            data={searchResults}
            style={{ width: "100%", height: 300 }}
            refreshControl={
              <RefreshControl
                style={{ backgroundColor: "transparent" }}
                refreshing={loading}
                onRefresh={() => this.refresh()}
                tintColor={"#ffffff"}
                title={loading ? "Loading..." : "Pull to Refresh"}
                titleColor={"#ffffff"}
              />
            }
            ListEmptyComponent={() => (
              <View style={styles.noDataContainer}>
                {loading && (
                  <ActivityIndicator
                    animating={true}
                    style={{ flex: 1 }}
                    color="#000000"
                  />
                )}
                {!loading && (
                  <Text style={styles.noDataBody}>
                    no matches. try a different search query.
                  </Text>
                )}
              </View>
            )}
            renderItem={this.renderRecipientItem}
            keyExtractor={(item, index) => item.id + "" || item.year}
          />

          <TouchableOpacity
            onPress={this._saveNewSchedule}
            style={[styles.dialogConfirmButton, CommonStyles.commonRowCenter]}
            onPress={this.onPressDone}
          >
            <Text style={styles.dialogButtonTitle}>{"Confirm"}</Text>
          </TouchableOpacity>
        </View>
        <SimplePicker
          options={MODAL_PICKER_ROSTER}
          labels={MODAL_PICKER_ROSTER}
          ref={picker => (this.rosterPicker = picker)}
          onSubmit={this.onRosterChange}
          style={pickerSelectStyles.remind_picker}
          selectedValue={this.state.selectedRoster}
          cancelText={"Cancel"}
          confirmText={"Done"}
        />
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  scene: {
    flex: 1
  },
  noDataContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 70,
    paddingBottom: 70,
    padding: 40,
    backgroundColor: "#ffffff"
  },
  newScheduleDialog: {
    marginTop: "auto",
    marginBottom: "auto",
    marginHorizontal: 10,
    borderRadius: 3,
    backgroundColor: "white",
    overflow: "hidden"
  },
  noDataBody: {
    fontSize: 15,
    color: "#454545",
    textAlign: "center"
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
    height: "100%",
    paddingLeft: 17,
    paddingRight: 17
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
  dialogButtonTitle: {
    color: "white",
    fontWeight: "bold"
  },
  dialogConfirmButton: {
    marginTop: 20,
    width: "90%",
    height: 40,
    marginLeft: "5%",
    marginBottom: 10,
    backgroundColor: AppColors.brand.gamma
  }
});

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

RecipientsDialog.propTypes = {
  team: PropTypes.any,
  athletes: PropTypes.array,
  coaches: PropTypes.array,
  entityGroups: PropTypes.array,
  events: PropTypes.array,
  show_menu: PropTypes.bool,
  messageRecipients: PropTypes.array,
  onCancel: PropTypes.func,
  onDone: PropTypes.func
};

RecipientsDialog.defaultProps = {
  team: {},
  athletes: [],
  coaches: [],
  entityGroups: [],
  events: [],
  show_menu: false,
  messageRecipients: [],
  onCancel: () => {},
  onDone: () => {}
};

export default RecipientsDialog;
