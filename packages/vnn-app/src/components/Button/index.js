import React from "react";
import PropTypes from "prop-types";
import { View } from "react-native";

import { AppColors } from "@assets/theme";
import SharedButton from "@m1/shared/components/Button";

const Button = ({ buttonColor, textColor, outlined, ...props }) => {
  if (outlined) {
    textColor = AppColors.brand.alpha;
  }

  return (
    <SharedButton
      backgroundColor={buttonColor}
      textColor={textColor}
      outlined={outlined}
      {...props}
    />
  );
};

Button.propTypes = {
  buttonColor: PropTypes.string,
  textColor: PropTypes.string,
  outlined: PropTypes.bool
};

Button.defaultProps = {
  title: "New Button",
  buttonColor: AppColors.brand.alpha,
  textColor: "#454545",
  outlined: false
};

export default Button;
