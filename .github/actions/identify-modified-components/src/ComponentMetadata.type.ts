export interface ComponentMetadata {
  component: string;
  workflowName: string;
  pathPattern: Array<string>;
  excludePathPattern: Array<string>;
  waitForDeployCompletion: boolean;
}
