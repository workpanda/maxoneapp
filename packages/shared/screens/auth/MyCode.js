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
  Platform
} from "react-native";
import CommonStyles from "@m1/shared/theme/styles";
import PolygonButton from "@m1/shared/components/PolygonButton";
import CustomInput from "@m1/shared/components/Input";
import FloatingLabel from "react-native-floating-labels";

import AppColors from "@assets/theme/colors";
import { Feather } from "@expo/vector-icons";

import { API } from "aws-amplify"

const INPUT_INVITECODE = 1;

class MyCode extends Component {
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
      error: ""
    };

    this.mount = true;
  }

  componentWillUnmount() {
    this.mount = false;
  }

  componentWillReceiveProps(props) {
    if (!this.mount) return;
  }

  _onChangeInputValue = (value, key) => {
    if (!this.mount) return false;
    this.setState({error: ""})
    switch (key) {
      case INPUT_INVITECODE:
        this.setState({ inviteCode: value });
        break;
    }
    return true;
  };

  getTeamByInviteCode = async(inviteCode)  => {
    this.setState({error: ""})
    var type = this.props.navigation.state.params.type;
    console.log('type = ', type)
    console.log('inviteCode = ', inviteCode)
    var team = null;
    if(type === "coach"){
      try{
        team = await this.getByCoachCode(inviteCode)
      }
      catch(e){
        console.log('Error === ', e)
        this.setState({error: "We are experiencing a connectivity issue.  Please check your internet connection and try again."})
      }
      console.log('team ', team)
      if(!team || team.length === 0){
        // try checking if its an athlete code.
        var athleteTeam = await this.getByPlayerCode(inviteCode)
        if(!athleteTeam || athleteTeam.length === 0){
          this.setState({error: "Sorry, we couldn't find a team with that code.  Please try again."})
        }
        else{
          this.setState({error: "Whoops. Looks like you're trying to use an athlete code."})
        }
      }
      else{
        this.props.navigation.navigate("AuthCoachSignup", {team: team[0]})
      }
    }
    else{
      try{
        team = await this.getByPlayerCode(inviteCode)
      }
      catch(e){
        console.log('Error === ', e)
        this.setState({error: "We are experiencing a connectivity issue.  Please check your internet connection and try again."})
      }
      console.log('team ', team)
      if(!team || team.length === 0){
        // try checking if its a coach code.
        var coachTeam = await this.getByCoachCode(inviteCode)
        if(!coachTeam || coachTeam.length === 0){
          this.setState({error: "Sorry, we couldn't find a team with that code.  Please try again."})
        }
        else{
          this.setState({error: "Whoops. Looks like you're trying to use a coach code."})
        }      }
      else{
        this.props.navigation.navigate("AuthAthleteSignup", {team: team[0]})
      }
    }
  }

  async getByPlayerCode(inviteCode){
    return API.get('programs', `/programs/playerCode/${inviteCode}`);
  }
  async getByCoachCode(inviteCode){
    return API.get('programs', `/programs/coachCode/${inviteCode}`);
  }

  render() {
    return (
      <SafeAreaView style={CommonStyles.container}>
        <StatusBar barStyle="dark-content" translucent={false} />
        <KeyboardAvoidingView
          behavior={Platform.OS == "android" ? undefined : "padding"}
          style={CommonStyles.container}
        >
          <View style={styles.paddingContainer}>
              {
                this.state.error
                ?
                <Text style={{color:'red'}}> {this.state.error} </Text>
                :
                null
              }
              <FloatingLabel
                autoCapitalize={'none'}
                autoCorrect={false}
                labelStyle={styles.labelInput}
                inputStyle={styles.input}
                style={styles.formInput}
                value={this.state.username}
                onChangeText={text => this._onChangeInputValue(text, INPUT_INVITECODE)}
                multiline
              >
                {"Invite Code"}
              </FloatingLabel>
            <View style={styles.buttonGroupContainer}>
              <PolygonButton
                title={"SUBMIT"}
                onPress={()=> this.getTeamByInviteCode(this.state.inviteCode)}
                customColor={AppColors.brand.alpha}
                textColor={AppColors.button.text}
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
    paddingLeft: 0,
    fontSize: 15
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
  buttonGroupContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: '100%',
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

export default MyCode;
