import PropTypes from 'prop-types'
import React, { ReactNode } from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewPropTypes,
  ViewStyle,
  TextStyle,
  Platform
} from 'react-native'
import Color from './Color'

interface ActionsProps {
  options?: { [key: string]: any }
  optionTintColor?: string
  icon?: () => ReactNode
  wrapperStyle?: ViewStyle
  iconTextStyle?: any
  containerStyle?: ViewStyle
  onPressActionButton?(): void
}

export default class Actions extends React.Component<ActionsProps> {
  static defaultProps: ActionsProps = {
    options: {},
    optionTintColor: Color.optionTintColor,
    icon: undefined,
    containerStyle: {},
    iconTextStyle: {},
    wrapperStyle: {},
  }

  static propTypes = {
    onSend: PropTypes.func,
    options: PropTypes.object,
    optionTintColor: PropTypes.string,
    icon: PropTypes.func,
    onPressActionButton: PropTypes.func,
    wrapperStyle: ViewPropTypes.style,
    containerStyle: ViewPropTypes.style,
  }

  static contextTypes = {
    actionSheet: PropTypes.func,
  }

  onActionsPress = () => {
    const { options } = this.props
    const optionKeys = Object.keys(options!)
    const cancelButtonIndex = optionKeys.indexOf('Cancel')
    this.context.actionSheet().showActionSheetWithOptions(
      {
        options: optionKeys,
        cancelButtonIndex,
        tintColor: this.props.optionTintColor,
      },
      (buttonIndex: number) => {
        const key = optionKeys[buttonIndex]
        if (key) {
          options![key](this.props)
        }
      },
    )
  }
  getIconTextStyle = () => {
      if(Platform.OS === 'ios') {
          return {
            color: Color.defaultColor,
            fontWeight: 'bold',
            fontSize: 16,
            backgroundColor: Color.backgroundTransparent,
            textAlign: 'center',
            textAlignVertical: 'center',
            lineHeight: 16,
            justifyContent: 'center'
          }
      }else {
        return {
            color: Color.defaultColor,
            fontWeight: 'bold',
            fontSize: 16,
            
            textAlign: 'center',
            textAlignVertical: 'center',
            lineHeight: 16,
            width: 16,
            height: 16,
            alignSelf: 'center',
            marginTop: 2

          }
      }
  }
  renderIcon() {
    if (this.props.icon) {
      return this.props.icon()
    }
    return (
      <View style={[styles.wrapper, this.props.wrapperStyle]}>
        <Text style={[this.getIconTextStyle(), this.props.iconTextStyle]}>+</Text>
      </View>
    )
  }

  render() {
    return (
      <TouchableOpacity
        style={[styles.container, this.props.containerStyle]}
        onPress={this.props.onPressActionButton || this.onActionsPress}
      >
        {this.renderIcon()}
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },
  wrapper: {
    borderRadius: 13,
    borderColor: Color.defaultColor,
    borderWidth: 2,
    flex: 1,
    justifyContent:'center',
    alignItems: 'center'
  },
  iconText: {
    color: Color.defaultColor,
    fontWeight: 'bold',
    fontSize: 16,
    backgroundColor: Color.backgroundTransparent,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 16,
    justifyContent: 'center'
  },
})
