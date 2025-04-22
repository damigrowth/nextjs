import { gql } from "@apollo/client";
import { CATEGORY_FULL } from "../../fragments/taxonomies/service";

const ALL_TAXONOMIES = gql`
  query AllTaxonomies {
    freelancerSubcategories: freelancerSubcategories {
      data {
        attributes {
          plural
          label
          slug
        }
      }
    }
    serviceSubcategories: subcategories(sort: "label:asc") {
      data {
        attributes {
          label
          slug
        }
      }
    }
  }
`;

const ALL_TOP_TAXONOMIES = gql`
  query AllTopTaxonomies {
    topFreelancerSubcategories: topFreelancerTaxonomiesByCategory(
      category: ""
    ) {
      subcategories {
        plural
        slug
        type {
          data {
            attributes {
              slug
            }
          }
        }
        category {
          data {
            attributes {
              slug
            }
          }
        }
      }
    }
    topServiceSubcategories: topServiceTaxonomiesByCategory(category: "") {
      subcategories {
        label
        slug
        category {
          data {
            attributes {
              slug
            }
          }
        }
      }
    }
  }
`;

const ALL_ACTIVE_TOP_TAXONOMIES = gql`
  query AllActiveTopTaxonomies {
    topFreelancerSubcategories: freelancerSubcategories(
      filters: {
        freelancers: { 
          id: { ne: null },
          status: { type: { eq: "Active" } }
        }
      }
      sort: "label:asc"
      pagination: { limit: 100 }
    ) {
      data {
        attributes {
          plural
          label
          slug
          type {
            data {
              attributes {
                slug
              }
            }
          }
          category {
            data {
              attributes {
                slug
              }
            }
          }
        }
      }
    }
    topServiceSubcategories: subcategories(
      filters: {
        services: {
          id: { ne: null }
          status: { type: { eq: "Active" } }
          freelancer: { id: { ne: null } }
        }
      }
      sort: "label:asc"
      pagination: { limit: 100 }
    ) {
      data {
        attributes {
          label
          slug
          category {
            data {
              attributes {
                slug
              }
            }
          }
        }
      }
    }
  }
`;

const FEATURED_CATEGORIES = gql`
  query FeaturedCategories {
    featuredEntity {
      data {
        id
        attributes {
          categories(
            filters: {
              services: {
                id: { ne: null }
                status: { type: { eq: "Active" } }
                freelancer: { id: { ne: null } }
              }
            }
          ) {
            data {
              id
              attributes {
                label
                slug
                description
                icon
                image {
                  data {
                    id
                    attributes {
                      formats
                    }
                  }
                }
                subcategories(
                  filters: {
                    services: {
                      id: { ne: null }
                      status: { type: { eq: "Active" } }
                      freelancer: { id: { ne: null } }
                    }
                  }
                ) {
                  data {
                    id
                    attributes {
                      label
                      slug
                      category {
                        data {
                          id
                          attributes {
                            label
                            slug
                            icon
                          }
                        }
                      }
                      subdivisions(
                        filters: {
                          services: {
                            id: { ne: null }
                            status: { type: { eq: "Active" } }
                            freelancer: { id: { ne: null } }
                          }
                        }
                      ) {
                        data {
                          id
                          attributes {
                            label
                            slug
                            subcategory {
                              data {
                                id
                                attributes {
                                  label
                                  slug
                                  category {
                                    data {
                                      id
                                      attributes {
                                        label
                                        slug
                                        icon
                                      }
                                    }
                                  }
                                }
                              }
                            }
                            category {
                              data {
                                id
                                attributes {
                                  label
                                  slug
                                  icon
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
      }
    }
  }
`;

const CATEGORIES_ALL = gql`
  query CategoriesAll {
    allCategories: categories(sort: "label:asc") {
      data {
        attributes {
          label
          slug
        }
      }
    }
  }
`;

export {
  ALL_TAXONOMIES,
  FEATURED_CATEGORIES,
  CATEGORIES_ALL,
  ALL_TOP_TAXONOMIES,
  ALL_ACTIVE_TOP_TAXONOMIES,
};
