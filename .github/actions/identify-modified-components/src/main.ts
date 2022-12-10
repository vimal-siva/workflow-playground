import { setFailed, setOutput, debug, info } from "@actions/core";
import { env } from "process";
import { getFilesModifiedFromPreviousRelease } from "./github.service";
import { sets } from "./diff";

async function run() {
  try {
    const differences = await getFilesModifiedFromPreviousRelease(env);
    setOutput("files", differences.join(" "));

    const componentFilters = {
      frontend: "./frontend/**",
      backend: "./backend/**",
      adf: "./adf-config/**",
    };

    let filterSets = sets(componentFilters, differences);
    info(Object.keys(filterSets).join(" "));
    
    Array.from(Object.entries(filterSets)).forEach(([key, matches]) => {
      debug(`files for ${key} ${matches}`);
      setOutput(key, matches.join(" "));
    });
  } catch (error: any) {
    console.log(error);
    setFailed(error.message);
  }
}

run();
