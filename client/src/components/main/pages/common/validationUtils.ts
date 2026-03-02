class ValidationUtils {
  static validateNumeric = (str: string) => {
    if (typeof str != "string" || str === "") return false; // Check if the input is a non-empty string
    return Number.isFinite(Number(str)); // Coerce and check for finite number
  };

  static validateRequired = (value: string) => (value?.length ?? 0) !== 0;

  static validateEmail = (email: string) =>
    !!email.length &&
    email
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      );
}

export default ValidationUtils;
