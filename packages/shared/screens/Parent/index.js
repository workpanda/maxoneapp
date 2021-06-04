import React, { Component } from "react";
import {
  AsyncStorage,
  View,
  KeyboardAvoidingView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Text,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  Alert
} from "react-native";
import _ from "lodash";
import { API } from "aws-amplify";
import Images from "@assets/images";
import AppColors from "@assets/theme/colors";
import CommonStyles from "@m1/shared/theme/styles";

import FontIcon from '@m1/shared/components/FontIcon';
import CustomInput from "@m1/shared/components/Input";
import PolygonButton from "@m1/shared/components/PolygonButton";
import { NavigationEvents } from "react-navigation";

import { Image as CacheImage } from 'react-native-expo-image-cache'

import { Constants, Linking } from 'expo';

const iconBackArrow = require("../../assets/ic_back_white.png");
const default_avatar = require("@m1/shared/assets/avatar-default.png")

class Parent extends Component {
  static navigationOptions = ({ navigation }) => {
    var onAdd = () => {};
    var bShowAddButton = true;
    let params = navigation.state.params;

    if (params && params.onAdd) {
      onAdd = params.onAdd;
    }

    if (params) {
      bShowAddButton = params.bShowAddButton;
    }
    var appContext =
      navigation.state.params && navigation.state.params.appContext
        ? navigation.state.params.appContext
        : {};
    return {
      headerTitle: (
        <Image
          style={{ height: 22, width: 160 }}
          resizeMode="contain"
          source={Images.logoHeader}
        />
      ),
      headerLeft: null,
      headerRight: bShowAddButton ? (
        <View style={{ flexDirection: "row" }}>
        {appContext.id !== "" &&
          <TouchableOpacity
            onPress={() => navigation.navigate("Conversations", { userRole: "Parent" })}
            style={CommonStyles.navRightContainer}
          >
            <FontIcon name="chat" size={20} color={"#fff"} />
          </TouchableOpacity>
        }
        </View>
      ) : null
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      loading:true,
      currentTeam: {},
      userContext: {},
      linkedAthletes:[],
      athletePhone: null,
      showAddAthlete: false
    };

    this.mount = true;
  }

  componentDidMount = async () => {
    var userContextString = await AsyncStorage.getItem("@M1:userContext");
    var appContextString = await AsyncStorage.getItem("@M1:appContext");
    var userContext = JSON.parse(userContextString);
    var appContext = JSON.parse(appContextString);
    this.setState({userContext})
    const currentTeam = _.find(
      userContext.appContextList,
      c => c.id === appContext.id
    );

    this.props.navigation.setParams({
      appContext
    });

    var linkedAthletes = await this.getLinkedAthletes(userContext.user.id, userContext)
    console.log('userId ', userContext.user.id)
    this.setState({
      loading:false,
      linkedAthletes,
      currentTeam: currentTeam,
      username: userContext.user.username,
      userContext: userContext
    });
  };

  async getLinkedAthletes(userId, userContext){
    var athleteIds = await API.get("users", `/users/${userId}/children`);
    var athletes = [];
    await this.asyncForEach(athleteIds, async a =>{
      var id = a.childId;
      var athlete = await this.getAthleteUser(id);
      var roles = await this.getAthleteRoles(id)
      athlete.teams = []
      await this.asyncForEach(roles, async role =>{
        var team = _.find(userContext.appContextList, ac => ac.id === role.parentId)
        // console.log(team)
        if(team){
          athlete.teams.push(team)
        }
      })
      athletes.push(athlete)
    })
    return athletes;
  }

  async getAthleteUser(userId){
    return API.get("users", `/users/${userId}`);
  }

  async getAthleteRoles(userId){
    return API.get("users", `/users/${userId}/roles`);
  }

  async getLinkedAthleteIds(userId){
    return API.get("users", `/users/${userId}/children`);
  }

  createGuardianLink(){
    const { userContext, athletePhone } = this.state;
    return API.post("users", `/guardian/${userContext.user.id}/athlete/${athletePhone}`);
  }

  async sendLink(appName, endpoint){
    const { userContext, athletePhone } = this.state;
    console.log('userContext ==  ', userContext)
    console.log('athletePhone == ', athletePhone)
    return API.post("users", `/guardian/${userContext.user.id}/send/sms`,
    {
      body:{
        endpoint,
        athletePhone,
        appName,
        userId: userContext.user.id,
        nameFirst: userContext.user.nameFirst,
        nameLast: userContext.user.nameLast
      }
    });
  }

  async sendGuardianAthleteLinkRequest(){
    try{
      const { userContext, athletePhone } = this.state;
      console.log('userContext ', userContext)
      console.log('athletePhone ', athletePhone)

      // const endpoint = Constants.manifest.scheme;
      const appName = Constants.manifest.name;
      const endpoint = Linking.makeUrl("/auth/login", {guardianId: userContext.user.id, nameFirst: userContext.user.nameFirst, nameLast: userContext.user.nameLast})
      console.log('endpoint ', endpoint)

      await this.sendLink(appName, endpoint)
      this.setState({athletePhone: "", showAddAthlete:false })
      alert("Successfully Sent!")
    }
    catch(e){
      console.log('Error = ', e)
    }
  }

