# Releasing Mizen

Mizen publishes `@mizen-labs/ui` and `@mizen-labs/cli` together from
[mizen-labs/mizen](https://github.com/mizen-labs/mizen). Their versions stay equal
because the CLI embeds the UI catalog. Docs-only changes do not need a release.

Publishing is manual. Merging a PR, pushing a tag, and creating a GitHub Release
do not publish packages. The `Release` workflow is the only publishing entry point.
This workflow supports stable versions. Add a separate prerelease policy before
using versions such as `0.2.0-beta.1`.

## One-time setup

1. Confirm the repository is `mizen-labs/mizen`. The organization transfer is
   complete. Check `git remote -v` and, if needed, update your remote:
   `git remote set-url github https://github.com/mizen-labs/mizen.git`.
2. Require the `CI result` check on `main`. Protect `v*` tags against updates and
   deletion while allowing the release workflow to create them.
3. Create the GitHub environment `npm-release`. Limit it to `main`. Add required
   reviewers if you want approval gates. Both publishing and finalization use
   this environment, so required reviewers may need to approve both jobs.
4. For both npm packages, add a GitHub Actions trusted publisher:
   organization `mizen-labs`, repository `mizen`, workflow filename `release.yml`,
   environment `npm-release`. Enable **Allow npm publish** and **Allow npm dist-tag**.
   No npm token is needed. The workflow installs npm 11.21.0 for OIDC dist-tag support.
5. Push these workflow changes through your normal review process. Local edits do
   not configure npm or GitHub settings.

See [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/).
Keep `repository.url` in both packages aligned with the GitHub repository.

## Record changes

Run from the repository root:

```sh
pnpm changeset
```

Select the affected package and describe the consumer-visible outcome. Changesets
bumps the fixed UI/CLI group together. Use patch for compatible fixes and minor
for features. Before 1.0, use minor for breaking changes and include migration
instructions. Never hide a breaking change in a patch. Do not add attribution lines.

Commit the changeset with the implementation and regression tests. Docs-only and
release-tooling changes can omit it; explain that choice in the PR.

## Prepare a release PR

From an up-to-date `main`, create a release branch and run:

```sh
git switch -c release/next
pnpm version-packages
```

Review both package versions, both changelogs, and `pnpm-lock.yaml`. Commit those
changes and open one release PR using the normal GitHub review flow. Version
preparation does not commit, push, create tags, or publish automatically.

The release PR must pass CI. Merge it, then wait for the **push to main** CI run
for that exact merge commit to finish successfully. A PR CI run is not eligible.
If main advances before starting Release, use its new successful CI run after
reviewing the additional changes. Do not publish an unreviewed candidate.

## Publish manually

In GitHub Actions, open **Release → Run workflow**, select `main`, and enter:

- `version`: the shared version in the release PR, for example `0.1.1`.
- `ci_run_id`: the numeric ID in the successful main CI run's URL.

The selected CI commit must equal the release workflow commit. This keeps npm
provenance, package contents, and the Git tag tied to the same source.

The workflow:

1. Requires a successful main push run of `ci.yml` from this repository.
2. Downloads `release-ubuntu-latest-node-24.11.0`. Other matrix builds remain
   compatibility checks. CI retains candidate artifacts for 90 days.
3. Rejects dirty sources, mismatched lockfiles, versions, archive hashes, package
   entries, repository metadata, missing release notes, unconsumed changesets,
   and catalog drift.
4. Checks both versions on npm before publishing either. Existing versions must
   contain exactly the verified archive bytes. Registry errors stop the release.
5. Publishes missing archives under `release-candidate`, without rebuilding them.
   The packages are public at this point, but normal installs still use `latest`.
6. Downloads published archives and verifies their hashes. Installs exact versions
   in fresh npm consumers, runs CLI checks and initialization, and builds a Next app.
7. Promotes both versions to `latest`, refusing to move either tag backward.
8. Creates the annotated Git tag `v<version>` at the verified commit. It attaches
   both archives, the manifest, and release notes to a draft GitHub Release, then
   publishes the completed release.

Consumer installation and compilation run in a separate job with read-only
repository access and no OIDC publishing permission.

The workflow has one concurrency group and does not cancel an active release.
Package publication and promotion cannot be atomic across two npm packages.
A failure can leave one package published or promoted; use the retry flow below.
The `release-candidate` dist-tag remains as a pointer to the last candidate.

## Retry and recover

Re-run the failed **original Release workflow** with its original inputs. This
preserves its source commit even if `main` has advanced. Never rebuild a partly
published version and substitute a new archive. The retry checks existing npm
versions, tags, and GitHub assets and refuses conflicts.

If a published archive differs, stop and investigate. Publish a corrected new
version through a new release PR. Never move a release Git tag or overwrite an
existing asset with different bytes. A registry outage does not mean a version
is unpublished.

Keep the original CI artifact until release completion. If it expires, do not
assume a rebuilt artifact will match a partially published release. Compare its
hashes first. Completed releases retain their archives and manifest in GitHub.

For local, read-only inspection of a downloaded CI artifact:

```sh
pnpm release:verify /absolute/path/to/downloaded-artifact 0.1.1
```

Use a clean checkout of the candidate commit. This verifies files and release
notes without publishing, tagging, or accessing npm. `pnpm release:check` remains
a development check and may produce a manifest marked dirty; publishing rejects it.

## Verify consumers

Automated registry verification is not verification of the original admin app.
Upgrade the original app to the released version and repeat the reported workflow.
Link the issue, fix PR, release, app commit, and evidence before marking consumer
verification complete. Follow [the integration workflow](CONTRIBUTING.md#integration-workflow).

## Existing 0.1.0 release

Do not use this workflow to relabel today's code as 0.1.0. Recover the original
published archives and source commit before creating any historical tag. The next
release PR should generate its own version and changelog entries.


## Release workflow troubleshooting

The publishing, consumer, and finalization jobs install npm 11.21.0 in a dedicated
runner directory. They prepend its bin directory to `GITHUB_PATH` so pnpm's
runtime shims cannot select a different npm version in subsequent steps.
The publication guard reports the resolved version if this setup fails.

For both npm packages, the trusted publisher must allow `npm publish` and
`npm dist-tag`. Configure owner `mizen-labs`, repository `mizen`, workflow
`release.yml`, and environment `npm-release`. Dist-tag permission is separate
from publishing permission and is required to promote the verified version to
`latest`. GitHub environment approval does not grant npm permissions.

Finalization searches release listings, including drafts, before creating a
release. A retry resumes existing asset uploads and checks existing bytes.
It uploads assets sequentially so cleanup cannot remove files still in use.

The consumer job allows 50 minutes for four separately bounded installation,
initialization, and build commands plus setup and registry checks. Finalization
allows 30 minutes for promotion and asset transfer. These are failure ceilings,
not delays added to successful runs.

After a workflow fix, push the new commit, wait for its CI run, and dispatch a
new Release run using that CI run ID. Keep the prepared package version if no
package has been published. An old workflow retry still uses its original code.
