import { setFailed, setOutput, debug, info, startGroup, endGroup } from "@actions/core";
import { env } from "process";
import { getFilesModifiedFromPreviousRelease } from "./github.service";
import { sets } from "./diff";

async function run() {
  try {
    const differences = await getFilesModifiedFromPreviousRelease(env);
    debug(`Files modified :: \n ${differences.join('\n')}`);
    
    const componentFilters = {
      frontend: "frontend/**",
      backend: "backend/**",
      adf: "adf-config/**",
    };
    let filterSets = sets(componentFilters, differences);

    startGroup('Components modified');
    info(Object.keys(filterSets).join("\n"));
    endGroup();
  } catch (error: any) {
    console.log(error);
    setFailed(error.message);
  }
}

run();
