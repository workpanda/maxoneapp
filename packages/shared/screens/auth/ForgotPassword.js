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

const INPUT_USERNAME = 1;
const INPUT_CONFIRMATION_CODE = 2;
const INPUT_PASSWORD = 3;

class ForgotPassword extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: "FORGOT PASSWORD",
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
      error: "",
      username: "",
      password:"",
      confirmationCode:"",
      getUsername: true
    };

    this.mount = true;
  }

  componentWillUnmount() {
    this.mount = false;
  }

  componentWillReceiveProps(props) {
    if (!this.mount) return;
  }

  async confirmNewPassword(username, confirmationCode, password){
      return await Auth.forgotPasswordSubmit(
          username,
          confirmationCode,
          password
        )
          .then(data => {
            console.log("Forgot password submitted ", data);
            this.props.navigation.navigate('AuthLogin', {message: "Password was successfully changed!"})
          })
          .catch(e => this.setState({error: e && e.message ? e.message : e}));;
  }

  async forgotPassword(){
    return await Auth.forgotPassword(this.state.username)
      .then(data => {
        this.setState({getUsername: false})
        console.log("data --- ", data);
        this.setState({
          delivery: data.CodeDeliveryDetails,
          username: this.state.username,
          message: `\n We sent via ${data.CodeDeliveryDetails.DeliveryMedium} to: ${
            data.CodeDeliveryDetails.Destination
          } with a code to reset your password.`
        });
      })
      .catch(e => this.setState({error: e && e.message ? e.message : e}));
  }

  submit = async() =>{
    this.setState({loading:true})
    try{
      await this.confirmNewPassword(this.state.username, this.state.confirmationCode, this.state.password)
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
      case INPUT_USERNAME:
        this.setState({ username: value });
        break;
      case INPUT_CONFIRMATION_CODE:
        this.setState({ confirmationCode: value });
        break;
      case INPUT_PASSWORD:
        this.setState({ password: value });
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
        {
          this.state.error
          ?
          <Text style={{color:'red'}}> {this.state.error} </Text>
          :
          null
        }
        {
          this.state.getUsername
          ?
          <View style={styles.paddingContainer}>
              <Text style={{ fontSize: 15, marginTop:15, marginBottom:15 }}>Please enter your username.</Text>
              <FloatingLabel
                autoCapitalize={'none'}
                autoCorrect={false}
                type="phone"
                labelStyle={styles.labelInput}
                inputStyle={styles.input}
                style={styles.formInput}
                value={this.state.username}
                onChangeText={text => this._onChangeInputValue(text, INPUT_USERNAME)}
                multiline
              >
                {"Username"}
              </FloatingLabel>
            <View style={styles.buttonGroupContainer}>
              <PolygonButton
                title={"SUBMIT"}
                onPress={()=> this.forgotPassword()}
                customColor={AppColors.brand.alpha}
              />
            </View>
          </View>
          :
          <View style={styles.paddingContainer}>
              <Text style={{ fontSize: 15, marginTop:15, marginBottom:15 }}>{this.state.message}</Text>
              <FloatingLabel
                autoCapitalize={'none'}
                autoCorrect={false}
                type="phone"
                labelStyle={styles.labelInput}
                inputStyle={styles.input}
                style={styles.formInput}
                value={this.state.confirmationCode}
                onChangeText={text => this._onChangeInputValue(text, INPUT_CONFIRMATION_CODE)}
              >
                {"Confirmation Code"}
              </FloatingLabel>
              <FloatingLabel
                autoCapitalize={'none'}
                autoCorrect={false}
                labelStyle={styles.labelInput}
                inputStyle={styles.input}
                style={styles.formInput}
                value={this.state.password}
                onChangeText={text => this._onChangeInputValue(text, INPUT_PASSWORD)}
                password
              >
                {"New Password"}
              </FloatingLabel>
            <View style={styles.buttonGroupContainer}>
              <PolygonButton
                title={"SUBMIT"}
                onPress={()=> this.submit()}
                customColor={AppColors.brand.alpha}
              />
            </View>
          </View>
        }
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

export default ForgotPassword;
