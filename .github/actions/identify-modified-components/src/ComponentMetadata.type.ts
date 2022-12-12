export interface ComponentMetadata {
    component: string
    workflowName: string
    pathPattern: Array<string>
    waitForDeployCompletion: boolean
}