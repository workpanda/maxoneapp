import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  AsyncStorage,
  ActivityIndicator,
  Alert,
  Image,
  StatusBar
} from "react-native";
import { graphql, compose } from "react-apollo";
import { withApollo } from "react-apollo";
import ApolloClient from "apollo-client";
import PropTypes from "prop-types";

import { Query } from "react-apollo";

import {
  GiftedChat,
  Actions,
  Message,
  SystemMessage
} from "@m1/shared/screens/tab/Chat/Components/CustomGiftedChat";
import { Feather } from "@expo/vector-icons";
import KeyboardSpacer from "react-native-keyboard-spacer";
import CustomActions from "./Components/CustomActions";
import CustomView from "@m1/shared/screens/tab/Chat/Components/CustomView";
import CustomComposer from "@m1/shared/screens/tab/Chat/Components/CustomComposer";
import AvatarGroup from "@m1/shared/screens/tab/Chat/Components/AvatarGroup";
import CommonStyles from "@m1/shared/theme/styles";
import Modal from "react-native-modal";
import Spacer from "@m1/shared/components/Spacer";
import { Permissions, ImagePicker } from "expo";
import { Storage } from "aws-amplify";
import ChatBubble from "@m1/shared/screens/tab/Chat/Components/ChatBubble";
import Preview from "@m1/shared/screens/tab/Chat/Components/Preview";

import {
  getConvo,
  createMessage as CreateMessage,
  onCreateMessage as OnCreateMessage
} from "./graphql";
import { observer } from "mobx-react";
import uuid from "uuid/v4";
import moment from "moment";
import _ from "lodash";
import { API, Auth, graphqlOperation } from "aws-amplify";

const iconMore = require("@m1/shared/assets/more.png");

const EMPTY_STRING =
  "71BD144D001CAB84D701347C59BE0058739AEE986981886A06A9FF9DEA3F70D4080E284C3FB8DA45728103D4FF13AAD6374A1BECF0BD318B4A29338E6E2D2D4F";
const EMPTY_FILE = {
  bucket: null,
  region: null,
  key: null,
  __typename: "S3Object"
};
const VISIBILITY = "public";
const CANCEL_INDEX = 0;
const TAKE_PHOTO_INDEX = 1;
const SELECT_PHOTO_INDEX = 2;
const options = ["Cancel", "Take Photo", "Camera Roll"];
const title = "Change Your Photo";
var updateNotificationInterval = -1;
class ConversationView extends React.Component {
  static navigationOptions = ({ navigation }) => {
    var onShowMenu = () => {};

    let params = navigation.state.params;
    if (params && params.onShowMenu) {
      onShowMenu = params.onShowMenu;
    }
    var conversation =
      params.conversation && params.conversation.conversation
        ? params.conversation.conversation
        : {};
    var associatedItems =
      conversation.associated && conversation.associated
        ? conversation.associated.items
        : { items: [] };
    var avatarList = [];

    _.forEach(associatedItems, associated => {
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
      // title: 'Chat',
      headerTransparent: true,
      headerTitle: (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("ViewMembers", navigation.state.params)
          }
        >
          <AvatarGroup
            title={
              params.conversation &&
              params.conversation.conversation &&
              params.conversation.conversation.name
                ? params.conversation.conversation.name
                : "Conversation"
            }
            avatarList={avatarList}
          />
        </TouchableOpacity>
      ),
      headerLeft: (
        <TouchableOpacity
          onPress={() => {
            navigation.state.params.backToConversations
              ? navigation.navigate("Conversations")
              : navigation.goBack();
          }}
          style={{ marginLeft: 10 }}
        >
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
      ),
      headerRight: (
        <TouchableOpacity
          onPress={onShowMenu}
          style={CommonStyles.navRightContainer}
        >
          <Image
            source={iconMore}
            style={CommonStyles.chatNavRightImgWhite}
            resizeMode="contain"
          />
        </TouchableOpacity>
      ),
      tabBarVisible: false
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      loadEarlier: true,
      typingText: null,
      isLoadingEarlier: false,
      showMenu: false,
      user: {},
      message: "",
      loading: true,
      appContext: {}
    };

    // this.renderBubble = this.renderBubble.bind(this);
    // this.renderSystemMessage = this.renderSystemMessage.bind(this);
    this.renderFooter = this.renderFooter.bind(this);

    this._isAlright = null;
  }

