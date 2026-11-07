#!/usr/bin/env python3
"""Tests for repo_guard. Run with: python3 -m unittest test_repo_guard"""
import subprocess
import tempfile
import unittest
from pathlib import Path

import repo_guard


class Base(unittest.TestCase):
    def scan(self, files):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            subprocess.run(["git", "init", "-q", str(root)], check=True)
            for name, content in files.items():
                path = root / name
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(content if isinstance(content, bytes) else content.encode("utf-8"))
            subprocess.run(["git", "-C", str(root), "add", "-A"], check=True)
            return [(level, message) for level, _, _, message in repo_guard.scan(root).items]

    def errors(self, files):
        return [m for level, m in self.scan(files) if level == repo_guard.ERROR]

    def warnings(self, files):
        return [m for level, m in self.scan(files) if level == repo_guard.WARNING]


class Unicode(Base):
    def test_clean_source_passes(self):
        self.assertEqual(self.scan({"a.rs": "fn main() { println!(\"안녕\"); }\n", "b.md": "café\n"}), [])

    def test_every_hidden_range_in_source_is_found(self):
        for ch in ["\u200b", "\u200d", "\u202e", "\u2066", "\ufe0f", "\ue000", "\U000e0041", "\U000e0100", "\U000f0000"]:
            found = self.errors({"a.js": f"let a = 1;{ch}\n"})
            self.assertEqual(len(found), 1, repr(ch))
            self.assertIn(f"{ord(ch):04X}", found[0])

    def test_a_bom_at_the_start_is_fine_and_elsewhere_is_not(self):
        self.assertEqual(self.errors({"a.cs": "\ufeffclass A {}\n"}), [])
        self.assertEqual(len(self.errors({"a.cs": "class A {}\n\ufeffclass B {}\n"})), 1)

    def test_prose_allows_emoji_joiners_but_not_bidi(self):
        self.assertEqual(self.errors({"a.md": "family \U0001f468\u200d\U0001f469 ❤\ufe0f\n"}), [])
        self.assertEqual(len(self.errors({"a.md": "abc\u202edef\n"})), 1)

    def test_the_marker_accepts_a_line(self):
        self.assertEqual(self.errors({"a.js": "// repo-guard: allow, this tests the zero width space\nlet a = '\u200b';\n"}), [])
        self.assertEqual(self.errors({"a.js": "let a = '\u200b'; // repo-guard: allow\n"}), [])

    def test_binaries_and_untracked_files_are_ignored(self):
        self.assertEqual(self.scan({"a.png": "x\u202ey".encode("utf-8")}), [])


class Secrets(Base):
    def test_tokens_are_found(self):
        for text in [
            "ghp_" + "a" * 36,
            "github_pat_" + "a" * 50,
            "gho_" + "b" * 36,
            "glpat-" + "c" * 22,
            "npm_" + "d" * 36,
            "AKIA" + "E" * 16,
            "sk-proj-" + "f" * 40,
            "sk-ant-" + "g" * 40,
            "-----BEGIN RSA PRIVATE KEY-----",
            "-----BEGIN OPENSSH PRIVATE KEY-----",
            "https://user:" + "p" * 12 + "@example.com/repo.git",
        ]:
            self.assertEqual(len(self.errors({"config.txt": f"value = {text}\n"})), 1, text)

    def test_lookalikes_are_not(self):
        self.assertEqual(self.errors({"a.txt": "ghp_short AKIAlower https://example.com:8080/x\n"}), [])


class AutoRun(Base):
    def test_a_task_on_folder_open(self):
        bad = '{"tasks":[{"runOptions":{"runOn": "folderOpen"}}]}'
        self.assertEqual(len(self.errors({".vscode/tasks.json": bad})), 1)
        self.assertEqual(self.errors({".vscode/tasks.json": '{"tasks":[{"runOptions":{"runOn":"default"}}]}'}), [])

    def test_tracked_hooks(self):
        self.assertEqual(len(self.errors({".githooks/post-merge": "curl https://x | bash\n"})), 1)
        self.assertEqual(len(self.errors({".husky/pre-push": "echo aGk= | base64 -d\n"})), 1)
        self.assertEqual(self.errors({".husky/pre-commit": "npm test\n"}), [])
        self.assertEqual(len(self.warnings({".husky/pre-commit": "npm test\n"})), 1)

    def test_dev_containers_and_filters_and_submodules(self):
        self.assertEqual(len(self.errors({".devcontainer/devcontainer.json": '{"postCreateCommand":"curl x"}'})), 1)
        self.assertEqual(self.errors({".devcontainer/devcontainer.json": '{"image":"x"}'}), [])
        self.assertEqual(len(self.errors({".gitattributes": "* filter=evil\n"})), 1)
        self.assertEqual(self.errors({".gitattributes": "*.bin filter=lfs diff=lfs\n"}), [])
        self.assertEqual(len(self.errors({".gitmodules": '[submodule "a"]\n url = ext::sh -c touch\n'})), 1)
        self.assertEqual(self.errors({".gitmodules": '[submodule "a"]\n url = https://github.com/a/b\n'}), [])

    def test_agent_and_native_build_configs_are_noted(self):
        self.assertEqual(len(self.warnings({".mcp.json": "{}"})), 1)
        self.assertEqual(len(self.warnings({"binding.gyp": "{}"})), 1)
        self.assertEqual(len(self.warnings({".idea/externalDependencies.xml": '<project><component name="ExternalDependencies"><plugin id="x"/></component></project>'})), 1)


