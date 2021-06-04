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
  StatusBar
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

class AddNewConversationWithData extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: "New Conversation",
      // headerLeft: null,
      headerLeft: (
        <TouchableOpacity
          onPress={() => navigation.navigate("Conversations")}
          style={{ marginLeft: 10 }}
        >
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
      ),
      headerRight: (
        <TouchableOpacity
          style={CommonStyles.navRightContainer}
          onPress={() => navigation.state.params.createConversation()}
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
      loading: true
    };

    this.mount = true;
  }

  async componentWillMount() {
    try {
      const { navigation } = this.props;
      const params = navigation.state.params;
      const athletes = await this.getAthletes();
      const coaches = await this.getCoaches();
      const guardians = await this.getGuardians();

      groupData[0].selected = false;
      groupData[1].selected = false;
      groupData[2].selected = false;
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
          }
        }

        return athlete;
      });

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
          }
        }

        return coach;
      });

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
        }

        return guardian;
      });

      navigation.setParams({ ...params, createConversation: this.createConvo });

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

  onItemClick = item => {};

  createConvo = async () => {
    try {
      var conversation = await this.createConversation();
    } catch (e) {
      console.log("error ", e);
    }
  };

  createConversation = async () => {
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

    var currentUserId = this.props.navigation.state.params.userId;

    users.push(currentUserId);
    users = _.uniqBy(users);

    this.setState({ loading: true });

    const teamId = this.props.navigation.state.params.currentTeamId;

    const members = users.sort();

    const convo = {
      input: { name: conversationName, createdAt: moment(), id: uuid(), teamId }
    };

    await API.graphql(graphqlOperation(createConvo, convo)).then(
      async conversation => {
        const {
          data: {
            createConvo: { id: convoLinkConversationId }
          }
        } = conversation;

        await this.asyncForEach(members, async member => {
          var id = uuid();

          var relation = {
            input: {
              convoLinkConversationId: convoLinkConversationId,
              convoLinkUserId: member,
              id: id,
              name: conversationName,
              status: "READY"
            }
          };
          await API.graphql(graphqlOperation(createConvoLink, relation));
        });
        conversation.associated = userData;

        try {
          var get = await API.graphql(
            graphqlOperation(getConversation, { id: convoLinkConversationId })
          );

          this.setState({ loading: false });

          this.props.navigation.navigate("Conversation", {
            conversation: { conversation: get.data.getConvo },
            userId: this.props.navigation.state.params.userId,
            currentTeam: this.props.navigation.state.params.currentTeam,
            backToConversations: true
          });
        } catch (e) {
          console.log("getConversation e ", e);
          this.setState({ loading: false });
        }
      },
      error => {
          console.log(e);
          Alert.alert("Error", "Please try again.")
        this.setState({ loading: false });
      }
    );
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

  async getAthletes() {
    const { navigation } = this.props;
    const { currentTeam } = navigation.state.params;
    return Auth.currentSession().then(auth => {
      const options = {
        headers: {
          Authorization: auth.idToken.jwtToken
        }
      };
      return API.get("programs", `/programs/${currentTeam.id}/players`);
    });
  }

  async getCoaches() {
    const { navigation } = this.props;
    const { currentTeam } = navigation.state.params;

    return Auth.currentSession().then(auth => {
      const options = {
        headers: {
          Authorization: auth.idToken.jwtToken
        }
      };
      return API.get("programs", `/programs/${currentTeam.id}/coaches`);
    });
  }

  async getGuardians() {
    const { navigation } = this.props;
    const { currentTeam } = navigation.state.params;

    return Auth.currentSession().then(auth => {
      const options = {
        headers: {
          Authorization: auth.idToken.jwtToken
        }
      };
      return API.get("programs", `/programs/${currentTeam.id}/guardians`);
    });
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

export default AddNewConversationWithData;
