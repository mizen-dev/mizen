<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->

## Integration findings

When integration reveals a possible library defect:
- Record the installed library version.
- Check the documented API.
- Reproduce with the smallest supported composition.
- Determine whether the app or library owns the defect.
- Search existing issues before creating one.
- Do not patch library internals or hide defects with CSS overrides.
- Add the regression test in the owning repository.
- Verify the released fix in the original app workflow.

Use the Bug, Improvement, or Missing component issue form. Follow
[the integration workflow](CONTRIBUTING.md#integration-workflow).
Prioritize missing components that block a current operator task. Document an
existing composition before extending an API or proposing a reusable component.
Keep admin-domain behavior in the app.

Keep the report, fix PR, release version, and app verification linked. A merged
fix is not consumer verification. Mark verification complete only after the
original app uses the fixed version and passes the original workflow.

Without tracker access, save ready-to-file reports under `docs/ui-findings/` in
the consumer app. Once filed, replace each local report with its issue link.
Do not keep a second backlog in this library.
