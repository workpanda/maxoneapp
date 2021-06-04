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

import FontIcon from "@m1/shared/components/FontIcon";
import Images from "@assets/images";
const SCREEN_WIDTH = Dimensions.get("window").width - 12;


class DashboardScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {

    let params = navigation.state.params;

    var appContext = navigation.state.params && navigation.state.params.appContext ? navigation.state.params.appContext : {}

    return {
      headerTitle: (
        <Image
          style={{ height: 22, width: 160 }}
          resizeMode="contain"
          source={Images.logoHeader}
        />
      ),
      headerLeft: null,
      headerRight:
        <View style={{ flexDirection: "row" }}>
        {
          appContext.isCoach || appContext.isOwner || appContext.isHeadCoach
        ?
          <TouchableOpacity
            onPress={() => navigation.navigate("MESSAGES")}
            style={CommonStyles.navRightContainer}
          >
            <FontIcon name="send" size={20} color={"#fff"} />
          </TouchableOpacity>
          :
          null
        }
          <TouchableOpacity
            onPress={() => navigation.navigate("Conversations")}
            style={CommonStyles.navRightContainer}
          >
            <FontIcon name="chat1" size={20} color={"#fff"} />
          </TouchableOpacity>
        </View>
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      search: "",
      username: "",
      currentTeam: {},

    };

    this.mount = true;
  }

  componentWillMount() { }

  componentWillUnmount() {
    this.mount = false;
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
    this.setState({ currentTeam: currentTeam, appContext });


  };



  componentWillReceiveProps(props) {
    if (!this.mount) return;
  }



  render() {
    return (
      <SafeAreaView style={styles.whiteBackground}>
        <StatusBar barStyle="light-content" translucent={false} />

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
  background: {
    backgroundColor: "#DFDFDF"
  },
  whiteBackground: {
    backgroundColor: "white"
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

export default DashboardScreen;

DashboardScreen.propTypes = {
  videoInfoList: PropTypes.array
};

DashboardScreen.defaultProps = {
  videoInfoList: []
};
