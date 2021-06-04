import React from "react";
import PropTypes from "prop-types";
import {
  AsyncStorage,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  StatusBar,
  Alert,
  ScrollView,
  Button
} from "react-native";
import { SearchBar } from "react-native-elements";
import { API } from "aws-amplify";
import _ from "lodash";
import Spacer from "@m1/shared/components/Spacer";
import CommonStyles from "@m1/shared/theme/styles";
import { TextInput } from "react-native-gesture-handler";
import GroupList from "@m1/shared/components/GroupList";
import { Feather } from "@expo/vector-icons";
const groupData = [
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

class RosterGroupView extends React.Component {
  static navigationOptions = ({ navigation }) => {
    var onSave = () => { };

    let params = navigation.state.params;

    if (params && params.onSave) {
      onSave = params.onSave;
    }

    return {
      title: "Edit Group",
      headerLeft: (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={CommonStyles.navBackContainer}
        >
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
      ),
      headerRight: (
        <TouchableOpacity
          style={CommonStyles.navRightContainer}
          onPress={onSave}
        >
          <Text style={CommonStyles.darkNavRightText}>Save</Text>
        </TouchableOpacity>
      )
    };
  };

  constructor(props) {
    super(props);

    var { navigation } = props;

    var athletes = navigation.getParam("athletes", []);
    var coaches = navigation.getParam("coaches", []);
    var selectedGroup = navigation.getParam("selectedGroup", {});
    var groupTitle = navigation.getParam("groupTitle", "");

    groupData[0].listData = athletes.map((item, index) => {
      item.itemIndex = index + 1;
      var findItem = selectedGroup.participants.find(function (groupItem) {
        return (
          groupItem.userId === item.id ||
          (groupItem.username && groupItem.id == item.id)
        );
      });

      if (findItem) {
        item.selected = true;
      } else {
        item.selected = false;
      }

      return item;
    });
    groupData[1].listData = coaches.map((item, index) => {
      item.itemIndex = index + 1;

      var findItem = selectedGroup.participants.find(function (groupItem) {
        return (
          groupItem.userId === item.id ||
          (groupItem.username && groupItem.id == item.id)
        );
      });

      if (findItem) {
        item.selected = true;
      } else {
        item.selected = false;
      }

      return item;
    });

    this.state = {
      search: "",
      group_title: groupTitle,
      filteredGroupList: [],
      username: "",
      currentTeam: {},
      group_id: selectedGroup.id
    };
  }

  componentWillMount() {
    if (groupData && groupData.length != 0) {
      this.setState({
        filteredGroupList: this.getFilteredArray(
          groupData,
          this.state.search.trim()
        )
      });
    }
  }

  componentDidMount = async () => {
    this.mount = true;

    var userContextString = await AsyncStorage.getItem("@M1:userContext");
    var appContextString = await AsyncStorage.getItem("@M1:appContext");
    var userContext = JSON.parse(userContextString);
    var appContext = JSON.parse(appContextString);
    this.setState({ username: userContext.user.username });

    const currentTeam = _.find(
      userContext.appContextList,
      c => c.id === appContext.id
    );

    this.setState({ currentTeam: currentTeam });

    this.props.navigation.setParams({
      onSave: this._clickRightNavigation
    });
  };

  componentWillUnmount() {
    this.mount = false;

    this.props.navigation.setParams({
      onSave: null
    });
  }

  componentWillReceiveProps(props) {
    // var {navigation} = props
    // var athletes = navigation.getParam('athletes', [])
    // var coaches = navigation.getParam('coaches', [])
    // var selectedGroup = navigation.getParam('selectedGroup', [])
    // var groupTitle = navigation.getParam('groupTitle', '')
    // groupData[0].listData = athletes.map((item, index) => {
    //     item.itemIndex = index + 1
    //     return item
    // })
    // groupData[1].listData = coaches.map((item, index) => {
    //     item.itemIndex = index + 1
    //     return item
    // })
    // this.setState({
    //     search: '',
    //     group_title: groupTitle,
    //     filteredGroupList: [],
    //     username: '',
    //     currentTeam: {}
    // })
  }

  _clickRightNavigation = async () => {
    let arrResult = [];

    if (this.state.group_title.trim() === "") {
      Alert.alert(
        "Error",
        "Please input group name",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }],
        { cancelable: false }
      );

      return;
    }

    if (groupData) {
      for (let i = 0; i < groupData.length; i++) {
        let element = groupData[i];

        let result = element.listData.filter(obj => {
          return obj.selected === true;
        });

        if (result && result.length > 0) {
          for (var j = 0; j < result.length; j++) {
            var cloneObj = Object.assign({}, result[j], {});

            if (cloneObj.selected != undefined && cloneObj.selected != null) {
              delete cloneObj["selected"];
            }

            arrResult.push(cloneObj);
          }
        }
      }

      if (arrResult.length > 0) {
        let params = this.props.navigation.state.params;

        if (params && params.groupEdit) {
          var selectedGroup = this.props.navigation.getParam(
            "selectedGroup",
            {}
          );

          var cloneObj = Object.assign({}, selectedGroup, {});

          cloneObj.name = this.state.group_title;
          cloneObj.participants = arrResult;
          cloneObj.groupName = this.state.group_title;

          await API.put("groups", `/groups/${this.state.group_id}`, {
            body: cloneObj
          })
            .then(result => {
              if (result.id != null && result.id != undefined) {
                params.groupEdit(result);

                this.props.navigation.goBack();
              }
            })
            .catch(error => {
              console.log(error);

              Alert.alert(
                "Error",
                "Please try later",
                [{ text: "OK", onPress: () => console.log("OK Pressed") }],
                { cancelable: false }
              );
            });
        }
      } else {
        // alert('Please select any member')
        Alert.alert(
          "Error",
          "Please select any member",
          [{ text: "OK", onPress: () => console.log("OK Pressed") }],
          { cancelable: false }
        );
      }
    } else {
      alert("Error");
    }
  };

  getFilteredArray = (arrList, search) => {
    if (search === "") {
      return arrList;
    }

    if (arrList) {
      let arrResult = [];
      arrList.forEach(element => {
        let result = element.listData.filter(obj => {
          return (obj.nameFirst + " " + obj.nameLast)
            .toLowerCase()
            .includes(search.toLowerCase());
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

  updateSearch = search => {
    this.setState({ search: search });

    if (groupData && groupData.length != 0) {
      this.setState({
        filteredGroupList: this.getFilteredArray(groupData, search.trim())
      });
    }
  };

  onItemClick = item => { };

  onClick = () => {
    return;
  };

  _renderItem = ({ item, index }) => {
    return (
      <GroupList
        groupTitle={item.groupTitle}
        groupId={"" + item.id}
        groupList={item.listData}
        groupStatus={item.selected}
        clickGroupCheck={this.clickGroupCheck}
        clickChildItem={this.onClickChildItem}
        bShowCheckBox={true}
        key={item.id + "rosterview" + index}
      />
    );
  };

  clickGroupCheck = groupId => {
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

  delete_group = () => {
    Alert.alert(
      "Warning",
      "Are you sure you wish to delete this group?",
      [
        {
          text: "OK",
          onPress: async () => {
            await this.deleteGroup(this.state.group_id);

            var { navigation } = this.props;

            let params = navigation.state.params;

            if (params && params.groupRemove) {
              params.groupRemove(this.state.group_id);
            }

            navigation.goBack();
          }
        },
        { text: "Cancel", onPress: () => console.log("Cancel Pressed") }
      ],
      { cancelable: false }
    );
  };

  deleteGroup(groupId) {
    return API.del("groups", `/groups/${groupId}`);
  }

  render() {
    return (
      <SafeAreaView style={styles.container_background}>
        <StatusBar barStyle="light-content" translucent={false} />
        <ScrollView style={styles.container_background}>
          <View style={styles.group_container}>
            <TextInput
              style={styles.group_name_input}
              value={this.state.group_title}
              onChangeText={this.onGroupNameChange}
              placeholder={"Enter Group Name"}
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
            keyExtractor={item => item.id}
            style={[styles.whiteBackground]}
            horizontal={false}
          />
          <View style={styles.delete_container}>
            <View style={styles.delete_button_sub_container}>
              <Text>This action cannot be undone.</Text>
              <TouchableOpacity
                style={styles.delete_button}
                title={"DELETE GROUP"}
                onPress={() => this.delete_group()}
              >
                <Text style={styles.delete_button_text}>{"DELETE GROUP"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
  },
  delete_container: {
    width: "100%",
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#DFDFDF",

    paddingLeft: 22,
    paddingRight: 22
  },
  delete_button: {
    width: "100%",
    height: 50,
    backgroundColor: "#E33638",
    justifyContent: "center",
    alignItems: "center"
  },
  delete_button_text: {
    color: "white",
    fontSize: 15
  },
  delete_button_sub_container: {
    width: "100%"
  }
};

const styles = StyleSheet.create(style);

export default RosterGroupView;

RosterGroupView.propTypes = {};

RosterGroupView.defaultProps = {};
