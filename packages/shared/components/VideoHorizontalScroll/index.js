import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import VideoItem from '@m1/shared/components/VideoItem'
import AppColors from "@assets/theme/colors";
/* Component ====================================================== */
const SCREEN_WIDTH = Dimensions.get("window").width;

class VideoHorizontalScroll extends React.Component {
    constructor(props) {
        super(props)

        let { tagName, data } = props;

        this.mount = true

        if(data) {
            data.sort(function(x, y){
                if(x.name > y.name) {
                    return 1
                }

                if(x.name < y.name) {
                    return -1
                }

                return 0
            })
        }
        this.state = {
            tagName: this.capitalize(tagName),
            data: data
        }
    }

    componentWillMount() {

    }

    componentWillUnmount() {
        this.mount = false
    }

    onPress = (item) =>{
        this.props.onPress(item)
    }

    capitalize = (str) => {
        if (typeof str !== 'string') return ''
        return str.charAt(0).toUpperCase() + str.slice(1)
    }
    componentWillReceiveProps(props) {
        let { tagName, data } = props;

        this.setState({tagName: this.capitalize(tagName)})

        if(data) {
            data.sort(function(x, y){
                if(x.name > y.name) {
                    return 1
                }

                if(x.name < y.name) {
                    return -1
                }

                return 0
            })
        }
        this.setState({data: data})
    }

    render() {

        return (
            <View style={ styles.itemContainer }>
                <Text style={ styles.tag_title }>
                    {this.state.tagName}
                </Text>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                    {
                        this.state.data &&
                        this.state.data.map((item, index) => {
                            return (
                                <TouchableOpacity
                                    style={[
                                        index == 0 ? styles.itemLeft : (index == this.state.length - 1 ? styles.itemRight: styles.itemLeft),
                                        styles.background ]} key= {item.name + "_" + index}>
                                    <VideoItem
                                        style={ styles.itemContainer }
                                        imagePath={ item.thumbnail }
                                        description={ item.description }
                                        title={ item.name }
                                        duration={ item.duration }
                                        itemHeight={ SCREEN_WIDTH * 0.4 }
                                        item= {item}
                                        onPress={()=> this.onPress(item)}
                                        >
                                    </VideoItem>
                                </TouchableOpacity>
                            )
                        })
                    }
                </ScrollView>
            </View>
        )
    }
}

VideoHorizontalScroll.propTypes = {
    tagName: PropTypes.string,
    data: PropTypes.any,
    onPress: PropTypes.func
};

VideoHorizontalScroll.defaultProps = {
    tagName: '',
    data: [],
    onPress: ()=>{}
};
let style = {
    itemContainer: {
        width: '100%'
    },
    tag_title: {
        padding:5,
        fontSize: 15,
        backgroundColor: AppColors.brand.gamma,
        width: '100%',
        color: 'white'
    },
    overlayImage: {
        width: '100%',
        position:'absolute',
        bottom: 0
    },
    itemLeft: {
        marginLeft: 5,
        marginTop: 5,
        marginBottom: 5,
        marginRight: 0
    },
    itemRight: {
        marginLeft: 5,
        marginTop: 5,
        marginBottom: 5,
        marginRight: 5
    },
    playImage: {
        width: 50,
        height: 50,
    },
    container: {
        backgroundColor: 'white',
        width: '100%'
    },
    backgroundImage:{
        width: '100%',
        left: 0,
        right:0,
        top: 0,
        resizeMode: 'cover',
        position: 'absolute',
    },
    backgroundContainer: {
        justifyContent:'center',
        alignItems: 'center',
        marginBottom: 5
    },
    duration: {
        position:'absolute',
        fontSize: 10,
        bottom: 10,
        right:0,
        marginRight: 10,
        color: 'white'
    },
    title: {
        color: 'black',
        textAlign: 'left',
        paddingLeft: 6
    }
};

const styles = StyleSheet.create(style);

export default VideoHorizontalScroll;
