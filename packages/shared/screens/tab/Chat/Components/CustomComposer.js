import PropTypes from 'prop-types';
import React from 'react';
import { Platform, StyleSheet, TextInput } from 'react-native';

const MIN_COMPOSER_HEIGHT = Platform.select({
  ios: 33,
  android: 41,
});
const MAX_COMPOSER_HEIGHT = 200;
const DEFAULT_PLACEHOLDER = 'Type a message...';
const DATE_FORMAT = 'll';
const TIME_FORMAT = 'LT';

export default class CustomComposer extends React.Component {

  onContentSizeChange(e) {
    const { contentSize } = e.nativeEvent;

    // Support earlier versions of React Native on Android.
    if (!contentSize) return;

    if (
      !this.contentSize ||
      this.contentSize.width !== contentSize.width ||
      this.contentSize.height !== contentSize.height
    ) {
      this.contentSize = contentSize;
      this.props.onInputSizeChanged(this.contentSize);
    }
  }

  onChangeText(text) {
    this.props.onTextChanged(text);
  }

  render() {
    return (
      <TextInput
        testID={this.props.placeholder}
        accessible
        accessibilityLabel={this.props.placeholder}
        placeholder={this.props.placeholder}
        placeholderTextColor={this.props.placeholderTextColor}
        multiline={this.props.multiline}
        onChange={(e) => this.onContentSizeChange(e)}
        onContentSizeChange={(e) => this.onContentSizeChange(e)}
        onChangeText={(text) => this.onChangeText(text)}
        style={[styles.textInput, this.props.textInputStyle, { height: this.props.composerHeight, paddingVertical: 0}]}
        autoFocus={this.props.textInputAutoFocus}
        value={this.props.text}
        enablesReturnKeyAutomatically
        underlineColorAndroid="transparent"
        keyboardAppearance={this.props.keyboardAppearance}
        {...this.props.textInputProps}
      />
    );
  }

}

const styles = StyleSheet.create({
  textInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    
    marginTop: Platform.select({
      ios: 6,
      android: 0,
    }),
    marginBottom: Platform.select({
      ios: 5,
      android: 3,
    }),
  },
});

CustomComposer.defaultProps = {
  composerHeight: MIN_COMPOSER_HEIGHT,
  text: '',
  placeholderTextColor: 'black',
  placeholder: DEFAULT_PLACEHOLDER,
  textInputProps: null,
  multiline: true,
  textInputStyle: {},
  textInputAutoFocus: false,
  keyboardAppearance: 'default',
  onTextChanged: () => {},
  onInputSizeChanged: () => {},
};

CustomComposer.propTypes = {
  composerHeight: PropTypes.number,
  text: PropTypes.string,
  placeholder: PropTypes.string,
  placeholderTextColor: PropTypes.string,
  textInputProps: PropTypes.object,
  onTextChanged: PropTypes.func,
  onInputSizeChanged: PropTypes.func,
  multiline: PropTypes.bool,
  textInputStyle: TextInput.propTypes.style,
  textInputAutoFocus: PropTypes.bool,
  keyboardAppearance: PropTypes.string,
};