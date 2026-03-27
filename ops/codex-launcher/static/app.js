const state = {
  bootstrap: null,
  selectedWorkspaceId: "",
  selectedActionId: "",
  selectedJobId: "",
  pollHandle: null
};

async function api(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }
  return response.json();
}

function byId(id) {
  return document.getElementById(id);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderWorkspaces() {
  const target = byId("workspace-list");
  const workspaces = state.bootstrap?.workspaces || [];
  target.innerHTML = workspaces.map((workspace) => `
    <button class="workspace-card ${workspace.id === state.selectedWorkspaceId ? "active" : ""}" data-workspace-id="${workspace.id}" type="button">
      <strong>${escapeHtml(workspace.label)}</strong>
      <div class="muted">${escapeHtml(workspace.description || "")}</div>
      <div class="pill">${escapeHtml(workspace.path)}</div>
    </button>
  `).join("");
  target.querySelectorAll("[data-workspace-id]").forEach((element) => {
    element.addEventListener("click", () => {
      state.selectedWorkspaceId = element.getAttribute("data-workspace-id") || "";
      renderWorkspaces();
      renderActions();
      syncWorkspaceCaption();
    });
  });
}

function renderActions() {
  const target = byId("action-grid");
  const actions = state.bootstrap?.actions || [];
  target.innerHTML = actions.map((action) => `
    <button class="action-card ${action.id === state.selectedActionId ? "active" : ""}" data-action-id="${action.id}" type="button">
      <div class="pill">${escapeHtml(action.group || action.kind)}</div>
      <strong>${escapeHtml(action.label)}</strong>
      <div class="muted">${escapeHtml(action.description || "")}</div>
    </button>
  `).join("");
  target.querySelectorAll("[data-action-id]").forEach((element) => {
    element.addEventListener("click", () => {
      const actionId = element.getAttribute("data-action-id") || "";
      const action = actions.find((item) => item.id === actionId);
      state.selectedActionId = actionId;
      byId("selected-action-caption").textContent = action?.description || "버튼을 선택하세요";
      if (action?.kind === "codex") {
        byId("custom-codex-prompt").value = action.promptTemplate || "";
      }
      renderActions();
    });
  });
}

function renderJobs(jobs) {
  const target = byId("job-list");
  if (!jobs.length) {
    target.innerHTML = `<div class="muted">아직 실행 이력이 없습니다.</div>`;
    return;
  }
  target.innerHTML = jobs.map((job) => `
    <button class="job-card ${job.jobId === state.selectedJobId ? "active" : ""}" data-job-id="${job.jobId}" type="button">
      <strong>${escapeHtml(job.title)}</strong>
      <div class="muted">${escapeHtml(job.workspaceLabel || "")}</div>
      <div class="pill ${job.status === "succeeded" ? "success" : job.status === "failed" ? "danger" : ""}">
        ${escapeHtml(job.status)}
      </div>
    </button>
  `).join("");
  target.querySelectorAll("[data-job-id]").forEach((element) => {
    element.addEventListener("click", async () => {
      const jobId = element.getAttribute("data-job-id") || "";
      await loadJob(jobId);
    });
  });
}

function syncWorkspaceCaption() {
  const workspace = (state.bootstrap?.workspaces || []).find((item) => item.id === state.selectedWorkspaceId);
  byId("workspace-caption").textContent = workspace ? `${workspace.label} · ${workspace.path}` : "";
}

function setJobDetail(job) {
  if (!job) {
    return;
  }
  state.selectedJobId = job.jobId;
  byId("job-meta").textContent = `${job.status} · ${job.workspaceLabel || ""} · ${job.startedAt || ""}`;
  byId("command-preview").textContent = job.commandPreview || "명령 정보가 없습니다.";
  byId("raw-output").textContent = job.output || "출력이 없습니다.";
  byId("final-output").textContent = job.finalMessage || "Codex 최종 응답이 없습니다.";
}

async function refreshJobs() {
  const payload = await api("/api/jobs");
  renderJobs(payload.items || []);
}

async function loadJob(jobId) {
  if (!jobId) {
    return;
  }
  const job = await api(`/api/jobs/${jobId}`);
  setJobDetail(job);
  renderJobs((await api("/api/jobs")).items || []);
  if (job.status === "running") {
    startPolling(jobId);
  }
}

function startPolling(jobId) {
  stopPolling();
  state.pollHandle = window.setInterval(async () => {
    try {
      const job = await api(`/api/jobs/${jobId}`);
      setJobDetail(job);
      await refreshJobs();
      if (job.status !== "running") {
        stopPolling();
      }
    } catch (error) {
      console.error(error);
      stopPolling();
    }
  }, 1500);
}

function stopPolling() {
  if (state.pollHandle) {
    window.clearInterval(state.pollHandle);
    state.pollHandle = null;
  }
}

async function runAction() {
  if (!state.selectedActionId) {
    alert("먼저 Quick Action을 선택하세요.");
    return;
  }
  const extraInput = byId("extra-input").value;
  const payload = await api("/api/run", {
    method: "POST",
    body: JSON.stringify({
      workspaceId: state.selectedWorkspaceId,
      actionId: state.selectedActionId,
      extraInput
    })
  });
  setJobDetail(payload);
  await refreshJobs();
  startPolling(payload.jobId);
}

async function runCustomCodex() {
  const prompt = byId("custom-codex-prompt").value.trim();
  if (!prompt) {
    alert("Codex Prompt를 입력하세요.");
    return;
  }
  const payload = await api("/api/run", {
    method: "POST",
    body: JSON.stringify({
      workspaceId: state.selectedWorkspaceId,
      mode: "codex_custom",
      prompt
    })
  });
  setJobDetail(payload);
  await refreshJobs();
  startPolling(payload.jobId);
}

async function runCustomShell() {
  const command = byId("custom-shell-command").value.trim();
  if (!command) {
    alert("Shell Command를 입력하세요.");
    return;
  }
  const payload = await api("/api/run", {
    method: "POST",
    body: JSON.stringify({
      workspaceId: state.selectedWorkspaceId,
      mode: "shell_custom",
      shellCommand: command
    })
  });
  setJobDetail(payload);
  await refreshJobs();
  startPolling(payload.jobId);
}

async function cancelCurrentJob() {
  if (!state.selectedJobId) {
    return;
  }
  await api(`/api/jobs/${state.selectedJobId}/cancel`, { method: "POST", body: "{}" });
  await loadJob(state.selectedJobId);
}

async function refreshLogin() {
  const payload = await api("/api/login-status", { method: "POST", body: "{}" });
  byId("login-status").textContent = payload.loggedIn ? "ready" : "not ready";
}

async function bootstrap() {
  state.bootstrap = await api("/api/bootstrap");
  state.selectedWorkspaceId = state.bootstrap.defaultWorkspaceId || state.bootstrap.workspaces?.[0]?.id || "";
  byId("codex-version").textContent = state.bootstrap.codexVersion || "unknown";
  byId("login-status").textContent = state.bootstrap.loginReady ? "ready" : "not ready";
  renderWorkspaces();
  renderActions();
  syncWorkspaceCaption();
  await refreshJobs();
}

window.addEventListener("DOMContentLoaded", async () => {
  byId("run-selected-action").addEventListener("click", runAction);
  byId("run-custom-codex").addEventListener("click", runCustomCodex);
  byId("run-custom-shell").addEventListener("click", runCustomShell);
  byId("cancel-job").addEventListener("click", cancelCurrentJob);
  byId("refresh-jobs").addEventListener("click", refreshJobs);
  byId("refresh-login").addEventListener("click", refreshLogin);
  try {
    await bootstrap();
  } catch (error) {
    byId("raw-output").textContent = error instanceof Error ? error.message : String(error);
  }
});
