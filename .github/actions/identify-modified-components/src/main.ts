import {
  setFailed,
  debug,
  info,
  startGroup,
  endGroup,
  getInput,
  setOutput,
} from "@actions/core";
import { env } from "process";
import { getFilesModifiedFromPreviousRelease } from "./github.service";
import { ComponentMetadata } from "./ComponentMetadata.type";
import { Minimatch } from "minimatch";
import { readFileSync } from 'fs';

function getComponents(): Promise<Record<string, ComponentMetadata>> {
  const componentsFile = getInput("components-json", {
    required: true,
    trimWhitespace: true,
  });
  const contents =  readFileSync(componentsFile, 'utf8');
  return JSON.parse(contents);
}

async function run() {
  try {
    const differences = await getFilesModifiedFromPreviousRelease(env);
    debug(`Files modified :: \n ${differences.join("\n")}`);

    const components = await getComponents();

    const modifiedComponents = Object.entries(components).reduce(
      (filtered, [component, metadata]) => {
        const isModified = metadata.pathPattern.some((pattern) => {
          const matcher = new Minimatch(pattern);
          return differences.some((file) => matcher.match(file));
        });

        if (isModified) filtered.push({ ...metadata, component });
        return filtered;
      },
      [] as ComponentMetadata[]
    );

    startGroup("Components modified");
    info(Object.keys(modifiedComponents).join("\n"));
    endGroup();
    setOutput("components-matrix", modifiedComponents);
  } catch (error: any) {
    console.log(error);
    setFailed(error.message);
  }
}

run();
