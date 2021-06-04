import React from "react";
import _ from "lodash";
import {
  AsyncStorage,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  StyleSheet,
  StatusBar,
  ActivityIndicator
} from "react-native";
import { Image as CacheImage } from "react-native-expo-image-cache";
import _cloneDeep from "lodash.clonedeep";
import Spacer from "@m1/shared/components/Spacer";
import CommonStyles from "@m1/shared/theme/styles";
import ContextService from "@m1/shared/services/context";
import { Avatar, Badge, Icon, withBadge } from "react-native-elements";
import { Feather } from "@expo/vector-icons";
var readChatTimer = -1;

class ChatSelectView extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: "Chat",
      headerLeft: (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginLeft: 10 }}
        >
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
      ),
      headerRight: null
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      unReadChat: [],
      currentTeam: {},
      appContextList: [],
      userContext: {}
    };

    this.mount = true;
  }

  async componentDidMount() {
    clearInterval(readChatTimer);

    var appContextString = await AsyncStorage.getItem("@M1:appContext");
    var unReadChat = await AsyncStorage.getItem("unReadMessageCount");
    var userContext = await this._retrieveUserContext();
    if (appContextString !== null) {
      appContext = JSON.parse(appContextString);
    }
    var currentTeam = _.find(
      userContext.appContextList,
      c => c.id === appContext.id
    );

    if (unReadChat) {
      var totalCount = JSON.parse(unReadChat);
      this.props.navigation.setParams({
        unReadChat: totalCount
      });

      this.setState({ unReadChat: totalCount, currentTeam });
    }

    readChatTimer = setInterval(async () => {
      var unReadChat = await AsyncStorage.getItem("unReadMessageCount");

      if (unReadChat) {
        var totalCount = JSON.parse(unReadChat);

        this.props.navigation.setParams({
          unReadChat: totalCount
        });
        this.setState({ unReadChat: totalCount });
      }
    }, 1000);

    var appContextList = userContext.appContextList
      ? _.filter(userContext.appContextList, a => {
          if (a.id === appContext.id) {
            return false;
          }

          return a.isTeam;
        })
      : [];

      appContextList = appContextList.map((item, index) => {
        item.flatIndex = index;

        return item;
      });
      
    var idList = _.uniq(_.map(appContextList, r => r.id));

    idList.filter((item, index) => idList.indexOf(item) === index);

    var itemList = [];

    for(var i = 0; i < idList.length; i ++ ) {
        var index = _.findIndex(appContextList, pe => pe.id == idList[i]);

        if(index > -1) {
            itemList.push(appContextList[index]);
        }
    }
    
    this.setState({ appContextList: itemList, userContext });
    this.setState({ loading: false });
  }

  componentWillUnmount() {
    this.mount = false;

    clearInterval(readChatTimer);
  }

  componentWillReceiveProps(props) {
    
  }

  onItemClick = item => {
    // this.props.navigation.navigate("Conversation", {
    //   conversation: item,
    //   userId: this.props.navigation.state.params.userId,
    //   currentTeam: this.props.navigation.state.params.currentTeam
    // });
  };

  onClick = () => {
    return;
  };

  _retrieveUserContext = async () => {
    try {
      const value = await AsyncStorage.getItem("@M1:userContext");
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

  changeAppContext = async newAppContextId => {
    const contextService = new ContextService();

    const newAppContext = await contextService.changeAppContext(
      this.state.userContext,
      newAppContextId
    );
    appContext = newAppContext;
    var currentTeam = _.find(
      this.state.userContext.appContextList,
      a => a.id === appContext.id
    );
    var appContextList = this.state.userContext.appContextList
      ? _.filter(this.state.userContext.appContextList, a => {
          if (a.id === appContext.id) {
            return false;
          }

          return a.isTeam;
        })
      : [];

      
    this.setState({
      appContext,
      appContextList,
      showTeamSwitcher: false,
      currentTeam
    });

    this.props.navigation.setParams({currentTeam: currentTeam});
    
    await this._storeAppContext(appContext);
  };

  _renderItem = ({ item, index }) => {
    var badgeCount = _.filter(this.state.unReadChat, pe => pe.teamId == item.id)
      .length;
    return (
      <View>
        <TouchableOpacity
          style={{
            alignItems: "center",
            justifyContent: "center",
            height: 60
          }}
          onPress={() => {
            this.changeAppContext(item.id);
          }}
        >
          <View style={[styles.chat_group_item]}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <CacheImage
                style={[
                  styles.avatar_img,
                  { borderWidth: 1, borderColor: "#454545" }
                ]}
                {...{
                  uri:
                    item.logo &&
                    item.logo !== null &&
                    item.logo !== undefined &&
                    item.logo.includes("http")
                      ? item.logo
                      : item.logo &&
                        item.logo !== null &&
                        item.logo !== undefined &&
                        !item.logo.includes("http")
                      ? `https://s3.amazonaws.com/programax-videos-production/uploads/program/logo/${
                          item.legacyId
                        }/${item.logo}`
                      : ""
                }}
              />
              <Text style={styles.group_title}>
                {item && item.customName
                  ? item.customName
                  : item.name + " " + item.sport}
              </Text>
            </View>

            {badgeCount > 0 && <Badge value={badgeCount} status="error" />}
          </View>
        </TouchableOpacity>

        {index < this.state.appContextList.length - 1 && <Spacer />}
      </View>
    );
  };

  render() {
    var badgeCount = _.filter(
      this.state.unReadChat,
      pe => pe.teamId == this.state.currentTeam.id
    ).length;
    var logoPath = this.state.currentTeam.logo;
    return (
      <SafeAreaView style={styles.container_background}>
        <StatusBar barStyle="light-content" translucent={false} />

        {this.state.loading ? (
          <View
            style={{
              height: "100%",
              justifyContent: "center",
              width: "100%",
              alignItems: "center",
              top: 0,
              left: 0,
              position: "absolute"
            }}
          >
            <ActivityIndicator size="large" color={"black"} />
          </View>
        ) : (
          <View
            style={{ width: "100%", height: "100%", flexDirection: "column" }}
          >
            <View
              style={[
                {
                  width: "100%",
                  marginBottom: 10,
                  paddingLeft: 17,
                  paddingRight: 17,
                  height: 60
                },
                styles.background
              ]}
            >
              <TouchableOpacity
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  height: 60
                }}
              >
                <View style={[styles.chat_group_item]}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center"
                    }}
                  >
                    <Text>{"Current:"}</Text>
                    {logoPath &&
                      logoPath !== null &&
                      logoPath !== undefined &&
                      logoPath.includes("http") && (
                        <CacheImage
                          style={[
                            styles.avatar_img,
                            {
                              marginLeft: 10,
                              borderWidth: 1,
                              borderColor: "#454545"
                            }
                          ]}
                          {...{
                            uri: logoPath
                          }}
                        />
                      )}
                    {logoPath &&
                      logoPath !== null &&
                      logoPath !== undefined &&
                      !logoPath.includes("http") && (
                        <CacheImage
                          style={[
                            styles.avatar_img,
                            {
                              marginLeft: 10,
                              borderWidth: 1,
                              borderColor: "#454545"
                            }
                          ]}
                          {...{
                            uri: `https://s3.amazonaws.com/programax-videos-production/uploads/program/logo/${
                              this.state.currentTeam.legacyId
                            }/${logoPath}`
                          }}
                        />
                      )}

                    {(logoPath == null ||
                      logoPath == undefined ||
                      logoPath == "") && (
                      <CacheImage
                        style={[
                          styles.avatar_img,
                          {
                            marginLeft: 10,
                            borderWidth: 1,
                            borderColor: "#454545"
                          }
                        ]}
                        {...{
                          uri: ""
                        }}
                      />
                    )}

                    <Text style={styles.group_title}>
                      {this.state.currentTeam &&
                      this.state.currentTeam.customName
                        ? this.state.currentTeam.customName
                        : this.state.currentTeam.name +
                          " " +
                          this.state.currentTeam.sport}
                    </Text>
                  </View>

                  {badgeCount > 0 && (
                    <Badge value={badgeCount} status="error" />
                  )}
                </View>
              </TouchableOpacity>
            </View>
            {this.state.appContextList &&
              this.state.appContextList.length > 0 && (
                <FlatList
                  data={this.state.appContextList}
                  renderItem={this._renderItem}
                  numColumns={1}
                  keyExtractor={(item, index) => item.id + item.coachCode + item.name + item.flatIndex + (item.sport ? item.sport : '')}
                  style={[styles.whiteBackground, styles.flatList]}
                  horizontal={false}
                />
              )}
          </View>
        )}
      </SafeAreaView>
    );
  }
}
let style = {
  container_background: {
    // backgroundColor: '#DFDFDF',
    backgroundColor: "#DFDFDF",
    height: "100%"
  },
  background: {
    // backgroundColor: '#DFDFDF',
    backgroundColor: "white"
  },
  whiteBackground: {
    backgroundColor: "white"
  },
  flatList: {
    marginTop: 10,
    paddingLeft: 17,
    paddingRight: 17,
    paddingTop: 6
  },
  itemLeft: {
    marginLeft: 5,
    marginTop: 5,
    marginBottom: 5,
    marginRight: 1
  },
  itemRight: {
    marginLeft: 1,
    marginTop: 5,
    marginBottom: 5,
    marginRight: 5
  },
  group_title: {
    fontSize: 14,
    color: "#454545",
    marginLeft: 10
  },
  chat_group_right_arrow: {
    width: 6,
    height: 10
  },
  chat_group_item: {
    flexDirection: "row",
    width: "100%",

    justifyContent: "space-between",
    alignItems: "center"
  },
  avatar_img: {
    width: 30,
    height: 30,
    backgroundColor: "white"
  }
};

const styles = StyleSheet.create(style);

export default ChatSelectView;
