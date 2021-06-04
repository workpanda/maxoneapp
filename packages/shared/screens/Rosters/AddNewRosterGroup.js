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
  StatusBar,
  Alert
} from "react-native";
import { SearchBar } from "react-native-elements";
import { API } from "aws-amplify";
import _ from "lodash";
import { Feather } from "@expo/vector-icons";
import Spacer from "@m1/shared/components/Spacer";
import CommonStyles from "@m1/shared/theme/styles";
import { TextInput } from "react-native-gesture-handler";
import GroupList from "@m1/shared/components/GroupList";

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
  }
//   },
//   {
//     id: 3,
//     groupTitle: "Parents",
//     selected: false,
//     listData: []
//   }
];

const iconBackArrow = require("@m1/shared/assets/ic_back_white.png");

class AddNewRosterGroup extends React.Component {
  static navigationOptions = ({ navigation }) => {
    var onSave = () => {};

    let params = navigation.state.params;

    if (params && params.onSave) {
      onSave = params.onSave;
    }

    return {
      title: "New Group",
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

    groupData[0].selected = false;
    groupData[1].selected = false;
    groupData[0].listData = athletes.map((item, index) => {
      item.itemIndex = index + 1;
        item.selected = false;
      return item;
    });
    groupData[1].listData = coaches.map((item, index) => {
      item.itemIndex = index + 1;
      item.selected = false;
      return item;
    });

    this.state = {
      search: "",
      group_title: "",
      filteredGroupList: [],
      username: "",
      currentTeam: {}
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

    groupData[0].selected = false;
    groupData[1].selected = false;

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
    if (!this.mount) return;
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

        if (params && params.groupAdd) {
          var mParam = {};

          mParam["id"] = null;
          mParam["legacyId"] = 0;
          mParam["name"] = this.state.group_title;
          mParam["parentId"] = this.state.currentTeam.id;
          mParam["participants"] = arrResult;

          await API.post(
            "groups",
            `/programs/${this.state.currentTeam.id}/groups`,
            {
              body: mParam
            }
          )
            .then(result => {
              if (result.id != null && result.id != undefined) {
                params.groupAdd(result);

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

  _renderItem = ({ item, index }) => {
    return (
      <GroupList
        groupTitle={item.groupTitle}
        groupId={item.id}
        groupList={item.listData}
        groupStatus={item.selected}
        clickGroupCheck={this.onClickGroupCheck}
        clickChildItem={this.onClickChildItem}
        bShowCheckBox={true}
      />
    );
  };

  onClickGroupCheck = groupId => {
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
      </SafeAreaView>
    );
  }
}

let style = {
  container_background: {
    backgroundColor: "#DFDFDF",
    height: "100%"
  },
  background: {
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

export default AddNewRosterGroup;

AddNewRosterGroup.propTypes = {};

AddNewRosterGroup.defaultProps = {};
