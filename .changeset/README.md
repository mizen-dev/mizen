# Release notes

Run `pnpm changeset` for a user-visible package change. Select UI or CLI and write
its impact on consumers. The fixed group releases both packages together.
Docs-only and release-tooling changes need no changeset.

Use patch for compatible fixes and minor for features. Before 1.0, use minor for
breaking API changes and explain the migration. Never describe a breaking change
as a patch. Do not add attribution lines.

See [the release guide](../RELEASING.md) for version preparation and publishing.
