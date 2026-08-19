const parseCsvTimestamp = (dateString: string): Date => {
  // 1. Extract the date and time portions
  const datePart = dateString.substring(0, 10);
  const timePart = dateString.substring(11, 22);

  // 2. Parse year, month (0-indexed), and day
  const [yyyy, mm, dd] = datePart.split("/");

  // 3. Convert 12-hour AM/PM time to 24-hour format
  const [time, modifier] = timePart.split(" ");
  let [hours, minutes, seconds] = time.split(":");

  if (modifier === "PM" && hours !== "12") {
    hours = parseInt(hours, 10) + 12 + "";
  } else if (modifier === "AM" && hours === "12") {
    hours = "00";
  }

  // 4. Create the JavaScript Date object (Note: mm - 1 because months are 0-indexed)
  const jsDate = new Date(
    parseInt(yyyy),
    parseInt(mm) - 1,
    parseInt(dd),
    parseInt(hours),
    parseInt(minutes),
    parseInt(seconds),
  );

  return jsDate;
};

export default parseCsvTimestamp;