  async componentWillMount() {
    console.log("Component will mount");
  }

  async componentDidMount() {
    this.mount = true;

    this.props.navigation.setParams({
      onShowMenu: this._clickRightNavigation
    });
    console.log("componentDidMount");
    clearInterval(updateNotificationInterval);
    const conversationId = this.props.navigation.state.params.conversation
      .conversation.id;
   
    var userContext = null;
    var userContext = null;
    var userContextString = await AsyncStorage.getItem("@M1:userContext");
    var appContextString = await AsyncStorage.getItem("@M1:appContext");

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
    updateNotificationInterval = setInterval(async () => {
      await this.updateChatChannelStatus(userContext.user.id, conversationId);
    }, 2000);
    this.setState({ user: userContext.user, appContext });
    this.props.navigation.setParams({
      userId: userContext.user.id,
      user: userContext.user,
      appContext: appContext,
      appContextId: appContext.id,
      currentTeam
    });

    this.props.subscribeToNewMessages();
    this.setState({ loading: false });
  }

  componentWillUnmount = async () => {
    this.mount = false;
    
    clearInterval(updateNotificationInterval);
    this.props.navigation.setParams({
      onShowMenu: null
    });
  };

  onChange = message => {
    this.setState({ message: message });
  };

  renderPreview = (url_matches, bubbleProps) => {
    const uri = url_matches[0];
    const text_color = bubbleProps.position == "right" ? "#FFF" : "#000";
    const modified_bubbleProps = {
      ...bubbleProps,
      uri
    };

    return (
      <ChatBubble {...modified_bubbleProps}>
        <Preview uri={uri} text_color={text_color} />
      </ChatBubble>
    );
  };

  renderMessage = msg => {
    const url_matches = msg.currentMessage.text.match(/\bhttps?:\/\/\S+/gi);

    const renderBubble = url_matches
      ? this.renderPreview.bind(this, url_matches)
      : null;

    const modified_msg = {
      ...msg,
      renderBubble
    };

    return <Message {...modified_msg} />;
  };

  _clickRightNavigation = () => {
    this.setState({ showMenu: true });
  };

  updateChatChannelStatus(userId, messageConversationId) {
    var param = {
      userId: userId,
      messageConversationId: messageConversationId
    };

    return API.post(
      "chatNotifications",
      `/chatNotifications/updateNotification`,
      {
        body: param
      }
    );
  }

  createMessage = async e => {
    if (this.state.message === "" && !this.state.selectedFile) return;

    var messageText = this.state.message.trim().slice(0);

    const username = this.state.user.id;
    const conversationId = this.props.navigation.state.params.conversation
      .conversation.id;
    const conversation = this.props.navigation.state.params.conversation
      .conversation;
    var selectedFile = this.state.selectedFile
      ? Object.assign({}, this.state.selectedFile)
      : null;

    this.setState({ selectedFile: null });
    this.setState({ message: "" });
    const message = {
      id: uuid(),
      createdAt: moment(),
      messageConversationId: conversationId,
      content: messageText == "" ? EMPTY_STRING : messageText,
      owner: username,
      chatbot: false,
      isSent: true,
      file: selectedFile ? selectedFile : null,
      conversation: conversation
    };

    var associatedItems =
      conversation.associated && conversation.associated
        ? conversation.associated.items
        : { items: [] };

    var associatedItemsList = [];

    _.forEach(associatedItems, associated => {
      if (associated.user && associated.user.id != this.state.user.id) {
        if (associated.status !== "DELETED") {
          associatedItemsList.push(associated.user.id);
        }
      }
    });

    await this.props.createMessage(message);

    if (messageText != "") {
      console.log("Image Upload");
      await Promise.all(
        associatedItemsList.map(async chip => {
          let sentPushNotification = null;
          if (chip)
            sentPushNotification = await this.handleNotificationSend(
              chip,
              conversationId,
              messageText
            );

            console.log(sentPushNotification);
        })
      );
    } else {
      await Promise.all(
        associatedItemsList.map(async chip => {
          let sentPushNotification = null;
          if (chip)
            sentPushNotification = await this.handleNotificationSend(
              chip,
              conversationId,
              "Image Shared"
            );
        })
      );
    }

    setTimeout(() => {
      this.setState({ loading: false });
    }, 1200);
  };

