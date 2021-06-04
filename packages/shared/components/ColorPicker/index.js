import React from "react";
import { View, Modal, TouchableWithoutFeedback, TouchableOpacity, Text } from "react-native";
import PropTypes from 'prop-types';
import { ColorWheel } from 'react-native-color-wheel';

import CommonStyles from '@m1/shared/theme/styles'
import CommonSizes from '@m1/shared/theme/sizes'
import { hsvToHex, hsvToRgb } from "colorsys";

class ColorPicker extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            selectedColor: '#ee0000',
        }
        this.mount = true
    }

    componentWillUnmount() {
        this.props.onClose()
        this.mount = false
    }

    _onPressSave = () => {
        this.props.onChangeColor(this.state.selectedColor)
        this.props.onClose()
    }

    _onPressCancel = () => {
        this.props.onClose()
    }

    _onColorChanged = (color) => {
        if (!this.mount) return
        if(!color) return
        
        let selectedColor = hsvToHex(color)
        this.setState({ selectedColor: selectedColor })
    }

    render() {
        let { isOpen, onClose, onChangeColor, defaultColor } = this.props
        return (
            <Modal
                animationType='fade'
                style={[CommonStyles.colorPickerModal, CommonStyles.commonRowCenter]}
                visible={isOpen}
                onRequestClose={onClose}>
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={[{ width: '100%', height: '100%' }, CommonStyles.commonRowCenter]}>
                        <View>
                            <ColorWheel
                                initialColor={defaultColor}
                                onColorChange={this._onColorChanged}
                                // onColorChangeComplete={onChangeColor}
                                style={CommonStyles.colorPickerFrame}
                                thumbStyle={CommonStyles.colorPickerThumb}
                                thumbSize={CommonSizes.colorPickerThumbSize}
                            />
                            <View style={[CommonStyles.colorPickerModalButtonRow, CommonStyles.commonRowCenter]}>
                                <TouchableOpacity onPress={this._onPressSave} style={CommonStyles.colorPickerModalButton}>
                                    <Text>{'Save'}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={this._onPressCancel} style={[CommonStyles.colorPickerModalButton, CommonStyles.colorPickerModalButtonSpacing]}>
                                    <Text>{'Cancel'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        )
    }
}

ColorPicker.propTypes = {
    onChangeColor: PropTypes.func,
    onClose: PropTypes.func,
    isOpen: PropTypes.bool,
    defaultColor: PropTypes.string
};

ColorPicker.defaultProps = {
    onChangeColor: () => { },
    onClose: () => { },
    isOpen: false,
    defaultColor: '#ee0000'
};

ColorPicker.componentName = 'ColorPicker';

export default ColorPicker;
