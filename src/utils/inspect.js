import util from "util";

export function inspect(object) {
  console.log(`🔎 ---------------------------------------------------🔎`);
  console.log(
    `🔎 ~ file: inspect.js:6 ~ inspect ~ object:`,
    util.inspect(object, false, null, true /* enable colors */)
  );
  console.log(`🔎 ---------------------------------------------------🔎`);
}
