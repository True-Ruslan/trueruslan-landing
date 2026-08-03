# fast-xml-parser remediation evidence

Issue: #72
Advisory: GHSA-gh4j-gqv2-49f6

## Current vulnerable path

`@diplodoc/transform@4.76.2` declares `fast-xml-parser@^4.1.3`, and the current lockfile resolves `fast-xml-parser@4.5.6`.

## Security invariant

`package-lock.json` must not contain any `fast-xml-parser` release below `5.7.0`.

## Selected remediation

Upgrade `@diplodoc/transform` to a release where the vulnerable parser dependency is removed from the upstream package manifest. This is preferred over an npm override because it follows the upstream dependency graph and avoids forcing an unreviewed major version through another package's declared range.

## Verification required

- `npm ci`
- `npm test`
- `npm run build:docs`
- `npm run check:site`
- `npm audit --json`
- confirm `npm ls fast-xml-parser --all` contains no version below `5.7.0`
- Build, CodeQL and Dependency Review pass on the pull request
