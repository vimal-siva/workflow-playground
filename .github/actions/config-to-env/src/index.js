import { getInput, setFailed } from '@actions/core';
import { load } from 'js-yaml';
import { readFileSync } from 'fs';

try {
    const environment = 'test';//getInput('environment');
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
    const variables = load(fileContents).variables;
    console.log(variables);
    return variables.map(value => new { name: value.name, value: value.value });
}

function updateGitHubEnv(values) {
    console.log(values);
}