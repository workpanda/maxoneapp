// import React from "react";
// import PropTypes from "prop-types";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   TextInput,
//   StyleSheet,
//   Image
// } from "react-native";
// import DateTimePicker from "react-native-modal-datetime-picker";
// import moment from "moment";
// import Spacer from "../Spacer";
// import CommonStyles from "@m1/shared/theme/styles";

// import {
//   getCustomizedDateString,
//   getCustomizedTimeString,
//   getCustomizedDateDefaultString
// } from "@m1/shared/utils";
// import SimplePicker from "react-native-simple-picker";
// const enumInputTypes = ["input", "date", "time", "picker"];
// const imgDownArrow = require("@m1/shared/assets/drop_down_arrow.png");

// class CustomInput extends React.Component {
//   constructor(props) {
//     super(props);
//     let { defaultValue } = this.props;

//     if (defaultValue == undefined || defaultValue == null) {
//       defaultValue = new Date();
//     }

//     let mTime = this.getDateTimeText(defaultValue)

//     this.state = {
//         input: mTime,
//       isDateTimePickerVisible: false,
//       selectedValue: defaultValue,
//       changedValue: defaultValue
//     };
//     this.mount = true;
//     // this._handleDatePicked = this._handleDatePicked.bind(this)
//   }

//   componentWillUnmount() {
//     this.mount = false;
//   }

//   componentWillReceiveProps(props) {
//       if(!this.mount) return
//     let { defaultValue } = this.props;

//     if (defaultValue == undefined || defaultValue == null) {
//       defaultValue = new Date();
//     }

//     this.setState({
//       isDateTimePickerVisible: false,
//       selectedValue: defaultValue,
//       changedValue: defaultValue
//     });
//   }

//   getDateTimeText = dateTime => {
//     var strDateTimeText = null;
//     switch (this.props.type) {
//       case "date":
//         strDateTimeText = dateTime;
//         break;
//       case "time":
//         strDateTimeText = dateTime;
//         break;
//     }
//     return moment(strDateTimeText).format("YYYY-MM-DD HH:mm:ss");
//   };

//   _onChangeText = text => {
//     if (!this.mount) return;
//     this.setState({ input: text });

//     this.props.onChangeValue(text);
//   };

//   _showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true });

//   _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });

//   _handleDatePicked = dateTime => {
//     let { onChangeValue, type } = this.props;

//     this._hideDateTimePicker();
//     switch (type) {
//       case "date":
//         if (!onChangeValue(dateTime)) return;
//         break;
//       case "time":
//         if (!onChangeValue(dateTime)) return;
//         break;
//       default:
//         break;
//     }

//     this.setState({
//       changedValue: dateTime,
//         input: this.getDateTimeText(dateTime)
//     });
//   };

//   _renderModalPicker() {}

//   _getPickerDefault(mArray) {
//     if (mArray == undefined || mArray == null) {
//       return undefined;
//     }

//     if (mArray.length > 0) {
//       return mArray[0].label;
//     }

//     return undefined;
//   }

//   _showPicker() {
//     if (this.props != undefined && this.props != null) {
//       let {
//         containerStyle,
//         placeholder,
//         type,
//         defaultValue,
//         bRightBorder,
//         items,
//         bRightDropDown,
//         onChangeValue
//       } = this.props;

//       if (type === "picker") {
//         if (this.picker == null || this.picker == undefined) return;

//         this.picker.show();
//       }
//     }
//   }

//   placeHolderTextColor = color => {
//     return { color: color };
//   };

//   render() {
//     let { input, selectedValue, isDateTimePickerVisible } = this.state;
//     let {
//       containerStyle,
//       placeholder,
//       type,
//       defaultValue,
//       bRightBorder,
//       items,
//       bRightDropDown,

//       placeholderColor,
//       onChangeValue
//     } = this.props;

//     // let mReminder_PickerLabels = []
//     // let mReminder_PickerOptions = []

//     // if(items != null && items != undefined)
//     // {
//     // 	items.map((value, index)=>{
//     // 		mReminder_PickerOptions.push(value)
//     // 		mReminder
//     // 	})
//     // }

