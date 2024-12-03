import { gql } from "@apollo/client";

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
  mutation UpdateUserRole(
    $id: ID!
    $roleId: ID!
    $displayName: String!
    $consent: Boolean
  ) {
    updateUsersPermissionsUser(
      id: $id
      data: { role: $roleId, displayName: $displayName, consent: $consent }
    ) {
      data {
        id
        attributes {
          displayName
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
        }
      }
    }
  }
`;
