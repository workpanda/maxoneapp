import React from "react";
import { Font } from "expo";
import { View } from "react-native";

import { createIconSetFromIcoMoon } from "@expo/vector-icons";
import icoMoonConfig from "@assets/fonts/selection.json";
import icomoonTtf from "@assets/fonts/icomoon.ttf";

const Icon = createIconSetFromIcoMoon(icoMoonConfig, "Icomoon");

export default class FontIcon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fontLoaded: false
    };
  }

  async componentDidMount() {
    await Font.loadAsync({
      Icomoon: icomoonTtf
    });

    this.setState({ fontLoaded: true });
  }

  render() {
    return (
      <View>
        {this.state.fontLoaded && (
          <Icon
            name={this.props.name}
            size={this.props.size}
            color={this.props.color}
          />
        )}
      </View>
    );
  }
}
