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
  ActivityIndicator,
  ScrollView
} from "react-native";
import "@expo/vector-icons";
import { API } from "aws-amplify";
import _ from "lodash";
import SimplePicker from "react-native-simple-picker";
import { SearchBar } from "react-native-elements";
import CommonStyles from "@m1/shared/theme/styles";
import VideoHorizontalScroll from "@m1/shared/components/VideoHorizontalScroll";
import Spacer from "@m1/shared/components/Spacer";
import { NavigationEvents } from "react-navigation";
import { Avatar, Badge, Icon, withBadge } from "react-native-elements";
import FontIcon from "@m1/shared/components/FontIcon";
import Images from "@assets/images";
const SCREEN_WIDTH = Dimensions.get("window").width - 12;

const UN_TAGGED = "untagged";
const ALL_TAG = "All Videos";
const imgDownArrow = require("@m1/shared/assets/drop_down_arrow.png");
const DEFAULT_THUMBNAIL =
  "https://programax-videos-production.s3.amazonaws.com/us-east-1%3Ab6eae98c-3a1d-4e74-8b84-014cbece35a7/undefinedryfcrEAtN-Screen%20Shot%202019-04-12%20at%2011.56.47%20AM.png";
var ACTIVITY_LIST = [];
var TAG_LIST = [];
var CATEGORY_LIST = [
  "Skill Development",
  "Strength & Conditioning",
  "Education Materials",
  "Coaching Resources"
];
var INTERNAL_API_CATEGORY = ["drill", "exercise", "education", "coach"];
const PREFIX_URL =
  "https://s3.amazonaws.com/programax-videos-production/uploads/activity/image/";
