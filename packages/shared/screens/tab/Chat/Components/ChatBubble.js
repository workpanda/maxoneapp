import React from 'react';
import { View } from 'react-native';
import { MessageText, Time } from '@m1/shared/screens/tab/Chat/Components/CustomGiftedChat';

const ChatBubble = (props) => {
  const { position, children, currentMessage, uri } = props;
  const text = currentMessage.text.replace(uri, '');
  const updated_props = { ...props, currentMessage: { text } };
  return (
    <View style={styles[position].container}>
      <View style={styles[position].wrapper}>
        <MessageText {...updated_props} />
        {children}
        <Time {...updated_props} />
      </View>
    </View>
  );
}

const styles = {
  left: {
    container: {
      flex: 1,
      alignItems: 'flex-start',
    },
    wrapper: {
      borderRadius: 15,
      backgroundColor: '#f0f0f0',
      marginRight: 60,
      minHeight: 20,
      justifyContent: 'flex-end',
    }
  },
  right: {
    container: {
      flex: 1,
      alignItems: 'flex-end',
    },
    wrapper: {
      borderRadius: 15,
      backgroundColor: '#0084ff',
      marginLeft: 60,
      minHeight: 20,
      justifyContent: 'flex-end',
    }
  }
}

export default ChatBubble;