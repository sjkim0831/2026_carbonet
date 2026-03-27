#!/usr/bin/env python3
import argparse
import json
import os
import shlex
import subprocess
import threading
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import urlparse


def now_iso() -> str:
    return datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds")


def read_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def safe_text(value: Any) -> str:
    return "" if value is None else str(value)


@dataclass
class JobRecord:
    job_id: str
    title: str
    kind: str
    workspace_id: str
    workspace_label: str
    cwd: str
    command_preview: str
    status: str = "running"
    started_at: str = field(default_factory=now_iso)
    ended_at: str = ""
    exit_code: int | None = None
    output: str = ""
    final_message: str = ""
    error: str = ""
    process: subprocess.Popen[str] | None = None
    output_file: str = ""

    def as_dict(self) -> dict[str, Any]:
        return {
            "jobId": self.job_id,
            "title": self.title,
            "kind": self.kind,
            "workspaceId": self.workspace_id,
            "workspaceLabel": self.workspace_label,
            "cwd": self.cwd,
            "commandPreview": self.command_preview,
            "status": self.status,
            "startedAt": self.started_at,
            "endedAt": self.ended_at,
            "exitCode": self.exit_code,
            "output": self.output,
            "finalMessage": self.final_message,
            "error": self.error,
            "outputFile": self.output_file,
        }


