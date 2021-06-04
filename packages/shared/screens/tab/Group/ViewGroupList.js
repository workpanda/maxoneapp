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
    StatusBar
} from "react-native";
import { SearchBar } from 'react-native-elements';
import Spacer from '@m1/shared/components/Spacer'
import CommonStyles from '@m1/shared/theme/styles'

const chat_group_right_arrow = require("@m1/shared/assets/chat_group_right_arrow.png")
const iconBackArrow = require('@m1/shared/assets/ic_back_white.png')
const arrGroupList = [
    {
        id: 1,
        group_title: 'OUR TEAM GROUP'
    },
    {
        id: 2,
        group_title: 'Coaches GROUP'
    },
    {
        id: 3,
        group_title: 'Parents GROUP'
    }
]
class ViewGroupList extends React.Component {
    static navigationOptions = ({ navigation }) => ({
        title: 'Groups',
        headerLeft: null,
        headerRight: (
            <TouchableOpacity style={CommonStyles.navRightContainer} onPress={() => navigation.navigate('AddNewGroup')}>
                <Text style={CommonStyles.darkNavRightText}>Add</Text>
            </TouchableOpacity>
        )
    });

    constructor(props) {
        super(props);

        this.state = {
            search: '',
            filteredGroupList: []
        }

        this.mount = true;
    }

    componentWillMount() {
        if (arrGroupList && arrGroupList.length != 0) {
            this.setState({ filteredGroupList: this.getFilteredArray(arrGroupList, this.state.search.trim()) });
        }
    }

    getFilteredArray = (arrList, filter) => {
        if (filter === "") {
            return arrList;
        }

        if (arrList) {
            return arrList.filter(function (item) {
                return item.group_title.toLowerCase().includes(filter.toLowerCase());
            });
        } else {
            return []
        }
    }

    componentWillUnmount() {
        this.mount = false;
    }

    componentWillReceiveProps(props) {
        if (!this.mount) return;
    }

    updateSearch = search => {
        this.setState({ search: search });

        if (arrGroupList && arrGroupList.length != 0) {
            this.setState({ filteredGroupList: this.getFilteredArray(arrGroupList, search.trim()) });
        }
    }

    onItemClick = (item) => {
        this.props.navigation.navigate('GroupView');
    }

    onClick = () => {
        return
    }

    _renderItem = ({ item, index }) => {
        return (
            <View>
                <View style={{ paddingTop: 24, paddingBottom: 24 }}>
                    <TouchableOpacity
                        style={[styles.chat_group_item, styles.background]} onPress={() => this.onItemClick(item)}>
                        <Text style={styles.group_title} >
                            {item.group_title}
                        </Text>
                        <Image source={chat_group_right_arrow} style={styles.chat_group_right_arrow} />
                    </TouchableOpacity>
                </View>
                {
                    index < this.state.filteredGroupList.length - 1 &&
                    <Spacer />
                }

            </View>
        )
    }

    render() {
        return (
            <SafeAreaView style={styles.container_background}>
                <StatusBar barStyle="light-content" translucent={false} />
                <SearchBar
                    platform="android"
                    placeholder="Search"
                    value={this.state.search}
                    onChangeText={this.updateSearch}
                    style={{ width: '100%' }}
                    cancelButtonProps={{ disabled: true }}
                    cancelButtonTitle={""}
                    icon={{ name: 'search' }}
                    cancelIcon={{ name: 'search' }}
                    leftIconContainerStyle={{
                        paddingLeft: 15,
                        paddingRight: 0,
                        marginRight: 0,
                        width: 35,
                        height: 35,
                    }}
                >

                </SearchBar>
                <FlatList
                    data={this.state.filteredGroupList}
                    renderItem={this._renderItem}
                    numColumns={1}
                    keyExtractor={item => item.id}
                    style={[styles.whiteBackground, styles.flatList]}
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
        paddingLeft: 30,
        paddingRight: 30,
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
    }
};

const styles = StyleSheet.create(style);

export default ViewGroupList;

ViewGroupList.propTypes = {

};

ViewGroupList.defaultProps = {

};
