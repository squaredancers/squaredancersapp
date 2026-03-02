import { createCA, createCert } from "mkcert";
import { writeFileSync } from "fs";

const ca = await createCA({
  organization: "Triangle Squares dancers",
  countryCode: "CA",
  state: "Ontario",
  locality: "Toronto",
  validity: 365,
});

const cert = await createCert({
  ca: { key: ca.key, cert: ca.cert },
  domains: ["127.0.0.1", "localhost", "::1"],
  validity: 365,
});

writeFileSync("server.key", ca.key);
writeFileSync("server.cert", ca.cert);
console.log("Files generated");
//console.log(cert.key, cert.cert); // certificate info
//console.log(`${cert.cert}${ca.cert}`); // create full chain certificate by merging CA and domain certificates