//     return (
//       <View
//         style={[
//           containerStyle,
//           CommonStyles.customInputCell,
//           bRightBorder ? CommonStyles.customInputRightBorder : null
//         ]}
//       >
//         <View style={CommonStyles.customInputCellInnerPart}>
//           <Text style={this.placeHolderTextColor(placeholderColor)}>
//             {placeholder}
//           </Text>
//           {type === "input" && (
//             <TextInput
//               style={[
//                 CommonStyles.customInputField,
//                 CommonStyles.customInputFieldMargin
//               ]}
//               underlineColorAndroid="transparent"
//               autoCapitalize="none"
//               multiline={false}
//               onChangeText={text => this._onChangeText(text)}
//               value={input}
//             />
//           )}
//           {type === "password" && (
//             <TextInput
//               style={[
//                 CommonStyles.customInputField,
//                 CommonStyles.customInputFieldMargin
//               ]}
//               secureTextEntry={true}
//               underlineColorAndroid="transparent"
//               autoCapitalize="none"
//               multiline={false}
//               onChangeText={text => this._onChangeText(text)}
//               value={input}
//             />
//           )}
//           {type === "email" && (
//             <TextInput
//               style={[
//                 CommonStyles.customInputField,
//                 CommonStyles.customInputFieldMargin
//               ]}
//               keyboardType="email-address"
//               underlineColorAndroid="transparent"
//               autoCapitalize="none"
//               multiline={false}
//               onChangeText={text => this._onChangeText(text)}
//               value={input}
//             />
//           )}
//           {type === "phone" && (
//             <TextInput
//               style={[
//                 CommonStyles.customInputField,
//                 CommonStyles.customInputFieldMargin
//               ]}
//               keyboardType="phone-pad"
//               underlineColorAndroid="transparent"
//               autoCapitalize="none"
//               multiline={false}
//               onChangeText={text => this._onChangeText(text)}
//               value={input}
//             />
//           )}
//           {(type === "date" || type === "time") && (
//             <TouchableOpacity
//               style={[
//                 CommonStyles.customInputField,
//                 CommonStyles.customInputPicker,
//                 bRightDropDown ? CommonStyles.customInputFieldRow : null
//               ]}
//               onPress={this._showDateTimePicker}
//             >
//               <Text style={CommonStyles.customInputFieldValue}>{input}</Text>
//               {bRightDropDown && (
//                 <Image
//                   source={imgDownArrow}
//                   style={CommonStyles.customInputFieldDropDown}
//                   resizeMode="contain"
//                 />
//               )}
//               <DateTimePicker
//                 isVisible={isDateTimePickerVisible}
//                 onConfirm={this._handleDatePicked}
//                 onCancel={this._hideDateTimePicker}
//                 mode={type}
//                 date={
//                   this.state.changedValue == null ||
//                   this.state.changedValue == undefined
//                     ? defaultValue
//                     : this.state.changedValue
//                 }
//               />
//             </TouchableOpacity>
//           )}
//           {type === "picker" && (
//             <TouchableOpacity
//               style={[
//                 CommonStyles.customInputField,
//                 CommonStyles.customInputPicker,
//                 bRightDropDown ? CommonStyles.customInputFieldRow : null
//               ]}
//               onPress={this._showPicker.bind(this)}
//             >
//               <Text
//                 style={[
//                   CommonStyles.customInputFieldVerticalCenter,
//                   bRightDropDown
//                     ? CommonStyles.customInputFieldRightDown
//                     : CommonStyles.customInputField
//                 ]}
//               >
//                 {input}
//               </Text>
//               {bRightDropDown && (
//                 <Image
//                   source={imgDownArrow}
//                   style={CommonStyles.customInputFieldDropDown}
//                   resizeMode="contain"
//                 />
//               )}
//             </TouchableOpacity>
//           )}
//           <Spacer color={placeholderColor} />
//         </View>