var readChatTimer = -1;
class VideoLibrary extends React.Component {
  static navigationOptions = ({ navigation }) => {
    let params = navigation.state.params;
    var unReadChatCount = 0;
    var appContext =
      navigation.state.params && navigation.state.params.appContext
        ? navigation.state.params.appContext
        : {};
    if (params && params.unReadChatCount) {
      unReadChatCount = params.unReadChatCount;
    }
    return {
      headerTitle: (
        <View
          style={{
            width: "100%",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <Image
            style={{ height: 22, width: 50 }}
            resizeMode="contain"
            source={Images.logoHeader}
          />
        </View>
      ),
      headerTitleStyle: { flex: 1, textAlign: "center" },
      headerLeft: <View />,
      headerRight: (
        <View style={{ flexDirection: "row" }}>
          {appContext.isCoach ||
          appContext.isOwner ||
          appContext.isHeadCoach ? (
            <TouchableOpacity
              onPress={() => navigation.navigate("MESSAGES")}
              style={CommonStyles.navRightContainer}
            >
              <FontIcon name="send" size={20} color={"#fff"} />
            </TouchableOpacity>
          ) : null}
          {appContext.id !== "" && (
            <TouchableOpacity
              onPress={() => navigation.navigate("Conversations")}
            >
              <View style={CommonStyles.navRightContainer}>
                <FontIcon name="chat1" size={20} color={"#fff"} />
              </View>
              {unReadChatCount > 0 && (
                <Badge
                  value={unReadChatCount}
                  status="error"
                  containerStyle={[
                    styles.badge,
                    { right: unReadChatCount > 9 ? 5 : 8 }
                  ]}
                />
              )}
            </TouchableOpacity>
          )}
        </View>
      )
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      search: "",
      username: "",
      currentTeam: {},
      itemList: [],
      selectedCategory: "Skill Development",
      selectedTag: ALL_TAG,
      loading: true,
      mData: {},
      unReadChatCount: 0
    };

    this.mount = true;
  }

  componentWillMount() {}

  componentWillUnmount() {
    this.mount = false;

    clearInterval(readChatTimer);
  }

  componentDidMount = async () => {
    var userContextString = await AsyncStorage.getItem("@M1:userContext");
    var appContextString = await AsyncStorage.getItem("@M1:appContext");
    var userContext = JSON.parse(userContextString);
    var appContext = JSON.parse(appContextString);
    this.setState({ username: userContext.user.username });

    this.props.navigation.setParams({
      appContext
    });

    clearInterval(readChatTimer);
    var unReadChatCount = await AsyncStorage.getItem("unReadMessageCount");

    if (unReadChatCount) {
      var totalCount = JSON.parse(unReadChatCount);
      this.props.navigation.setParams({
        unReadChatCount: totalCount.length
      });
    }

    readChatTimer = setInterval(async () => {
      var unReadChatCount = await AsyncStorage.getItem("unReadMessageCount");

      if (unReadChatCount) {
        var totalCount = JSON.parse(unReadChatCount);
        this.props.navigation.setParams({
          unReadChatCount: totalCount.length
        });
      }
    }, 1000);

    const currentTeam = _.find(
      userContext.appContextList,
      c => c.id === appContext.id
    );
    this.setState({ currentTeam: currentTeam, appContext });

    console.log(
      "Parent ID ===========================================",
      currentTeam.id
    );

    if (appContext.isAthlete == true) {
      CATEGORY_LIST = [
        "Skill Development",
        "Strength & Conditioning",
        "Education Materials"
      ];
      INTERNAL_API_CATEGORY = ["drill", "exercise", "education"];
    }

    await this.getActivities(currentTeam.id, this.state.selectedCategory);

    this.setState({ loading: false });

    // ACTIVITY_LIST = videoList.slice(0);
  };

  async getActivities(parentId, category) {
    var nIndex = CATEGORY_LIST.findIndex(element => element == category);

    if (nIndex > INTERNAL_API_CATEGORY.length - 1 || nIndex === undefined)
      return;
    this.setState({ loading: true });
    return API.get(
      "activities",
      `/programs/${parentId}/activities/${INTERNAL_API_CATEGORY[nIndex]}`
    )
      .then(apiResult => {
        var convertedResult = apiResult;
        if (apiResult) {
          TAG_LIST = [ALL_TAG, UN_TAGGED];
          var sortedActivities = {};
          sortedActivities[UN_TAGGED] = [];
          convertedResult = apiResult.map((item, index) => {
            if (item.videoType === "youtube") {
              if (item.thumbnail == null) {
                if (item.attachment == null) {
                  item.thumbnail = `http://img.youtube.com/vi/${item.videoId}/0.jpg`;
                } else {
                  var re = /(?:\.([^.]+))?$/;
                  var ext = re.exec(item.attachment)[1];

                  if (
                    ext.toUpperCase() === "JPG" ||
                    ext.toUpperCase() === "PNG"
                  ) {
                    // assume is an image
                    item.thumbnail = item.attachment;
                  } else {
                    item.thumbnail = `http://img.youtube.com/vi/${item.videoId}/0.jpg`;
                  }
                }
              }
            } else {
              if (item.thumbnail == null) {
                item.thumbnail = this.state.currentTeam.logo
                  ? this.state.currentTeam.logo
                  : "";
              }
            }

            item.index = index;

            var mTags = item.taggings;

            if (mTags != null && Object.keys(mTags).length != 0) {
              var itemTagList = [];
              Object.keys(mTags).forEach(key => {
                var mTagLabel =
                  mTags[key].tag.label == undefined
                    ? UN_TAGGED
                    : mTags[key].tag.label;

                var searchResult = TAG_LIST.find(element => {
                  return element == mTagLabel;
                });

                if (searchResult === undefined) {
                  TAG_LIST.push(mTagLabel);

                  sortedActivities[mTagLabel] = [];

                  sortedActivities[mTagLabel].push(this.CloneObject(item));

                  itemTagList.push(mTagLabel);
                } else {
                  var bAlreadyAdd = itemTagList.find(element => {
                    return element == mTagLabel;
                  });

                  if (bAlreadyAdd === undefined) {
                    if (searchResult !== undefined) {
                      sortedActivities[mTagLabel].push(this.CloneObject(item));
                    }

                    itemTagList.push(mTagLabel);
                  }
                }
              });
            } else {
              sortedActivities[UN_TAGGED].push(this.CloneObject(item));
            }

            return item;
          });
        }

        console.log("-------***---------", sortedActivities[UN_TAGGED].length);
        TAG_LIST.sort(function(x, y) {
          if (y === ALL_TAG) {
            return 1;
          }

          if (x === ALL_TAG) {
            return -1;
          }

          if (y === UN_TAGGED) {
            return -1;
          }

          if (x === UN_TAGGED) {
            return 1;
          }

          if (x < y) {
            return -1;
          }
          if (x > y) {
            return 1;
          }
          return 0;
        });

        this.setState({ selectedTag: ALL_TAG }, () => {
          ACTIVITY_LIST = sortedActivities;
          this.setState({ mData: sortedActivities });
        });

        this.setState({ loading: false });

        return convertedResult;
      })
      .catch(error => {
        this.setState({ loading: false });
        console.log(error);
      });
  }

  componentWillReceiveProps(props) {
    if (!this.mount) return;
  }
  updateSearch = search => {
    this.setState({ search: search });

    var filteredActivities = {};
    Object.keys(ACTIVITY_LIST).forEach(key => {
      if (this.state.selectedTag === ALL_TAG) {
        var data = ACTIVITY_LIST[key];

        if (data.length != 0) {
          var filterList = data.filter(obj => {
            return obj.name.toLowerCase().includes(search.toLowerCase());
          });

          if (filterList.length > 0) {
            filteredActivities[key] = filterList;
          }
        }
      } else {
        if (this.state.selectedTag === key) {
          var data = ACTIVITY_LIST[key];

          if (data.length != 0) {
            var filterList = data.filter(obj => {
              return obj.name.toLowerCase().includes(search.toLowerCase());
            });

            if (filterList.length > 0) {
              filteredActivities[key] = filterList;
            }
          }
        }
      }
    });

    this.setState({ mData: filteredActivities });
  };

  onItemClick = item => {
    this.props.navigation.navigate("VideoDetail", {
      title: item.name,
      data: item
    });
  };

  onClick = () => {
    return;
  };

  _onChangeCategory = async value => {
    if (!this.mount) return false;

    if (value == this.state.selectedCategory) {
      return;
    }

    this.setState({ selectedCategory: value });
    this.setState({ search: "" });

    await this.getActivities(this.state.currentTeam.id, value);
  };

  _onChangeTag = value => {
    if (!this.mount) return false;

    if (value == this.state.selectedTag) {
      return;
    }
    this.setState({ selectedTag: value });
    var filteredActivities = {};
    Object.keys(ACTIVITY_LIST).forEach(key => {
      if (value === ALL_TAG) {
        var data = ACTIVITY_LIST[key];

        if (data.length != 0) {
          var filterList = data.filter(obj => {
            return obj.name
              .toLowerCase()
              .includes(this.state.search.toLowerCase());
          });

          if (filterList.length > 0) {
            filteredActivities[key] = filterList;
          }
        }
      } else {
        if (value === key) {
          var data = ACTIVITY_LIST[key];

          if (data.length != 0) {
            var filterList = data.filter(obj => {
              return obj.name
                .toLowerCase()
                .includes(this.state.search.toLowerCase());
            });

            if (filterList.length > 0) {
              filteredActivities[key] = filterList;
            }
          }
        }
      }
    });

    this.setState({ mData: filteredActivities });
  };

  _showCategoryPicker = () => {
    if (this.categoryPicker == null || this.categoryPicker == undefined) return;

    this.categoryPicker.show();
  };

  _showTagPicker = () => {
    if (
      this.tagPicker == null ||
      this.tagPicker == undefined ||
      TAG_LIST.length == 0
    )
      return;

    this.tagPicker.show();
  };

  renderItem() {
    const items = [];

    var keyList = Object.keys(this.state.mData);

    keyList.sort(function(x, y) {
      if (y === UN_TAGGED) {
        return 1;
      }

      if (x === UN_TAGGED) {
        return -1;
      }

      if (x < y) {
        return -1;
      }

      if (x > y) {
        return 1;
      }

      return 0;
    });

    for (var i = 0; i < keyList.length; i++) {
      if (this.state.mData[keyList[i]].length > 0) {
        items.push(
          <VideoHorizontalScroll
            tagName={keyList[i]}
            data={this.state.mData[keyList[i]]}
            onPress={item => this.onItemClick(item)}
            key={keyList[i] + "_" + i}
          />
        );
      }
    }

    return items;
  }
  async checkAppContextChanged() {
    var appContextString = await AsyncStorage.getItem("@M1:appContext");
    var appContext = JSON.parse(appContextString);

    if (this.state.appContext && appContext !== this.state.appContext) {
      this.setState({ loading: true });
      await this.componentDidMount();
    }
  }

  CloneObject(src) {
    return Object.assign({}, src);
  }
  render() {
    return (
      <SafeAreaView style={styles.whiteBackground}>
        <StatusBar barStyle="light-content" translucent={false} />
        <NavigationEvents onDidFocus={() => this.checkAppContextChanged()} />

        <View
          style={{
            width: "100%",
            height: 50,
            flexDirection: "row",
            justifyContent: "space-between"
          }}
        >
          <View style={{ width: "50%" }}>
            <View style={CommonStyles.customInputCell}>
              <View style={CommonStyles.customInputCellInnerPart}>
                <TouchableOpacity
                  style={[
                    CommonStyles.customInputField,
                    CommonStyles.customInputPicker,
                    CommonStyles.customInputFieldRow
                  ]}
                  onPress={this._showCategoryPicker}
                >
                  <Text
                    style={[
                      CommonStyles.customInputFieldVerticalCenter,
                      CommonStyles.customInputFieldRightDown
                    ]}
                    ellipsizeMode={"tail"}
                    numberOfLines={1}
                  >
                    {this.state.selectedCategory}
                  </Text>

                  <Image
                    source={imgDownArrow}
                    style={CommonStyles.customInputFieldDropDown}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={{ width: "50%" }}>
            <View style={CommonStyles.customInputCell}>
              <View style={CommonStyles.customInputCellInnerPart}>
                <TouchableOpacity
                  style={[
                    CommonStyles.customInputField,
                    CommonStyles.customInputPicker,
                    CommonStyles.customInputFieldRow
                  ]}
                  onPress={this._showTagPicker}
                >
                  <Text
                    style={[
                      CommonStyles.customInputFieldVerticalCenter,
                      CommonStyles.customInputFieldRightDown,
                      { textAlign: "right" }
                    ]}
                  >
                    {this.state.selectedTag}
                  </Text>

                  <Image
                    source={imgDownArrow}
                    style={CommonStyles.customInputFieldDropDown}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        <Spacer />
        <SearchBar
          platform="android"
          placeholder="Search Videos"
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
        <Spacer />
        <ScrollView
          style={styles.parentScrollView}
          contentContainerStyle={styles.contentContainer}
        >
          {this.state.mData && this.renderItem()}
        </ScrollView>
        <View style={pickerSelectStyles.remind_picker_container}>
          <SimplePicker
            options={CATEGORY_LIST}
            labels={CATEGORY_LIST}
            ref={picker => (this.categoryPicker = picker)}
            onSubmit={this._onChangeCategory}
            style={pickerSelectStyles.remind_picker}
            selectedValue={this.state.selectedCategory}
            cancelText={"Cancel"}
            confirmText={"Done"}
          />
          <SimplePicker
            options={TAG_LIST}
            labels={TAG_LIST}
            ref={picker => (this.tagPicker = picker)}
            onSubmit={this._onChangeTag}
            style={pickerSelectStyles.remind_picker}
            selectedValue={this.state.selectedTag}
            cancelText={"Cancel"}
            confirmText={"Done"}
          />
        </View>
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
    zIndex: 1000000000,
    width: "100%",
    height: "100%"
  },
  background: {
    backgroundColor: "#DFDFDF"
  },
  whiteBackground: {
    backgroundColor: "white",
    width: "100%",
    height: "100%"
  },
  flatList: {
    width: "100%",
    paddingBottom: 60
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
  itemContainer: {
    width: "100%"
  },
  parentScrollView: {
    width: "100%",
    backgroundColor: "white"
  },
  contentContainer: {
    paddingBottom: 120
  },
  badge: {
    position: "absolute",
    top: -5
  }
};

const pickerSelectStyles = StyleSheet.create({
  remind_picker: {
    height: 250
  },

  remind_picker_container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0
  }
});

const styles = StyleSheet.create(style);

export default VideoLibrary;

VideoLibrary.propTypes = {
  videoInfoList: PropTypes.array
};

VideoLibrary.defaultProps = {
  videoInfoList: []
};
