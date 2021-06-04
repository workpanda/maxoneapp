import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Text
} from "react-native";

import navmap from "./navmap";
import storage from "@m1/shared/services/storage";


const windowWidth = Dimensions.get("window").width;

const S = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 50,
    elevation: 2,
    paddingTop: 10,
    paddingBottom:5,
    alignItems: "center",

    backgroundColor: 'white'

  },
  tabButton: { flex: 1 },
  scaler: { flex: 1, alignItems: "center", justifyContent: "center" }
});

class TabBar extends React.Component {
  SpotLight = undefined;
  spotlightStyle = undefined;
  Inner = undefined;
  userRole = undefined;

  state = {
    userRole: null
  };

  constructor(props) {
    super(props);
    this.init();
  }

  async componentDidMount() {
    this.getUserContent();
  }

  componentDidUpdate(prevProps) {
    const numTabs = this.props.navigation.state.routes.length;
    const prevNumTabs = prevProps.navigation.state.routes.length;
    if (numTabs !== prevNumTabs) {
      this.init();
    }
  }

  init() {
    const numTabs = this.props.navigation.state.routes.length;
    const tabWidth = windowWidth / numTabs;
    const poses = Array.from({ length: numTabs }).reduce((poses, _, index) => {
      return { ...poses, [`route${index}`]: { x: tabWidth * index } };
    }, {});

    const styles = StyleSheet.create({
      spotlight: {
        width: tabWidth,
        height: "100%",
        justifyContent: "center",
        alignItems: "center"
      }
    });

    this.spotlightStyle = styles.spotlight;
    const { tabColors } = this.props;
  }

  getUserContent = async () => {
    const appContext = await storage.get("@M1:appContext");

    if (appContext && appContext.isAthlete) return this.setState({ userRole: "Athlete" });
    else if (
      (appContext && appContext.isCoach) ||
      (appContext && appContext.isHeadCoach) ||
      (appContext && appContext.isOwner) ||
      (appContext && appContext.isStaff)
    )
      return this.setState({ userRole: "Coach" });
    else if (
      (appContext && appContext.isGuardian && appContext.id ))
    return this.setState({ userRole: "Parent" })
    else return this.setState({ userRole: "ParentNoAthlete" });
  };

  render() {
    const {
      renderIcon,
      activeTintColor,
      inactiveTintColor,
      onTabPress,
      onTabLongPress,
      getLabelText,
      getAccessibilityLabel,
      navigation
    } = this.props;

    const { routes, index: activeRouteIndex } = navigation.state;
    const { spotlightStyle } = this;

    
    if (!this.state.userRole)
      return (
        <SafeAreaView>
          <View style={S.container} />
        </SafeAreaView>
      );

    return (
      <SafeAreaView>
        <View style={S.container}>
          {routes.map((route, routeIndex) => {
            const isRouteActive = routeIndex === activeRouteIndex;
            const tintColor = isRouteActive
              ? activeTintColor
              : inactiveTintColor;

            if (!navmap[this.state.userRole].includes(route.key) )
              return <View key={routeIndex} />;

            return (
              <TouchableOpacity
                key={routeIndex}
                style={S.tabButton}
                onPress={() => {
                  onTabPress({ route });
                }}
                onLongPress={() => {
                  onTabLongPress({ route });
                }}
                accessibilityLabel={getAccessibilityLabel({ route })}
              >
                <View style={S.scaler}>
                    {
                        this.state.userRole === "Athlete" && activeRouteIndex == 8 && routeIndex == 0 &&
                        renderIcon({ route, focused: true, tintColor})
                    }

                    {
                        !(this.state.userRole === "Athlete" && activeRouteIndex == 8 && routeIndex == 0) &&
                        renderIcon({ route, focused: isRouteActive, tintColor})
                    }



                  <Text style={{ fontSize: 12, paddingTop: 5 }}>
                    {
                        this.state.userRole === "Athlete" && activeRouteIndex == 8 && routeIndex == 0 &&
                        getLabelText({ route, focused: true, tintColor })
                    }

                    {
                        !(this.state.userRole === "Athlete" && activeRouteIndex == 8 && routeIndex == 0) &&
                        getLabelText({ route, focused: isRouteActive, tintColor })
                    }

                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>
    );
  }
}

export default TabBar;
