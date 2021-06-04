import PropTypes from 'prop-types';
import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  ViewPropTypes,
  View,
  Image
} from 'react-native';
import CommonStyles from '@m1/shared/theme/styles'
const image_picker = require("@m1/shared/assets/image_picker.png");
export default class CustomView extends React.Component {
    renderIcon() {
        return (
            <View style={[styles.wrapper, this.props.wrapperStyle]}>
                <Image source={ image_picker } style={CommonStyles.lightNavBackImg} resizeMode='contain' />
            </View>
            
        );
    }
  render() {
    return (
        <TouchableOpacity
          style={[styles.container, this.props.containerStyle, {alignSelf: 'auto'}, ]}
          onPress={this.props.onPressActionButton || this.onActionsPress}
        >
          {this.renderIcon()}
        </TouchableOpacity>
      );
  }
}

const styles = StyleSheet.create({
  container: {
  },
  
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },
  wrapper: {
    borderRadius: 13,
    borderColor: 'transparent',
    borderWidth: 2,
    flex: 1,
  },
});

CustomView.defaultProps = {
  currentMessage: {},
  containerStyle: {},
  mapViewStyle: {},
};

CustomView.propTypes = {
  currentMessage: PropTypes.object,
  containerStyle: ViewPropTypes.style,
  mapViewStyle: ViewPropTypes.style,
};