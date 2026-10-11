## 0.1.2

* Update zapier-platform-core to 19.2.0
* Run zapier-platform-cli via pinned npx instead of a dev dependency (clears dev-only advisories)
* Disable dependency install scripts via .npmrc
* Harden publish workflow (no expression injection, tag validation, validate before push)
* Update mocha to 12.x; drop obsolete npm overrides

## 0.1.1

* Fix security advisories via npm overrides
* Add promote step to publish workflow
* Auto-sync package.json version from git tag

## 0.1.0

* Update zapier-platform-core from 15.x to 19.x (Node 22 runtime)
* Update swagger.json and generate samples from schema
* Update trigger/alert, trigger/incident, trigger/pulse to use response.data
* Update search/alert, search/incident, search/pulse to use response.data
* Update create/alert, create/incident, create/pulse to use response.data
* Fix cleanInputData flag to resolve D028 warnings
* Add Dependabot, CODEOWNERS, GitHub Actions CI

## 0.0.7 - 07-28-2023

* Update schema.

## 0.0.6 - 07-28-2023

* Update schema.

## 0.0.5

* Initial release.
