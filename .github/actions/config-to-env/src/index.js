import { getInput, setFailed, exportVariable, setSecret } from '@actions/core';
import { load } from 'js-yaml';
import { readFileSync } from 'fs';

try {
    const environment = getInput('environment');
    const configPath = './.github/configs';

    loadVariablesToWorkflowEnv(`${configPath}/shared.yml`);

    loadVariablesToWorkflowEnv(`${configPath}/${environment}.yml`);

} catch (error) {
    setFailed(error.message);
}

function loadVariablesToWorkflowEnv(file) {
    const fileContents = readFileSync(file, 'utf8');
    const variables = load(fileContents).variables;
    variables.forEach(_ => { 
        setSecret(_.value); 
        exportVariable(_.name, _.value);
    });
}