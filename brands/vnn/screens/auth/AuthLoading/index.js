import React from 'react';
import { ActivityIndicator, AsyncStorage, StatusBar, View, Text } from 'react-native';
import { API, Auth } from 'aws-amplify'

export default class AuthLoading extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this._bootstrapAsync();
  }

  _bootstrapAsync = async () => {
    // await AsyncStorage.removeItem("@M1:appContext")
    // await AsyncStorage.removeItem("@M1:userContext")
    // await AsyncStorage.removeItem("@M1:userToken")
    var userToken = await this._retrieveData()
    console.log('User token ', userToken)
    if(userToken){
      try{
        var userId = userToken.signInUserSession.idToken.payload.identities[0].userId;
        console.log('userId', userId)

        var userData = await this.getUserData(userId);
        console.log('User Data', userData)
        if(userData.error){
          // SET FLAG NO USER
          console.log('NO USER DATA')
        }
        else{
          await this._storeData(JSON.stringify(userData))
          console.log('stored data')
          // This will switch to the App screen or Auth screen and this loading
          // screen will be unmounted and thrown away.
          // console.log('User Data id', userData[0].id)

          var appContext = await this._retrieveAppContext();
          var userContext = await this._retrieveUserContext();

          console.log('appContext', appContext)
          console.log('userContext', userContext)

          this.props.navigation.navigate("App", {}, {
            type: "Navigate",
            routeName: "App",
            action: {
                type: "Navigate",
                routeName: "Home",
                params: {userContext: userContext, username: userData.username, userId:userData.id, avatarUrl: userData.avatarUrl  }
            }});
        }
      }
      catch(e){
        console.log('error = ', e)
      }
    }
    else{
      this.props.navigation.navigate('AuthLogin');
    }
  };

  _storeAppContext = async appContext => {
    try {
      if (appContext !== {}) {
        await AsyncStorage.setItem(
          "@M1:appContext",
          JSON.stringify(appContext)
        );
      }
    } catch (error) {
      console.error("error in store data", error);
      // Error saving data
    }
  };
  _retrieveAppContext = async () => {
    try {
      const value = await AsyncStorage.getItem("@M1:appContext");
      if (value !== null) {
        // We have data!!
        console.log(value);
        return JSON.parse(value);
      }
    } catch (error) {
      // Error retrieving data
      console.error("error in retrieving data", error);
    }
  };
  _retrieveUserContext = async () => {
    try {
      const value = await AsyncStorage.getItem("@M1:userContext");
      if (value !== null) {
        // We have data!!
        console.log(value);
        return value;
      }
    } catch (error) {
      // Error retrieving data
      console.error("error in retrieving data", error);
    }
  };

  handleSignOut = async() => {
      console.log('Signing out')
      await Auth.signOut()
        .then(async () => {
          await AsyncStorage.removeItem('@M1:userContext');
          await AsyncStorage.removeItem('@M1:appContext');
          await AsyncStorage.removeItem('@M1:user');
          await AsyncStorage.removeItem('@M1:userToken');
          this._bootstrapAsync()
        })
        .catch(err => console.log(err));
    }


    async getUserData(userId){
      return API.get('users', `/users/vnn-${userId}`)
    }

  componentDidMount = async () => {
    console.log('Auth Loading.......')
    // await this._bootstrapAsync()
  };

  _storeData = async (userData) => {
    try {
      await AsyncStorage.setItem('@M1:user', userData[0]);
    } catch (error) {
      console.error("error in store data", error)
      // Error saving data
    }
  }

  _retrieveData = async () => {
    try {
        var value = await AsyncStorage.getItem('@M1:userToken');
        console.log('Value ==== ', value)
        if (value !== null) {
          // We have data!!
          console.log(value);
          value = JSON.parse(value)
          return value;
        }
     } catch (error) {
       // Error retrieving data
       console.error("error in retrieving data", error)

     }
  }
  render() {
    return (
      <View>
        <ActivityIndicator />
        <StatusBar barStyle="default" />
        <Text>Loading VNN... </Text>
      </View>
    );
  }
}
