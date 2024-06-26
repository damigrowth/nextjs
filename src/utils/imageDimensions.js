export const getBestDimensions = (formats) => {
  if (formats) {
    if (formats.medium) {
      return formats.medium;
    }
    if (formats.small) {
      return formats.small;
    }
    return formats.thumbnail;
  }
};
