import { redact } from "../api/lib/redact.ts";

let pass = 0, fail = 0;
const check = (n: string, c: boolean, d = "") =>
  c ? (pass++, console.log(`  PASS  ${n}`)) : (fail++, console.log(`  FAIL  ${n} ${d}`));

const googleErr = new Error(
  `{"error":{"code":403,"message":"Permission denied: Consumer 'api_key:AIzaSyEXAMPLEFAKEKEYFORTESTSONLY0000000' has been suspended."}}`
);
const out = redact(googleErr);
check("classic AIza... key is removed", !out.includes("AIzaSyEXAMPLE"), out.slice(0, 80));
check("replacement marker present", out.includes("[redacted]"));
check("the rest of the message survives", out.includes("has been suspended"));

const newFormat = redact("api_key:AQ.EXAMPLEFAKETOKENFORTESTSONLY000000 failed");
check("new AQ. key format is removed", !newFormat.includes("EXAMPLEFAKE"), newFormat);

check("clerk secret is removed", !redact("sk_test_abcdefghij1234567890").includes("abcdefghij"));
check("bearer token is removed", !redact("Authorization: Bearer abcdef1234567890xyz").includes("abcdef1234567890"));
check("ordinary text is untouched", redact("nothing secret here") === "nothing secret here");

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