  handleNotificationSend(userId, conversationId, messageText) {
    var user = this.state.user ? this.state.user : {};
    var name = "";
    if (user && user.nameFirst) {
      name = name + user.nameFirst + " ";
    }
    if (user && user.nameLast) {
      name = name + user.nameLast;
    } else if (user && user.name) {
      name = user.name;
    }
    var currentTeam = this.props.navigation.state.params.currentTeam;

    var teamName = currentTeam.customName
      ? currentTeam.customName
      : currentTeam.name;

    var conversationName = this.props.navigation.state.params.conversation
      .conversation.name;

    var param = {
      userId: userId,
      message: messageText,
      messageConversationId: conversationId,
      title: `New chat from ${
        this.state.user.nameFirst ? this.state.user.nameFirst : ""
      } ${
        this.state.user.nameLast ? this.state.user.nameLast : ""
      } on ${teamName} in #${conversationName}`,
      senderId: this.state.user.id,
      teamId: currentTeam.id,
      conversationName: conversationName,
      userName: name
    };

    console.log(param);

    return API.post(
      "chatNotifications",
      `/chatNotifications/pushNotification`,
      {
        body: param
      }
    );
  }

  renderCustomActions(props) {
    const options = {
      "Take Photo": props => this._takePhoto(),
      "Camera Roll": props => this._choosePhoto(),
      Cancel: () => {}
    };
    return <Actions {...props} options={options} />;
  }