//         {type === "picker" && (
//           <View style={pickerSelectStyles.remind_picker_container}>
//             <SimplePicker
//               options={items}
//               labels={this.props.labels ? this.props.labels : items}
//               ref={picker => (this.picker = picker)}
//               // onValueChange={value => {
//               // 	this._onChangeText(value)
//               // }}
//               // showMask={true}
//               onSubmit={this._onChangeText}
//               style={pickerSelectStyles.remind_picker}
//               selectedValue={""}
//               cancelText={"Cancel"}
//               confirmText={"Done"}
//             />
//           </View>
//         )}
//       </View>
//     );
//   }
// }

// CustomInput.propTypes = {
//   containerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
//   placeholder: PropTypes.string,
//   type: PropTypes.string,
//   defaultValue: PropTypes.any,
//   bRightBorder: PropTypes.bool,
//   items: PropTypes.array,
//   bRightDropDown: PropTypes.bool,
//   placeholderColor: PropTypes.string,
//   onChangeValue: PropTypes.func
// };

// CustomInput.defaultProps = {
//   containerStyle: null,
//   placeholder: null,
//   type: "input",
//   defaultValue: null,
//   bRightBorder: false,
//   items: [],
//   bRightDropDown: false,
//   placeholderColor: "black",
//   onChangeValue: () => {}
// };

// CustomInput.componentName = "CustomInput";

// const pickerSelectStyles = StyleSheet.create({
//   remind_picker: {
//     height: 250
//   },

//   remind_picker_container: {
//     position: "absolute",
//     left: 0,
//     right: 0,
//     bottom: 0
//   }
// });

// /* Export Component ============================================== */
// export default CustomInput;

import React from "react";
import PropTypes from "prop-types";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image
} from "react-native";
import DateTimePicker from "react-native-modal-datetime-picker";
import _ from "lodash";
import Spacer from "../Spacer";
import CommonStyles from "../../theme/styles";
import moment from "moment";
import {
  getCustomizedDateString,
  getCustomizedTimeString,
  getCustomizedDateDefaultString
} from "../../utils";
import SimplePicker from "react-native-simple-picker";
const enumInputTypes = ["input", "date", "time", "picker"];
const imgDownArrow = require("../../assets/drop_down_arrow.png");

class CustomInput extends React.Component {
  constructor(props) {
    super(props);
    let { defaultValue, type, items } = this.props;

    var defaultInputValue = null;
    if (type === "date" || type === "time") {
      if (defaultValue == undefined || defaultValue == null) {
        defaultValue = new Date();
      }

      defaultInputValue = this.getDateTimeText(defaultValue);
    } else {
      if (defaultValue == undefined || defaultValue == null) {
        defaultValue = "";

        defaultInputValue = "";
      } else {
        defaultInputValue = defaultValue;
      }
    }

    var selectedIndex = 0;

    if (type == "picker" && items) {
      var index = _.findIndex(items, pe => pe == defaultValue);

      if (index > -1) {
        selectedIndex = index;
      }
    }

    this.state = {
      input: defaultInputValue,
      isDateTimePickerVisible: false,
      selectedValue: selectedIndex,
      changedValue: defaultValue
    };
    this.mount = true;
    // this._handleDatePicked = this._handleDatePicked.bind(this)
  }

  componentWillReceiveProps(props) {
    if (!this.mount) return;

    let { defaultValue, type, items } = props;

    var defaultInputValue = null;
    if (type === "date" || type === "time") {
      if (defaultValue == undefined || defaultValue == null) {
        defaultValue = new Date();
      }

      defaultInputValue = this.getDateTimeText(defaultValue);
    } else {
      if (defaultValue == undefined || defaultValue == null) {
        defaultValue = "";

        defaultInputValue = "";
      } else {
        defaultInputValue = defaultValue;
      }
    }

    var selectedIndex = 0;

    if (type == "picker" && items) {
      var index = _.findIndex(items, pe => pe == defaultValue);

      if (index > -1) {
        selectedIndex = index;
      }
    }

    this.setState({
      input: defaultInputValue,
      isDateTimePickerVisible: false,
      selectedValue: selectedIndex,
      changedValue: defaultValue
    });
  }

