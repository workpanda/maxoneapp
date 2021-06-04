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
import FloatingLabel from "react-native-floating-labels";
import AppColors from "@assets/theme/colors";

const iconBackArrow = require("@m1/shared/assets/ic_back_dark.png");

import { API, Auth } from "aws-amplify"

const INPUT_INVITECODE = 1;

class ConfirmUser extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: "CONFIRM",
    headerStyle: CommonStyles.lightNavbarBackground,
    headerTitleStyle: CommonStyles.lightNavbarTitle,
    headerLeft: (
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={CommonStyles.navBackContainer}
      >
        <Image
          source={iconBackArrow}
          style={CommonStyles.lightNavBackImg}
          resizeMode="contain"
        />
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

  componentDidMount(){
    const { navigation } = this.props;
    var currentTeam = navigation.state.params.team;
    var user = navigation.state.params.user;
    this.setState({currentTeam, user})
  }

  async cognitoConfirmSignUp(username, confirmationCode){
      return await Auth.confirmSignUp(username, confirmationCode);
  }

  submit = async() =>{
    this.setState({loading:true})
    try{
      await this.cognitoConfirmSignUp(this.state.user.username, this.state.confirmationCode)
      this.props.navigation.navigate('AuthLogin', {isFromSignup: true})
    }
    catch(e){
      alert(e)
      this.setState({loading: false})
    }

  }

  _onChangeInputValue = (value, key) => {
    if (!this.mount) return false;
    this.setState({error: ""})
    switch (key) {
      case INPUT_INVITECODE:
        this.setState({ confirmationCode: value });
        break;
    }
    return true;
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
              {
                this.state.error
                ?
                <Text style={{color:'red'}}> {this.state.error} </Text>
                :
                null
              }
              <Text style={{ fontSize: 15, marginTop:15, marginBottom:15 }}>Please enter the confirmation code you were just texted.</Text>
              <FloatingLabel
                autoCapitalize={'none'}
                autoCorrect={false}
                type="phone"
                labelStyle={styles.labelInput}
                inputStyle={styles.input}
                style={styles.formInput}
                value={this.state.confirmationCode}
                onChangeText={text => this._onChangeInputValue(text, INPUT_INVITECODE)}
                multiline
              >
                {"Confirmation Code"}
              </FloatingLabel>
            <View style={styles.buttonGroupContainer}>
              <PolygonButton
                title={"SUBMIT"}
                onPress={()=> this.submit()}
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
    paddingLeft: 0
  },
  formInput: {
    borderBottomWidth: 1,
    borderColor: AppColors.text.dark,
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
    marginLeft: 20,
    marginRight: 20,
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

export default ConfirmUser;
