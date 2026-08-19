import { describe, expect, it } from "vitest";
import csvParser from "./csvparser.js";

describe("Test good parse", () => {
  it("Test1", () => {
    const csvValue: string[] = ['"first","second","third"'];
    const result = csvParser(csvValue);

    expect(result.length).toBe(1); // Assertion

    const firstLine = result[0];

    expect(firstLine.length).toBe(3);
    expect(firstLine[0]).toBe("first");
    expect(firstLine[1]).toBe("second");
    expect(firstLine[2]).toBe("third");
  });

  it("Test2", () => {
    const csvValue: string[] = [
      '"first","second","third"',
      '"four","five","six","seven"',
    ];
    const result = csvParser(csvValue);

    expect(result.length).toBe(2); // Assertion

    let line = result[0];

    expect(line.length).toBe(3);
    expect(line[0]).toBe("first");
    expect(line[1]).toBe("second");
    expect(line[2]).toBe("third");

    line = result[1];

    expect(line.length).toBe(4);
    expect(line[0]).toBe("four");
    expect(line[1]).toBe("five");
    expect(line[2]).toBe("six");
    expect(line[3]).toBe("seven");
  });

  it("Test3", () => {
    const csvValue: string[] = [
      '"""""",",,""","third"""',
      '"four","","","seven"',
    ];
    const result = csvParser(csvValue);

    expect(result.length).toBe(2); // Assertion

    let line = result[0];

    expect(line.length).toBe(3);
    expect(line[0]).toBe('""');
    expect(line[1]).toBe(',,"');
    expect(line[2]).toBe('third"');

    line = result[1];

    expect(line.length).toBe(4);
    expect(line[0]).toBe("four");
    expect(line[1]).toBe("");
    expect(line[2]).toBe("");
    expect(line[3]).toBe("seven");
  });
});

describe("Test bad parse", () => {
  it("Test1", () => {
    const csvValue: string[] = ['first","second","third"'];

    expect(() => csvParser(csvValue)).toThrow("Line must start with a quote.");
  });

  it("Test2", () => {
    const csvValue: string[] = ['"first","second","third'];

    expect(() => csvParser(csvValue)).toThrow("Missing final last end quote.");
  });

  it("Test3", () => {
    const csvValue: string[] = ['"first",t"second","third"'];

    expect(() => csvParser(csvValue)).toThrow(
      "Unexpected char, t found between quotes.",
    );
  });
});