  componentWillUnmount() {
    this.mount = false;
  }

  getDateTimeText = dateTime => {
    var strDateTimeText = null;
    // console.log("From Item", dateTime)

    // console.log("Moment", moment(dateTime).format("YYYY MM DD HH:mm:ss"))
    switch (this.props.type) {
      case "date":
        strDateTimeText = getCustomizedDateDefaultString(dateTime, false);
        break;
      case "time":
        strDateTimeText = getCustomizedTimeString(dateTime);
        break;
    }
    return strDateTimeText;
  };

  _onChangeText = text => {
    if (!this.mount) return;

    let { defaultValue, type, items, labels } = this.props;

    if (type == "picker") {
      if (labels.length != 0 && items.length != 0) {
        var index = _.findIndex(items, pe => pe == text);

        this.setState({ input: labels[index] });
      } else {
        this.setState({ input: text });
      }
    } else {
      this.setState({ input: text });
    }

    this.props.onChangeValue(text);
  };

  _showDateTimePicker = () => {
    var { editable } = this.props;

    if (editable == false) {
      return;
    }
    this.setState({ isDateTimePickerVisible: true });
  };

  _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });

  _handleDatePicked = dateTime => {
    let { onChangeValue, type, editable } = this.props;

    if (editable == false) {
      return;
    }
    this._hideDateTimePicker();
    switch (type) {
      case "date":
        if (!onChangeValue(dateTime)) return;
        break;
      case "time":
        if (!onChangeValue(dateTime)) return;
        break;
      default:
        break;
    }
    this.setState({
      changedValue: dateTime,
      input: this.getDateTimeText(dateTime)
    });
  };

  _renderModalPicker() {}

  _getPickerDefault(mArray) {
    if (mArray == undefined || mArray == null) {
      return undefined;
    }

    if (mArray.length > 0) {
      return mArray[0].label;
    }

    return undefined;
  }

  _showPicker() {
    if (this.props != undefined && this.props != null) {
      let {
        containerStyle,
        placeholder,
        type,
        defaultValue,
        bRightBorder,
        items,
        bRightDropDown,
        onChangeValue,
        editable
      } = this.props;

      if (editable == false) {
        return;
      }
      if (type === "picker") {
        if (this.picker == null || this.picker == undefined) return;

        this.picker.show();
      }
    }
  }

  placeHolderTextColor = color => {
    return { color: color };
  };

  render() {
    let { input, selectedValue, isDateTimePickerVisible } = this.state;
    let {
      containerStyle,
      placeholder,
      type,
      defaultValue,
      bRightBorder,
      items,
      bRightDropDown,
      editable,
      placeholderColor,
      onChangeValue
    } = this.props;

    // let mReminder_PickerLabels = []
    // let mReminder_PickerOptions = []

    // if(items != null && items != undefined)
    // {
    // 	items.map((value, index)=>{
    // 		mReminder_PickerOptions.push(value)
    // 		mReminder
    // 	})
    // }

    return (
      <View
        style={[
          containerStyle,
          CommonStyles.customInputCell,
          bRightBorder ? CommonStyles.customInputRightBorder : null
        ]}
      >
        <View style={CommonStyles.customInputCellInnerPart}>
          <Text style={this.placeHolderTextColor(placeholderColor)}>
            {placeholder}
          </Text>
          {type === "input" && (
            <TextInput
              style={[
                CommonStyles.customInputField,
                CommonStyles.customInputFieldMargin
              ]}
              underlineColorAndroid="transparent"
              autoCapitalize="none"
              editable={editable}
              multiline={false}
              onChangeText={text => this._onChangeText(text)}
              value={input}
            />
          )}
          {type === "password" && (
            <TextInput
              style={[
                CommonStyles.customInputField,
                CommonStyles.customInputFieldMargin
              ]}
              secureTextEntry={true}
              editable={editable}
              underlineColorAndroid="transparent"
              autoCapitalize="none"
              multiline={false}
              onChangeText={text => this._onChangeText(text)}
              value={input}
            />
          )}
          {type === "email" && (
            <TextInput
              style={[
                CommonStyles.customInputField,
                CommonStyles.customInputFieldMargin
              ]}
              keyboardType="email-address"
              editable={editable}
              underlineColorAndroid="transparent"
              autoCapitalize="none"
              multiline={false}
              onChangeText={text => this._onChangeText(text)}
              value={input}
            />
          )}
          {type === "phone" && (
            <TextInput
              style={[
                CommonStyles.customInputField,
                CommonStyles.customInputFieldMargin
              ]}
              keyboardType="phone-pad"
              editable={editable}
              underlineColorAndroid="transparent"
              autoCapitalize="none"
              multiline={false}
              onChangeText={text => this._onChangeText(text)}
              value={input}
            />
          )}
          {(type === "date" || type === "time") && (
            <TouchableOpacity
              style={[
                CommonStyles.customInputField,
                CommonStyles.customInputPicker,
                bRightDropDown ? CommonStyles.customInputFieldRow : null
              ]}
              onPress={this._showDateTimePicker}
            >
              <Text style={CommonStyles.customInputFieldValue}>{input}</Text>
              {bRightDropDown && (
                <Image
                  source={imgDownArrow}
                  style={CommonStyles.customInputFieldDropDown}
                  resizeMode="contain"
                />
              )}
              <DateTimePicker
                isVisible={isDateTimePickerVisible}
                onConfirm={this._handleDatePicked}
                onCancel={this._hideDateTimePicker}
                mode={type}
                date={
                  this.state.changedValue == null ||
                  this.state.changedValue == undefined
                    ? defaultValue
                    : this.state.changedValue
                }
              />
            </TouchableOpacity>
          )}
          {type === "picker" && (
            <TouchableOpacity
              style={[
                CommonStyles.customInputField,
                CommonStyles.customInputPicker,
                bRightDropDown ? CommonStyles.customInputFieldRow : null
              ]}
              onPress={this._showPicker.bind(this)}
            >
              <Text
                style={[
                  CommonStyles.customInputFieldVerticalCenter,
                  bRightDropDown
                    ? CommonStyles.customInputFieldRightDown
                    : CommonStyles.customInputField
                ]}
              >
                {input}
              </Text>
              {bRightDropDown && (
                <Image
                  source={imgDownArrow}
                  style={CommonStyles.customInputFieldDropDown}
                  resizeMode="contain"
                />
              )}
            </TouchableOpacity>
          )}
          <Spacer />
        </View>

        {type === "picker" && (
          <View style={pickerSelectStyles.remind_picker_container}>
            <SimplePicker
              options={items}
              labels={this.props.labels ? this.props.labels : items}
              ref={picker => (this.picker = picker)}
              // onValueChange={value => {
              // 	this._onChangeText(value)
              // }}
              // showMask={true}
              onSubmit={this._onChangeText}
              style={pickerSelectStyles.remind_picker}
              initialOptionIndex={selectedValue}
              cancelText={"Cancel"}
              confirmText={"Done"}
            />
          </View>
        )}
      </View>
    );
  }
}

CustomInput.propTypes = {
  containerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  placeholder: PropTypes.string,
  type: PropTypes.string,
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  bRightBorder: PropTypes.bool,
  items: PropTypes.array,
  labels: PropTypes.array,
  bRightDropDown: PropTypes.bool,
  placeholderColor: PropTypes.string,
  onChangeValue: PropTypes.func,
  editable: PropTypes.bool
};

CustomInput.defaultProps = {
  containerStyle: null,
  placeholder: null,
  type: "input",
  defaultValue: null,
  bRightBorder: false,
  items: [],
  labels: [],
  bRightDropDown: false,
  placeholderColor: "#4e4d52",
  onChangeValue: () => {},
  editable: true
};

CustomInput.componentName = "CustomInput";

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

/* Export Component ============================================== */
export default CustomInput;