class LauncherApp:
    def __init__(self, app_root: Path):
        self.app_root = app_root
        self.config_root = app_root / "config"
        self.static_root = app_root / "static"
        self.data_root = app_root / "data"
        self.jobs_root = self.data_root / "jobs"
        self.history_file = self.data_root / "job-history.jsonl"
        self.jobs_root.mkdir(parents=True, exist_ok=True)
        self.data_root.mkdir(parents=True, exist_ok=True)
        self.lock = threading.Lock()
        self.workspaces_doc = read_json(self.config_root / "workspaces.json")
        self.actions_doc = read_json(self.config_root / "actions.json")
        self.workspaces = {
            item["id"]: item
            for item in self.workspaces_doc.get("workspaces", [])
        }
        self.actions = {
            item["id"]: item
            for item in self.actions_doc.get("actions", [])
        }
        self.jobs: dict[str, JobRecord] = {}

    def bootstrap(self) -> dict[str, Any]:
        login = self.login_status()
        return {
            "defaultWorkspaceId": self.workspaces_doc.get("defaultWorkspaceId", ""),
            "workspaces": self.workspaces_doc.get("workspaces", []),
            "actions": self.actions_doc.get("actions", []),
            "codexVersion": self.codex_version(),
            "loginReady": login.get("loggedIn", False),
        }

    def codex_bin(self) -> str:
        return os.environ.get("CARBONET_CODEX_BIN", "codex")

    def codex_version(self) -> str:
        try:
            completed = subprocess.run(
                [self.codex_bin(), "--version"],
                capture_output=True,
                text=True,
                check=False,
            )
        except OSError as exc:
            return f"missing: {exc}"
        return (completed.stdout or completed.stderr or "unknown").strip()

    def login_status(self) -> dict[str, Any]:
        try:
            completed = subprocess.run(
                [self.codex_bin(), "login", "status"],
                capture_output=True,
                text=True,
                check=False,
            )
        except OSError as exc:
            return {"loggedIn": False, "message": str(exc)}
        text = (completed.stdout or completed.stderr or "").strip()
        return {
            "loggedIn": completed.returncode == 0 and "Logged in" in text,
            "message": text,
        }

    def list_jobs(self) -> list[dict[str, Any]]:
        with self.lock:
            items = sorted(
                self.jobs.values(),
                key=lambda item: item.started_at,
                reverse=True,
            )
            return [item.as_dict() for item in items]

    def get_job(self, job_id: str) -> dict[str, Any]:
        with self.lock:
            job = self.jobs.get(job_id)
            if job is None:
                raise KeyError(job_id)
            return job.as_dict()

    def cancel_job(self, job_id: str) -> dict[str, Any]:
        with self.lock:
            job = self.jobs.get(job_id)
            if job is None:
                raise KeyError(job_id)
            if job.process and job.status == "running":
                job.process.terminate()
        return self.get_job(job_id)

    def run_job(self, payload: dict[str, Any]) -> dict[str, Any]:
        workspace = self.resolve_workspace(payload)
        spec = self.build_spec(payload, workspace)
        job_id = uuid.uuid4().hex[:12]
        output_file = self.jobs_root / f"{job_id}-final.txt"
        job = JobRecord(
            job_id=job_id,
            title=spec["title"],
            kind=spec["kind"],
            workspace_id=workspace["id"],
            workspace_label=workspace["label"],
            cwd=spec["cwd"],
            command_preview=spec["command_preview"],
            output_file=str(output_file),
        )
        with self.lock:
            self.jobs[job_id] = job
        thread = threading.Thread(
            target=self._execute_job,
            args=(job_id, spec["command"], output_file),
            daemon=True,
        )
        thread.start()
        return job.as_dict()

    def resolve_workspace(self, payload: dict[str, Any]) -> dict[str, Any]:
        workspace_id = safe_text(payload.get("workspaceId")) or safe_text(self.workspaces_doc.get("defaultWorkspaceId"))
        workspace = self.workspaces.get(workspace_id)
        if workspace is None:
            raise ValueError(f"Unknown workspace: {workspace_id}")
        path = Path(safe_text(workspace.get("path")))
        if not path.exists():
            raise ValueError(f"Workspace path not found: {path}")
        return workspace

    def build_spec(self, payload: dict[str, Any], workspace: dict[str, Any]) -> dict[str, Any]:
        mode = safe_text(payload.get("mode"))
        if mode == "codex_custom":
            prompt = safe_text(payload.get("prompt")).strip()
            if not prompt:
                raise ValueError("Prompt is required.")
            return self.build_codex_spec(
                title="Custom Codex Prompt",
                workspace=workspace,
                prompt=prompt,
                full_auto=True,
            )
        if mode == "shell_custom":
            command = safe_text(payload.get("shellCommand")).strip()
            if not command:
                raise ValueError("Shell command is required.")
            return {
                "title": "Custom Shell Command",
                "kind": "shell",
                "cwd": safe_text(workspace["path"]),
                "command": ["bash", "-lc", command],
                "command_preview": command,
            }

        action_id = safe_text(payload.get("actionId"))
        action = self.actions.get(action_id)
        if action is None:
            raise ValueError("Action is required.")

        if safe_text(action.get("kind")) == "codex":
            extra_input = safe_text(payload.get("extraInput")).strip()
            prompt = safe_text(action.get("promptTemplate")).strip()
            if extra_input:
                prompt = f"{prompt}\n\n추가 입력:\n{extra_input}"
            return self.build_codex_spec(
                title=safe_text(action.get("label")) or action_id,
                workspace=self.resolve_action_workspace(action, workspace),
                prompt=prompt,
                full_auto=bool(action.get("fullAuto", True)),
            )

        command_workspace = self.resolve_action_workspace(action, workspace)
        cwd = safe_text(command_workspace["path"])
        if action.get("script"):
            script_path = (self.app_root / safe_text(action["script"])).resolve()
            if not script_path.exists():
                raise ValueError(f"Script not found: {script_path}")
            command = ["bash", str(script_path)]
            preview = str(script_path)
        elif action.get("command"):
            command = [safe_text(item) for item in action.get("command", [])]
            preview = shlex.join(command)
        else:
            shell = safe_text(action.get("shell")).strip()
            if not shell:
                raise ValueError(f"Unsupported action: {action_id}")
            command = ["bash", "-lc", shell]
            preview = shell
        return {
            "title": safe_text(action.get("label")) or action_id,
            "kind": "shell",
            "cwd": cwd,
            "command": command,
            "command_preview": preview,
        }

    def resolve_action_workspace(self, action: dict[str, Any], default_workspace: dict[str, Any]) -> dict[str, Any]:
        override_id = safe_text(action.get("workspaceId"))
        if not override_id:
            return default_workspace
        workspace = self.workspaces.get(override_id)
        if workspace is None:
            raise ValueError(f"Unknown action workspace: {override_id}")
        return workspace

    def build_codex_spec(self, title: str, workspace: dict[str, Any], prompt: str, full_auto: bool) -> dict[str, Any]:
        cwd = safe_text(workspace["path"])
        sandbox = safe_text(workspace.get("defaultSandbox")) or "workspace-write"
        command = [
            self.codex_bin(),
            "exec",
            "--color",
            "never",
            "--skip-git-repo-check",
            "-C",
            cwd,
            "--sandbox",
            sandbox,
        ]
        if full_auto:
            command.append("--full-auto")
        command.append(prompt)
        return {
            "title": title,
            "kind": "codex",
            "cwd": cwd,
            "command": command,
            "command_preview": shlex.join(command),
        }

    def _execute_job(self, job_id: str, command: list[str], output_file: Path) -> None:
        with self.lock:
            job = self.jobs[job_id]
        try:
            effective_command = list(command)
            if job.kind == "codex":
                effective_command.extend(["-o", str(output_file)])
            process = subprocess.Popen(
                effective_command,
                cwd=job.cwd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                env=os.environ.copy(),
            )
            with self.lock:
                job.command_preview = shlex.join(effective_command)
                job.process = process
            chunks: list[str] = []
            assert process.stdout is not None
            for line in process.stdout:
                chunks.append(line)
                with self.lock:
                    job.output = "".join(chunks)[-120000:]
            exit_code = process.wait()
            final_message = ""
            if output_file.exists():
                final_message = output_file.read_text(encoding="utf-8").strip()
            with self.lock:
                job.exit_code = exit_code
                job.final_message = final_message
                job.status = "succeeded" if exit_code == 0 else "failed"
                job.ended_at = now_iso()
        except Exception as exc:
            with self.lock:
                job.status = "failed"
                job.error = str(exc)
                job.ended_at = now_iso()
                if not job.output:
                    job.output = str(exc)
        finally:
            self.persist_job(job_id)

    def persist_job(self, job_id: str) -> None:
        with self.lock:
            job = self.jobs[job_id]
            row = {
                "jobId": job.job_id,
                "title": job.title,
                "kind": job.kind,
                "workspaceId": job.workspace_id,
                "workspaceLabel": job.workspace_label,
                "status": job.status,
                "startedAt": job.started_at,
                "endedAt": job.ended_at,
                "exitCode": job.exit_code,
                "commandPreview": job.command_preview,
            }
        with self.history_file.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(row, ensure_ascii=False) + "\n")


