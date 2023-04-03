using YamlDotNet.Serialization;
using YamlDotNet.Serialization.NamingConventions;

namespace ReleaseAction.GitHub;

internal class GitHubConfiguration
{
    internal static Dictionary<string, object> GetAllConfiguration(string environment)
    {
        var deserializer = new DeserializerBuilder()
            .WithNamingConvention(CamelCaseNamingConvention.Instance)
            .Build();
        var sharedConfigs = deserializer.Deserialize<GitHubConfig>(File.OpenText(".github/configs/shared.yml"));
        var environmentConfigs = deserializer.Deserialize<GitHubConfig>(File.OpenText($".github/configs/{environment}.yml"));
        var variables = environmentConfigs.Variables
            .Union(sharedConfigs.Variables)
            .ToDictionary(_ => _.Name, _ => (object)_.Value);

        variables.TryAdd("environment", environment);
        return variables;
    }
}
