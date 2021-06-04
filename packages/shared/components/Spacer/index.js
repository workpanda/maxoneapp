/**
 * Spacer: Creates a spacing without having to add a margin style.
 * Example:
    <Spacer size={10} />
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import CommonColors from '@m1/shared/theme/colors'
import CommonSizes from '@m1/shared/theme/sizes'

/* Component ====================================================== */
const Spacer = ({ size, height, color }) => (
  <View
    style={{
      left: 0,
      right: 0,
      height: height,
      marginTop: size - height,
      backgroundColor: color,
      width: '100%'
    }}
  />
);

Spacer.propTypes = { 
  size: PropTypes.number,
  height: PropTypes.number,
  color: PropTypes.string  
};

Spacer.defaultProps = { 
  size: CommonSizes.spacerHeight,
  height: CommonSizes.spacerHeight,
  color: CommonColors.spacer
};

Spacer.componentName = 'Spacer';

/* Export Component ============================================== */
export default Spacer;
