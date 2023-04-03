using YamlDotNet.Serialization.NamingConventions;
using YamlDotNet.Serialization;

namespace ReleaseAction.GitHub;

internal delegate Task WorkflowCompletion(string componentName, CancellationToken cancellationToken);

internal class GitHubWorkflows
{
    private static readonly GitHubClient _client;

    static GitHubWorkflows()
    {
        if (_client is null)
        {
            _client = new GitHubClient(new ProductHeaderValue("maersk-rock-release-action"));
            var tokenAuth = new Credentials(ActionInputs.Instance.GitHubToken);
            _client.Credentials = tokenAuth;
        }
    }

    internal static async Task TriggerWorkflowAsync(Component component, WorkflowCompletion onWorkflowCompletion, CancellationToken cancellationToken)
    {
        if (cancellationToken.IsCancellationRequested) return;

        var dispatchRequest = new CreateWorkflowDispatch(ActionInputs.Instance.Ref)
        {
            Inputs = GitHubConfiguration.GetAllConfiguration(ActionInputs.Instance.Environment)
        };
        await _client.TriggerWorkflow(component.WorkflowName, dispatchRequest);

        var runId = await GetWorkflowRunId(component, DateTime.UtcNow, cancellationToken);
        var isSuccess = await WaitForCompletion(runId, cancellationToken).WithTimeout(TimeSpan.FromMinutes(60), false);
        if (isSuccess)
            await onWorkflowCompletion(component.Name, cancellationToken);
        else
            throw new Exception($"{component.Name} failed to deploy!");
    }

    private static async Task<long> GetWorkflowRunId(Component component, DateTime createdAt, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        await Task.Delay(ActionInputs.Instance.RefreshIntervalInMilliseconds, cancellationToken);
        var request = new WorkflowRunsRequest
        {
            Event = "workflow_dispatch",
            HeadSha = ActionInputs.Instance.HeadSha,
            Created = $"{createdAt.AddMinutes(-2):u}..{createdAt:u}"
        };
        var workflowRuns = await _client.GetWorkflowRun(component.WorkflowName, request);
        if (workflowRuns.WorkflowRuns.Any())
            return workflowRuns.WorkflowRuns[0].WorkflowId;

        return await GetWorkflowRunId(component, createdAt, cancellationToken);
    }

    private static async Task<bool> WaitForCompletion(long runId, CancellationToken cancellationToken)
    {
        while (!cancellationToken.IsCancellationRequested)
        {
            var workflow = await _client.GetWorkflowRunById(runId);
            if (workflow.Conclusion == WorkflowRunConclusion.ActionRequired)
                // Should we auto approve?? Need to check with team
                await _client.ApproveDeployment(runId);
            else if (workflow.IsFailure())
                return false;
            else if (workflow.IsSuccess())
                return true;

            await Task.Delay(ActionInputs.Instance.RefreshIntervalInMilliseconds, cancellationToken);
        }
        return false;
    }
}