"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sets = void 0;
const minimatch_1 = require("minimatch");
/** produce a collection of named diff sets based on patterns defined in sets */
const sets = (filters, files) => Array.from(Object.entries(filters)).reduce((filtered, [key, patterns]) => patterns.split(/\r?\n/).reduce((filtered, pattern) => {
    let matcher = new minimatch_1.Minimatch(pattern);
    let matched = files.filter((file) => matcher.match(file));
    if (matched.length > 0) {
        filtered[key] = (filtered[key] || []).concat(matched);
    }
    return filtered;
}, filtered), {});
exports.sets = sets;
