/**
 * Button
 *
    <Button title='My Button' spacingTop={0} spacingBottom={16} onPress={} />
 *
 */

import PropTypes from "prop-types";
import React, { Component } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableNativeFeedback,
  TouchableOpacity,
  ActivityIndicator,
  Platform
} from "react-native";

import { AppSizes, AppFonts, AppColors } from "@assets/theme";

const log = () => {
  /* eslint-disable no-console */
  console.log("Please attach a method to this component");
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 1
  },
  disabled: {
    // grey from designmodo.github.io/Flat-UI/
    backgroundColor: "#D1D5D8"
  },
  title: {
    // ...AppFonts.openSans.semiBold,
    backgroundColor: "transparent",
    color: "white",
    fontSize: 14,
    textAlign: "center",
    padding: 15,
    fontWeight: "600"
  },
  disabledTitle: {
    color: "#F3F4F5"
  },
  iconContainer: {
    marginHorizontal: 5
  }
});

class Button extends Component {
  render() {
    const {
      TouchableComponent,
      backgroundColor,
      textColor,
      fontWeight,
      containerStyle,
      onPress,
      buttonStyle,
      transparent,
      title,
      titleProps,
      titleStyle,
      disabled,
      disabledBackground,
      disabledText,
      disabledStyle,
      disabledTitleStyle,
      spacingTop,
      spacingBottom,
      loading,
      selected,
      selectedBackground,
      selectedText,
      isRound,
      outlined,
      ...attributes
    } = this.props;

    if (
      Platform.OS === "android" &&
      (buttonStyle.borderRadius && !attributes.background)
    ) {
      if (Platform.VERSION >= 21) {
        attributes.background = TouchableNativeFeedback.Ripple(
          "ThemeAttrAndroid",
          true
        );
      } else {
        attributes.background = TouchableNativeFeedback.SelectableBackground();
      }
    }

    return (
      <View style={[containerStyle]}>
        <TouchableComponent
          {...attributes}
          onPress={loading ? null : onPress}
          underlayColor={transparent ? "transparent" : undefined}
          activeOpacity={transparent ? 0 : undefined}
          disabled={disabled}
        >
          <View
            style={[
              styles.button,
              buttonStyle,
              backgroundColor && { backgroundColor },
              isRound && { borderRadius: AppSizes.borderRadius },
              disabled && styles.disabled,
              disabled && disabledStyle,
              disabled &&
                disabledBackground && { backgroundColor: disabledBackground },
              selected &&
                selectedBackground && { backgroundColor: selectedBackground },
              transparent && { backgroundColor: "transparent", elevation: 0 },
              outlined && {
                borderWidth: 1,
                backgroundColor: "transparent",
                borderColor: backgroundColor
              },
              { marginTop: spacingTop, marginBottom: spacingBottom }
            ]}
          >
            {loading ? (
              <View style={{ height: 33, margin: 8, justifyContent: "center" }}>
                <ActivityIndicator
                  size="small"
                  color={backgroundColor === "#fff" ? "black" : "white"}
                />
              </View>
            ) : (
              title && (
                <Text
                  style={[
                    styles.title,
                    titleStyle,
                    fontWeight && { fontWeight },
                    transparent && { color: backgroundColor },
                    textColor && { color: textColor },
                    disabled && styles.disabledTitle,
                    disabled && disabledTitleStyle,
                    disabled && disabledText && { color: disabledText },
                    selected && selectedText && { color: selectedText }
                  ]}
                  {...titleProps}
                >
                  {title}
                </Text>
              )
            )}
          </View>
        </TouchableComponent>
      </View>
    );
  }
}

Button.propTypes = {
  title: PropTypes.string,
  outlined: PropTypes.bool,
  backgroundColor: PropTypes.string,
  textColor: PropTypes.string,
  titleStyle: Text.propTypes.style,
  titleProps: PropTypes.object,
  buttonStyle: PropTypes.any,
  transparent: PropTypes.bool,
  onPress: PropTypes.any,
  containerStyle: PropTypes.any,
  TouchableComponent: PropTypes.any,
  disabled: PropTypes.bool,
  isRound: PropTypes.bool,
  disabledStyle: PropTypes.any,
  disabledTitleStyle: Text.propTypes.style,
  spacingTop: PropTypes.number,
  spacingBottom: PropTypes.number
};

Button.defaultProps = {
  title: "New Button",
  outlined: false,
  TouchableComponent:
    Platform.OS === "ios" ? TouchableOpacity : TouchableNativeFeedback,
  onPress: log,
  transparent: false,
  buttonStyle: {
    // borderRadius: AppSizes.borderRadius,
  },
  spacingTop: 10,
  spacingBottom: 0,
  disabled: false,
  backgroundColor: AppColors.brand.alpha,
  isRound: true
};

/* Export Component ==================================================================== */
export default Button;
