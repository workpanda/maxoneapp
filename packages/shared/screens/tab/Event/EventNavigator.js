import React from 'react'
import { Image, View, Text, TouchableOpacity } from 'react-native'
import { createStackNavigator } from 'react-navigation'

import EventScreen from '@m1/shared/screens/tab/Event/EventScreen'
import NewEventPage from '@m1/shared/screens/tab/Event/NewEvent'

import { AppConfig } from "@m1/constants";

import CommonStyles from '@m1/shared/theme/styles'

import {
    Feather
} from "@expo/vector-icons";

const EventNavigator = createStackNavigator(
    {
        EventScreen: { screen: EventScreen },
        NewEventPage: {
            screen: NewEventPage,
            navigationOptions: ({ navigation }) => ({
                headerRight: <View style={CommonStyles.emptyNavRightView} />,
                headerLeft: (
                    <TouchableOpacity onPress={() => navigation.goBack()} style={CommonStyles.navBackContainer}>
                        <Feather name="arrow-left" size={24} color="white" />
                    </TouchableOpacity>
                ),
            })
        },
    },
    {
        defaultNavigationOptions: AppConfig.navigationOptions,
    }
)

// export const AuthNavigator = createStackNavigator(

// )

export default EventNavigator