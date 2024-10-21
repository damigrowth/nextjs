export const getBestDimensions = (formats) => {
  if (formats) {
    if (formats.large) {
      return formats.large;
    }
    if (formats.medium) {
      return formats.medium;
    }
    if (formats.small) {
      return formats.small;
    }
    return formats.thumbnail;
  } else {
    return null;
  }
};
