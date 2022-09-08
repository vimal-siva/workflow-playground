
type Env = Record<string, string | undefined>;

export interface Config {
    githubToken: string;
    owner: string;
    repo: string;
    base: string;
    head: string;
}

function cleanRef(ref: string): string {
    if (ref.startsWith('refs/heads/')) {
        return ref.replace('refs/heads/', '');
    }
    if (ref.startsWith('refs/tags/')) {
        return ref.replace('refs/tags/', '');
    }
    return ref;
};

export function parseConfig(env: Env): Config {
    const [owner, repo] = (env.GITHUB_REPOSITORY || '').split('/', 2);
    return {
        githubToken: env.GITHUB_TOKEN || '',
        owner,
        repo,
        head: cleanRef(env.GITHUB_HEAD_REF || env.GITHUB_REF || ''),
        base: env.INPUT_BASE || 'main'
    }
};