import React from "react";
import PropTypes from "prop-types";
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Image,
  Alert,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  AsyncStorage
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { SearchBar } from "react-native-elements";
import Spacer from "@m1/shared/components/Spacer";
import CommonStyles from "@m1/shared/theme/styles";
import { TextInput } from "react-native-gesture-handler";
import GroupList from "@m1/shared/components/GroupList";
import { API, Auth, graphqlOperation } from "aws-amplify";
import _ from "lodash";
import {
  createConvo,
  createConvoLink,
  updateConvoLink,
  getConversation,
  getUserAndConversations
} from "./graphql";
import { observer } from "mobx-react";
import uuid from "uuid/v4";
import moment from "moment";
import { graphql, compose } from "react-apollo";

const convoList = {};

var groupData = [
  {
    id: 1,
    groupTitle: "Athletes",
    selected: false,
    listData: []
  },
  {
    id: 2,
    groupTitle: "Coaches",
    selected: false,
    listData: []
  },
  {
    id: 3,
    groupTitle: "Parents",
    selected: false,
    listData: []
  }
];

class UpdateConversation extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: "Edit Conversation",
      // headerLeft: null,
      headerLeft: (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginLeft: 10 }}
        >
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
      ),
      headerRight: (
        <TouchableOpacity
          style={CommonStyles.navRightContainer}
          onPress={() => navigation.state.params.updateConversation()}
        >
          <Text style={{ color: "white" }}>Save</Text>
        </TouchableOpacity>
      )
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      search: "",
      group_title: "",
      filteredGroupList: [],
      loading: true,
      currentTeam: {}
    };

    this.mount = true;
  }

  async componentWillMount() {
    try {
      const { navigation } = this.props;

      var userContext = null;
      var userContext = null;
      var userContextString = await AsyncStorage.getItem("@M1:userContext");
      var appContextString = await AsyncStorage.getItem("@M1:appContext");

      groupData[0].selected = false;
      groupData[1].selected = false;
      groupData[2].selected = false;

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

      this.setState({ currentTeam });

      const athletes = await this.getAthletes(currentTeam);
      const coaches = await this.getCoaches(currentTeam);
      const guardians = await this.getGuardians(currentTeam);

      let params = navigation.state.params;

      let conversation = this.props.navigation.state.params.conversation;

      if (conversation && conversation.conversation) {
        this.setState({ group_title: conversation.conversation.name });
      }

      groupData[0].listData = athletes.map((athlete, index) => {
        athlete.itemIndex = index + 1;

        if (athlete) {
          if (athlete.avatarUrl && !athlete.avatarUrl.includes("http")) {
            athlete.avatarUrl = `https://s3.amazonaws.com/programax-videos-production/uploads/user/avatar/${
              athlete.legacyId ? athlete.legacyId : athlete.id
            }/${athlete.avatarUrl}`;
          }

          if (athlete.id == this.props.navigation.state.params.userId) {
            athlete.selected = true;
          } else {
            if (
              conversation &&
              conversation.conversation &&
              conversation.conversation.associated &&
              conversation.conversation.associated.items
            ) {
              let item = _.find(
                conversation.conversation.associated.items,
                pe =>
                  pe.convoLinkUserId == athlete.id && pe.status !== "DELETED"
              );

              if (item) {
                athlete.selected = true;
              }
            }
          }
        }

        return athlete;
      });

      const athleteUnSelected = _.filter(
        groupData[0].listData,
        pe => pe.selected == false || !pe.selected 
      );

    
      if (
        groupData[0].listData &&
        groupData[0].listData.length > 0 &&
        athleteUnSelected.length == 0
      ) {
        groupData[0].selected = true;
      }

      groupData[1].listData = coaches.map((coach, index) => {
        coach.itemIndex = index + 1;

        if (coach) {
          if (coach.avatarUrl && !coach.avatarUrl.includes("http")) {
            coach.avatarUrl = `https://s3.amazonaws.com/programax-videos-production/uploads/user/avatar/${
              coach.legacyId ? coach.legacyId : coach.id
            }/${coach.avatarUrl}`;
          }
          if (coach.id == this.props.navigation.state.params.userId) {
            coach.selected = true;
          } else {
            if (
              conversation &&
              conversation.conversation &&
              conversation.conversation.associated &&
              conversation.conversation.associated.items
            ) {
              let item = _.find(
                conversation.conversation.associated.items,
                pe => pe.convoLinkUserId == coach.id && pe.status !== "DELETED"
              );

              if (item) {
                coach.selected = true;
              }
            }
          }
        }

        return coach;
      });

      const coachUnSelected = _.filter(
        groupData[1].listData,
        pe => pe.selected == false || !pe.selected 
      );

      if (
        groupData[1].listData &&
        groupData[1].listData.length > 0 &&
        coachUnSelected.length == 0
      ) {
        groupData[1].selected = true;
      }

      groupData[2].listData = guardians.map((guardian, index) => {
        guardian.itemIndex = index + 1;

        if (guardian) {
          if (guardian.avatarUrl && !guardian.avatarUrl.includes("http")) {
            guardian.avatarUrl = `https://s3.amazonaws.com/programax-videos-production/uploads/user/avatar/${
              guardian.legacyId ? guardian.legacyId : guardian.id
            }/${guardian.avatarUrl}`;
          }
        }

        if (guardian.id == this.props.navigation.state.params.userId) {
          guardian.selected = true;
        } else {
          if (
            conversation &&
            conversation.conversation &&
            conversation.conversation.associated &&
            conversation.conversation.associated.items
          ) {
            let item = _.find(
              conversation.conversation.associated.items,
              pe => pe.convoLinkUserId == guardian.id && pe.status !== "DELETED"
            );

            if (item) {
              guardian.selected = true;
            }
          }
        }

        return guardian;
      });

      const parentUnSelected = _.filter(
        groupData[2].listData,
        pe => pe.selected == false || !pe.selected 
      );

      if (
        groupData[2].listData &&
        groupData[2].listData.length > 0 &&
        parentUnSelected.length == 0
      ) {
        groupData[2].selected = true;
      }

      navigation.setParams({ ...params, updateConversation: this.updateConvo });

      if (groupData && groupData.length != 0) {
        this.setState({
          filteredGroupList: this.getFilteredArray(
            groupData,
            this.state.search.trim()
          )
        });
      }
      this.setState({ loading: false });
    } catch (e) {
      console.log("Error Add New Conversation - ", e);
    }
    this.setState({ loading: false });
  }

  getFilteredArray = (arrList, search) => {
    if (search === "") {
      return arrList;
    }

    if (arrList) {
      let arrResult = [];
      arrList.forEach(element => {
        let result = element.listData.filter(obj => {
          var strFullName = obj.nameFirst + " " + obj.nameLast;
          return strFullName.toLowerCase().includes(search.toLowerCase());
        });

        if (result && result.length > 0) {
          var cloneObj = Object.assign({}, element, {});

          arrResult.push(cloneObj);

          arrResult[arrResult.length - 1].listData = result;
        }
      });
      return arrResult;
    } else {
      return [];
    }
  };

  componentWillUnmount() {
    this.mount = false;
  }

  componentWillReceiveProps(props) {
    if (!this.mount) return;
  }
  updateSearch = search => {
    this.setState({ search: search });

    if (groupData && groupData.length != 0) {
      this.setState({
        filteredGroupList: this.getFilteredArray(groupData, search.trim())
      });
    }
  };

  getConversation = async conversationId => {
    return API.get("chat", `/conversation/${conversationId}`);
  };

  editConversation = async (conversationId, data) => {
    return API.put("chat", `/conversation/${conversationId}`, { body: data });
  };

  onItemClick = item => {};

  updateConvo = async () => {
    try {
      var conversation = await this.updateConversation();
    } catch (e) {
      console.log("error ", e);
    }
  };

  convoLinkRemoveMember = (userId, conversationId, groupName) => {
    return API.del(
      "chat",
      `/convolinkRemoveMember/${userId}/conversation/${conversationId}/${groupName}`
    );
  };

  convoLinkAddMember = (userId, conversationId, data) => {
    return API.put(
      "chat",
      `/convolinkAddMember/${userId}/conversation/${conversationId}`,
      { body: data }
    );
  };

  updateConversation = async () => {
    const conversationName = this.state.group_title;

    if (conversationName.trim() == "") {
      Alert.alert("Error", "Please input Conversation Name.");

      return;
    }

    var users = [];
    var userData = { items: [] };
    _.forEach(groupData, group => {
      _.forEach(group.listData, user => {
        if (user.selected) {
          users.push(user.id);
          userData.items.push(user);
        }
      });
    });

    if (userData.items.length < 2) {
      Alert.alert("Error", "You need to select a user at least.");
      return;
    }

    this.setState({ loading: true });

    let conversation = this.props.navigation.state.params.conversation;

    if (
      conversation &&
      conversation.conversation &&
      conversation.conversation.associated &&
      conversation.conversation.associated.items
    ) {
      var items = [];
      var deletedItems = [];
      var newItems = [];
      let oldIdArray = _.uniq(
        _.map(
          _.filter(
            conversation.conversation.associated.items,
            pe => pe.status !== "DELETED"
          ),
          r => r.convoLinkUserId
        )
      );
      var newIdArray = _.uniq(_.map(userData.items, r => r.id));

      items = items.concat(oldIdArray);
      items = items.concat(newIdArray);

      items = items.filter((item, pos) => {
        return items.indexOf(item) == pos;
      });

      for (var i = 0; i < items.length; i++) {
        if (newIdArray.indexOf(items[i]) == -1) {
          deletedItems.push(items[i]);
        }

        if (oldIdArray.indexOf(items[i]) == -1) {
          newItems.push(items[i]);
        }
      }

      let conversationInfo = await this.getConversation(
        conversation.conversation.id
      );

      var updateConversationInfo = Object.assign({}, conversationInfo);

      updateConversationInfo.name = conversationName.trim();
      //   updateConversationInfo.updatedAt = Date.now();

      let updateConversation = await this.editConversation(
        conversation.conversation.id,
        updateConversationInfo
      );

      var data = {};

      data.name = conversationName;

      await Promise.all(
        deletedItems.map(async item => {
          var deleteFlag = await this.convoLinkRemoveMember(
            item,
            conversation.conversation.id,
            conversationName
          );

          
        })
      );

      await Promise.all(
        newIdArray.map(async item => {
          var addFlag = await this.convoLinkAddMember(
            item,
            conversation.conversation.id,
            data
          );
          
        })
      );

      var usersConvos = await API.graphql(
        graphqlOperation(getUserAndConversations, {
          id: this.props.navigation.state.params.userId
        })
      );

      if (usersConvos) {
        if (
          usersConvos.data.getUser &&
          usersConvos.data.getUser.userConversations.items
        ) {
          var currentConversation = _.find(
            _.filter(
              usersConvos.data.getUser.userConversations.items,
              r => r.conversation != null
            ),
            pe => pe.conversation.id == conversation.conversation.id
          );

          if (currentConversation) {
            
            if (currentConversation.status !== "DELETED") {
              this.props.navigation.navigate("Conversation", {
                conversation: currentConversation,
                userId: this.props.navigation.state.params.userId,
                currentTeam: this.props.navigation.state.params.currentTeam,
                backToConversations: false
              });
            }
          }
        }
      }
    }

    this.setState({ loading: false });
  };

  async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  onItemPress = (groupId, itemId) => {
    let globalData = groupData;

    if (
      globalData[groupId - 1].listData[itemId - 1].id ==
      this.props.navigation.state.params.userId
    ) {
      return;
    }
    let currentStatus = !globalData[groupId - 1].listData[itemId - 1].selected;

    globalData[groupId - 1].listData[itemId - 1].selected = currentStatus;

    if (currentStatus) {
      let bAllStatus = globalData[groupId - 1].listData.every(
        obj => obj.selected == true
      );

      if (bAllStatus) {
        globalData[groupId - 1].selected = true;
      }
    } else {
      globalData[groupId - 1].selected = false;
    }

    this.setState({
      filteredArray: this.getFilteredArray(globalData, this.state.search)
    });
    return;
  };

  async getAthletes(currentTeam) {
    return API.get("programs", `/programs/${currentTeam.id}/players`);
  }

  async getCoaches(currentTeam) {
    return API.get("programs", `/programs/${currentTeam.id}/coaches`);
  }

  async getGuardians(currentTeam) {
    return API.get("programs", `/programs/${currentTeam.id}/guardians`);
  }

  _renderItem = ({ item, index }) => {
    return (
      <GroupList
        groupTitle={item.groupTitle}
        groupId={"" + item.id}
        groupList={item.listData}
        groupStatus={item.selected}
        clickGroupTitle={this.onClickGroupTitle}
        clickChildItem={this.onItemPress}
        bShowCheckBox={true}
      />
    );
  };

  onClickGroupTitle = groupId => {
    let globalData = groupData;
    let currentStatus = !globalData[groupId - 1].selected;

    globalData[groupId - 1].selected = currentStatus;
    globalData[groupId - 1].listData = this.updateGroupStatus(
      globalData[groupId - 1].listData,
      currentStatus
    );

    this.setState({
      filteredArray: this.getFilteredArray(globalData, this.state.search)
    });
  };

  updateGroupStatus = (data, bStatus) => {
    if (data) {
      return data.map((item, index) => {
        item.selected = bStatus;

        if (item.id == this.props.navigation.state.params.userId) {
          item.selected = true;
        }

        return item;
      });
    } else {
      return data;
    }
  };

  onClickChildItem = item => {
    let globalData = groupData;
    // let currentData = this.state.groupData
    let currentStatus = !globalData[groupId - 1].listData[itemId - 1].selected;

    // currentData[groupId - 1].listData[itemId - 1].selected = currentStatus
    globalData[groupId - 1].listData[itemId - 1].selected = currentStatus;

    if (currentStatus) {
      let bAllStatus = globalData[groupId - 1].listData.every(
        obj => obj.selected == true
      );

      if (bAllStatus) {
        globalData[groupId - 1].selected = true;
      }
    } else {
      globalData[groupId - 1].selected = false;
    }

    this.setState({
      filteredArray: this.getFilteredArray(globalData, this.state.search)
    });
  };

  onGroupNameChange = text => {
    this.setState({ group_title: text });
  };

  render() {
    return (
      <SafeAreaView style={styles.container_background}>
        <StatusBar barStyle="light-content" translucent={false} />
        <View style={styles.group_container}>
          <TextInput
            style={styles.group_name_input}
            value={this.state.group_title}
            onChangeText={this.onGroupNameChange}
            placeholder={"Enter Conversation Name"}
          />
        </View>
        <Spacer />
        <SearchBar
          platform="android"
          placeholder="Search"
          value={this.state.search}
          onChangeText={this.updateSearch}
          style={{ width: "100%" }}
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

        <FlatList
          data={this.state.filteredGroupList}
          renderItem={this._renderItem}
          numColumns={1}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          style={[styles.whiteBackground]}
          horizontal={false}
        />
        {this.state.loading && (
          <View style={styles.loading}>
            <ActivityIndicator size="large" />
          </View>
        )}
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
  group_container: {
    width: "100%",
    height: 53,
    paddingLeft: 22,
    paddingRight: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white"
  },
  group_name_input: {
    width: "100%",
    fontSize: 14
  }
};

const styles = StyleSheet.create(style);

// const AddNewConversationWithData = compose(
// )(AddNewConversation)
// export default AddNewConversation;

export default UpdateConversation;
