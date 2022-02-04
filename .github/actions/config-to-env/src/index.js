import { getInput, setFailed, exportVariable } from '@actions/core';
import { load } from 'js-yaml';
import { readFileSync } from 'fs';

try {
    const environment = getInput('environment');
    const configPath = './.github/configs';

    let values = readVariables(`${configPath}/shared.yml`);
    updateGitHubEnv(values);

    values = readVariables(`${configPath}/${environment}.yml`);
    updateGitHubEnv(values);

} catch (error) {
    setFailed(error.message);
}

function readVariables(file) {
    const fileContents = readFileSync(file, 'utf8');
    return load(fileContents).variables;
}

function updateGitHubEnv(values) {
    values.forEach(_ => exportVariable(_.name, _.value));
}