import { gql } from '@apollo/client';

const SOCIALS = gql`
  fragment Socials on ComponentSocialsList {
    facebook {
      label
      url
    }
    linkedin {
      label
      url
    }
    x {
      label
      url
    }
    youtube {
      label
      url
    }
    github {
      label
      url
    }
    instagram {
      label
      url
    }
    behance {
      label
      url
    }
    dribbble {
      label
      url
    }
  }
`;

export { SOCIALS };
