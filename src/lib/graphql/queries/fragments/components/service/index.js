import { gql } from "@apollo/client";

const SERVICE_TYPE = gql`
  fragment ServiceType on ComponentServiceType {
    online
    presence
    oneoff
    subscription
    onbase
    onsite
  }
`;

export { SERVICE_TYPE };
