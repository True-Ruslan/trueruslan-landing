# Security Policy

## Supported versions

Security fixes are applied to the current `master` branch and the production site built from it. Historical branches, archived prototypes and old generated artifacts are not supported.

## Reporting a vulnerability

Do not publish suspected vulnerabilities, credentials, tokens, private data or working exploit details in a public issue, discussion or pull request.

Preferred reporting path:

1. Use GitHub **Private vulnerability reporting** for this repository when the option is available.
2. If private reporting is unavailable, email `ruslan.nemikin@gmail.com` with the subject `Security: trueruslan-landing`.

Include:

- affected file, workflow, route or dependency;
- realistic attack preconditions;
- expected and observed behavior;
- impact and reproduction steps;
- a minimal proof of concept without unrelated private data.

An acknowledgement is normally sent within 7 days. Validation, remediation and coordinated disclosure timing depend on severity and reproducibility. Please allow a reasonable remediation window before public disclosure.

## System and scope

This repository contains a public static engineering portfolio and knowledge platform built with Node.js and Diplodoc and deployed through GitHub Actions and GitHub Pages.

Security-relevant scope includes:

- repository and branch governance;
- GitHub Actions workflows, permissions and third-party actions;
- npm dependencies and lockfile integrity;
- build, post-processing and deployment scripts;
- parsers and validators for repository-controlled JSON, YAML and Markdown data;
- URL handling, redirects, external-link checks and generated metadata;
- generated HTML, JavaScript, CSS, feeds, search data and downloadable artifacts;
- custom-domain deployment configuration.

The published site has no account system, payment processing, user database or server-side application runtime.

## Threat model and trust boundaries

Potentially attacker-controlled input may include:

- pull-request changes from contributors;
- dependency and GitHub Action updates;
- external HTTP responses inspected by maintenance scripts;
- URLs and editorial fields added to repository data;
- browser input handled by search, filters and navigation controls.

Important trust boundaries are:

- contributor content → repository review and CI;
- repository source → generated site artifact;
- workflow definition → GitHub-hosted runner and `GITHUB_TOKEN`;
- external URL or response → bounded validation logic;
- generated artifact → public GitHub Pages deployment.

## Security invariants

The following properties must hold:

- Secrets, credentials and private tokens must never be committed, embedded in generated files, uploaded as diagnostics or printed to logs.
- GitHub Actions permissions must be explicitly minimized per workflow and job.
- Pull-request workflows must not expose privileged secrets to untrusted code.
- Third-party Actions must be pinned to immutable commit SHAs, with the human-readable release version retained in a comment.
- Dependency changes must preserve lockfile integrity and pass the full test, build, browser, accessibility and artifact verification pipeline.
- Repository data must be treated as untrusted input by renderers and must be validated and escaped before insertion into generated output.
- URL handling must reject unsafe schemes and must not introduce unrestricted redirect following, local-network access or secret-bearing requests.
- Generated output must be deterministic enough for integrity, metadata, visual and custom-domain checks to detect unexpected changes.
- Deployment must originate from reviewed repository state and must not rely on writable credentials retained after checkout.

## Reportable findings and severity context

Reportable issues include realistic paths to:

- secret disclosure or unauthorized repository/deployment mutation;
- execution of attacker-controlled code in a privileged workflow context;
- persistent script or markup injection in the generated site;
- bypass of repository data validation that creates a security impact;
- unsafe external-request behavior such as meaningful SSRF or credential forwarding;
- dependency or Action compromise with a reachable impact on build or deployment;
- integrity failures that allow unreviewed content to reach production.

Severity should reflect practical reachability, privileges available to the attacker, affected assets and whether a pull request or maintainer action is required.

## Out of scope

Unless they demonstrate a concrete security impact, the following are out of scope:

- vulnerabilities in GitHub, Habr, Telegram, Cloudflare or other third-party services themselves;
- availability complaints caused solely by those third-party services;
- content accuracy, spelling, design preferences, SEO ranking or accessibility observations without a security consequence;
- attacks that require prior compromise of the repository owner’s GitHub account or local workstation;
- findings that affect only unsupported historical branches or expired CI artifacts;
- automated scanner output without a reproducible and reachable impact.

## Safe-harbor expectations

Good-faith research should avoid privacy violations, service disruption, data destruction, persistence, lateral movement and access beyond what is required to demonstrate the issue. Do not use discovered access to alter the public site or repository. Preserve confidentiality while remediation is in progress.
