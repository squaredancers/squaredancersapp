class StringUtils {
  public static capitalizeFirstLetter = (str: string) => {
    if (str.length === 0) {
      return str; // Handle empty string case
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
}

export default StringUtils;
