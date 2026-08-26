const fs = require("fs");
const path = require("path");
const assert = require("assert");

const promoScript = fs.readFileSync(
  path.join(__dirname, "..", "public", "book-promo.js"),
  "utf8"
);
const promoStyles = fs.readFileSync(
  path.join(__dirname, "..", "public", "book-promo.css"),
  "utf8"
);

assert.match(promoScript, /data-rb-book-promo-close/);
assert.match(promoScript, /rb-book-promo-dismissed/);
assert.match(promoScript, /type\s*=\s*["']button["']/);
assert.match(promoStyles, /\.rb-book-promo__close/);
assert.match(promoStyles, /position:\s*absolute/);

console.log("book promo close controls are implemented");
