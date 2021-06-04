import React, { Component } from "react";
import {
  View,
  KeyboardAvoidingView,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Text,
  Platform,
  Vibration,
  AsyncStorage
} from "react-native";
import { Constants } from "expo";
import ContextService from "@m1/shared/services/context";

import CommonStyles from "@m1/shared/theme/styles";
import PolygonButton from "@m1/shared/components/PolygonButton";
import CustomInput from "@m1/shared/components/Input";
import FloatingLabel from "react-native-floating-labels";

import AppColors from "@assets/theme/colors";
import { Feather } from "@expo/vector-icons";

import { API } from "aws-amplify";

const INPUT_INVITECODE = 1;

class AddTeamCode extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: "INVITE CODE",
    headerStyle: CommonStyles.lightNavbarBackground,
    headerTitleStyle: CommonStyles.lightNavbarTitle,
    headerLeft: (
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={CommonStyles.navBackContainer}
      >
        <Feather name="arrow-left" size={24} color="#454545" />
      </TouchableOpacity>
    ),
    headerRight: <View />
  });

  constructor(props) {
    super(props);

    this.state = {
      invite_code: "",
      error: "",
      isScanned: false
    };

    this.mount = true;

    console.log("Hi", "Hello world");

    console.log("props.navigation.state.params.type", props.navigation.state.params.type);
  }

  componentWillUnmount() {
    this.mount = false;
  }

  componentWillReceiveProps(props) {
    if (!this.mount) return;
  }

  _onChangeInputValue = (value, key) => {
    if (!this.mount) return false;
    this.setState({ error: "" });
    switch (key) {
      case INPUT_INVITECODE:
        this.setState({ inviteCode: value });
        break;
    }
    return true;
  };

  getTeamByInviteCode = async inviteCode => {
    this.setState({ error: "" });
    var type = this.props.navigation.state.params.type;
    var team = null;

    try {
      if (type === "coach") {
        team = await this.getByCoachCode(inviteCode);
      } else {
        team = await this.getByPlayerCode(inviteCode);
      }
    } catch (e) {
      console.log("Error === ", e);
      this.setState({
        error:
          "We are experiencing a connectivity issue.  Please check your internet connection and try again."
      });
    }

    if (!team || team.length === 0) {
      // try checking if its an athlete code.
      var checkTeam = null;

      if (type === "coach") {
        checkTeam = await this.getByPlayerCode(inviteCode);
      } else {
        checkTeam = await this.getByCoachCode(inviteCode);
      }

      if (!checkTeam || checkTeam.length === 0) {
        this.setState({
          error:
            "Sorry, we couldn't find a team with that code.  Please try again."
        });
      } else {
        this.setState({
          error: `Whoops. Looks like you're trying to use an ${
            type === "coach" ? "athlete" : "coach"
          } code.`
        });
      }
    } else {
      Vibration.vibrate(100);
      this.setState({ isScanned: true });
      var userContextString = await AsyncStorage.getItem("@M1:userContext");
      var userContext = JSON.parse(userContextString);
      var user = userContext.user;
      await this.createRole(team[0], user);
      alert(
        `Successfully added to team: ${
          team[0].customName ? team[0].customName : team[0].name
        }`
      );

      // get updated userContext\
      await this.setSessionInfo(user.username);

      this.props.navigation.push("ProfileEditScreen");
    }
  };

  async createRole(team, user) {
    var type = this.props.navigation.state.params.type;
    var role = {
      parentId: team.id,
      role: type,
      isTeam: true,
      tenant: Constants.manifest.slug
    };
    console.log("role ", role);

    return API.post("users", `/users/${user.id}/roles`, { body: role });
  }

  async getByPlayerCode(inviteCode) {
    return API.get("programs", `/programs/playerCode/${inviteCode}`);
  }
  async getByCoachCode(inviteCode) {
    return API.get("programs", `/programs/coachCode/${inviteCode}`);
  }

  _storeUserContext = async userContext => {
    try {
      if (userContext !== {}) {
        await AsyncStorage.setItem(
          "@M1:userContext",
          JSON.stringify(userContext)
        );
      }
    } catch (error) {
      console.error("error in store data", error);
      // Error saving data
    }
  };

  setSessionInfo = async username => {
    const contextService = new ContextService();
    var { userContext, appContext } = await contextService.buildUserContext(
      username
    );
    console.log("USER CONTEXT =====``= ", userContext);
    await this._storeUserContext(userContext);
    return { user: userContext.user };
  };

  render() {
    return (
      <SafeAreaView style={CommonStyles.container}>
        <StatusBar barStyle="dark-content" translucent={false} />
        <KeyboardAvoidingView
          behavior={Platform.OS == "android" ? undefined : "padding"}
          style={CommonStyles.container}
        >
          <View style={styles.paddingContainer}>
            {this.state.error ? (
              <Text style={{ color: "red" }}> {this.state.error} </Text>
            ) : null}
            <FloatingLabel
              autoCapitalize={"none"}
              autoCorrect={false}
              labelStyle={styles.labelInput}
              inputStyle={styles.input}
              style={styles.formInput}
              value={this.state.username}
              onChangeText={text =>
                this._onChangeInputValue(text, INPUT_INVITECODE)
              }
              multiline
            >
              {"Invite Code"}
            </FloatingLabel>
            <View style={styles.buttonGroupContainer}>
              <PolygonButton
                title={"SUBMIT"}
                onPress={() => this.getTeamByInviteCode(this.state.inviteCode)}
                customColor={AppColors.brand.alpha}
                textColor={AppColors.text.white}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
}

let style = {
  labelInput: {
    color: AppColors.text.dark,
    marginLeft: 0,
    paddingLeft: 0
  },
  formInput: {
    borderBottomWidth: 1,
    borderColor: AppColors.text.dark
  },
  input: {
    borderWidth: 0,
    fontSize: 15,
    paddingVertical: 0,
    height: 30,
    marginLeft: 0,
    paddingLeft: 0
  },
  buttonGroupContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100
  },
  paddingContainer: {
    width: "100%",
    height: "100%",
    paddingLeft: 17,
    paddingRight: 17
  },
  inviteInfo: {
    width: "100%",
    marginTop: 50
  },

  invite_container: {
    flexDirection: "row",
    width: "100%"
  }
};

const styles = StyleSheet.create(style);

export default AddTeamCode;
