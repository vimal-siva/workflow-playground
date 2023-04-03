namespace ReleaseAction.Extensions;

internal static class TaskExtensions
{
    internal static async Task<TResult> WithTimeout<TResult>(this Task<TResult> task, TimeSpan timeSpan, TResult defaultValue)
    {
        var timoutTask = Task.Run(async () => { await Task.Delay(timeSpan); return defaultValue; });
        return (await Task.WhenAny(task, timoutTask)).Result;
    }
}
