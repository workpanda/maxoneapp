import { StyleSheet, Platform } from "react-native";

import AppColors from "@assets/theme/colors";

import CommonColors from "./colors";
import CommonSizes from "./sizes";
import { Dimensions } from "react-native";
import { getStatusBarHeight } from "react-native-status-bar-height";
const { width: viewportWidth, height: viewportHeight } = Dimensions.get(
  "window"
);

const CommonStyles = StyleSheet.create({
  container: {
    flex: 1
  },
  imageBackground: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    alignItems: "stretch",
    width: null,
    height: null,
    backgroundColor: "rgba(0, 0, 0, 0)"
  },
  // Calendar Header Row styles
  calendarScheduleRowsContainer: {
    left: 0,
    right: 0
    // top:
    //   CommonSizes.scheduleRowHeight +
    //   CommonSizes.spacerHeight +
    //   getStatusBarHeight(true)
  },
  calendarHeaderRow: {
    backgroundColor: "#fff",
    width: "100%",
    height: CommonSizes.scheduleRowHeight,
    flexDirection: "row",
    alignItems: "center"
  },
  scheduleLeftColorShape: {
    width: 18,
    height: 0,
    borderTopWidth: 20,
    borderRightWidth: 7,
    borderRightColor: "transparent",
    borderStyle: "solid"
  },
  absoluteFullContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  },
  commonRowCenter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  calendarHeaderRowTitle: {
    color: "white",
    fontWeight: "bold"
  },
  calendarHeaderRowDownArrowContainer: {
    position: "absolute",
    right: 20,
    width: 18,
    height: 10
  },
  calendarHeaderRowDownArrowImage: {
    width: "100%",
    height: "100%"
  },
  moreDownArrowImage: {
    width: "40%",
    height: "40%"
  },
  // Event list header row
  eventListContainer: {
    width: "100%",
    backgroundColor: "white"
  },
  eventListHeaderRow: {},
  eventListHeaderRowTitle: {
    marginLeft: 30,
    fontWeight: "bold",
    fontSize: 16,
    color: "black"
  },
  eventItemRow: {
    paddingVertical: 10
  },
  eventLeftColorShape: {
    width: 8,
    height: "100%"
  },
  eventTimeValue: {
    marginLeft: 22,
    fontWeight: "bold",
    color: "black"
  },
  eventAMValue: {
    alignSelf: "flex-start",
    fontSize: 8,
    fontWeight: "bold",
    color: "black"
  },
  eventTitleValue: {
    marginLeft: 22,
    fontSize: 12,
    color: "black"
  },
  // Add event button
  addEventButtonFrame: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 40,
    height: 40,
    backgroundColor: CommonColors.calendarBackground,
    borderRadius: 20,
    overflow: "hidden"
  },
  addEventButtonTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold"
  },
  // new schedule dialog
  newScheduleDialog: {
    marginTop: 10,
    marginHorizontal: 10,
    borderRadius: 3,
    backgroundColor: "white"
  },
  newScheduleItemRow: {
    width: "100%",
    height: 50,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-around"
  },

  newScheduleCustomItem: {
    width: "100%",
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-around"
  },

  newScheduleVisibilityPicker: {
    alignSelf: "center",
    width: 150
  },
  // color picker dialog
  colorPickerModal: {
    width: 500,
    height: 500
  },
  colorPickerFrame: {
    width: 250,
    height: 250
  },
  colorPickerThumb: {
    height: CommonSizes.colorPickerThumbSize,
    width: CommonSizes.colorPickerThumbSize,
    borderRadius: CommonSizes.colorPickerThumbSize,
    borderWidth: 2
  },
  dialogBottomButon: {
    width: "100%",
    height: 40,
    backgroundColor: CommonColors.dialogButtonBackground
  },
  dialogButtonTitle: {
    color: "black",
    fontWeight: "bold"
  },
  dialogRemoveBottomButon: {
    width: "100%",
    height: 40,
    marginTop: 10
  },
  dialogRemoveButtonTitle: {
    color: CommonColors.dialogButtonBackground,
    fontWeight: "bold"
  },
  colorPickerModalButtonRow: {
    marginBottom: 150
  },
  colorPickerModalButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: CommonColors.dialogButtonBackground,
    borderRadius: 2
  },
  colorPickerModalButtonSpacing: {
    marginLeft: 20
  },
  // Custom input cell
  customInputCell: {
    flex: 1
  },
  customInputCellInnerPart: {
    padding: 5
  },
  customInputRightBorder: {
    borderRightWidth: CommonSizes.spacerHeight,
    borderRightColor: CommonColors.spacer
  },
  customInputField: {
    width: "100%",
    paddingVertical: 3

    // height: 20
  },
  customInputFieldRightDown: {
    width: "85%",
    paddingVertical: 2

    // height: 20
  },
  customInputFieldRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  customInputFieldDropDown: {
    width: 15,
    height: 15,
    marginRight: 1
  },
  customInputFieldMargin: {
    marginTop: 5
    // height: 20
  },
  customInputFieldVerticalCenter: {
    textAlignVertical: "center"
  },
  customSaveButtonMargin: {
    marginTop: 20
  },
  customInputPicker: {
    width: "100%",
    height: 40,
    alignSelf: "center",
    alignItems: "center"
  },
  customInputFieldValue: {
    textAlign: "left",
    color: "black"
  },
  // New Event window
  newEventRow: {
    flexDirection: "row",
    marginTop: 15
  },
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 4,
    color: "black",
    paddingRight: 30 // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: "blue",
    borderRadius: 8,
    color: "black",
    paddingRight: 30 // to ensure the text is never behind the icon
  },

  padding_right_5: {
    paddingRight: 5
  },
  padding_left_5: {
    paddingLeft: 5
  },
  newScheduleDialog: {
    marginTop: 90,
    marginHorizontal: 10,
    borderRadius: 3,
    backgroundColor: "white",
    overflow: "hidden"
  },
  newScheduleHeader: {
    flexDirection: "row",
    width: "100%",
    height: "100%"
  },
  newScheduleTitleContainer: {
    width: "100%",
    
    flexDirection: "row",
    height: "100%",
    justifyContent: "center",
    alignItems: "center"
  },
  newScheduleCloseContainer: {
    width: "20%",
    position: 'absolute',
    right: 0,
    flexDirection: "row",
    height: "100%",
    justifyContent: "center",
    alignItems: "center"
  },

  newScheduleTitle: {
    fontSize: 18,
    color: "black",
    fontWeight: "bold"
  },
  colorSelectFrame: {
    width: 25,
    height: 25,

    marginRight: 15,
    borderRadius: 12.5
  },
  colorClose: {
    position: "absolute",
    right: 15,
    width: 20,
    height: 20
  },
  newScheduleVisibilityPicker: {
    alignSelf: "center",
    width: 150
  },
  // new event dialog
  newEventDialog: {
    marginTop: 10,
    marginHorizontal: 10,
    borderRadius: 3,
    backgroundColor: "white"
  },
  // navigation bar style
  navBackImg: {
    tintColor: "white",
    width: 24,
    height: 24
  },
  navHeader: {
    backgroundColor: CommonColors.calendarBackground
  },
  navTitle: {
    color: "white",
    textAlign: "center",
    alignSelf: "center",
    flex: 1
  },
  emptyNavRightView: {
    width: 24
  },
  navBackContainer: {
    marginLeft: 15
  },
  background_white: {
    backgroundColor: "white"
  },
  dialogBottomButton: {
    marginTop: 70,
    width: "90%",
    height: 40,
    marginLeft: "5%",
    marginBottom: 10,
    backgroundColor: CommonColors.dialogButtonBackground
  },
  dialogConfirmButton: {
    marginTop: 20,
    width: "90%",
    height: 40,
    marginLeft: "5%",
    marginBottom: 10,
    backgroundColor: CommonColors.dialogButtonBackground
  },
  loginNavbarBackground: {
    backgroundColor: "transparent",
    shadowColor: "transparent",
    elevation: 0,
    borderBottomWidth: 0
  },
  loginNavbarTitle: {
    color: "#454545",
    textAlign: "center",
    alignSelf: "center",
    flex: 1
  },
  loginNavBackImg: {
    tintColor: "#646464",
    width: 24,
    height: 24
  },
  loginNavBackImgWhite: {
    tintColor: "#ffffff",
    width: 24,
    height: 24
  },
  athleteNavbarBackground: {
    backgroundColor: "transparent",
    shadowColor: "transparent",
    elevation: 0,
    borderBottomWidth: 0
  },
  videoLibraryNavbarBackground: {
    backgroundColor: "#222127",
    shadowColor: "transparent",
    elevation: 0,
    borderBottomWidth: 0
  },
  videoLibraryNavbarTitle: {
    color: "#ffffff",
    textAlign: "center",
    alignSelf: "center",
    flex: 1
  },
  chatNavbarBackground: {
    backgroundColor: "#222127",
    shadowColor: "transparent",
    elevation: 0,
    borderBottomWidth: 0
  },

  chatNavbarTitle: {
    color: "#ffffff",
    textAlign: "center",
    alignSelf: "center",
    flex: 1
  },

  navRightContainer: {
    marginRight: 15
  },

  chatNavBackImgWhite: {
    tintColor: "#ffffff",
    width: 24,
    height: 24
  },
  chatNavRightImgWhite: {
    tintColor: "#ffffff",
    width: 25,
    height: 7
  },
  chatNavRightAddWhite: {
    color: "#ffffff"
  },
  darkNavRightText: {
    color: "#ffffff"
  },
  lightNavbarBackground: {
    backgroundColor: "transparent",
    shadowColor: "transparent",
    elevation: 0,
    borderBottomWidth: 0
  },
  lightNavbarTitle: {
    color: "#454545",
    alignSelf: "center",
    textAlign: "center",
    flex: 1
  },
});

export default CommonStyles;