  async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array)
    }
  }

  componentWillUnmount() {
    this.mount = false;
  }

  componentWillReceiveProps(props) {
    if (!this.mount) return;
  }

  _onChangeAthleteCode = (value) => {
    this.setState({ athletePhone: value });
  };

  handleOnPress = async () => {
    const { userContext } = this.state
    const linkedGuardian = await this.createGuardianLink()
    const linkedAthletes = await this.getLinkedAthletes(userContext.user.id, userContext)
    this.setState({linkedAthletes})
  }

  render() {
    const { showAddAthlete } = this.state
    return (
      <SafeAreaView style={CommonStyles.container}>
        <StatusBar barStyle="light-content" translucent={false} />
        <NavigationEvents onDidFocus={() => this.componentDidMount()} />
        <KeyboardAvoidingView
          behavior={Platform.OS == "android" ? undefined : "padding"}
          style={CommonStyles.container}
        >
          <View>
            {showAddAthlete &&
              <View style={styles.inputContainer}>
                <CustomInput
                  placeholderColor="#646464"
                  placeholder="Enter your athlete's phone number"
                  defaultValue={this.state.athletePhone}
                  onChangeValue={text =>
                      this._onChangeAthleteCode(text)
                  }
                />
                <PolygonButton
                    title={"Send Link Request"}
                    onPress={() => this.sendGuardianAthleteLinkRequest()}
                    textColor={AppColors.button.text}
                    customColor={AppColors.brand.gamma}
                />
              </View>
            }
            <View style={{width:"100%", alignItems:"center"}}>
              <PolygonButton title={ showAddAthlete ? 'Cancel' : 'Add Child' } customColor={ showAddAthlete ? "#D3D3D3" : AppColors.brand.gamma}
                          textColor={AppColors.button.text} onPress={() => this.setState({showAddAthlete: !showAddAthlete})}/>
            </View>
          </View>
          <View style={styles.paddingContainer}>
          {this.state.linkedAthletes.map((item, i) => (
              <TouchableOpacity
                  style={{
                      height:120,
                      justifyContent: 'flex-start',
                      paddingVertical: 20,
                      borderTopWidth: i === 0 ? 0 : 1,
                      borderColor: '#D8D8D8',
                  }}
                  key={item.id + "-" + i}
                  onPress={() => this.props.navigation.navigate("ProfileScreen", {user: item})}
              >
                  <View style={styles.avatar_container}>
                      {
                          item.avatarUrl == null &&
                          <Image style={{width: 50, height: 50}} source={default_avatar}/>
                      }

                      {
                          item.avatarUrl !== null && item.avatarUrl !== undefined && !item.avatarUrl.includes('http') && item.legacyId &&
                          <CacheImage style={styles.avatar_img}  {...{uri: "https://s3.amazonaws.com/programax-videos-production/uploads/user/avatar/" + item.legacyId + "/" + item.avatarUrl}}/>
                      }
                      {
                          item.avatarUrl !== null && item.avatarUrl !== undefined && !item.avatarUrl.includes('http') && !item.legacyId &&
                          <CacheImage style={styles.avatar_img}  {...{uri: "https://s3.amazonaws.com/programax-videos-production/uploads/user/avatar/" + item.id + "/" + item.avatarUrl}}/>
                      }
                      {
                          item.avatarUrl !== null && item.avatarUrl !== undefined && item.avatarUrl.includes('http') &&
                          <CacheImage style={styles.avatar_img} {...{uri: item.avatarUrl }}/>
                      }

                      <Text style={[styles.user_name, styles.general_text]}>{item.nameFirst} {item.nameLast}</Text>
                  </View>
                  <Text style={[styles.user_name, styles.general_text]}>{Constants.manifest.slug === 'pgc' ? `Sessions: ` : `Teams: `} {item.teams.length }</Text>
                  <View style={styles.avatar_container}>
                      {/*item.teams.map((team, t) => (
                        <View key={team.id}>
                        {
                            team.logo !== null && team.logo !== undefined && team.logo.includes('http') &&
                            <CacheImage style={{width: 25, height: 25}} {...{uri: team.logo}}/>
                        }
                        {
                            team.logo !== null && team.logo !== undefined && !team.logo.includes('http') && team.legacyId &&
                            <CacheImage style={{width: 25, height: 25, marginRight:5}} {...{uri: "https://s3.amazonaws.com/programax-videos-production/uploads/program/logo/" + team.legacyId + "/" + team.logo}}/>
                        }
                        {
                            team.logo !== null && team.logo !== undefined && !team.logo.includes('http') && !team.legacyId &&
                            <CacheImage style={{width: 25, height: 25, marginRight:5}} {...{uri: "https://s3.amazonaws.com/programax-videos-production/uploads/program/logo/" + team.id + "/" + team.logo}}/>
                        }
                        </View>
                      ))*/}
                  </View>
              </TouchableOpacity>
          ))}

          {this.state.loading && (
            <View style={styles.loading}>
              <ActivityIndicator size="large" />
            </View>
          )}
          </View>
        </KeyboardAvoidingView>
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
  toggleAddText: {
    fontSize: 13,
    fontWeight: 'bold'
  },
  inputContainer: {
    height: 130,
    marginTop: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatar_img: {
      width: 50,
      height: 50,
      backgroundColor: 'white',
      borderRadius: 14,
      marginRight:10
  },
  avatar_container: {
      flexDirection: 'row',
      alignItems:'center',
      height: 60
  },
  buttonGroupContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 35,
    height: 40
  },
  paddingContainer: {
    width: "100%",
    height: "100%",
    paddingLeft: 17,
    paddingRight: 17
  },
  firstInfo: {
    width: "100%",
    marginTop: 50
  },
  row_container: {
    flexDirection: "row",
    width: "100%"
  },
  otherInfo: {
    width: "100%",
    marginTop: 30
  }
};

const styles = StyleSheet.create(style);

export default Parent;
