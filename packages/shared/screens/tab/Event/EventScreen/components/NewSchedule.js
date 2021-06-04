import React from "react";
import PropTypes from "prop-types";
import {
  Text,
  TouchableOpacity,
  View,
  Image,
  Keyboard,
  Alert
} from "react-native";
import { API } from "aws-amplify";
import Modal from "react-native-modal";
import ColorPickerModal from "@m1/shared/components/ColorPicker";
import CommonStyles from "@m1/shared/theme/styles";
import CustomInput from "@m1/shared/components/Input";
import Spacer from "@m1/shared/components/Spacer";

const imgClose = require("@m1/shared/assets/close.png");

const INPUT_CALENDAR_NAME = 1;
const INPUT_VISIBILITY = 2;

class NewSchedule extends React.Component {
  constructor(props) {
    super(props);

    let { currentTeam } = props;
    this.state = {
      selectedColor: "#0000ff",
      visibility: "Everyone",
      bColorPickerModalShow: false,
      calendar_name: "",
      currentTeam: currentTeam
    };
    this.mount = true;
  }

  componentWillUnmount() {
    this.showColorPickerModal(false);
    this.mount = false;
  }

  showColorPickerModal = bShow => {
    if (!this.mount) return;
    this.setState({ bColorPickerModalShow: bShow });
  };

  _onPressColor = () => {
    this.showColorPickerModal(true);
  };

  _onVisibilityChanged = (itemValue, itemIndex) => {
    if (!this.mount) return;

    this.setState({
      visibility: itemValue
    });
  };

  _onCloseColorPickerModal = () => {
    this.showColorPickerModal(false);
  };

  _onChangeColor = color => {
    if (!this.mount) return;

    this.setState({ selectedColor: color });

    // this.showColorPickerModal(false)
  };

  _saveNewSchedule = async () => {
    // TODO: save

    const { selectedColor, visibility, calendar_name } = this.state;
    
    Keyboard.dismiss();

    if (!calendar_name) {
      Alert.alert("Please enter a name for your schedule.");
      return;
    } else if (!selectedColor) {
      Alert.alert("Please select a color.");
      return;
    } else if (!visibility) {
      Alert.alert("Please select your schedule visibility preference.");
      return;
    }

    let { currentTeam } = this.props
    console.log(selectedColor, visibility, calendar_name);

    const newSchedule = await API.post(
      "schedules",
      `/teams/${currentTeam.id}/schedules`,
      {
        body: {
          name: calendar_name.trim(),
          visibility: visibility.toLowerCase(),
          color: selectedColor
        }
      }
    );

    this.props.saveSchedule(newSchedule);

    this._onClose();
};

  _removeNewSchedule = () => {
    // TODO: remove

    this._onClose();
  };

  _onClose = () => {
    // back to previous
    // this.props.navigation.goBack()
    this.props.onClose();
  };

  _onChangeInputValue = (value, key) => {
    if (!this.mount) return false;
    switch (key) {
      case INPUT_CALENDAR_NAME:
        this.setState({ calendar_name: value });
        break;

      case INPUT_VISIBILITY:
        this.setState({ visibility: value });
        break;
    }
    return true;
  };

  _onPressClose = () => {
    this.props.onClose();
  };

  render() {
    let { selectedColor, visibility, bColorPickerModalShow } = this.state;
    let { isOpen, onClose } = this.props;
    return (
      <Modal isVisible={isOpen} style={{ justifyContent: "flex-start" }}>
        <View style={CommonStyles.newScheduleDialog}>
          <View style={[CommonStyles.newScheduleCustomItem]}>
            <View style={CommonStyles.newScheduleHeader}>
              <View style={CommonStyles.newScheduleTitleContainer}>
                <TouchableOpacity
                  onPress={this._onPressColor}
                  style={[
                    CommonStyles.colorSelectFrame,
                    { backgroundColor: selectedColor }
                  ]}
                />
                <Text style={CommonStyles.newScheduleTitle}>
                  {"New Schedule"}
                </Text>
              </View>
              <View style={CommonStyles.newScheduleCloseContainer}>
                <TouchableOpacity
                  style={[
                    CommonStyles.colorClose,
                    CommonStyles.commonRowCenter
                  ]}
                  onPress={this._onPressClose}
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

          <View style={[CommonStyles.newScheduleCustomItem]}>
            <CustomInput
              placeholder={"Calendar name*"}
              containerStyle={CommonStyles.padding_right_5}
              defaultValue={this.state.calendar_name}
              onChangeValue={value =>
                this._onChangeInputValue(value, INPUT_CALENDAR_NAME)
              }
            />
          </View>

          <View style={[CommonStyles.newScheduleCustomItem]}>
            <CustomInput
              placeholder="Visibility*"
              bRightDropDown={true}
              
              onChangeValue={text =>
                this._onChangeInputValue(text, INPUT_VISIBILITY)
              }
              type="picker"
              defaultValue={this.state.visibility}
              labels={["Everyone", "Coaches", "Team" ,"Parents & Coaches"]}
              items={["Everyone", "Coaches", "Team" ,"Parents & Coaches"]}
            />
          </View>
          <TouchableOpacity
            onPress={this._saveNewSchedule}
            style={[
              CommonStyles.dialogBottomButton,
              CommonStyles.commonRowCenter
            ]}
          >
            <Text style={CommonStyles.dialogButtonTitle}>{"Save"}</Text>
          </TouchableOpacity>
          <ColorPickerModal
            onChangeColor={this._onChangeColor}
            isOpen={bColorPickerModalShow}
            onClose={this._onCloseColorPickerModal}
            defaultColor={this.state.selectedColor}
          />
        </View>
      </Modal>
    );
  }
}

export default NewSchedule;

NewSchedule.propTypes = {
  onClose: PropTypes.func,
  saveSchedule: PropTypes.func,
  isOpen: PropTypes.bool,
  currentTeam: PropTypes.any
};

NewSchedule.defaultProps = {
  onClose: () => {},
  saveSchedule: () => {},
  isOpen: false,
  currentTeam: {}
};
