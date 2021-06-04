import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import {
  AsyncStorage,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  StatusBar,
  ActivityIndicator
} from "react-native";
import { Image as CacheImage } from "react-native-expo-image-cache";
import _cloneDeep from "lodash.clonedeep";
import { SearchBar } from "react-native-elements";
import Spacer from "@m1/shared/components/Spacer";
import CommonStyles from "@m1/shared/theme/styles";
import { getUserAndConversations } from "./graphql";
import { observer } from "mobx-react";
import { graphql, compose } from "react-apollo";
import { NavigationEvents } from "react-navigation";
import { Avatar, Badge, Icon, withBadge } from "react-native-elements";

const PREFIX_TITLE = "# ";
var readChatTimer = -1;
const ConversationsObserver = observer(
  class Conversations extends React.Component {
    static navigationOptions = ({ navigation }) => {
      var params = navigation;
      var unReadChat = [];
      var nBadgeCount = 0;
      var appContext =
        navigation.state.params && navigation.state.params.appContext
          ? navigation.state.params.appContext
          : {};

      if (navigation.state.params && navigation.state.params.unReadChat) {
        unReadChat = navigation.state.params.unReadChat;

        nBadgeCount = unReadChat.length;
      }
      return {
        title: "Chat",
        headerLeft:
          navigation &&
          navigation.state &&
          navigation.state.params &&
          navigation.state.params.currentTeam ? (
            <TouchableOpacity
              style={[styles.avatar_img, { marginLeft: 15 }]}
              onPress={() => {
                navigation.navigate("ChatSelectView");
              }}
            >
              {navigation.state.params.currentTeam.logo &&
                navigation.state.params.currentTeam.logo !== null &&
                navigation.state.params.currentTeam.logo !== undefined &&
                navigation.state.params.currentTeam.logo.includes("http") && (
                  <CacheImage
                    style={styles.avatar_img}
                    {...{
                      uri: navigation.state.params.currentTeam.logo
                    }}
                  />
                )}

              {navigation.state.params.currentTeam.logo &&
                navigation.state.params.currentTeam.logo !== null &&
                navigation.state.params.currentTeam.logo !== undefined &&
                !navigation.state.params.currentTeam.logo.includes("http") && (
                  <CacheImage
                    style={styles.avatar_img}
                    {...{
                      uri: `https://s3.amazonaws.com/programax-videos-production/uploads/program/logo/${navigation.state.params.currentTeam.legacyId}/${navigation.state.params.currentTeam.logo}`
                    }}
                  />
                )}

              {navigation.state.params.currentTeam.logo == null ||
                (navigation.state.params.currentTeam.logo == undefined && (
                  <CacheImage
                    style={styles.avatar_img}
                    {...{
                      uri: ""
                    }}
                  />
                ))}

              {nBadgeCount > 0 && (
                <Badge
                  value={nBadgeCount}
                  status="error"
                  containerStyle={{ position: "absolute", top: -5, right: -5 }}
                />
              )}
            </TouchableOpacity>
          ) : null,
        headerRight:
          appContext.isCoach ||
          appContext.isOwner ||
          appContext.isHeadCoach ||
          appContext.isStaff ? (
            <TouchableOpacity
              style={CommonStyles.navRightContainer}
              onPress={() =>
                navigation.navigate("AddNewConversation", {
                  userId: navigation.state.params.userId,
                  currentTeam: navigation.state.params.currentTeam,
                  currentTeamId: navigation.state.params.currentTeam.id
                })
              }
            >
              <Text style={{ color: "white" }}>Add</Text>
            </TouchableOpacity>
          ) : null
      };
    };

    constructor(props) {
      super(props);

      this.state = {
        search: "",
        filteredGroupList: [],
        loading: true,
        unReadChat: []
      };

      this.mount = true;
    }

    async componentWillMount() {
      var { conversations } = this.props;

      clearInterval(readChatTimer);
      this.setState({ loading: true });
      var userContext = null;
      var userContext = null;
      var userContextString = await AsyncStorage.getItem("@M1:userContext");
      var appContextString = await AsyncStorage.getItem("@M1:appContext");
      var unReadChat = await AsyncStorage.getItem("unReadMessageCount");
      if (userContextString !== null) {
        userContext = JSON.parse(userContextString);
      }
      if (appContextString !== null) {
        appContext = JSON.parse(appContextString);
      }
      var currentTeam = _.find(
        userContext.appContextList,
        c => c.id === appContext.id
      );
      this.props.navigation.setParams({
        userId: userContext.user.id,
        user: userContext.user,
        appContext: appContext,
        appContextId: appContext.id,
        currentTeam
      });

      if (unReadChat) {
        var totalCount = JSON.parse(unReadChat);
        this.props.navigation.setParams({
          unReadChat: totalCount
        });

        this.setState({ unReadChat: totalCount });
      }

      readChatTimer = setInterval(async () => {
        if (!this.mount) return;
        var unReadChat = await AsyncStorage.getItem("unReadMessageCount");

        if (unReadChat) {
          var totalCount = JSON.parse(unReadChat);

          this.props.navigation.setParams({
            unReadChat: totalCount
          });
          this.setState({ unReadChat: totalCount });
        }
      }, 1000);

      var removedEmpties = _.filter(conversations, item => item.conversation);
      if (this.props.navigation.getParam("removedConversation", null)) {
        var foundConversation = _.findIndex(removedEmpties, function(item) {
          return (
            item.conversation.id ===
            this.props.navigation.getParam("removedConversation")
          );
        });

        if (foundConversation) {
          removedEmpties.splice(foundConversation, 1);
        }
      }
      var filteredConversations = _.filter(
        removedEmpties,
        item => item.conversation.teamId === appContext.id
      );

      if (filteredConversations) {
        this.setState({
          filteredGroupList: this.getFilteredArray(
            filteredConversations,
            this.state.search.trim()
          )
        });
      }

      await this.props.data.refetch();
      this.props.data.startPolling(1);

      this.setState({ loading: false });
    }

    getFilteredArray = (arrList, filter) => {
      if (filter === "") {
        return arrList;
      }

      if (arrList) {
        return arrList.filter(function(item) {
          return item.conversation.name
            ? item.conversation.name
                .toLowerCase()
                .includes(filter.toLowerCase())
            : "";
        });
      } else {
        return [];
      }
    };

    componentWillUnmount() {
      this.mount = false;

      clearInterval(readChatTimer);
    }

    componentWillReceiveProps(props) {
      if (!this.mount) return;
      var { conversations } = props;

      var removedEmpties = _.filter(
        conversations,
        item => item.status !== "DELETED"
      );
      removedEmpties = _.filter(removedEmpties, item => item.conversation);

      if (props.navigation.getParam("removedConversation", null)) {
        var foundConversation = _.findIndex(removedEmpties, function(item) {
          return (
            item.conversation.id ==
            props.navigation.getParam("removedConversation")
          );
        });

        if (foundConversation) {
          removedEmpties.splice(foundConversation, 1);
        }
      }
      var appContextId = props.navigation.state.params.appContext.id;

      var filteredConversations = _.filter(
        removedEmpties,
        item =>
          item.conversation.teamId ===
          props.navigation.state.params.appContext.id
      );

      if (filteredConversations && filteredConversations.length != 0) {
        this.setState({
          filteredGroupList: this.getFilteredArray(
            filteredConversations,
            this.state.search.trim()
          )
        });
      } else {
        this.setState({
          filteredGroupList: []
        });
      }
    }

    updateSearch = search => {
      this.setState({ search: search });
      var { conversations } = this.props;
      var removedEmpties = _.filter(conversations, item => item.conversation);
      if (this.props.navigation.getParam("removedConversation", null)) {
        var foundConversation = _.findIndex(removedEmpties, function(item) {
          return (
            item.conversation.id ==
            this.props.navigation.getParam("removedConversation")
          );
        });

        if (foundConversation) {
          removedEmpties.splice(foundConversation, 1);
        }
      }
      var filteredConversations = _.filter(
        removedEmpties,
        item =>
          item.conversation.teamId ===
          this.props.navigation.state.params.appContext.id
      );
      if (filteredConversations && filteredConversations.length != 0) {
        this.setState({
          filteredGroupList: this.getFilteredArray(
            filteredConversations,
            this.state.search.trim()
          )
        });
      }
    };

    onItemClick = item => {
      this.props.navigation.navigate("Conversation", {
        conversation: item,
        userId: this.props.navigation.state.params.userId,
        currentTeam: this.props.navigation.state.params.currentTeam
      });
    };

    onClick = () => {
      return;
    };

    _renderItem = ({ item, index }) => {
      var badgeCount = _.filter(
        this.state.unReadChat,
        pe => pe.messageConversationId == item.conversation.id
      ).length;
      return (
        <View>
          <View style={{ paddingTop: 24, paddingBottom: 24 }}>
            <TouchableOpacity
              style={[styles.chat_group_item, styles.background]}
              onPress={() => this.onItemClick(item)}
            >
              <Text style={styles.group_title}>
                {item && item.conversation && item.conversation.name
                  ? PREFIX_TITLE + item.conversation.name
                  : PREFIX_TITLE + " "}
              </Text>
              {badgeCount > 0 && <Badge value={badgeCount} status="error" />}

              {
                //   <Image
                //   source={chat_group_right_arrow}
                //   style={styles.chat_group_right_arrow}
                // />
              }
            </TouchableOpacity>
          </View>
          {index < this.state.filteredGroupList.length - 1 && <Spacer />}
        </View>
      );
    };

    cancelTimer() {
      clearInterval(readChatTimer);
    }
    render() {
      return (
        <SafeAreaView style={styles.container_background}>
          <NavigationEvents
            onDidFocus={() => this.componentWillMount()}
            onDidBlur={() => this.cancelTimer()}
          />
          <StatusBar barStyle="light-content" translucent={false} />
          <SearchBar
            platform="android"
            placeholder="Search"
            value={this.state.search}
            onChangeText={this.updateSearch}
            style={{ width: "100%", backgroundColor: "white" }}
            cancelButtonProps={{ disabled: true }}
            cancelButtonTitle={""}
            icon={{ name: "search" }}
            cancelIcon={{ name: "search" }}
            leftIconContainerStyle={{
              paddingLeft: 15,
              paddingRight: 0,
              marginRight: 0,
              width: 35,
              height: 35
            }}
          />

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
          ) : this.state.filteredGroupList.length !== 0 ? (
            <FlatList
              data={this.state.filteredGroupList}
              renderItem={this._renderItem}
              numColumns={1}
              keyExtractor={item =>
                item.conversation.id + item.conversation.createdAt
              }
              style={[styles.whiteBackground, styles.flatList]}
              horizontal={false}
            />
          ) : (
            <Text style={{ marginTop: 10, marginLeft: 10 }}>
              No Conversations
            </Text>
          )}
        </SafeAreaView>
      );
    }
  }
);

