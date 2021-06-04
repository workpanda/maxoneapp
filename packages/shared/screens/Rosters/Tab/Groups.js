import React from "react";
import PropTypes from "prop-types";

import {
  AsyncStorage,
  SafeAreaView,
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator
} from "react-native";

import _ from "lodash";

import GroupList from "@m1/shared/screens/Rosters/Tab/Components/GroupList";

import ActionButton from "react-native-action-button";
import AppColors from "@assets/theme/colors";
import { withNavigation } from "react-navigation";
import ContextService from "@m1/shared/services/context";
import { NavigationEvents } from "react-navigation";


const contextService = new ContextService();

var groupData = [];

class Groups extends React.Component {
  constructor(props) {
    super(props);

    this.mount = true;
    var { groups } = props;

    groupData = groups;

    this.state = {
      username: "",
      currentTeam: {},
      showQRCode: false,
      athletesList: [],
      coachesList: [],
      appContext:{},
        groups: []
    };
  }

  componentWillUnmount() {
    this.mount = false;
  }

  componentWillReceiveProps(props) {
    if(JSON.stringify(this.props.groups) != JSON.stringify(props.groups)) {
        console.log("X");
        this.setState({
            groups: props.groups
        })
    }
  }

componentDidMount = async () => {
    var userContextString = await AsyncStorage.getItem("@M1:userContext");
    var appContextString = await AsyncStorage.getItem("@M1:appContext");
    var userContext = JSON.parse(userContextString);
    var appContext = JSON.parse(appContextString);

    this.setState({ username: userContext.user.username, appContext });

    const currentTeam = _.find(
      userContext.appContextList,
      c => c.id === appContext.id
    );

    this.setState({ currentTeam: currentTeam });
  };

  async checkAppContextChanged() {
    var appContextString = await AsyncStorage.getItem("@M1:appContext");
    var appContext = JSON.parse(appContextString);

    if (this.state.appContext && appContext !== this.state.appContext) {
      await this.componentDidMount();
    }
  }

  render() {
    let { addNewRosterGroup } = this.props;
    return (
      <SafeAreaView style={styles.container_background}>
        <NavigationEvents onDidFocus={() => this.checkAppContextChanged()} />
        <StatusBar barStyle="light-content" translucent={false} />
        <ScrollView style={[styles.whiteBackground]} horizontal={false}>
          {this.state.groups.map((item, index) => {
            return (
              <GroupList
                groupTitle={item.name}
                groupId={item.id}
                groupIdentify={item.id}
                groupList={item.participants}
                bShowCheckBox={false}
                key={"b" + index}
                appContext={this.state.appContext}
                currentTeam={this.state.currentTeam}
                clickGroupTitle={groupId => this.props.groupClick(groupId)}
                checkExpand={groupId => this.props.checkExpand(groupId)}
                isExpand={item.isExpand}
              />
            );
          })}
        </ScrollView>

        {this.state.loading && (
          <View style={styles.loading}>
            <ActivityIndicator size="large" />
          </View>
        )}
        {!this.state.showQRCode && (!this.state.appContext.isStaff || this.state.appContext.isStaff && contextService.isStaffPermitted(this.state.currentTeam, 'canInviteUsers')) ? (
          <ActionButton
            buttonColor={AppColors.brand.orange}
            onPress={() => addNewRosterGroup()}
          />
        ) : null}
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
    backgroundColor: "#DFDFDF",
    height: "100%"
  },
  top_parent: {
    width: "100%",
    height: "100%"
  },
  whiteBackground: {
    backgroundColor: "white"
  },
  background: {
    backgroundColor: "#DFDFDF"
  },
  qr_code_container: {
    width: "100%",
    height: 90,
    backgroundColor: "transparent"
  },
  qr_code_sub_container: {
    flexDirection: "row",
    flex: 1
  },
  qr_code_image: {
    width: 28,
    height: 28
  }
};

const styles = StyleSheet.create(style);

export default withNavigation(Groups);

Groups.propTypes = {
  groups: PropTypes.array,
  groupClick: PropTypes.func
};

Groups.defaultProps = {
  groups: [],
  groupClick: () => {}
};
