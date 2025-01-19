import { gql } from "@apollo/client";

export const LOGIN_USER = gql`
  mutation Login($identifier: String!, $password: String!) {
    login(input: { identifier: $identifier, password: $password }) {
      jwt
    }
  }
`;

export const REGISTER_USER = gql`
  mutation Register($input: UsersPermissionsRegisterInput!) {
    register(input: $input) {
      jwt
      user {
        id
        username
        email
      }
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser(
    $id: ID!
    $roleId: ID
    $displayName: String
    $consent: Boolean
    $freelancer: ID
    $username: String
  ) {
    updateUsersPermissionsUser(
      id: $id
      data: {
        role: $roleId
        freelancer: $freelancer
        username: $username
        displayName: $displayName
        consent: $consent
      }
    ) {
      data {
        id
        attributes {
          freelancer {
            data {
              id
            }
          }
          role {
            data {
              id
              attributes {
                name
              }
            }
          }
        }
      }
    }
  }
`;

export const CREATE_FREELANCER = gql`
  mutation CreateFreelancer($data: FreelancerInput!) {
    createFreelancer(data: $data) {
      data {
        id
        attributes {
          username
          email
          type {
            data {
              id
            }
          }
        }
      }
    }
  }
`;

export const UPDATE_FREELANCER = gql`
  mutation UpdateFreelancer($id: ID!, $data: FreelancerInput!) {
    updateFreelancer(id: $id, data: $data) {
      data {
        id
      }
    }
  }
`;