const ConversationsWithData = compose(
  graphql(getUserAndConversations, {
    skip: props => !props.navigation.getParam("userId", null),
    options: props => {
      return {
        variables: {
          id: props.navigation.getParam("userId", null)
        },
        fetchPolicy: "network-only"
      };
    },
    props: props => {
      
        var items = props.data.getUser
          ? _.orderBy(
              props.data.getUser.userConversations.items,
              "conversation.name",
              "asc"
            )
          : [];
        // _.forEach(items, item => item && item.conversation ? console.log('ID === ', item.conversation.id, 'Name === ', item.conversation.name) : null)
        return {
          data: props.data,
          conversations:
            props.data.getUser && props.data.getUser.userConversations.items
              ? _.orderBy(
                  props.data.getUser.userConversations.items,
                  "conversation.name",
                  "asc"
                )
              : []
        };

      
    }
  })
)(ConversationsObserver);

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
    paddingLeft: 30,
    paddingRight: 30,
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
    color: "#454545"
  },
  chat_group_right_arrow: {
    width: 6,
    height: 10
  },
  chat_group_item: {
    flexDirection: "row",
    width: "100%",
    height: 19,
    justifyContent: "space-between",
    alignItems: "center"
  },
  avatar_img: {
    width: 28,
    height: 28,
    backgroundColor: "white"
  }
};

const styles = StyleSheet.create(style);

export default ConversationsWithData;
