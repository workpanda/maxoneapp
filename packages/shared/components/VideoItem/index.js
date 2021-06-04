import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Image as CacheImage } from 'react-native-expo-image-cache'
import Images from "@assets/images";
const playImage = require("@m1/shared/assets/playButton.png")
const overlayImage = require("@m1/shared/assets/overlay.png")
const defaultImage = require("@m1/shared/assets/default-avatar.png")
/* Component ====================================================== */

class VideoItem extends React.Component {
    constructor(props) {
        super(props)
        
        let {imagePath, description, title, duration, itemHeight, item} = props;

        this.state = {
            imagePath: imagePath,
            description: description,
            title: title,
            duration: duration,
            itemHeight: itemHeight,
            item: item
        }

        this.mount = true
    }

    componentWillMount() {
        
    }

    componentWillUnmount() {
        this.mount = false
    }

    componentWillReceiveProps(props) {
        let {imagePath, description, title, duration, itemHeight, item} = props;

        this.setState({
            imagePath: imagePath,
            description: description,
            title: title,
            duration: duration,
            itemHeight: itemHeight,
            item: item
        })

    }

    onPress = (item) =>{
        
        this.props.onPress(item)
    }

    render() {
        return (
            <TouchableOpacity style={{backgroundColor: 'white', width: this.state.itemHeight - 20}} onPress={()=> this.onPress(this.state.item)}>
                <View style={[ styles.backgroundContainer, { height: this.state.itemHeight - 20, width: this.state.itemHeight - 20 }]}>
                    {
                        this.state.imagePath != "" && 
                        (<CacheImage style={[ styles.backgroundImage, { height: this.state.itemHeight - 20 }]} {...{uri: this.state.imagePath}} transitionDuration={10}/>)
                        
                    }

                    {
                        this.state.imagePath == "" && 
                        <Image style={[ styles.backgroundImage, { height: this.state.itemHeight - 20}]} source={defaultImage} />
                    }
                    
                    <Image source={overlayImage} style={styles.overlayImage}/>
                    <Text style={styles.duration}>{this.state.duration}</Text>
                    <Image source={playImage} style={styles.playImage}/>
                </View>
                
                <Text style={ styles.title } ellipsizeMode={'tail'} numberOfLines={1}>{this.state.title}</Text>
            </TouchableOpacity>
        )
    }
}

VideoItem.propTypes = { 
    imagePath: PropTypes.string,
    description: PropTypes.string,
    title: PropTypes.string,
    duration: PropTypes.string,
    itemHeight: PropTypes.float,
    item: PropTypes.any,
    onPress: PropTypes.func
};

VideoItem.defaultProps = { 
    imagePath: '',
    description: '',
    title: '',
    duration: '',
    itemHeight: 150,
    item: null,
    onPress: ()=>{}
};
let style = {
    overlayImage: {
        width: '100%', 
        position:'absolute', 
        bottom: 0
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


/* Export Component ============================================== */
export default VideoItem;