class LauncherHandler(BaseHTTPRequestHandler):
    server_version = "CarbonetCodexLauncher/0.1"

    @property
    def app(self) -> LauncherApp:
        return self.server.app  # type: ignore[attr-defined]

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/":
            self.serve_static("index.html", "text/html; charset=utf-8")
            return
        if parsed.path.startswith("/static/"):
            self.serve_static(parsed.path.removeprefix("/static/"))
            return
        if parsed.path == "/api/bootstrap":
            self.write_json(HTTPStatus.OK, self.app.bootstrap())
            return
        if parsed.path == "/api/jobs":
            self.write_json(HTTPStatus.OK, {"items": self.app.list_jobs()})
            return
        if parsed.path.startswith("/api/jobs/"):
            job_id = parsed.path.split("/")[-1]
            try:
                self.write_json(HTTPStatus.OK, self.app.get_job(job_id))
            except KeyError:
                self.write_json(HTTPStatus.NOT_FOUND, {"message": "Job not found"})
            return
        self.write_json(HTTPStatus.NOT_FOUND, {"message": "Not found"})

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        payload = self.read_body_json()
        if parsed.path == "/api/run":
            try:
                self.write_json(HTTPStatus.OK, self.app.run_job(payload))
            except ValueError as exc:
                self.write_json(HTTPStatus.BAD_REQUEST, {"message": str(exc)})
            return
        if parsed.path == "/api/login-status":
            self.write_json(HTTPStatus.OK, self.app.login_status())
            return
        if parsed.path.endswith("/cancel") and parsed.path.startswith("/api/jobs/"):
            job_id = parsed.path.split("/")[-2]
            try:
                self.write_json(HTTPStatus.OK, self.app.cancel_job(job_id))
            except KeyError:
                self.write_json(HTTPStatus.NOT_FOUND, {"message": "Job not found"})
            return
        self.write_json(HTTPStatus.NOT_FOUND, {"message": "Not found"})

    def read_body_json(self) -> dict[str, Any]:
        length = int(self.headers.get("Content-Length", "0"))
        if length <= 0:
            return {}
        raw = self.rfile.read(length).decode("utf-8")
        if not raw.strip():
            return {}
        return json.loads(raw)

    def serve_static(self, relative_path: str, content_type: str | None = None) -> None:
        target = (self.app.static_root / relative_path).resolve()
        if not str(target).startswith(str(self.app.static_root.resolve())) or not target.exists():
            self.write_json(HTTPStatus.NOT_FOUND, {"message": "Asset not found"})
            return
        if content_type is None:
            if target.suffix == ".css":
                content_type = "text/css; charset=utf-8"
            elif target.suffix == ".js":
                content_type = "application/javascript; charset=utf-8"
            else:
                content_type = "text/plain; charset=utf-8"
        body = target.read_bytes()
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def write_json(self, status: HTTPStatus, payload: dict[str, Any]) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--app-root", required=True)
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=43110)
    args = parser.parse_args()

    app = LauncherApp(Path(args.app_root).resolve())
    server = ThreadingHTTPServer((args.host, args.port), LauncherHandler)
    server.app = app  # type: ignore[attr-defined]
    print(f"Carbonet Codex Launcher listening on http://{args.host}:{args.port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
