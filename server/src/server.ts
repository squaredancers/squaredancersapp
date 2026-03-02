import { bootstrap } from "./app.js";

console.log("Start of app");
try {
  const { url } = await bootstrap();
  console.log(`server started at ${url}`);
} catch (e) {
  console.error(e);
}
