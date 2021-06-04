import React from "react";
import PropTypes from "prop-types";
import {
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
    FlatList,
    Image,
    StyleSheet,
    Dimensions,
    StatusBar,
    Alert
} from "react-native";
import { SearchBar } from 'react-native-elements';
import Spacer from '@m1/shared/components/Spacer'
import CommonStyles from '@m1/shared/theme/styles'
import { TextInput } from "react-native-gesture-handler";
import GroupList from '@m1/shared/components/GroupList';


const groupData = [
    {
        id: 1,
        groupTitle: 'Athletes',
        selected: false,
        listData: [
            {
                id: 1,
                username: 'C.Ronaldo',
                imagePath: 'https://e1.365dm.com/18/07/768x432/skysports-cristiano-ronaldo_4353998.jpg?20180705155412',
                selected: false
            },
            {
                id: 2,
                username: 'Lionel Messi',
                imagePath: 'https://cdn.newsapi.com.au/image/v1/26cebf396ab187617a05356a674e530a',
                selected: false
            },
            {
                id: 3,
                username: 'Neymar',
                imagePath: 'https://statics.sportskeeda.com/wp-content/uploads/2012/08/Cristiano-Ronaldo-1345616688.jpg',
                selected: false
            }
        ]
    },
    {
        id: 2,
        groupTitle: 'Coaches',
        selected: false,
        listData: [
            {
                id: 1,
                username: 'Sam Williams (2016)',
                imagePath: 'https://statics.sportskeeda.com/wp-content/uploads/2012/08/Cristiano-Ronaldo-1345616688.jpg',
                selected: false
            },
            {
                id: 2,
                username: 'Sam Williams (2016)',
                imagePath: 'https://e1.365dm.com/18/07/768x432/skysports-cristiano-ronaldo_4353998.jpg?20180705155412',
                selected: false
            },
            {
                id: 3,
                username: 'Sam Williams (2016)',
                imagePath: 'https://e1.365dm.com/18/07/768x432/skysports-cristiano-ronaldo_4353998.jpg?20180705155412',
                selected: false
            }
        ]
    },
    {
        id: 3,
        groupTitle: 'Parents',
        selected: false,
        listData: [
            {
                id: 1,
                username: 'Sam Williams (2016)',
                imagePath: 'https://statics.sportskeeda.com/wp-content/uploads/2012/08/Cristiano-Ronaldo-1345616688.jpg',
                selected: false
            },
            {
                id: 2,
                username: 'Sam Williams (2016)',
                imagePath: 'https://e1.365dm.com/18/07/768x432/skysports-cristiano-ronaldo_4353998.jpg?20180705155412',
                selected: false
            },
            {
                id: 3,
                username: 'Sam Williams (2016)',
                imagePath: 'https://e1.365dm.com/18/07/768x432/skysports-cristiano-ronaldo_4353998.jpg?20180705155412',
                selected: false
            }
        ]
    }
]

const GROUP_TITLE = "Defensive Line"
const iconBackArrow = require('../../../assets/ic_back_white.png')
class GroupView extends React.Component {
    static navigationOptions = ({ navigation }) => {
        var onSave = () => { }

        let params = navigation.state.params

        if (params && params.onSave) {
            onSave = params.onSave
        }

        return {
            title: GROUP_TITLE,
            headerLeft: (
                <TouchableOpacity onPress={() => navigation.goBack()} style={CommonStyles.navBackContainer}>
                    <Image source={iconBackArrow} style={CommonStyles.darkNavBackImg} resizeMode='contain' />
                </TouchableOpacity>
            ),
            headerRight: (
                <TouchableOpacity style={CommonStyles.navRightContainer} onPress={onSave}>
                    <Text style={CommonStyles.darkNavRightText}>Edit</Text>
                </TouchableOpacity>
            )
        }
    };

    constructor(props) {
        super(props);

        this.state = {
            search: '',
            group_title: '',
            filteredGroupList: [],
        }
    }

    componentWillMount() {

    }

    componentDidMount() {
        this.mount = true;

        this.props.navigation.setParams({
            onSave: this._clickRightNavigation,
        })
    }

    componentWillUnmount() {
        this.mount = false;

        this.props.navigation.setParams({
            onSave: null,
        })
    }

    componentWillReceiveProps(props) {
        if (!this.mount) return;
    }

    _clickRightNavigation = () => {
        this.props.navigation.navigate('EditGroup')
    }

    _renderItem = ({ item, index }) => {

        return (
            <GroupList groupTitle={item.groupTitle}
                groupId={item.id}
                groupList={item.listData}
                bShowCheckBox={false}
            />
        )
    }

    render() {

        return (
            <SafeAreaView style={styles.container_background}>
                <StatusBar barStyle="light-content" translucent={false} />
                <FlatList
                    data={groupData}
                    renderItem={this._renderItem}
                    numColumns={1}
                    keyExtractor={item => item.id}
                    style={[styles.whiteBackground]}
                    horizontal={false}
                />
            </SafeAreaView>
        );
    }
}

let style = {
    container_background: {
        // backgroundColor: '#DFDFDF',
        backgroundColor: '#DFDFDF',
        height: '100%'
    },
    background: {
        // backgroundColor: '#DFDFDF',
        backgroundColor: 'white'
    },
    whiteBackground: {
        backgroundColor: 'white'
    },
    flatList: {
        marginTop: 10,
        paddingTop: 6
    },
    itemLeft: {
        marginLeft: 5,
        marginTop: 5,
        marginBottom: 5,
        marginRight: 1
    },
    itemRight: {
        marginLeft: 1,
        marginTop: 5,
        marginBottom: 5,
        marginRight: 5
    },
    group_title: {
        fontSize: 14,
        color: '#454545'
    },
    chat_group_right_arrow: {
        width: 6,
        height: 10
    },
    chat_group_item: {
        flexDirection: 'row',
        width: '100%',
        height: 19,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    group_container: {
        width: '100%',
        height: 53,
        paddingLeft: 22,
        paddingRight: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white'
    },
    group_name_input: {
        width: '100%',
        fontSize: 14
    }
};

const styles = StyleSheet.create(style);

export default GroupView;

GroupView.propTypes = {

};

GroupView.defaultProps = {

};
