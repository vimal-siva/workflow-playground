using IHost host = Host.CreateDefaultBuilder(args)
    .Build();

using CancellationTokenSource tokenSource = new();

Console.CancelKeyPress += (_, _) => tokenSource.Cancel();

var parser = Default.ParseArguments(() => ActionInputs.Instance, args);
parser.WithNotParsed(
    errors =>
    {
        host.Services.GetRequiredService<ILoggerFactory>()
            .CreateLogger("ReleaseAction")
            .LogError(
                string.Join(Environment.NewLine, errors.Select(error => error.ToString())));

        Environment.Exit(1);
    });

await parser.WithParsedAsync(async inputs =>
{
    try
    {
        await DeploymentOrchestrator.DeployAllAsync(inputs, tokenSource.Token);
    }
    catch (Exception ex)
    {
        Console.WriteLine(ex.Message);
    }
});

await host.RunAsync();