  renderBubble(props) {
    let color = props.position === "left" ? "black" : "white";

    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: "#f0f0f0",
            borderRadius: 20
          },
          right: {
            backgroundColor: "#1b86ff",
            borderRadius: 20
          }
        }}
        textProps={{ style: { color: color, borderRadius: 20 } }}
      />
    );
  }

  renderSystemMessage(props) {
    return (
      <SystemMessage
        {...props}
        containerStyle={{
          marginBottom: 15,
          borderRadius: 20
        }}
        textStyle={{
          fontSize: 14,
          color: "white"
        }}
      />
    );
  }

  renderCustomView(props) {
    return <CustomView {...props} />;
  }

  renderComposer(props) {
    return <CustomComposer {...props} />;
  }

  renderFooter(props) {
    if (this.state.typingText) {
      return (
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>{this.state.typingText}</Text>
        </View>
      );
    }
    return null;
  }

  async _takePhoto() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    if (status === "granted") {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: "Images",
        allowsEditing: false,
        aspect: [1, 1],
        base64: true
      });

      this.handleImageResult(result);
    } else {
      alert("Camera permission not granted");
      throw new Error("Camera roll permission not granted");
    }
  }

  async _choosePhoto() {
    const { user } = this.state;
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (status === "granted") {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "Images",
        allowsEditing: false,
        aspect: [1, 1],
        base64: true
      });
      // console.log('Result = ', result)
      this.handleImageResult(result);
    } else {
      alert("Camera roll permission not granted");
      //   throw new Error("Camera roll permission not granted");
    }
  }

  async handleImageResult(result) {
    const { navigation } = this.props;
    var userId = navigation.state.params.userId;
    var currentTeam = navigation.state.params.currentTeam;
    var conversation = navigation.state.params.conversation.conversation;

    if (!result.cancelled) {
      this.setState({ loading: true });
      var nameArr = result.uri.split("/");
      const orgId = currentTeam.organizationId;
      const teamId = currentTeam.id;
      const convoId = conversation.id;
      const idForS3 = orgId + "/" + teamId + "/" + convoId + "/" + userId;
      const fileStructure = `uploads/chat/${idForS3}/`;

      try {
        var buf = new Buffer.from(result.base64, "base64");
        const customPrefix = { public: "", private: "", protected: "" };
        const access = {
          level: "public",
          contentType: "image/jpeg",
          customPrefix: customPrefix
        };

        await Storage.put(
          `${fileStructure}${nameArr.slice(-1)[0]}`,
          buf,
          access
        )
          .then(async succ => {
            const file = {
              bucket: "programax-videos-production",
              key: succ.key,
              region: "us-east-1"
            };
            this.setState({ selectedFile: file });
            this.createMessage();
          })
          .catch(err => {
            Alert.alert("Error", `Uploading file error.`);
            console.log("ERRORS FO DAYS", err);
            this.setState({ loading: false });
          });
      } catch (e) {
        this.setState({ loading: false });
        console.log("Big ol error, ", e);
      }
    } else {
      console.log("CANCELLED");
    }
  }

  _deleteConversation = async () => {
    this.setState({ loading: true });
    this._cancelMenuItem();
    var conversation = this.props.navigation.state.params.conversation
      .conversation;
    // console.log('Conversation === ', conversation )
    // console.log("conversation.id  ", conversation.id);
    var convoLinks = conversation.associated.items;
    // var convoLinks = await this.getAllConvoLinks(conversation.id)
    await this.asyncForEach(convoLinks, async convoLink => {
      //   console.log("convoLink ", convoLink);
      try {
        await this.deleteConvoLink(conversation.id, convoLink.convoLinkUserId);
      } catch (e) {
        // console.log("e ", e);
      }
    });

    console.log("DONE DELETING CONVO LINKS");
    try {
      await this.deleteConversation(conversation.id);
    } catch (e) {
      //   console.log("e ", e);
    }
    this.setState({ loading: false });
    this.setState({ showMenu: false }, () => {
      this.props.navigation.navigate("Conversations");
    });
  };

  deleteConvoLink = async (conversationId, userId) => {
    // console.log("ConversationId: ", conversationId);
    // console.log("userId: ", userId);
    return API.del(
      "chat",
      `/users/${userId}/conversation/${conversationId}/link`
    );
  };

  deleteConversation = async conversationId => {
    return API.del("chat", `/conversation/${conversationId}`);
  };

  async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  _viewMembersMenuItem() {
    this.setState({ showMenu: false }, () => {
      setTimeout(() => {
        this.props.navigation.navigate(
          "ViewMembers",
          this.props.navigation.state.params
        );
      }, 1000);
    });
  }

  _updateConversationMenuItem() {
    this.setState({ showMenu: false }, () => {
      setTimeout(() => {
        this.props.navigation.navigate(
          "UpdateConversation",
          this.props.navigation.state.params
        );
      }, 1000);
    });
  }

  _viewConversationMenuItem() {
    this.setState({ showMenu: false }, () => {
      setTimeout(() => {
        this.props.navigation.navigate("Conversations");
      }, 1000);
    });
  }

  _deleteConversationMenuItem() {
    Alert.alert(
      `Delete ${this.props.navigation.state.params.conversation.conversation.name}`,
      `Are you sure you want to delete ${this.props.navigation.state.params.conversation.conversation.name}?  This action can not be undone`,
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "OK", onPress: async () => await this._deleteConversation() }
      ],
      { cancelable: true }
    );
  }

  _cancelMenuItem() {
    this.setState({ showMenu: false }, () => {});
  }

  renderMenuModal = () => {
    let { showMenu } = this.state;

    return (
      <Modal isVisible={showMenu} style={styles.menu_modal_position}>
        <View style={styles.menu_modal_dialog}>
          <TouchableOpacity
            style={styles.menu_modal_dialog_item}
            onPress={this._viewMembersMenuItem.bind(this)}
          >
            <Text style={styles.menu_modal_dialog_item_text}>
              {"View Members"}
            </Text>
          </TouchableOpacity>
          <Spacer />
          {this.state.appContext.isCoach == true && (
            <TouchableOpacity
              style={styles.menu_modal_dialog_item}
              onPress={this._updateConversationMenuItem.bind(this)}
            >
              <Text style={styles.menu_modal_dialog_item_text}>
                {"Edit Conversation"}
              </Text>
            </TouchableOpacity>
          )}

          {this.state.appContext.isCoach == true && <Spacer />}

          <Spacer />
          <TouchableOpacity
            style={styles.menu_modal_dialog_item}
            onPress={this._viewConversationMenuItem.bind(this)}
          >
            <Text style={styles.menu_modal_dialog_item_text}>
              {"View Conversations"}
            </Text>
          </TouchableOpacity>
          <Spacer />
          {this.state.appContext.isCoach == true && (
            <TouchableOpacity
              style={styles.menu_modal_dialog_item}
              onPress={this._deleteConversationMenuItem.bind(this)}
            >
              <Text
                style={[styles.menu_modal_dialog_item_text, { color: "red" }]}
              >
                {"Delete Conversation"}
              </Text>
            </TouchableOpacity>
          )}

          {this.state.appContext.isCoach == true && <Spacer />}

          <Spacer />
          <TouchableOpacity
            style={styles.menu_modal_dialog_item}
            onPress={this._cancelMenuItem.bind(this)}
          >
            <Text style={styles.menu_modal_dialog_item_text}>{"Close"}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  };

  render() {
    var { message, user } = this.state;
    var { data, navigation } = this.props;
    var conversationId = navigation.state.params.conversation.conversation.id;
    return user && user.id ? (
      <SafeAreaView style={CommonStyles.container}>
        <StatusBar barStyle="light-content" translucent={false} />
        <View style={{ flex: 1, marginTop: Platform.OS === "ios" ? 64 : 51 }}>
          <GiftedChat
            messages={this.props.messages}
            text={message}
            onInputTextChanged={message => this.onChange(message)}
            onSend={this.createMessage}
            isLoadingEarlier={this.state.isLoadingEarlier}
            showAvatarForEveryMessage={true}
            user={{
              _id: this.state.user.id // sent messages should have same user._id
            }}
            renderUsernameOnMessage={true}
            renderActions={this.renderCustomActions.bind(this)}
            renderMessage={this.renderMessage}
            renderComposer={this.renderComposer}
          />
          {Platform.OS === "android" ? <KeyboardSpacer /> : null}
          {this.renderMenuModal()}
          <Text>
            <Query query={getConvo} variables={{ id: conversationId }}>
              {({ loading, error, data }) => {
                if (loading) return <Text>Loading...</Text>;
                if (error) return <Text>`Error! ${error.message}`</Text>;

                return <Text />;
              }}
            </Query>
          </Text>
          {this.state.loading && (
            <View style={styles.loading}>
              <ActivityIndicator size="large" />
            </View>
          )}
        </View>
      </SafeAreaView>
    ) : (
      <View />
    );
  }
}

