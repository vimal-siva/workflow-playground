namespace ReleaseAction.Models;

internal class Component
{
    public string Name { get; set; } = null!;
    public string[] DependsOn { get; set; } = Array.Empty<string>();
    public string[] IncludePathPatterns { get; set; } = Array.Empty<string>();
    public string[] ExcludePathPatterns { get; set; } = Array.Empty<string>();
    public bool SkipBuild { get; set; }
    public string WorkflowName { get; set; } = null!;
}