namespace ReleaseAction.Extensions;

internal static class GitHubReleaseExtensions
{
    internal static Task<Release> GetRelease(this GitHubClient client, string? @ref)
    {
        @ref = @ref?.Replace("refs/tags/", "");
        return client.Repository.Release.Get(ActionInputs.Instance.RepositoryOwner, ActionInputs.Instance.Repository, @ref);
    }
}