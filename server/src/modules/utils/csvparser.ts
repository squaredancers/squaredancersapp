const isNextCharAQuote = (line: string, index: number) => {
  const nextIndex = index + 1;

  if (nextIndex >= line.length) return false;

  return line.charAt(nextIndex) === '"';
};

const parseLine = (csvLine: string): string[] => {
  const result: string[] = [];
  let inQuote = false;
  let index = 0;
  let value: string[] = [];

  if (csvLine.length > 0) {
    if (csvLine.charAt(0) !== '"') {
      throw new Error("Line must start with a quote.");
    }

    while (index < csvLine.length) {
      const charAtIndex = csvLine.charAt(index);

      if (inQuote) {
        if (charAtIndex === '"') {
          // This is either a quote which ends the value or it is a double quote.
          if (isNextCharAQuote(csvLine, index)) {
            // This is a double quote.  We will push the first quote and skip
            // and skip the next one.
            value.push(charAtIndex);
            index += 2;
          } else {
            // We found the end quote push the value to the result.
            inQuote = false;
            result.push(value.join(""));
            index++;
          }
        } else {
          // We found a regular character in the line.
          value.push(charAtIndex);
          index++;
        }
      } else {
        //  If we are not in a quote next char must be either quote or comma
        if (charAtIndex === '"') {
          inQuote = true;
          value = [];
        } else if (charAtIndex === ",") {
          // Do nothing we are still outside a quote
        } else {
          throw new Error(
            "Unexpected char, " + charAtIndex + " found between quotes.",
          );
        }

        index++;
      }
    }

    if (inQuote) {
      //  We shouldn't be in a quote at this point.  We are missing
      // an end quote.
      throw new Error("Missing final last end quote.");
    }
  }

  return result;
};

const csvParser = (csvContent: string[]): string[][] => {
  const result: string[][] = [];

  csvContent.forEach((line) => {
    result.push(parseLine(line.trim()));
  });

  return result;
};

export default csvParser;
