import React from "react";
import PropTypes from "prop-types";
import {
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image
} from "react-native";

import AppColors from "@assets/theme/colors";

class PolygonButton extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillUnmount() {}

  renderTitle = (title, styledFont, textColor, loading) => {
    if (loading) return <ActivityIndicator color="white" />;
    if (styledFont)
      return <Text style={this.getLabelCSS(textColor)}>{title}</Text>;
    return <Text style={this.getLabelCSS(textColor)}>{title}</Text>;
  };

  getIconContainerDiagonalEdgeLeft = color => {
    return {
      width: 0,
      height: 0,
      backgroundColor: "transparent",
      borderStyle: "solid",
      borderBottomWidth: 50,
      borderLeftWidth: 15,
      borderRightColor: color,
      borderLeftColor: "transparent",
      zIndex: 4,
      borderRightWidth: 1,
      borderBottomColor: color
    };
  };

  getIconContainerDiagonalEdgeRight = color => {
    return {
      width: 0,
      height: 0,

      backgroundColor: "transparent",
      borderBottomWidth: 0,
      borderTopWidth: 50,
      borderTopColor: color,
      borderLeftWidth: 1,
      borderRightWidth: 15,
      borderLeftColor: color,
      zIndex: 4,
      borderRightColor: "transparent"
    };
  };

  getDoneContainerCSS = color => {
    return {
      height: 50,
      borderRightWidth: 0,
      borderLeftWidth: 0,
      flexDirection: "row",
      alignItems: "center",
      borderRightColor: color,
      borderLeftColor: color,
      justifyContent: "center",
      flex: 1,
      zIndex: 3,
      backgroundColor: color
    };
  };

  getLabelCSS = color => {
    return {
      position: "relative",
      fontSize: 15,
      zIndex: 10,
      marginLeft: 0,
      color: color
      // fontFamily: 'montserrat-bold',
    };
  };

  render() {
    const {
      title,
      icon,
      onPress,
      styledFont,
      style,
      disabled,
      customColor,
      textColor,
      stackContent,
      loading
    } = this.props;

    return (
      <TouchableOpacity
        disabled={disabled}
        onPress={onPress}
        style={buttonStyles.button}
      >
        <View style={this.getIconContainerDiagonalEdgeLeft(customColor)} />

        <View style={this.getDoneContainerCSS(customColor)}>
          {icon && <Image source={icon} style={btnStyles.iconStyle} />}
          {this.renderTitle(title, styledFont, textColor, loading)}
        </View>
        <View style={this.getIconContainerDiagonalEdgeRight(customColor)} />
      </TouchableOpacity>
    );
  }
}

PolygonButton.propTypes = {
  title: PropTypes.string,
  icon: PropTypes.any,
  styledFont: PropTypes.any,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  customColor: PropTypes.string,
  disabled: PropTypes.bool,
  stackContent: PropTypes.any,
  textColor: PropTypes.string,
  onPress: PropTypes.func
};

PolygonButton.defaultProps = {
  title: "",
  icon: null,
  styledFont: null,
  style: null,
  disabled: false,
  customColor: "white",
  stackContent: null,
  textColor: "#454545",
  onPress: () => {}
};

PolygonButton.componentName = "PolygonButton";

let btnStyles = {
  button: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 15,
    height: 50
  },
  iconContainerDiagonalEdge: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderBottomWidth: 50,
    borderLeftWidth: 15,
    borderLeftColor: "transparent",
    zIndex: 4,
    borderBottomColor: AppColors.button.background
  },
  labelContainer: {
    height: 90,
    borderRightWidth: 1,
    flexDirection: "row",
    padding: 10,
    paddingLeft: 30,
    paddingRight: 30,
    alignItems: "center",
    zIndex: 3
  },
  doneContainer: {
    height: 50,
    borderRightWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 220,
    zIndex: 3,
    backgroundColor: AppColors.button.background
  },
  label: {
    position: "relative",
    fontSize: 15,
    zIndex: 10,
    marginLeft: 0,
    color: AppColors.button.text
    // fontFamily: 'montserrat-bold',
  },

  diagonalEdgeLeft: {},
  diagonalEdgeRight: {
    //position: 'relative',
    right: 1,
    backgroundColor: "transparent",
    borderBottomWidth: 0,
    borderBottomWidth: 0,
    borderTopWidth: 50,
    borderTopColor: AppColors.button.background,
    borderLeftWidth: 0,
    borderRightWidth: 15,
    borderRightColor: "transparent"
  },
  iconStyle: {
    resizeMode: "contain",
    height: 22
  }
};

const buttonStyles = StyleSheet.create(btnStyles);

/* Export Component ============================================== */
export default PolygonButton;
