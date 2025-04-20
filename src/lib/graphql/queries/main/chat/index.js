import { gql } from "@apollo/client";

export const GET_FREELANCER_CHATS = gql`
  query GetFreelancerChats($freelancerId: ID!) {
    chats(
      filters: { participants: { id: { eq: $freelancerId } } }
      sort: "updatedAt:desc"
    ) {
      data {
        id
        attributes {
          name
          isGroup
          updatedAt
          unreadCountMap
          participants {
            data {
              id
              attributes {
                username
                displayName
                firstName
                lastName
                image {
                  data {
                    id
                    attributes {
                      formats
                      url
                    }
                  }
                }
              }
            }
          }
          lastMessage {
            data {
              id
              attributes {
                content
                createdAt
                readBy {
                  data {
                    id
                  }
                }
                author {
                  data {
                    id
                    attributes {
                      username
                      displayName
                      firstName
                      lastName
                      image {
                        data {
                          id
                          attributes {
                            formats
                            url
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_CHAT_MESSAGES = gql`
  query GetChatMessages($chatId: ID!) {
    messages(
      filters: { chat: { id: { eq: $chatId } } }
      sort: "createdAt:asc"
    ) {
      data {
        id
        attributes {
          content
          createdAt
          readBy {
            data {
              id
            }
          }
          author {
            data {
              id
              attributes {
                username
                displayName
                firstName
                lastName
                image {
                  data {
                    id
                    attributes {
                      formats
                      url
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const CHECK_EXISTING_CHAT = gql`
  query CheckExistingChat($participants: [ID]!) {
    chats(filters: { participants: { id: { in: $participants } } }) {
      data {
        id
        attributes {
          participants {
            data {
              id
            }
          }
        }
      }
    }
  }
`;
