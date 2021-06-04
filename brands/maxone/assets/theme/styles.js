/**
 * App Styles
 */
import { Platform } from "react-native";

import Colors from "./colors";
import Sizes from "./sizes";

export default {
  // Default
  container: {
    position: "relative",
    flex: 1,
    flexDirection: "column",
    height: Sizes.screen.height,
    width: Sizes.screen.width,
    backgroundColor: "#1E3869"
  },
  containerCentered: {
    justifyContent: "center",
    alignItems: "center"
  },
  windowSize: {
    height: Sizes.screen.height,
    width: Sizes.screen.width
  },

  // Aligning items
  spaceBetween: {
    alignItems: "space-between"
  },
  leftAligned: {
    alignItems: "flex-start"
  },
  centerAligned: {
    justifyContent: "center",
    alignItems: "center"
  },
  centerOnly: {
    alignItems: "center"
  },
  rightAligned: {
    alignItems: "flex-end"
  },
  leftTextAligned: {
    textAlign: "left"
  },
  centerTextAligned: {
    textAlign: "center"
  },
  rightTextAligned: {
    textAlign: "right"
  },

  justifyRight: {
    justifyContent: "flex-end"
  },

  listPadding: {
    flex: 1,
    padding: 20,
    paddingBottom: 20
  },
  listWrapperPadding: {
    padding: 20,
    paddingBottom: 0,
    paddingTop: 0
  },

  // flex
  flexRow: { flexDirection: "row" },
  flexColumn: { flexDirection: "column" },
  flex010: { flex: 1 / 10 },
  flex020: { flex: 1 / 5 },
  flex025: { flex: 1 / 4 },
  flex030: { flex: 0.3 },
  flex033: { flex: 1 / 3 },
  flex040: { flex: 0.4 },
  flex045: { flex: 0.45 },
  flex050: { flex: 1 / 2 },
  flex060: { flex: 0.6 },
  flex066: { flex: 2 / 3 },
  flex070: { flex: 0.7 },
  flex075: { flex: 3 / 4 },
  flex080: { flex: 4 / 5 },
  flex090: { flex: 9 / 10 },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  flex3: { flex: 3 },
  flex4: { flex: 4 },
  flex5: { flex: 5 },
  flex6: { flex: 6 },

  // margin
  m5: { margin: 5 },
  m10: { margin: 10 },
  m15: { margin: 15 },
  m20: { margin: 20 },
  m30: { margin: 30 },
  mt5: { marginTop: 5 },
  mt10: { marginTop: 10 },
  mt15: { marginTop: 15 },
  mt20: { marginTop: 20 },
  mt30: { marginTop: 30 },
  mr5: { marginRight: 5 },
  mr10: { marginRight: 10 },
  mr15: { marginRight: 15 },
  mr20: { marginRight: 20 },
  mr30: { marginRight: 30 },
  mb5: { marginBottom: 5 },
  mb10: { marginBottom: 10 },
  mb15: { marginBottom: 15 },
  mb20: { marginBottom: 20 },
  mb30: { marginBottom: 30 },
  ml5: { marginLeft: 5 },
  ml10: { marginLeft: 10 },
  ml15: { marginLeft: 15 },
  ml20: { marginLeft: 20 },
  ml30: { marginLeft: 30 },

  // padding
  p5: { padding: 5 },
  p10: { padding: 10 },
  p15: { padding: 15 },
  p20: { padding: 20 },
  p30: { padding: 30 },
  pt5: { paddingTop: 5 },
  pt10: { paddingTop: 10 },
  pt15: { paddingTop: 15 },
  pt20: { paddingTop: 20 },
  pt30: { paddingTop: 30 },
  pr5: { paddingRight: 5 },
  pr10: { paddingRight: 10 },
  pr15: { paddingRight: 15 },
  pr20: { paddingRight: 20 },
  pr30: { paddingRight: 30 },
  pb5: { paddingBottom: 5 },
  pb10: { paddingBottom: 10 },
  pb15: { paddingBottom: 15 },
  pb20: { paddingBottom: 20 },
  pb30: { paddingBottom: 30 },
  pl5: { paddingLeft: 5 },
  pl10: { paddingLeft: 10 },
  pl15: { paddingLeft: 15 },
  pl20: { paddingLeft: 20 },
  pl30: { paddingLeft: 30 },
  px5: { paddingHorizontal: 5 },
  px10: { paddingHorizontal: 10 },
  px15: { paddingHorizontal: 15 },
  px20: { paddingHorizontal: 20 },
  px30: { paddingHorizontal: 30 },
  py5: { paddingVertical: 5 },
  py10: { paddingVertical: 10 },
  py15: { paddingVertical: 15 },
  py20: { paddingVertical: 20 },
  py30: { paddingVertical: 30 },

  // TabBar
  tabbar: {
    backgroundColor: Colors.tabbar.background,
    borderTopColor: Colors.app.border,
    borderTopWidth: 1
  },

  // TabBar
  tabContainer: {
    flex: 1,
    alignSelf: "stretch"
    // overflow: 'visible',
  },
  tabBar: {
    backgroundColor: "transparent",
    zIndex: 99999,
    marginTop: -55
  },
  tabBarIndicator: {
    borderWidth: 1,
    height: 30,
    backgroundColor: "transparent",
    borderRadius: 30,
    borderColor: "rgba(256,256,256,0.60)",
    top: 7,
    margin: 5,
    flex: 1,
    zIndex: 9999,
    width: 84
  },
  tabBarText: {
    color: "#FFF",
    fontSize: 10,
    fontFamily: "System",
    zIndex: 9999
  },
  labelStyle: {
    borderRadius: 40,
    zIndex: 9999
  },
  tabStyle: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingRight: 8,
    paddingLeft: 8,
    zIndex: 9999
  }
};
