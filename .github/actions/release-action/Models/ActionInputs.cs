namespace ReleaseAction.Models;

public sealed class ActionInputs
{
    private static ActionInputs? _actionInputs;
    public static ActionInputs Instance
    {
        get
        {
            _actionInputs ??= new();
            return _actionInputs;
        }
    }
    private ActionInputs() { }

    [Option('c', "components-json",
        Required = true,
        HelpText = "Provide the components metadata (i.e path-pattern, workflow to trigger, etc.. )")]
    public string ComponentsJsonFile { get; set; } = null!;

    [Option('e', "environment",
        Required = true,
        HelpText = "The environment in which components have to be deployed.")]
    public string Environment { get; set; } = null!;

    [Option('o', "owner",
        Required = true,
        HelpText = "The owner of the repo. Assign from github.repository_owner. Example, \"Maersk-Global\".")]
    public string RepositoryOwner { get; set; } = null!;

    [Option('r', "repo",
        Required = true,
        HelpText = "The repository name. Assign from github.event.repository.name. Example, \"Rock\".")]
    public string Repository { get; set; } = null!;

    [Option('b', "branch",
        Required = true,
        HelpText = "The branch name. Assign from github.ref. Example, \"refs/heads/main\".")]
    public string Ref { get; set; } = null!;

    [Option('s', "head-sha",
        Required = true,
        HelpText = "The commit SHA that triggered the workflow. For example, ffac537e6cbbf934b08745a378932722df287a53.")]
    public string HeadSha { get; internal set; } = null!;

    [Option('t', "github-token",
        Required = true,
        HelpText = "Token for authenticating to GitHub APIs")]
    public string GitHubToken { get; set; } = null!;

    [Option('i', "refresh-interval",
        Required = false,
        HelpText = "The number of milliseconds delay between checking for result of run.", Default = 5000)]
    public int RefreshIntervalInMilliseconds { get; set; }
}