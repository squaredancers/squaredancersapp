import fs from "fs";

const fileName = process.argv[2];

const fileContent = fs.readFileSync(fileName).toString("utf8");
const lines = fileContent.split("\n");

console.log(JSON.stringify(lines));