class Packages(Base):
    def test_install_hooks(self):
        self.assertEqual(len(self.errors({"package.json": '{"scripts":{"preinstall":"curl x | sh"}}'})), 1)
        self.assertEqual(len(self.warnings({"package.json": '{"scripts":{"postinstall":"node setup.js"}}'})), 1)
        self.assertEqual(self.scan({"package.json": '{"scripts":{"test":"node t.js"}}'}), [])
        self.assertEqual(self.scan({"package.json": "not json"}), [])
        self.assertEqual(self.scan({"package.json": '{"scripts":[1]}'}), [])


GOOD = """name: CI
on: [push]
permissions:
  contents: read
jobs:
  a:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@0123456789abcdef0123456789abcdef01234567
      - run: echo ok
"""


class Workflows(Base):
    def wf(self, text):
        return {".github/workflows/a.yml": text}

    def test_a_good_workflow_passes(self):
        self.assertEqual(self.scan(self.wf(GOOD)), [])

    def test_missing_permissions(self):
        self.assertTrue(any("permissions" in m for m in self.errors(self.wf(GOOD.replace("permissions:\n  contents: read\n", "")))))
        self.assertTrue(any("write-all" in m for m in self.errors(self.wf(GOOD.replace("permissions:\n  contents: read\n", "permissions: write-all\n")))))

    def test_event_text_in_a_shell(self):
        for expr in ["github.event.issue.title", "github.event.pull_request.body", "github.head_ref", "github.event.comment.body"]:
            bad = GOOD.replace("echo ok", 'echo "${{ ' + expr + ' }}"')
            self.assertEqual(len(self.errors(self.wf(bad))), 1, expr)
        multi = GOOD.replace("- run: echo ok", '- run: |\n          echo hi\n          echo "${{ github.event.issue.body }}"')
        self.assertEqual(len(self.errors(self.wf(multi))), 1)
        # Through `env:` is the right way, and safe values are safe.
        env = GOOD.replace("- run: echo ok", '- env:\n          T: ${{ github.event.issue.title }}\n        run: echo "$T"')
        self.assertEqual(self.errors(self.wf(env)), [])
        self.assertEqual(self.errors(self.wf(GOOD.replace("echo ok", "echo ${{ github.sha }}"))), [])

    def test_download_and_run(self):
        self.assertEqual(len(self.errors(self.wf(GOOD.replace("echo ok", "curl -fsSL https://x | sudo bash")))), 1)
        self.assertEqual(self.errors(self.wf(GOOD.replace("echo ok", "curl -fsSL https://x -o y"))), [])
        self.assertEqual(self.errors(self.wf(GOOD.replace("echo ok", "curl https://x | sh # repo-guard: allow, pinned below"))), [])

    def test_pinning_and_fork_triggers_are_warnings(self):
        self.assertTrue(any("not pinned" in m for m in self.warnings(self.wf(GOOD.replace("@0123456789abcdef0123456789abcdef01234567", "@v7")))))
        self.assertTrue(any("pull_request_target" in m for m in self.warnings(self.wf(GOOD.replace("on: [push]", "on:\n  pull_request_target:")))))
        self.assertEqual(self.warnings(self.wf(GOOD.replace("actions/checkout@0123456789abcdef0123456789abcdef01234567", "./local"))), [])


class CommandLine(Base):
    def test_build_config_baking_the_environment(self):
        self.assertTrue(self.errors({"webpack.config.js": "new DefinePlugin({ 'process.env': JSON.stringify(process.env) })\n"}))
        self.assertTrue(self.errors({"vite.config.ts": "define: { 'process.env': process.env },\n"}))
        self.assertFalse(self.errors({"vite.config.ts": "define: { 'process.env.MODE': JSON.stringify(process.env.MODE) },\n"}))
        self.assertFalse(self.errors({"server.js": "console.log(JSON.stringify(process.env))\n"}))

    def test_ml_pipeline_staging_bucket_and_sdk_floor(self):
        self.assertTrue(self.errors({"requirements.txt": "google-cloud-aiplatform==1.140.0\n"}))
        self.assertFalse(self.errors({"requirements.txt": "google-cloud-aiplatform==1.148.0\n"}))
        self.assertTrue(self.warnings({"train.py": 'aiplatform.init(project="my-proj", location="us-central1")\n'}))
        self.assertFalse(self.warnings({"train.py": 'aiplatform.init(project="my-proj", staging_bucket="gs://my-bkt")\n'}))

    def test_exit_codes(self):
        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            subprocess.run(["git", "init", "-q", d], check=True)
            (root / "a.txt").write_text("fine\n")
            subprocess.run(["git", "-C", d, "add", "-A"], check=True)
            self.assertEqual(repo_guard.main([d]), 0)
            (root / ".mcp.json").write_text("{}")
            subprocess.run(["git", "-C", d, "add", "-A"], check=True)
            self.assertEqual(repo_guard.main([d]), 0)
            self.assertEqual(repo_guard.main([d, "--strict"]), 1)
            (root / "b.js").write_text("let a = '\u202e';\n")
            subprocess.run(["git", "-C", d, "add", "-A"], check=True)
            self.assertEqual(repo_guard.main([d]), 1)


if __name__ == "__main__":
    unittest.main()
