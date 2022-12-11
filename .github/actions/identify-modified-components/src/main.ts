import { setFailed, setOutput, debug, info } from "@actions/core";
import { env } from "process";
import { getFilesModifiedFromPreviousRelease } from "./github.service";
import { sets } from "./diff";

async function run() {
  try {
    const differences = await getFilesModifiedFromPreviousRelease(env);
    debug(differences.join(" "));
    const componentFilters = {
      frontend: "frontend/**",
      backend: "frontend/**",
      adf: "adf-config/**",
    };
    let filterSets = sets(componentFilters, differences);
    info(`Components modified :: \n${Object.keys(filterSets).join("\n")}`);
  } catch (error: any) {
    console.log(error);
    setFailed(error.message);
  }
}

run();
