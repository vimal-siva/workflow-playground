import { Minimatch } from "minimatch";

/** produce a collection of named diff sets based on patterns defined in sets */
export const sets = (
  filters: Record<string, string>,
  files: Array<string>
): Record<string, Array<string>> =>
  Array.from(Object.entries(filters)).reduce(
    (filtered, [key, patterns]) =>
      patterns.split(/\r?\n/).reduce((filtered, pattern) => {
        let matcher = new Minimatch(pattern);
        let matched = files.filter((file) => matcher.match(file));
        if (matched.length > 0) {
          filtered[key] = (filtered[key] || []).concat(matched);
        }
        return filtered;
      }, filtered),
    {}
  );
