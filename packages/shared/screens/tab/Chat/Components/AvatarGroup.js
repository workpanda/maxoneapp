import PropTypes from 'prop-types';
import React from 'react';
import {
  
  StyleSheet,
  View,
  Text,
  
} from 'react-native';

import { Image as CacheImage } from 'react-native-expo-image-cache'

export default class AvatarGroup extends React.Component {
    getZIndex = (index) =>{
        return ({zIndex: index})
    }
    render() {
        let { avatarList, title} = this.props;

        return (
            <View style={styles.container}>
                <View style={styles.avatars}>
                    {
                        avatarList &&
                        avatarList.reverse().map((item, index) => {
                            return (
                                <View style={[styles.avatar, {backgroundColor: 'red'}]} key={index}>
                                    <CacheImage style={styles.avatar_img} {...{uri: item}}/>
                                </View>
                            )
                        })
                    }
                </View>
                {
                    avatarList && avatarList.length > 0 &&
                    <View style={styles.title_container}>
                        <Text style={styles.title}>{title}</Text>
                    </View>
                }

                {
                    avatarList && avatarList.length == 0 &&
                    <View style={[styles.title_container, styles.empty_margin, ]}>
                        <Text style={styles.title}>{title}</Text>
                    </View>
                }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        height: 28,
        flexDirection: 'row'
    },

    avatars: {
        flexWrap:'wrap',
        flexDirection: 'row-reverse',
    },

    avatar: {
        marginLeft: -19,
        position: 'relative',
        borderRadius: 14,
        overflow: 'hidden',
        width: 28,
        height: 28
    },
    avatar_img: {
        width: 28,
        height: 28,
        backgroundColor: 'white'
    },
    title_container: {
        color: 'white',
        justifyContent: 'center',
        marginLeft: 10,
        height: 28
    },
    title_container: {
        color: 'white',
        justifyContent: 'center',
        marginLeft: 10,
        height: 28
    },
    empty_margin: {
        marginLeft: 0
    },
    title: {
        color: 'white',
        justifyContent: 'center',
    }
});

AvatarGroup.defaultProps = {
    avatarList: [],
    title: ''
};

AvatarGroup.propTypes = {
    avatarList: PropTypes.array,
    title: PropTypes.string
};
