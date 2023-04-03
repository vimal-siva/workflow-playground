namespace ReleaseAction.Extensions;

internal static class GitHubWorkflowExtensions
{
    internal static bool IsSuccess(this WorkflowRun workflowRun)
        => workflowRun.Conclusion == WorkflowRunConclusion.Success;

    internal static bool IsFailure(this WorkflowRun workflowRun)
    {
        return workflowRun.Conclusion == WorkflowRunConclusion.Cancelled
            || workflowRun.Conclusion == WorkflowRunConclusion.Failure
            || workflowRun.Conclusion == WorkflowRunConclusion.TimedOut;
    }

    internal static Task TriggerWorkflow(this GitHubClient client, string workflowName, CreateWorkflowDispatch request)
        => client.Actions.Workflows.CreateDispatch(ActionInputs.Instance.RepositoryOwner, ActionInputs.Instance.Repository, workflowName, request);

    internal static Task<WorkflowRunsResponse> GetWorkflowRun(this GitHubClient client, string workflowName, WorkflowRunsRequest request)
        => client.Actions.Workflows.Runs.ListByWorkflow(ActionInputs.Instance.RepositoryOwner, ActionInputs.Instance.Repository, workflowName, request);

    internal static Task<WorkflowRun> GetWorkflowRunById(this GitHubClient client, long runId)
        => client.Actions.Workflows.Runs.Get(ActionInputs.Instance.RepositoryOwner, ActionInputs.Instance.Repository, runId);

    internal static Task ApproveDeployment(this GitHubClient client, long runId)
        => client.Actions.Workflows.Runs.Approve(ActionInputs.Instance.RepositoryOwner, ActionInputs.Instance.Repository, runId);
}
