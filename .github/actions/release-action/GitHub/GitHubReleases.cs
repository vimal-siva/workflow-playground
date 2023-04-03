
using Microsoft.Extensions.FileSystemGlobbing;

namespace ReleaseAction.GitHub;
internal class GitHubReleases
{
    private static readonly GitHubClient _client;

    static GitHubReleases()
    {
        if (_client is null)
        {
            _client = new GitHubClient(new ProductHeaderValue("maersk-rock-release-action"));
            var tokenAuth = new Credentials(ActionInputs.Instance.GitHubToken);
            _client.Credentials = tokenAuth;
        }
    }
    internal static async Task<IEnumerable<Component>> GetAllComponentsToDeploy(ActionInputs inputs, CancellationToken token)
    {
        var currentRelease = await _client.GetRelease(inputs.Ref);
        var previousRelease = await GetPreviousRelease(currentRelease.Prerelease);
        var components = GetAllComponents(inputs);
        
        if (previousRelease is null) return components;
        return await GetModifiedComponents(currentRelease, previousRelease, components);
    }

    private static async Task<IEnumerable<Component>> GetModifiedComponents(Release currentRelease, Release previousRelease, IEnumerable<Component> components)
    {
        var commits = await _client.Repository.Commit.Compare(ActionInputs.Instance.RepositoryOwner, ActionInputs.Instance.Repository, previousRelease.TagName, currentRelease.TagName);
        var files = commits.Files.Where(_ => _.Status != "removed").Select(_ => _.Filename);
        return components.Where(component =>
        {
            var matcher = new Matcher();
            matcher.AddIncludePatterns(component.IncludePathPatterns);
            matcher.AddIncludePatterns(component.ExcludePathPatterns);
            var result = matcher.Match(files);
            return result.HasMatches;
        });
    }

    private static IEnumerable<Component> GetAllComponents(ActionInputs inputs)
    {
        var contents = File.ReadAllText(inputs.ComponentsJsonFile);
        var components = JsonSerializer.Deserialize<Dictionary<string, Component>>(contents) ?? new();
        return components
            .Select(_ => { _.Value.Name = _.Key; return _.Value; });
    }

    private static async Task<Release?> GetPreviousRelease(bool isPrerelease)
    {
        var releases = await _client.Repository.Release.GetAll(ActionInputs.Instance.RepositoryOwner, ActionInputs.Instance.Repository);
        var filteredReleases = releases.Where(_ => !_.Draft && _.Prerelease == isPrerelease);
        if (filteredReleases.Count() > 1)
        {
            return filteredReleases.ElementAt(1);
        }
        return null;
    }
}