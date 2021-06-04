import React from "react";
import PropTypes from "prop-types";

import {
  AsyncStorage,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  StatusBar,
  WebView,
  ScrollView,
  ActivityIndicator
} from "react-native";

import { API } from "aws-amplify";
import _ from "lodash";
import QRCode from "react-native-qrcode";
import ActionButton from "react-native-action-button";
import AppColors from "@assets/theme/colors";
import { withNavigation } from "react-navigation";
import RostersCommonListItem from "@m1/shared/components/RostersCommonListItem";
import Spacer from "@m1/shared/components/Spacer";
import { Constants } from "expo";
import { map } from "rsvp";
import ContextService from "@m1/shared/services/context";

import { NavigationEvents } from "react-navigation";

const contextService = new ContextService();
const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const QR_IMAGE = require("@m1/shared/assets/qr_code.png");

var items = [];
class Athletes extends React.Component {
  constructor(props) {
    super(props);

    this.mount = true;
    var { athletes } = props;

    items = athletes;
    this.state = {
      username: "",
      currentTeam: {},
      loading: false,
      showQRCode: false,
      appContext:{}
    };
  }

  componentWillUnmount() {
    this.mount = false;
  }

  hideQrCode() {
    this.setState({ showQRCode: false });
  }

  async getAthletes(id) {
    return API.get("programs", `/programs/${id}/players`);
  }

  componentDidMount = async () => {
    this.setState({ loading: true });
    this.mount = true;

    setTimeout(async () => {
      var userContextString = await AsyncStorage.getItem("@M1:userContext");
      var appContextString = await AsyncStorage.getItem("@M1:appContext");
      var userContext = JSON.parse(userContextString);
      var appContext = JSON.parse(appContextString);

      this.setState({ username: userContext.user.username, appContext });

      const currentTeam = _.find(
        userContext.appContextList,
        c => c.id === appContext.id
      );

      this.setState({ currentTeam: currentTeam });

      this.setState({ loading: false });
    }, 500);
  };

  componentWillReceiveProps(props) {
    var { athletes } = props;
    this.setState({ loading: true });
    items = athletes;
    this.setState({ loading: false });
  }

  async checkAppContextChanged() {
    var appContextString = await AsyncStorage.getItem("@M1:appContext");
    var appContext = JSON.parse(appContextString);

    if (this.state.appContext && appContext !== this.state.appContext) {
      await this.componentDidMount();
    }
  }

  render() {
    let { addNewAthlete } = this.props;
    return (
      <SafeAreaView style={styles.topContainer}>
        <StatusBar barStyle="light-content" translucent={false} />
        <NavigationEvents onDidFocus={() => this.checkAppContextChanged()} />
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
              <Text style={{ marginLeft: 15, fontSize: 20, color: "#59A7FF" }}>
                Close
              </Text>
            </TouchableOpacity>

            <View style={{ marginTop: 10 }}>
              <Text style={{ marginTop: 15, marginBottom: 15 }}>
                Or use this code: {this.state.currentTeam.playerCode}
              </Text>
            </View>
            <QRCode
              value={this.state.currentTeam.playerCode}
              size={SCREEN_WIDTH - 80}
              bgColor="black"
              fgColor="white"
            />
          </View>
        ) : (
          <ScrollView style={[styles.top_parent, styles.background]}>
            {(!this.state.appContext.isStaff || (this.state.appContext.isStaff && contextService.isStaffPermitted(this.state.currentTeam, 'canInviteUsers'))) && Constants.manifest.slug !== "vnn" ?
            <View style={styles.qr_code_container}>
              <View style={styles.qr_code_sub_container}>
                <View
                  style={{ justifyContent: "center", alignItems: "center" }}
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
                  <Text>{"Quickly add players to your program"}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      this.setState({ showQRCode: !this.state.showQRCode })
                    }
                  >
                    <Text style={{ color: "#59A7FF", fontSize: 18 }}>
                      {"View QR Code >"}
                    </Text>
                  </TouchableOpacity>
                  <Text style={{ marginTop: 3 }}>
                    or use this code: {this.state.currentTeam.playerCode}
                  </Text>
                </View>
              </View>
            </View>
            : null
          }
            <Spacer />
            {items &&
              items.map((item, index) => {
                return (
                  <RostersCommonListItem
                    bChecked={true}
                    bShowCheckBox={true}
                    key={item.id}
                    data={item}
                    showToggle={false}
                  />
                );
              })}
          </ScrollView>
        )}
        {this.state.loading && (
          <View style={styles.loading}>
            <ActivityIndicator size="large" />
          </View>
        )}
        {!this.state.showQRCode && (!this.state.appContext.isStaff || this.state.appContext.isStaff && contextService.isStaffPermitted(this.state.currentTeam, 'canInviteUsers')) ? (
          <ActionButton
            buttonColor={AppColors.brand.orange}
            onPress={() => {
              addNewAthlete();
            }}
          />
        ) : null}
      </SafeAreaView>
    );
  }
}

let style = {
  loading: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000000000
  },
  top_parent: {
    width: "100%",
    height: "100%"
  },
  background: {
    backgroundColor: "#DFDFDF"
  },
  qr_code_container: {
    width: "100%",
    height: 90,
    backgroundColor: "transparent"
  },
  qr_code_sub_container: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "center"
  },
  qr_code: {
    justifyContent: "center",
    alignItems: "center"
  },
  qr_code_image: {
    width: 28,
    height: 28
  }
};

const styles = StyleSheet.create(style);

export default withNavigation(Athletes);

Athletes.propTypes = {
  athletes: PropTypes.array
};

Athletes.defaultProps = {
  athletes: []
};
