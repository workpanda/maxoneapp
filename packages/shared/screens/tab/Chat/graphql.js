import graphql from 'graphql-tag'
import gql from 'graphql-tag';

// mutations
const createUser = `
  mutation($username: String!) {
    createUser(input: {
      username: $username
    }) {
      id username createdAt
    }
  }
`

const createMessage = gql`mutation CreateMessage(
    $createdAt: String, $id: ID, $owner: String, $content: String!, $messageConversationId: ID!, $file: S3ObjectInput, $chatbot: Boolean, $isSent: Boolean
  ) {
    createMessage(input: {
    createdAt: $createdAt, id: $id, content: $content, messageConversationId: $messageConversationId, owner: $owner, chatbot: $chatbot, file: $file, isSent: $isSent
  }) {
      id
      content
      createdAt
      owner
      chatbot
      isSent
      file {
        bucket
        region
        key
      }
      messageConversationId
    }
}
`;


const createConvo = gql`mutation CreateConvo($input: CreateConversationInput!) {
    createConvo(input: $input) {
    id
    name
    teamId
    createdAt
  }
}
`;

const createConvoLink = `mutation CreateConvoLink($input: CreateConvoLinkInput!) {
    createConvoLink(
      input: $input
    ) {
    id
  }
}
`;
// const createConvoLink = gql`mutation createConvoLink($input: CreateConvoLinkInput!) {
//     createConvoLink(
//       input: $input
//     ) {
//     id
//     convoLinkUserId
//     convoLinkConversationId
//     name
//     conversation {
//       id
//       name
//     }
//   }
// }
// `;

const updateConvoLink = `mutation UpdateConvoLink($id: ID!) {
    updateConvoLink(input: { id: $id, status: "READY" }) {
      id
      name
      convoLinkUserId
      convoLinkConversationId
      status
      conversation {
        id
        name
        teamId
        createdAt
        associated {
          items {
            convoLinkUserId
            user {
              id
              username
            }
          }
        }
      }
    }
  }
`;

const getUser = graphql`
  query getUser($id: ID!) {
    getUser(id: $id) {
      id
      username
    }
  }
`

const getUserAndConversations = gql`
  query getUserAndConversations($id:ID!) {
    getUser(id:$id) {
      id
      username
      userConversations(sortDirection: DESC, limit: 500) {
        items {
          id
          status
          conversation {
            id
            name
            teamId
            createdAt
            associated(sortDirection: DESC, limit: 500) {
              items {
                convoLinkUserId
                status
                user {
                  id
                  username
                  nameFirst
                  nameLast
                  legacyId
                  avatarUrl
                }
              }
            }
          }
        }
      }
    }
  }
`

const getConvo = gql`
  query getConvo($id: ID!) {
    getConvo(id:$id) {
      id
      messages(limit: 500) {
        nextToken
        items {
          id
          content
          owner
          messageConversationId
          createdAt
          file {
            bucket
            region
            key
          }
        }
      }
    }
  }
`
const getConversation = `
  query getConvo($id: ID!) {
    getConvo(id:$id) {
      __typename
      id
      name
      teamId
      createdAt
      associated {
        items {
          convoLinkUserId
          user {
            id
            username
            nameFirst
            nameLast
            legacyId
            avatarUrl
          }
        }
      }
    }
  }
`

const listUsers = graphql`
  query listUsers {
    listUsers {
      items {
        id
        username
        createdAt
      }
    }
  }
`

const onCreateMessage = gql`
  subscription onCreateMessage($messageConversationId: ID!) {
    onCreateMessage(messageConversationId: $messageConversationId) {
      id
      content
      createdAt
      owner
      chatbot
      isSent
      file {
        bucket
        region
        key
      }
      messageConversationId
    }
  }
`

const onCreateUser = gql`subscription OnCreateUser {
  onCreateUser {
    id
    username
    createdAt
  }
}
`;

export const onUpdateConvoLink = gql`
  subscription onUpdateConvoLink($convoLinkUserId: ID, $status: String) {
    onUpdateConvoLink(convoLinkUserId: $convoLinkUserId, status: $status) {
      id
      name
      status
      conversation {
        id
        name
        createdAt
        associated {
          items {
            convoLinkUserId
            user {
              id
              username
            }
          }
        }
      }
    }
  }
`

export {
  createUser,
  createMessage,
  createConvo,
  createConvoLink,
  updateConvoLink,
  getConvo,
  getConversation,
  getUser,
  getUserAndConversations,
  listUsers,
  onCreateMessage,
  onCreateUser
}
