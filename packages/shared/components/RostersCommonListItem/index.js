import PropTypes from 'prop-types';
import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
  Dimensions
} from 'react-native';

import { Image as CacheImage } from 'react-native-expo-image-cache'
import Spacer from '@m1/shared/components/Spacer';

const checkedImage = require("@m1/shared/assets/checkbutton.png")
const unCheckedImage = require("@m1/shared/assets/uncheckbutton.png")
const default_avatar = require("@m1/shared/assets/avatar-default.png")
const SCREEN_WIDTH = Dimensions.get("window").width;
export default class RostersCommonListItem extends React.Component {
    constructor(props) {
        super(props);

        let { data, bChecked, showCheckBox, showToggle, viewProfile, sendMessage, remove} = props;

        this.state = {
            data: data,
            toggle: false,
            bChecked: bChecked,
            showCheckBox: showCheckBox,
            showToggle: showToggle
        }

        this.mount = true;
    }

    getGeneralImageURL= (legacyId, avatarURL) => {
        var avatarPath = avatarURL
        if(avatarPath) {
            if(!avatarPath.includes("https://")) {
                avatarPath = `https://s3.amazonaws.com/programax-videos-production/uploads/user/avatar/${legacyId}/${avatarPath}`
            }
        }

        return avatarPath
    }

    componentWillReceiveProps(props) {
        let { data, bChecked, showCheckBox,showToggle, viewProfile, sendMessage, remove, clickCheckButton } = props;

        this.setState({
            data: data,
            bChecked: bChecked,
            showCheckBox: showCheckBox,
            showToggle: showToggle
        })
    }

    viewProfile = (id) => {
        let {viewProfile, sendMessage, remove} = this.props;

        if(viewProfile) {
            this.props.viewProfile(id)
        }
    }

    sendMessage = (id) => {
        let { viewProfile, sendMessage, remove} = this.props;

        if(sendMessage) {
            this.props.sendMessage(id)
        }
    }

    remove = (id) => {
        let { viewProfile, sendMessage, remove} = this.props;

        if(remove) {
            this.props.remove(id)
        }
    }

    clickCheckButton = (id) => {
        let { viewProfile, sendMessage, remove, clickCheckButton} = this.props;

        if(clickCheckButton) {
            clickCheckButton(id)
        }
    }

    clickItem = () => {
        this.setState({toggle: !this.state.toggle})
    }

    render() {
        return (

            <View style={styles.container}>

                <View style={styles.padding_container}>
                    <TouchableOpacity style={styles.group_child_container} onPress={()=>{this.clickItem()}}>
                        <View style={styles.avatar_container}>
                            {
                                this.state.data.avatarUrl == null &&
                                <Image style={styles.avatar_img} source={default_avatar}/>
                            }

                            {
                                this.state.data.avatarUrl !== null && this.state.data.avatarUrl !== undefined &&
                                <CacheImage style={styles.avatar_img} {...{uri: this.getGeneralImageURL(this.state.data.legacyId, this.state.data.avatarUrl)}}/>
                            }


                            <Text style={[styles.user_name, styles.general_text]}>{this.state.data.nameFirst} {this.state.data.nameLast}</Text>
                        </View>
                        {
                            this.state.bChecked && this.state.showCheckBox &&
                            <TouchableOpacity onPress={()=>{this.clickCheckButton(this.state.data.id)}}><Image source={checkedImage} style={styles.checkBoxImage}/></TouchableOpacity>
                        }

                        {
                            !this.state.bChecked && this.state.showCheckBox &&
                            <TouchableOpacity onPress={()=>{this.clickCheckButton(this.state.data.id)}}><Image source={unCheckedImage} style={styles.checkBoxImage}/></TouchableOpacity>
                        }

                    </TouchableOpacity>

                </View>
                {
                    this.state.showToggle && this.state.toggle &&
                    <View style={styles.menu_container}>
                        <View style={{width: SCREEN_WIDTH / 3, borderRightWidth: 2, borderRightColor: '#454545', justifyContent:'center', alignItems:'center'}}>
                            <Text style={[styles.menu_text_color, {alignItems: 'center'}]}>{"View Profile"}</Text>
                        </View>
                        <View style={{width: SCREEN_WIDTH / 3, borderRightWidth: 2, borderRightColor: '#454545', justifyContent:'center', alignItems:'center'}}>
                            <Text style={styles.menu_text_color}>{"Send Message"}</Text>
                        </View>
                        <View style={{width: SCREEN_WIDTH / 3, justifyContent:'center', alignItems:'center'}}>
                            <Text style={styles.menu_text_color}>{"Remove"}</Text>
                        </View>
                    </View>
                }

                <Spacer/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'column'
    },
    avatar_img: {
        width: 28,
        height: 28,
        backgroundColor: 'white',
        borderRadius: 14,
    },
    user_name: {
        marginLeft: 9
    },
    checkBoxImage: {
        width: 17,
        height: 17
    },

    general_text: {
        fontSize: 14
    },
    group_title_container: {
        flexDirection: 'row',
        height: 44,
        backgroundColor: '#E9E9E9',
        justifyContent:'space-between',
        alignItems:'center',
    },
    group_child_container: {
        flexDirection: 'row',
        width: '100%',
        height: 60,
        alignItems:'center',
        justifyContent:'space-between'
    },
    avatar_container: {
        flexDirection: 'row',
        alignItems:'center',
        height: 60
    },
    padding_container:{
        paddingLeft: 30,
        paddingRight: 30,
        backgroundColor: 'white'
    },
    menu_text_color: {
        color: '#454545',
        fontSize: 14
    },
    menu_container: {
        backgroundColor: '#c6c6c6',
        width: '100%',
        flexDirection: 'row',
        paddingTop: 10,
        paddingBottom: 10
    }

});

RostersCommonListItem.defaultProps = {
    data: {},
    bChecked: true,
    showCheckBox: true,
    showToggle: true,
    viewProfile: () => {},
    sendMessage: () => {},
    remove: () => {},
    clickCheckButton: () => {}
};

RostersCommonListItem.propTypes = {
    data: PropTypes.any,
    bChecked: PropTypes.bool,
    showCheckBox: PropTypes.bool,
    showToggle: PropTypes.bool,
    viewProfile: PropTypes.func,
    sendMessage: PropTypes.func,
    remove: PropTypes.func,
    clickCheckButton: PropTypes.func,
};
