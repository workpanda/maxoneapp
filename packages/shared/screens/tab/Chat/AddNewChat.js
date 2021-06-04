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
  StatusBar
} from "react-native";
import { SearchBar } from "react-native-elements";
import Spacer from "@m1/shared/components/Spacer";
import CommonStyles from "@m1/shared/theme/styles";
import { TextInput } from "react-native-gesture-handler";
import GroupList from "@m1/shared/components/GroupList";

const groupData = [
  {
    id: 1,
    groupTitle: "Athletes",
    selected: false,
    listData: [
    ]
  },
  {
    id: 2,
    groupTitle: "Coaches",
    selected: false,
    listData: [
    ]
  }
];

class AddNewChat extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    title: "New Chat",
    headerLeft: null,
    headerRight: (
      <TouchableOpacity
        style={CommonStyles.navRightContainer}
        onPress={() => navigation.goBack()}
      >
        <Text style={CommonStyles.darkNavRightText}>Save</Text>
      </TouchableOpacity>
    )
  });

  constructor(props) {
    super(props);

    this.state = {
      search: "",
      group_title: "",
      filteredGroupList: []
    };

    this.mount = true;
  }

  componentWillMount() {
    try{
      if (groupData && groupData.length != 0) {
        this.setState({
          filteredGroupList: this.getFilteredArray(
            groupData,
            this.state.search.trim()
          )
        });
      }
    }
    catch(e){
      console.log('error - ', e)
    }
  }

  getFilteredArray = (arrList, search) => {
    if (search === "") {
      return arrList;
    }

    if (arrList) {
      let arrResult = [];
      arrList.forEach(element => {
        let result = element.listData.filter(obj => {
          return obj.username.toLowerCase().includes(search.toLowerCase());
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

  onItemClick = item => { };

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
        clickGroupTitle={this.onClickGroupTitle}
        clickChildItem={this.onClickChildItem}
        bShowCheckBox={true}
      />
    );
  };

  onClickGroupTitle = groupId => {
    // let currentData = this.state.groupData
    // let currentStatus = !currentData[groupId - 1].selected

    // currentData[groupId - 1].selected = currentStatus

    // currentData[groupId - 1].listData = this.updateGroupStatus(currentData[groupId - 1].listData, currentStatus)

    // let globalData = groupData

    // globalData[groupId - 1].selected = currentStatus
    // globalData[groupId - 1].listData = this.updateGroupStatus(currentData[groupId - 1].listData, currentStatus)

    // this.setState({groupData: currentData})

    // let currentData = this.state.groupData
    // let currentStatus = !currentData[groupId - 1].selected

    // currentData[groupId - 1].selected = currentStatus

    // currentData[groupId - 1].listData = this.updateGroupStatus(currentData[groupId - 1].listData, currentStatus)

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

export default AddNewChat;

AddNewChat.propTypes = {};

AddNewChat.defaultProps = {};
