import PropTypes from 'prop-types';
import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image
} from 'react-native';

import { Image as CacheImage } from 'react-native-expo-image-cache'
import Spacer from '@m1/shared/components/Spacer';

const checkedImage = require("@m1/shared/assets/checked.png")
const unCheckedImage = require("@m1/shared/assets/unchecked.png")
const default_avatar = require("@m1/shared/assets/avatar-default.png")
export default class GroupList extends React.Component {
    getGeneralImageURL= (legacyId, avatarURL) => {
        var avatarPath = avatarURL
        if(avatarPath) {
            if(!avatarPath.includes("http")) {
                avatarPath = `https://s3.amazonaws.com/programax-videos-production/uploads/user/avatar/${legacyId}/${avatarPath}`
            }
        }

        return avatarPath
    }

    constructor(props) {
        super(props);

        let { groupTitle, groupList, clickGroupCheck, clickChildItem, groupId, groupStatus, bShowCheckBox, groupIdentify, clickGroupTitle} = props

        this.state = {
            closed: true,
            groupTitle: groupTitle,
            groupList: groupList,
            groupId: groupId,
            groupStatus: groupStatus,
            bShowCheckBox: bShowCheckBox,
            groupIdentify: groupIdentify
        }

        this.mount = true;
    }

    toggleItem() {
        this.setState({closed: !this.state.closed})
    }

    componentWillReceiveProps(props) {
        let { groupTitle, groupList, clickGroupCheck, clickChildItem, groupId, groupStatus, bShowCheckBox, groupIdentify, clickGroupTitle} = props

        this.setState({
            groupTitle: groupTitle, 
            groupList: groupList,  
            groupId: groupId, 
            groupStatus: groupStatus, 
            bShowCheckBox: bShowCheckBox, 
            groupIdentify: groupIdentify
        })
    }

    render() {
        let { groupTitle, groupList, clickGroupCheck, clickChildItem, groupId, groupStatus, bShowCheckBox, groupIdentify, clickGroupTitle, showGroupTile} = this.props;

        return (
            <View style={styles.container}>
                {
                    showGroupTile &&
                    <Spacer/>
                }

                {
                    showGroupTile &&
                    <TouchableOpacity style={[styles.group_title_container, styles.padding_container]} onPress={()=>{clickGroupTitle(groupId)}}>
                        <Text style={styles.general_text}>{this.state.groupTitle}</Text>
                        {
                            this.state.groupStatus && this.state.bShowCheckBox &&
                            <TouchableOpacity onPress={()=>{clickGroupCheck(groupId)}} style={styles.checkBoxImage}><Image source={checkedImage} style={styles.checkBoxImage}/></TouchableOpacity>
                        }

                        {
                            !this.state.groupStatus && this.state.bShowCheckBox &&
                            <TouchableOpacity onPress={()=>{clickGroupCheck(groupId)}} style={styles.checkBoxImage}><Image source={unCheckedImage} style={styles.checkBoxImage}/></TouchableOpacity>
                        }
                    </TouchableOpacity>
                }

                <Spacer/>

                {
                    this.state.groupList &&
                    this.state.groupList.map((item, index)=>{
                        return(
                            <View style={styles.padding_container} key={groupId + " " + index}>
                                <TouchableOpacity style={styles.group_child_container} onPress={()=>{clickChildItem(groupId, item.itemIndex ? item.itemIndex : index)}}>
                                    <View style={styles.avatar_container}>
                                        {
                                            item.avatarUrl == null&&
                                            <Image style={styles.avatar_img} source={default_avatar}/>
                                        }

                                        {
                                            item.avatarUrl !== null && item.avatarUrl !== undefined &&
                                            <CacheImage style={styles.avatar_img} {...{uri: this.getGeneralImageURL(item.legacyId, item.avatarUrl)}}/>
                                        }

                                        <Text style={[styles.user_name, styles.general_text]}>{item.nameFirst} {item.nameLast}</Text>
                                    </View>
                                    {
                                        item.selected && bShowCheckBox &&
                                        <Image source={checkedImage} style={styles.checkBoxImage}/>
                                    }

                                    {
                                        !item.selected && bShowCheckBox &&
                                        <Image source={unCheckedImage} style={styles.checkBoxImage}/>
                                    }

                                </TouchableOpacity>
                                {
                                    this.state.groupList.length - 1 > index &&
                                    <Spacer/>
                                }
                            </View>
                        )
                    })
                }

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
    }
});

GroupList.defaultProps = {
    groupList: [],
    groupTitle: '',
    clickGroupCheck: () =>{},
    clickChildItem: () => {},
    groupId: '',
    groupStatus: false,
    bShowCheckBox: false,
    groupIdentify: '',
    clickGroupTitle: () =>{},
    showGroupTile: true
};

GroupList.propTypes = {
    groupList: PropTypes.array,
    groupTitle: PropTypes.string,
    clickGroupCheck: PropTypes.func,
    clickChildItem: PropTypes.func,
    showGroupTile: PropTypes.bool,
    groupId: PropTypes.string,
    groupStatus: PropTypes.bool,
    bShowCheckBox: PropTypes.bool,
    groupIdentify: PropTypes.string,
    clickGroupTitle: PropTypes.func
};
