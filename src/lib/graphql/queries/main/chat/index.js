import { gql } from "@apollo/client";

export const GET_FREELANCER_CHATS = gql`
  query GetFreelancerChats($freelancerId: ID!, $page: Int, $pageSize: Int) {
    chats(
      filters: { participants: { id: { eq: $freelancerId } } }
      sort: "updatedAt:desc"
      pagination: { page: $page, pageSize: $pageSize }
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
                type {
                  data {
                    id
                    attributes {
                      slug
                    }
                  }
                }
                status {
                  data {
                    id
                    attributes {
                      type
                    }
                  }
                }
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
                      type {
                        data {
                          id
                          attributes {
                            slug
                          }
                        }
                      }
                      status {
                        data {
                          id
                          attributes {
                            type
                          }
                        }
                      }
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
      meta {
        pagination {
          page
          pageSize
          pageCount
          total
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
                type {
                  data {
                    id
                    attributes {
                      slug
                    }
                  }
                }
                status {
                  data {
                    id
                    attributes {
                      type
                    }
                  }
                }
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
  query CheckExistingChat($participant1: ID!, $participant2: ID) {
    chats(
      filters: {
        and: [
          { participants: { id: { eq: $participant1 } } }
          { participants: { id: { eq: $participant2 } } }
        ]
      }
    ) {
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