const styles = StyleSheet.create({
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
  menu_modal_position: {
    justifyContent: "flex-end",
    width: "100%",
    // paddingHorizontal: 0,
    marginHorizontal: 0,
    marginVertical: 0
  },
  menu_modal_dialog: {
    backgroundColor: "white",
    width: "100%",
    paddingBottom: 25
  },
  menu_modal_dialog_header: {
    width: "100%",
    height: 70,

    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "white"
  },
  menu_modal_dialog_header_text: {
    fontWeight: "bold",
    fontSize: 20,
    backgroundColor: "white"
  },
  menu_modal_dialog_item: {
    width: "100%",
    height: 60,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white"
  },
  menu_modal_dialog_item_text: {
    fontSize: 16
  },
  main_container: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1
  }
});

function checkSenderForMessageStyle(username, message) {
  if (username === message.owner) {
    return {
      backgroundColor: "#1b86ff",
      marginLeft: 50
    };
  } else {
    return { marginRight: 50 };
  }
}

function checkSenderForTextStyle(username, message) {
  if (username === message.owner) {
    return {
      color: "white"
    };
  }
}

ConversationView.propTypes = {
  client: PropTypes.instanceOf(ApolloClient)
};

const ConversationWithData = compose(
  graphql(getConvo, {
    options: props => {
      const conversationId =
        props.navigation.state.params.conversation.conversation.id;
      return {
        variables: {
          id: conversationId
        },
        fetchPolicy: "cache-and-network"
      };
    },
    props: props => {
      const conversationId =
        props.ownProps.navigation.state.params.conversation.conversation.id;
      let messages = props.data.getConvo
        ? props.data.getConvo.messages.items
        : [];

      var conversation =
        props.ownProps.navigation.state.params.conversation.conversation;
      const associated = conversation.associated.items
        ? conversation.associated.items
        : [];
      messages = messages.map(message => {
        message._id = message.id;
        message.text = message.content;
        message.conversation = null;
        var user = _.find(associated, ["convoLinkUserId", message.owner]);

        message.user = {
          _id: message.owner
        };
        message.user.avatar =
          user && user.user && user.user.avatarUrl ? user.user.avatarUrl : null;
        message.user.name = `${
          user && user.user && user.user.nameFirst ? user.user.nameFirst : ""
        } ${user && user.user && user.user.nameLast ? user.user.nameLast : ""}`;

        if (message.file) {
          // Check if the key is a jpg, jpeg, gif, png.  if so, then is type image.  if not, then it is type video.
          var key = message.file.key;
          var extArray = key.split(".");
          var ext = extArray[extArray.length - 1];

          if (ext.toLowerCase() === "jpg" || "jpeg" || "gif" || "png") {
            message.image =
              "https://s3.amazonaws.com/" +
              message.file.bucket +
              "/" +
              message.file.key;
          } else {
            message.video =
              "https://s3.amazonaws.com/" +
              message.file.bucket +
              "/" +
              message.file.key;
          }
        }
        return message;
      });

      messages = _.orderBy(
        messages,
        o => {
          return moment(o.createdAt).format("X");
        },
        ["desc"]
      );
      return {
        messages,
        data: props.data,
        subscribeToNewMessages: params => {
          props.data.subscribeToMore({
            document: OnCreateMessage,
            variables: { messageConversationId: conversationId },
            updateQuery: (
              prev,
              {
                subscriptionData: {
                  data: { onCreateMessage }
                }
              }
            ) => {
              let messageArray = prev.getConvo.messages.items.filter(
                message => message.id !== onCreateMessage.id
              );
              messageArray = messageArray.map(message => {
                message._id = message.id;
                message.text = message.content;
                message.conversation = null;
                var user = _.find(associated, [
                  "convoLinkUserId",
                  message.owner
                ]);

                message.user = {
                  _id: message.owner
                };
                message.user.avatar =
                  user && user.user && user.user.avatarUrl
                    ? user.user.avatarUrl
                    : null;
                message.user.name = `${
                  user && user.user && user.user.nameFirst
                    ? user.user.nameFirst
                    : ""
                } ${
                  user && user.user && user.user.nameLast
                    ? user.user.nameLast
                    : ""
                }`;

                if (message.file) {
                  // Check if the key is a jpg, jpeg, gif, png.  if so, then is type image.  if not, then it is type video.
                  var key = message.file.key;
                  var extArray = key.split(".");
                  var ext = extArray[extArray.length - 1];

                  if (ext.toLowerCase() === "jpg" || "jpeg" || "gif" || "png") {
                    message.image =
                      "https://s3.amazonaws.com/" +
                      message.file.bucket +
                      "/" +
                      message.file.key;
                  } else {
                    message.video =
                      "https://s3.amazonaws.com/" +
                      message.file.bucket +
                      "/" +
                      message.file.key;
                  }
                }
                return message;
              });
              messageArray = [...messageArray, onCreateMessage];

              messageArray = _.orderBy(
                messageArray,
                o => {
                  return moment(o.createdAt).format("X");
                },
                ["desc"]
              );
              return {
                ...prev,
                getConvo: {
                  ...prev.getConvo,
                  messages: {
                    ...prev.getConvo.messages,
                    items: messageArray
                  }
                }
              };
            }
          });
        }
      };
    }
  }),

  graphql(CreateMessage, {
    options: props => {
      const conversationId =
        props.navigation.state.params.conversation.conversation.id;
      return {
        update: (dataProxy, { data: { createMessage } }) => {
          const query = getConvo;
          const data = dataProxy.readQuery({
            query,
            variables: { id: conversationId }
          });

          data.getConvo.messages.items = data.getConvo.messages.items.filter(
            m => m.id !== createMessage.id
          );

          data.getConvo.messages.items.push(createMessage);

          dataProxy.writeQuery({
            query,
            data,
            variables: { id: conversationId }
          });
        }
      };
    },
    props: props => ({
      createMessage: message => {
        props.mutate({
          variables: message,
          optimisticResponse: {
            createMessage: { ...message, __typename: "Message" }
          }
        });
      }
    })
    // }),
    // graphql(CreateMessage, {
    //   options:  (props) => {
    //     const conversationId = props.navigation.state.params.conversation.conversation.id
    //     const data = props.data
    //
    //     return {
    //       update: (dataProxy, { data: { createMessage } }) => {
    //         const query = getConvo
    //         var data = {}
    //         try{
    //         console.log('props.client', props.client)
    //           data = dataProxy.readQuery({ query, variables: { id: conversationId } })
    //         }catch(e){
    //         console.log('data ', data)
    //         }
    //         if(!data){
    //           data = {}
    //         }
    //         if(!data.getConvo){
    //           data.getConvo = {}
    //         }
    //         if (!data.getConvo.messages){
    //           data.getConvo.messages = {items:[]}
    //         }
    //         data.getConvo.messages.items = data && data.getConvo && data.getConvo.messages ? data.getConvo.messages.items.filter(m => m.id !== createMessage.id) : []
    //         data.getConvo.messages.items.push(createMessage)
    //         data.getConvo.messages.items = data && data.getConvo && data.getConvo.messages ? _.orderBy(data.getConvo.messages.items, ['createdAt'],['desc']) : []
    //         dataProxy.writeQuery({ query, data, variables: { id: conversationId } })
    //       }
    //     }
    //   },
    //   props: (props) => ({
    //     createMessage: message => {
    //       console.log("message === ", message)
    //       const conversationId = props.ownProps.navigation.state.params.conversation.conversation.id
    //       console.log('conversationId ', conversationId)
    //       // console.log('data ', data)
    //       props.mutate({
    //         variables:message,
    //         optimisticResponse: {
    //           createMessage: { ...message, __typename: 'Message' }
    //         }
    //       })
    //     }
    //   }),
  })
  // graphqlMutation(createMessage, getConvo, 'Message')
)(ConversationView);

export default observer(ConversationWithData);

// export { ConversationViewWithData };
