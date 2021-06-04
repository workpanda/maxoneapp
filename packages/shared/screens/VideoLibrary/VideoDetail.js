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
  WebView,
  ScrollView,
  AsyncStorage
} from "react-native";
import _ from "lodash";
import HTMLView from "react-native-htmlview";
import AutoResizeHeightWebView from "react-native-autoreheight-webview";
import CommonStyles from "@m1/shared/theme/styles";
import { Image as CacheImage } from "react-native-expo-image-cache";
import { Video } from "expo";
import getRNDraftJSBlocks from "react-native-draftjs-render";

import AppColors from "@assets/theme/colors";
import Images from "@assets/images";
import VideoPlayer from "@m1/shared/components/VideoPlayer";
import { Feather } from "@expo/vector-icons";
const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const iconBackArrow = require("@m1/shared/assets/ic_back_white.png");
const overlayImage = require("@m1/shared/assets/large_overlay.png");
const playImage = require("@m1/shared/assets/playButton.png");
const PREFIX_URL =
  "https://s3.amazonaws.com/programax-videos-production/uploads/activity/image/";
const defaultImage = require("@m1/shared/assets/default-avatar.png");
class VideoDetail extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam("title", null),
    headerLeft: (
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{ marginLeft: 10 }}
      >
        <Feather name="arrow-left" size={24} color="white" />
      </TouchableOpacity>
    ),
    headerRight: <View />
  });

  constructor(props) {
    super(props);

    const { navigation } = this.props;

    var data = navigation.getParam("data", null);
    var attachmentType = "";
    var attachmentPath = "";
    if (data == null || data == {}) {
      navigation.goBack();
    }

    if (data.videoType == "youtube" || data.videoType == "vimeo") {
      if (data.videoType == "youtube") {
        attachmentPath = `https://www.youtube.com/embed/${data.videoId}`;
        attachmentType = "YOUTUBE";
      } else {
        attachmentPath = `https://player.vimeo.com/video/${
          data.videoId
        }?style=[object Object]`;
        attachmentType = "VIMEO";
      }
    } else {
      if (data.attachment == null) {
        attachmentType = "EMPTY";
      } else {
        if (data.attachment.toLowerCase().includes("/file/")) {
          attachmentType = "FILE";

          attachmentPath = `https://docs.google.com/viewer?url=${
            data.attachment
          }&embedded=true`;
        } else if (data.attachment.toLowerCase().includes("/image/")) {
          attachmentType = "IMAGE";
          attachmentPath = data.attachment;
        } else if (data.attachment.match(/\.(jpeg|jpg|gif|png)$/) != null) {
          data.attachment = PREFIX_URL + data.legacyId + "/" + data.attachment;
          attachmentType = "IMAGE";
          attachmentPath = data.attachment;
        } else {
          attachmentType = "VIDEO";
          attachmentPath = data.attachment;
        }
      }
    }

    console.log("AttachmentPath===============", attachmentPath);
    console.log("attachmentType===============", attachmentType);

    console.log(SCREEN_WIDTH);
    var description = data.description;
    var isJson = false;
    if (this.isJson(description) && description) {
      description = getRNDraftJSBlocks({
        contentState: JSON.parse(description),
        customStyles: blockStyle
      });

      console.log("description", description);
      isJson = true;
    }
    this.state = {
      videoInfo: data,
      attachmentType: attachmentType,
      attachmentPath: attachmentPath,
      description: description,
      isJson: isJson,
      currentTeam: {}
    };

    this.mount = true;
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

    const currentTeam = _.find(
      userContext.appContextList,
      c => c.id === appContext.id
    );
    this.setState({ currentTeam: currentTeam });
  };

  componentWillUnmount() {
    this.mount = false;
  }

  isJson = str => {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  };

  componentWillReceiveProps(props) {}

  render() {
    return (
      <SafeAreaView style={styles.topContainer}>
        <StatusBar barStyle="light-content" translucent={false} />
        <ScrollView style={styles.top_parent}>
          {this.state.attachmentType == "EMPTY" && (
            <View
              style={[
                styles.backgroundContainer,
                styles.container,
                { height: SCREEN_WIDTH }
              ]}
            >
              {this.state.currentTeam && this.state.currentTeam.logo && (
                <CacheImage
                  style={[styles.backgroundImage, { height: SCREEN_WIDTH }]}
                  {...{ uri: this.state.currentTeam.logo }}
                />
              )}

              {this.state.currentTeam && !this.state.currentTeam.logo && (
                <Image
                  style={[styles.backgroundImage, { height: SCREEN_WIDTH }]}
                  source={defaultImage}
                />
              )}
            </View>
          )}

          {this.state.attachmentType == "IMAGE" && (
            <View
              style={[
                styles.backgroundContainer,
                styles.container,
                { height: SCREEN_WIDTH }
              ]}
            >
              <CacheImage
                style={[styles.backgroundImage, { height: SCREEN_WIDTH }]}
                {...{ uri: this.state.attachmentPath }}
              />
            </View>
          )}

          {this.state.attachmentType == "FILE" && (
            <AutoResizeHeightWebView
              source={{
                html: `<html><body style="margin: 0;"><iframe width="100%" height="100%" src="${
                  this.state.attachmentPath
                }" frameborder="0"></iframe></body></html>`
              }}
              defaultHeight={SCREEN_HEIGHT * 0.6}
              style={styles.attachmentContentForFile}
            />
          )}

          {this.state.attachmentType == "VIMEO" && (
            <AutoResizeHeightWebView
              source={{
                html: `<html><body style="margin: 0;background-color: #000000"><iframe width="100%" height="100%" src="${
                  this.state.attachmentPath
                }" frameborder="0"></iframe></body></html>`
              }}
              defaultHeight={SCREEN_WIDTH}
              style={styles.attachContent}
            />
          )}

          {this.state.attachmentType == "YOUTUBE" && (
            <WebView
              scalesPageToFit={true}
              javaScriptEnabled={true}
              source={{
                html:
                  '<html><meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" name="viewport" /><iframe src="' +
                  this.state.attachmentPath +
                  '?modestbranding=1&playsinline=1&showinfo=0&rel=0" frameborder="0" style="overflow:hidden;overflow-x:hidden;overflow-y:hidden;height:100%;width:100%;position:absolute;top:0px;left:0px;right:0px;bottom:0px" height="100%" width="100%"></iframe></html>'
              }}
              style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}
            />
          )}

          {this.state.attachmentType == "VIDEO" && (
            <VideoPlayer
              videoProps={{
                shouldPlay: false,
                resizeMode: Video.RESIZE_MODE_CONTAIN,
                source: {
                  uri: this.state.attachmentPath
                }
              }}
              isPortrait={true}
              playFromPositionMillis={0}
            />
          )}
          {this.state.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>{"Description"}</Text>
              {this.state.isJson && (
                <ScrollView style={{ flex: 1, width: "100%" }}>
                  {this.state.description}
                </ScrollView>
              )}

              {!this.state.isJson && (
                <View style={{ width: "100%" }}>
                  <HTMLView
                    value={this.state.description}
                    stylesheet={styles.descriptionContent}
                  />
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const blockStyle = StyleSheet.flatten({
  // Use .flatten over .create
  "ordered-list-item": {
    flex: 1
  },
  orderedListItemNumber: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
    alignSelf: "flex-start",
    marginTop: 1
  },
  orderedListItemContainer: {
    alignItems: "flex-start",
    justifyContent: "flex-start"
  }
});

let style = {
  top_parent: {
    width: "100%",
    height: "100%"
  },
  background: {
    backgroundColor: "#DFDFDF"
  },
  whiteBackground: {
    backgroundColor: "white"
  },

  topContainer: {
    width: "100%",
    flex: 1
  },

  container: {
    width: "100%"
  },

  descriptionTitle: {
    color: AppColors.app.dark,
    fontSize: 18
  },
  descriptionContent: {
    color: "#939393",
    fontSize: 5,
    letterSpacing: 0.05,
    lineHeight: 16
  },
  descriptionContainer: {
    padding: 10,
    width: "100%",
    flexDirection: "column",
    backgroundColor: "#F5F5F5",
    height: "100%"
  },
  backgroundImage: {
    width: "100%",
    left: 0,
    right: 0,
    top: 0,
    resizeMode: "cover",
    position: "absolute"
  },
  playImage: {
    width: 78,
    height: 78
  },
  backgroundContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15
  },
  duration: {
    position: "absolute",
    fontSize: 16,
    bottom: 10,
    right: 0,
    marginRight: 10,
    color: "white",
    letterSpacing: 0.07
  },
  overlayImage: {
    width: "100%",
    position: "absolute",
    bottom: 0
  },
  attachContent: {
    width: "100%",
    backgroundColor: "black"
  },
  attachmentContentForFile: {
    width: "100%"
  }
};

const styles = StyleSheet.create(style);

export default VideoDetail;

VideoDetail.propTypes = {
  videoInfo: PropTypes.any
};

VideoDetail.defaultProps = {
  videoInfo: null
};
