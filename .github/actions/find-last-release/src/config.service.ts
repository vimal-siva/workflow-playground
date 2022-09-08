
type Env = Record<string, string | undefined>;

export interface Config {
    githubToken: string;
    owner: string;
    repo: string;
}

export function parseConfig(env: Env): Config {
    const [owner, repo] = (env.GITHUB_REPOSITORY || "").split("/", 2);
    return {
        githubToken: env.GITHUB_TOKEN || "",
        owner,
        repo
    }
};