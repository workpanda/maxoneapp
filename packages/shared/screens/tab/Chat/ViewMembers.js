import React from "react";
import PropTypes from "prop-types";
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  StatusBar,
  ActivityIndicator
} from "react-native";
import { Feather } from "@expo/vector-icons";
import CommonStyles from "@m1/shared/theme/styles";
import GroupList from "@m1/shared/components/GroupList";
import AvatarGroup from "./Components/AvatarGroup";
const iconBackArrow = require("@m1/shared/assets/ic_back_white.png");
import _ from "lodash";
import { API, Auth } from "aws-amplify";

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

class ViewMembers extends React.Component {
  static navigationOptions = ({ navigation }) => {
    //
    let params = navigation.state.params;
   
    var avatarList = [];
    _.forEach(params.conversation.conversation.associated.items, associated => {
      if (associated.status !== "DELETED") {
        if (associated.user && associated.user.avatarUrl) {
          if (associated.user.avatarUrl.includes("http")) {
            avatarList.push(associated.user.avatarUrl);
          } else {
            if (associated.user.legacyId) {
              avatarList.push(
                `https://s3.amazonaws.com/programax-videos-production/uploads/user/avatar/${associated.user.legacyId}/${associated.user.avatarUrl}`
              );
            } else {
              avatarList.push(
                `https://s3.amazonaws.com/programax-videos-production/uploads/user/avatar/${associated.user.id}/${associated.user.avatarUrl}`
              );
            }
          }
        }
      }
    });

    return {
      headerStyle: CommonStyles.chatNavbarBackground,
      headerTitle: (
        <AvatarGroup
          title={
            params.conversation &&
            params.conversation.conversation &&
            params.conversation.conversation.name
              ? params.conversation.conversation.name
              : "Members"
          }
          avatarList={avatarList}
        />
      ),
      headerTitleStyle: CommonStyles.chatNavbarTitle,
      headerLeft: (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginLeft: 10 }}
        >
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
      )
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      search: "",
      group_title: "",
      loading: true,
      filteredGroupList: []
    };

    this.mount = true;
  }

  async componentWillMount() {
    groupData = [
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
    const { navigation } = this.props;

    const athletes = await this.getAthletes();
    const coaches = await this.getCoaches();
    const guardians = await this.getGuardians();

    let params = navigation.state.params;

    await _.forEach(
      params.conversation.conversation.associated.items,
      associated => {
        if (associated.status !== "DELETED") {
          if (associated.user) {
            
            var athlete = _.find(athletes, { id: associated.user.id });
           
            if (!athlete) {
              var coach = _.find(coaches, { id: associated.user.id });
             
              if (!coach) {
                var guardian = _.find(guardians, { id: associated.user.id });
                
                if (!guardian) {
                  
                } else {
                  if (
                    guardian.avatarUrl &&
                    !guardian.avatarUrl.includes("http")
                  ) {
                    guardian.avatarUrl = `https://s3.amazonaws.com/programax-videos-production/uploads/user/avatar/${
                      guardian.legacyId ? guardian.legacyId : guardian.id
                    }/${guardian.avatarUrl}`;
                  }
                  groupData[2].listData.push(guardian);
                }
              } else {
                if (coach.avatarUrl && !coach.avatarUrl.includes("http")) {
                  coach.avatarUrl = `https://s3.amazonaws.com/programax-videos-production/uploads/user/avatar/${
                    coach.legacyId ? coach.legacyId : coach.id
                  }/${coach.avatarUrl}`;
                }

                groupData[1].listData.push(coach);
              }
            } else {
              if (athlete.avatarUrl && !athlete.avatarUrl.includes("http")) {
                athlete.avatarUrl = `https://s3.amazonaws.com/programax-videos-production/uploads/user/avatar/${
                  athlete.legacyId ? athlete.legacyId : athlete.id
                }/${athlete.avatarUrl}`;
              }
              groupData[0].listData.push(athlete);
            }
          }
        }
      }
    );

    

    if (groupData && groupData.length != 0) {
      this.setState({
        filteredGroupList: this.getFilteredArray(
          groupData,
          this.state.search.trim()
        )
      });
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
          return obj.username.includes(search);
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

  onClick = () => {
    return;
  };

  async getAthletes() {
    const { navigation } = this.props;
    const { currentTeam } = navigation.state.params;
    var currentTeamId = currentTeam.id;
    return Auth.currentSession().then(auth => {
      const options = {
        headers: {
          Authorization: auth.idToken.jwtToken
        }
      };
      return API.get("programs", `/programs/${currentTeamId}/players`);
    });
  }

  async getCoaches() {
    const { navigation } = this.props;
    const { currentTeam } = navigation.state.params;
    var currentTeamId = currentTeam.id;

    return Auth.currentSession().then(auth => {
      const options = {
        headers: {
          Authorization: auth.idToken.jwtToken
        }
      };
      return API.get("programs", `/programs/${currentTeamId}/coaches`);
    });
  }

  async getGuardians() {
    const { navigation } = this.props;
    const { currentTeam } = navigation.state.params;
    var currentTeamId = currentTeam.id;

    return Auth.currentSession().then(auth => {
      const options = {
        headers: {
          Authorization: auth.idToken.jwtToken
        }
      };
      return API.get("programs", `/programs/${currentTeamId}/guardians`);
    });
  }

  _renderItem = ({ item, index }) => {
    if (item.listData.length > 0) {
      return (
        <GroupList
          groupTitle={item.groupTitle}
          groupId={item.id + ""}
          groupList={item.listData}
          groupStatus={item.selected}
          bShowCheckBox={false}
        />
      );
    }
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

        return item;
      });
    } else {
      return data;
    }
  };

  onClickChildItem = (groupId, itemId) => {
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
      <SafeAreaView
        forceInset={{ top: "always" }}
        style={styles.container_background}
      >
        <StatusBar barStyle="light-content" translucent={false} />
        {this.state.loading && (
          <View style={styles.loading}>
            <ActivityIndicator size="large" />
          </View>
        )}
        <FlatList
          data={this.state.filteredGroupList}
          renderItem={this._renderItem}
          numColumns={1}
          keyExtractor={item => item.id}
          style={[styles.whiteBackground]}
          horizontal={false}
        />
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
    height: "100%",
    width: "100%"
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

export default ViewMembers;

ViewMembers.propTypes = {};

ViewMembers.defaultProps = {};
