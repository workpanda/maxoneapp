import React from "react";
import { Text, View, TouchableHighlight } from "react-native";
import PropTypes from 'prop-types';

import CommonStyles from '@m1/shared/theme/styles'

const AddEventButton = ({onPress}) => {
    return (
        <TouchableHighlight onPress={onPress} style={[CommonStyles.addEventButtonFrame, CommonStyles.commonRowCenter]}>
            <Text style={CommonStyles.addEventButtonTitle}>{'+'}</Text>
        </TouchableHighlight>
    )
};

AddEventButton.propTypes = {
    onPress: PropTypes.func
};

AddEventButton.defaultProps = {
    onPress: () => {}
};

AddEventButton.componentName = 'AddEventButton';

export default AddEventButton;
