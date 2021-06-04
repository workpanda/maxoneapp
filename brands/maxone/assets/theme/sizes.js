/**
 * App Theme - Sizes
 */

import { Dimensions, Platform } from "react-native";

const { width, height } = Dimensions.get("window");
const screenHeight = width < height ? height : width;
const screenWidth = width < height ? width : height;

const loadingHeight = 13;
const loadingPadding = 6;

export default {
  // Window Dimensions
  screen: {
    height: screenHeight,
    width: screenWidth,

    widthHalf: screenWidth * 0.5,
    widthThird: screenWidth * 0.333,
    widthTwoThirds: screenWidth * 0.666,
    widthQuarter: screenWidth * 0.25,
    widthThreeQuarters: screenWidth * 0.75
  },
  navbarHeight: Platform.OS === "ios" ? 64 : 51,
  statusBarHeight: Platform.OS === "ios" ? 16 : 0,
  tabbarHeight: 51,

  padding: 20,
  paddingSml: 10,

  borderRadius: 30,
  loading: {
    height: loadingHeight,
    padding: loadingPadding
  },

  lineNum: row => {
    return row * loadingHeight + loadingPadding * row;
  }
};
