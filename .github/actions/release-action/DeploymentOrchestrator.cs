namespace ReleaseAction;

internal class DeploymentOrchestrator
{
    private static IEnumerable<Component> _componentsToDeploy = Enumerable.Empty<Component>();
    private static readonly ConcurrentBag<string> _deployedComponents = new();

    internal static async Task DeployAllAsync(ActionInputs? inputs, CancellationToken cancellationToken)
    {
        if (_componentsToDeploy.Any())
        {
            _componentsToDeploy = _componentsToDeploy.Where(x => _deployedComponents.All(_ => _ != x.Name));
        }
        else if (inputs != null)
        {
            _componentsToDeploy = await GitHubReleases.GetAllComponentsToDeploy(inputs, cancellationToken);
        }
        var deploymentTasks = GetDeployableComponents(_componentsToDeploy)
            .Select(component => GitHubWorkflows.TriggerWorkflowAsync(component, OnWorkflowCompletion, cancellationToken));

        if (deploymentTasks.Any())
            await Task.WhenAll(deploymentTasks);
    }


    private static IEnumerable<Component> GetDeployableComponents(IEnumerable<Component> components)
    {
        if (!components.Any()) return Enumerable.Empty<Component>();
        var modifiedComponents = components.Select(_ => _.Name);
        foreach (var component in components)
        {
            var dependencies = component.DependsOn ?? Enumerable.Empty<string>();
            component.DependsOn = dependencies.Where(_ => modifiedComponents.Contains(_)).ToArray();
        }
        return components.Where(_ => !_.DependsOn.Any());
    }

    private static async Task OnWorkflowCompletion(string component, CancellationToken cancellationToken)
    {
        if (!_deployedComponents.Contains(component))
        {
            _deployedComponents.Add(component);
        }
        await DeployAllAsync(default, cancellationToken);
    }
}
