import React, { PureComponent } from "react";
import {
  Text,
  View,
  Alert,
  Image,
  Linking,
  FlatList,
  Clipboard,
  StyleSheet,
  Dimensions,
  ScrollView,
  AsyncStorage,
  ImageBackground,
  TouchableOpacity,
  SafeAreaView
} from "react-native";
import _ from "lodash";
import Images from "@assets/images";
import { API, Auth } from "aws-amplify";
import QRCode from "react-native-qrcode";
import AppColors from "@assets/theme/colors";
import CommonStyles from "@m1/shared/theme/styles";
import FontIcon from "@m1/shared/components/FontIcon";
import CustomInput from "@m1/shared/components/Input";
import FloatingLabel from "react-native-floating-labels";
import PolygonButton from "@m1/shared/components/PolygonButton";
import { Feather } from "@expo/vector-icons";
import { Avatar, Badge, Icon, withBadge } from "react-native-elements";
import { Constants } from "expo";
const SCREEN_WIDTH = Dimensions.get("window").width;
const QR_IMAGE = require("@m1/shared/assets/qr_code.png");
var readChatTimer = -1;
export default class LinkParent extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      athleteCode: "",
      phoneNumber: "",
      showQRCode: false,
      signUpUrlForParent: ""
    };
  }

  static navigationOptions = ({ navigation }) => {
    let params = navigation.state.params;
    var unReadChatCount = 0;
    if (params && params.unReadChatCount) {
      unReadChatCount = params.unReadChatCount;
    }
    return {
      headerTitle: (
        <Image
          style={{ height: 22, width: 160 }}
          resizeMode="contain"
          source={Images.logoHeader}
        />
      ),
      headerLeft: (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginLeft: 10 }}
        >
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
      ),
      headerRight: (
        <View style={{ flexDirection: "row" }}>
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
        </View>
      )
    };
  };

  async componentDidMount() {
    var appContextString = await AsyncStorage.getItem("@M1:appContext");
    var appContext = JSON.parse(appContextString);
    var userInfo = await Auth.currentAuthenticatedUser();
    var userResponse = await this.getUserByUsername(userInfo.username);
    let athleteCode = userResponse[0].id;
    // let tenant = userResponse[0].tenant ? userResponse[0].tenant : "maxone";
    let tenant = Constants.manifest.slug;
    let signUpUrlForParent =
      tenant == "pgc"
        ? `https://pgc.gomaxone.com/signup/parent?code=${athleteCode}`
        : tenant == "osb"
        ? `https://onesoftball.gomaxone.com/signup/parent?code=${athleteCode}`
        : tenant == "vnn"
        ? `https://app.gomaxone.com/signup/parent?code=${athleteCode}` //need to replace this with real, VNN signup link
        : `https://app.gomaxone.com/signup/parent?code=${athleteCode}`;
    this.setState({
      athleteCode: athleteCode,
      signUpUrlForParent: signUpUrlForParent
    });

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
  }
  _setContent(athleteCode) {
    Clipboard.setString(athleteCode);
    alert("Copied to Clipboard");
  }

  sendMessage(message) {
    return API.post("messages", `/messages/sms`, { body: message });
  }

  getUserByUsername(username) {
    return API.get("users", `/users/username/${username}`);
  }

  componentWillUnmount() {
    clearInterval(readChatTimer);
  }

  handleOnPress = async () => {
    const { phoneNumber, signUpUrlForParent } = this.state;
    // if(!phoneNumber) return Alert.alert('Oop, please enter a guardian\'s phone number')
    // let letstrippedNumber = phoneNumber.replace(/[^0-9\.]+/g, '');
    // if(strippedNumber.match(/[^$,.\d]/)) return Alert.alert("invalid characters" )
    // if(strippedNumber.length < 10) return Alert.alert("did you forget an area code?" )
    // if(strippedNumber.length > 10) return Alert.alert("did you add too many numbers?" )

    var tenantName =
      Constants.manifest.slug === "pgc"
        ? "PGC"
        : Constants.manifest.slug === "osb"
        ? "ONE Softball"
        : "MaxOne";
    let messageToSend = `Your child has invited you to join them on the ${tenantName} App - ${signUpUrlForParent}`;

    var message = {
      type: "sms",
      message: messageToSend,
      recipients: [{ phoneNumber: phoneNumber }]
    };
    const sentMessage = await this.sendMessage(message);
    this.setState({ success: true });
    setTimeout(() => this.setState({ success: false, phoneNumber: "" }), 2000);
  };

  _onChangeGuardianNumber = value => {
    this.setState({ phoneNumber: value });
  };

  render() {
    const { athleteCode } = this.state;
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          style={styles.contentParentContainer}
          contentContainerStyle={{ paddingBottom: 50 }}
        >
          {this.state.showQRCode ? (
            <View style={styles.qr_code}>
              <TouchableOpacity
                style={{
                  marginTop: 20,
                  fontSize: 15,
                  color: "#59A7FF",
                  width: SCREEN_WIDTH,
                  height: 50
                }}
                onPress={() =>
                  this.setState({ showQRCode: !this.state.showQRCode })
                }
              >
                <Text
                  style={{ marginLeft: 15, fontSize: 20, color: "#59A7FF" }}
                >
                  Close
                </Text>
              </TouchableOpacity>
              <QRCode
                bgColor="black"
                fgColor="white"
                value={athleteCode}
                size={SCREEN_WIDTH - 80}
              />
            </View>
          ) : (
            <View style={styles.optionsContainer}>
              <View>
                <Text style={styles.styledBoldText}>
                  {`If your guardian has downloaded the app: \n`}
                </Text>
                <Text style={styles.styledText}>
                  Use a QR code or unique player code to link
                </Text>
                <View style={styles.qr_code_container}>
                  <View style={styles.qr_code_sub_container}>
                    <View
                      style={{
                        justifyContent: "center",
                        alignItems: "flex-start"
                      }}
                    >
                      <Image source={QR_IMAGE} style={styles.qr_code_image} />
                    </View>
                    <View
                      style={{
                        justifyContent: "center",
                        textAlign: "left",
                        marginLeft: 10
                      }}
                    >
                      <TouchableOpacity
                        onPress={() =>
                          this.setState({ showQRCode: !this.state.showQRCode })
                        }
                      >
                        <Text style={{ color: "#59A7FF", fontSize: 18 }}>
                          {"View QR Code >"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.styledText,
                      { marginTop: 15, marginBottom: 15, fontSize: 18 }
                    ]}
                  >
                    Unique athlete code:
                  </Text>
                  <TouchableOpacity
                    onPress={() => this._setContent(athleteCode)}
                    style={{ flexDirection: "row" }}
                  >
                    <FontIcon name="content_copy" color={"#59A7FF"} size={18} />
                    <Text
                      style={[
                        styles.styledText,
                        { color: "#59A7FF", fontSize: 18 }
                      ]}
                    >
                      {athleteCode}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              {this.state.success ? (
                <View style={styles.singleOptionContainer}>
                  <Text style={{ color: "green" }}>
                    Success, your invite was sent successfully!
                  </Text>
                </View>
              ) : (
                <View style={styles.singleOptionContainer}>
                  <Text
                    style={[styles.styledBoldText, styles.secondaryStyledText]}
                  >
                    {"If your guardian has not downloaded the app:"}
                  </Text>
                  <FloatingLabel
                    autoCapitalize={"none"}
                    keyboardType={"phone-pad"}
                    autoCorrect={false}
                    labelStyle={styles.labelInput}
                    inputStyle={styles.input}
                    style={styles.formInput}
                    value={this.state.phoneNumber}
                    onChangeText={text => this._onChangeGuardianNumber(text)}
                  >
                    {"Send a text invite"}
                  </FloatingLabel>

                  <View style={{ width: "100%" }}>
                    <PolygonButton
                      title={"Send"}
                      style={{ width: "100%" }}
                      onPress={this.handleOnPress}
                      textColor={AppColors.button.text}
                      customColor={AppColors.button.background}
                    />
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  labelInput: {
    color: AppColors.text.dark,
    fontSize: 15,
    marginLeft: 0,
    paddingLeft: 0
  },
  formInput: {
    borderBottomWidth: 1,
    borderColor: AppColors.text.dark,
    fontSize: 15
  },
  input: {
    borderWidth: 0,
    fontSize: 15,
    paddingVertical: 0,
    height: 30,
    marginLeft: 0,
    paddingLeft: 0
  },
  contentContainer: {
    flex: 1,
    marginTop: 10,
    paddingBottom: 100,
    paddingLeft: 20,
    paddingRight: 20,

    flexDirection: "column",

    backgroundColor: "white"
  },
  contentParentContainer: {
    flex: 1,
    marginTop: 10,
    paddingBottom: 100,
    paddingLeft: 20,
    paddingRight: 20,

    flexDirection: "column",

    backgroundColor: "white"
  },
  styledText: {
    fontSize: 18
  },
  styledBoldText: {
    fontSize: 18,
    fontWeight: "bold"
  },
  secondaryStyledText: {
    marginBottom: 30
  },
  optionsContainer: {
    marginTop: 20
  },
  singleOptionContainer: {
    marginTop: 40
  },
  background: {
    backgroundColor: "#DFDFDF"
  },
  qr_code_container: {
    width: "100%",
    height: 100,
    backgroundColor: "transparent",
    marginTop: 15,
    marginBottom: 15
  },
  qr_code_sub_container: {
    flexDirection: "row",
    flex: 1
  },
  qr_code: {
    alignItems: "center"
  },
  qr_code_image: {
    width: 28,
    height: 28
  },
  badge: {
    position: "absolute",
    top: -5
  }
});
