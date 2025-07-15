// Type declarations for mixed JS/TS modules
declare module "*.jsx" {
  import { ComponentType } from "react";
  const Component: ComponentType<any>;
  export default Component;
}

declare module "*.js" {
  const content: any;
  export default content;
}

// Better Auth module augmentation
declare module "better-auth" {
  interface User {
    type: number;
    step: string;
    onboardingComplete: boolean;
    username?: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    city?: string;
    county?: string;
    zipcode?: string;
    confirmed: boolean;
    blocked: boolean;
  }
}
