# repo-guard

Checks a repository for what recent supply chain attacks hide in. It is one Python file with no dependencies, reads tracked files only, runs nothing from the repository, and needs no network.

| Check | Why |
| --- | --- |
| Invisible and bidirectional Unicode in source | Worms in editor extensions have hidden payloads in characters no review tool shows, and bidirectional controls make code read differently from how it compiles |
| Editor tasks that run on folder open, tracked Git hooks, dev containers that download, Git filter drivers, agent server configs | Each one runs without anybody asking it to, which is how fake recruiter coding tasks have infected developers |
| Package install hooks and `binding.gyp` | The trigger used by self-replicating registry worms |
| `pull_request_target`, event text in a shell, missing `permissions:`, `curl \| sh`, actions not pinned to a commit | CI trust boundaries, where one bad workflow can hand over a repository's secrets |
| Build configs that compile `process.env` into the bundle | One such line has shipped a whole CI environment, tokens included, inside released firmware |
| Unpinned `staging_bucket` or old `google-cloud-aiplatform`, and required IDE plugins | A predictable default bucket lets another tenant swap a pickled model before it loads, and an IDE plugin has full user privileges |
| Committed tokens and private keys | A leaked token keeps working until it is revoked |

```bash
python3 repo_guard.py [DIRECTORY] [--strict]
```

The exit code is 1 if there are errors, or with `--strict`, warnings too. To accept a finding, put `repo-guard: allow` and a reason on that line or the one before.

Copy the file into a repository's `.github/scripts/` and run it from a workflow. Fetching it live from CI would itself be a supply chain risk.

Run the tests with `python3 -m unittest test_repo_guard`.
