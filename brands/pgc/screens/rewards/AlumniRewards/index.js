import React, { PureComponent } from "react";
import {
  Text,
  View,
  Alert,
  Linking,
  FlatList,
  StyleSheet,
  Image,
  AsyncStorage,
  Dimensions,
  ScrollView,
  ImageBackground,
  TouchableOpacity
} from "react-native";
import _ from "lodash";
import Images from "@assets/images";
import AppColors from "@assets/theme/colors";
import CommonStyles from "@m1/shared/theme/styles";
import FontIcon from "@m1/shared/components/FontIcon";
import PolygonButton from "@m1/shared/components/PolygonButton";
import { Avatar, Badge, Icon, withBadge } from "react-native-elements";
const pgcUrl = "https://pgcbasketball.com/alumni-rewards-skills-academy-1";
var readChatTimer = -1;
export default class AlumniRewards extends PureComponent {
  static navigationOptions = ({ navigation }) => {
    var onAdd = () => {};
    var bShowAddButton = true;
    let params = navigation.state.params;
    var unReadChatCount = 0;
    if (params && params.onAdd) {
      onAdd = params.onAdd;
    }

    if (params && params.unReadChatCount) {
        unReadChatCount = params.unReadChatCount;
    }

    if (params) {
      bShowAddButton = params.bShowAddButton;
    }

    var appContext =
      navigation.state.params && navigation.state.params.appContext
        ? navigation.state.params.appContext
        : {};

    return {
      headerTitle: (
        <Image
          style={{ height: 22, width: 160 }}
          resizeMode="contain"
          source={Images.logoHeader}
        />
      ),
      headerLeft: null,
      headerRight: bShowAddButton ? (
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
              <TouchableOpacity style={CommonStyles.navRightContainer}>
                <FontIcon name="chat1" size={20} color={"#fff"} />
              </TouchableOpacity>
              {unReadChatCount > 0 && (
                <Badge
                  value={unReadChatCount}
                  status="error"
                  containerStyle={[styles.badge, {right: unReadChatCount > 9 ? 5 : 8}]}
                />
              )}
            </TouchableOpacity>
          )}
        </View>
      ) : null
    };
  };

  async componentDidMount() {
    var appContextString = await AsyncStorage.getItem("@M1:appContext");
    var appContext = JSON.parse(appContextString);
    this.props.navigation.setParams({
      bShowAddButton: true,
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
  }

  componentWillUnmount() {
      this.mount = false;
    clearInterval(readChatTimer);
  }

  handleOnPress() {
    Linking.openURL(pgcUrl);
  }

  render() {
    return (
      // need to replace this with new image once we get it
      <ImageBackground
        style={CommonStyles.container}
        source={Images.bgReward}
        imageStyle={CommonStyles.imageBackground}
      >
        <View style={styles.contentParentContainer}>
          <ScrollView style={{ flex: 1 }}>
            <View style={styles.contentContainer}>
              <View>
                <Image
                  resizeMode="contain"
                  style={{
                    marginBottom: 50,
                    marginTop: 20,
                    width: 300,
                    height: 100
                  }}
                  source={Images.logoSplash}
                />
              </View>
              <View>
                <Text style={styles.styledHeaderText}>Alumni Rewards</Text>
                <Text style={styles.styledText}>
                  Attending multiple PGC camps deepens the impact for every player, so we want to do everything possible to make returning easier with three special ways to save:
                </Text>
                <View style={styles.listTextContainer}>
                  <Text style={styles.styledText}>
                    1. Alumni Discount
                  </Text>
                  <Text style={styles.styledText}>
                    2. 3-Camp Pass
                  </Text>
                  <Text style={styles.styledText}>
                    3. Summer Lifetime Pass
                  </Text>
                </View>
                <Text style={styles.styledHeaderText}>
                  Limited-Time Opportunity
                </Text>
                <Text style={styles.styledText}>
                  Alumni Rewards pricing is only available during your camp and within five (5) days following check-out.
                </Text>
              </View>
              <PolygonButton
                title={"CHECK IT OUT"}
                customColor={AppColors.button.background}
                textColor={AppColors.button.text}
                onPress={this.handleOnPress}
              />
              <View style={{ height: 50, minHeight: 50 }} />
            </View>
          </ScrollView>
        </View>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: 20,
    width: "100%",
    height: "100%",
    flexDirection: "column",
    alignItems: "center"
  },
  contentParentContainer: {
    width: "100%",
    height: "100%",

    backgroundColor: "rgba(0,0,0, 0.3)"
  },
  styledHeaderText: {
    fontSize: 25,
    color: "white",
    fontWeight: "bold"
  },
  styledText: {
    fontSize: 15,
    color: "white"
  },
  listTextContainer: {
    margin: 20
  },
  buttonGroupContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    left: 20,
    right: 20,
    position: "absolute",
    bottom: 100
  },
  badge: {
    position: "absolute",
    top: -5
  }
});
