import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DEFAULT_PROJECTS_PATH = path.join(ROOT, 'data', 'projects.json');
const DEFAULT_EVIDENCE_PATH = path.join(ROOT, 'data', 'project-evidence.json');
const DEFAULT_OUTPUT_PATH = path.join(ROOT, 'quality-artifacts', 'content-freshness-observations.json');

export function parseGitHubRepoUrl(value) {
  if (typeof value !== 'string') return null;
  let url;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' || url.hostname.toLowerCase() !== 'github.com') return null;
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts.length !== 2) return null;
  const [owner, rawRepo] = parts;
  const repo = rawRepo.endsWith('.git') ? rawRepo.slice(0, -4) : rawRepo;
  if (!owner || !repo) return null;
  return {owner, repo};
}

export function collectEvidenceUrls(evidence) {
  const urls = new Set();
  for (const snapshot of evidence ?? []) {
    for (const signal of snapshot?.signals ?? []) {
      if (typeof signal?.url === 'string' && signal.url.trim()) urls.add(signal.url.trim());
    }
  }
  return [...urls].sort((a, b) => a.localeCompare(b, 'en'));
}

function githubHeaders(token) {
  return {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'trueruslan-content-freshness-guard',
    ...(token ? {Authorization: `Bearer ${token}`} : {}),
  };
}

async function probeRepository({project, fetchImpl, token}) {
  const githubUrl = project?.links?.github;
  const parsed = parseGitHubRepoUrl(githubUrl);
  if (!parsed) return null;

  const apiBase = `https://api.github.com/repos/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}`;
  try {
    const response = await fetchImpl(apiBase, {headers: githubHeaders(token)});
    if (!response.ok) {
      return {
        url: githubUrl,
        status: 'unavailable',
        httpStatus: response.status,
      };
    }

    const data = await response.json();
    const observation = {
      url: data.html_url || githubUrl,
      pushedAt: data.pushed_at || null,
    };

    try {
      const releaseResponse = await fetchImpl(`${apiBase}/releases/latest`, {headers: githubHeaders(token)});
      if (releaseResponse.ok) {
        const release = await releaseResponse.json();
        if (release?.published_at) {
          observation.latestRelease = {
            tagName: release.tag_name ?? null,
            publishedAt: release.published_at,
            url: release.html_url ?? null,
          };
        }
      }
    } catch {
      // Release lookup is optional bounded context. Repository observation remains usable.
    }

    return observation;
  } catch (error) {
    return {
      url: githubUrl,
      status: 'unavailable',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function probeLink(url, fetchImpl) {
  try {
    const response = await fetchImpl(url, {method: 'HEAD', redirect: 'follow'});
    return response.ok
      ? {status: 'ok', httpStatus: response.status}
      : {status: 'unreachable', httpStatus: response.status};
  } catch (error) {
    return {
      status: 'unavailable',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function probeFreshnessObservations({
  projects,
  evidence,
  fetchImpl = globalThis.fetch,
  token = process.env.GITHUB_TOKEN ?? '',
  now = new Date(),
} = {}) {
  if (!Array.isArray(projects)) throw new Error('projects must be an array');
  if (!Array.isArray(evidence)) throw new Error('evidence must be an array');
  if (typeof fetchImpl !== 'function') throw new Error('fetchImpl must be a function');

  const generatedDate = now instanceof Date ? now : new Date(now);
  if (Number.isNaN(generatedDate.getTime())) throw new Error('now must be a valid date');

  const repositories = {};
  const orderedProjects = [...projects].sort((a, b) => String(a.slug).localeCompare(String(b.slug), 'en'));
  for (const project of orderedProjects) {
    const observation = await probeRepository({project, fetchImpl, token});
    if (observation) repositories[project.slug] = observation;
  }

  const links = {};
  for (const url of collectEvidenceUrls(evidence)) {
    links[url] = await probeLink(url, fetchImpl);
  }

  return {
    generatedAt: generatedDate.toISOString(),
    repositories,
    links,
  };
}

function parseCliArgs(argv) {
  const result = {outputPath: DEFAULT_OUTPUT_PATH};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--output') {
      result.outputPath = argv[++index];
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }
  return result;
}

export async function runFreshnessProbe({
  projectsPath = DEFAULT_PROJECTS_PATH,
  evidencePath = DEFAULT_EVIDENCE_PATH,
  outputPath = DEFAULT_OUTPUT_PATH,
  fetchImpl = globalThis.fetch,
  token = process.env.GITHUB_TOKEN ?? '',
  now = new Date(),
} = {}) {
  const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
  const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
  const observations = await probeFreshnessObservations({projects, evidence, fetchImpl, token, now});
  fs.mkdirSync(path.dirname(outputPath), {recursive: true});
  fs.writeFileSync(outputPath, `${JSON.stringify(observations, null, 2)}\n`, 'utf8');
  return {observations, outputPath};
}

async function main() {
  try {
    const args = parseCliArgs(process.argv.slice(2));
    const result = await runFreshnessProbe(args);
    console.log(`Content freshness observations written: ${result.outputPath}`);
    console.log(`Repositories observed: ${Object.keys(result.observations.repositories).length}`);
    console.log(`Evidence links observed: ${Object.keys(result.observations.links).length}`);
  } catch (error) {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await main();
}
