import { gql } from "@apollo/client"; // Assuming you use Apollo Client, adjust if using another client

export const GET_CHAT_MESSAGES = gql`
  query GetChatMessages($chatId: ID!, $page: Int, $pageSize: Int) {
    messages(
      filters: { chat: { id: { eq: $chatId } } }
      sort: "createdAt:desc" # Fetch newest messages first for efficient pagination
      pagination: { page: $page, pageSize: $pageSize }
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
                    attributes {
                      slug
                    }
                  }
                }
                status {
                  data {
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
