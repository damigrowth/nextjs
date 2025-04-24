import { gql } from "@apollo/client"; // Assuming you use Apollo Client, adjust if using another client

export const GET_CHAT_MESSAGES = gql`
  # Query to get messages for a specific chat
  query GetChatMessages($chatId: ID!) {
    # Filter messages belonging to the given chatId, sort by creation time
    messages(
      filters: { chat: { id: { eq: $chatId } } }
      sort: "createdAt:asc"
      pagination: { limit: 100 }
    ) {
      # Adjust pagination limit as needed
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
            # Author is a freelancer
            data {
              id
              attributes {
                username
                displayName
                status {
                  data {
                    attributes {
                      type
                    }
                  }
                }
                type {
                  data {
                    attributes {
                      slug
                    }
                  }
                }
                image {
                  data {
                    id
                    attributes {
                      formats
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

// Add other message-related queries here if needed
