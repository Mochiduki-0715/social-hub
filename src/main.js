const services = [
  {
    id: "youtube",
    name: "YouTube",
    icon: "YT",
    url: "https://www.youtube.com/",
    accent: "#ff4242",
  },
  {
    id: "x",
    name: "X",
    icon: "X",
    url: "https://x.com/",
    accent: "#f7f7fb",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "IG",
    url: "https://www.instagram.com/",
    accent: "#ff4fb8",
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: "TT",
    url: "https://www.tiktok.com/",
    accent: "#52f4ff",
  },
  {
    id: "twitch",
    name: "Twitch",
    icon: "TW",
    url: "https://www.twitch.tv/",
    accent: "#a970ff",
  },
];

const SIDEBAR_WIDTH = 280;
const TOPBAR_HEIGHT = 176;
const STORAGE_KEY = "social-hub:v1";

const serviceById = new Map(services.map((service) => [service.id, service]));
const defaultState = {
  layoutMode: "single",
  activePane: "left",
  leftServiceId: "youtube",
  rightServiceId: "twitch",
};

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    return { ...defaultState, ...parsed };
  } catch {
    return { ...defaultState };
  }
}

let state = loadState();
let layoutMode = state.layoutMode === "split" ? "split" : "single";
let activePane = state.activePane === "right" ? "right" : "left";
let paneServices = {
  left: serviceById.get(state.leftServiceId) ?? services[0],
  right: serviceById.get(state.rightServiceId) ?? serviceById.get("twitch") ?? services[1],
};

function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      layoutMode,
      activePane,
      leftServiceId: paneServices.left.id,
      rightServiceId: paneServices.right.id,
    }),
  );
}

const invoke = async (command, args = {}) => {
  const tauriInvoke = window.__TAURI__?.core?.invoke;
  if (!tauriInvoke) {
    console.info("Tauri API is not available. UI preview mode.", command, args);
    return null;
  }
  return tauriInvoke(command, args);
};

function contentBounds() {
  return {
    x: SIDEBAR_WIDTH,
    y: TOPBAR_HEIGHT,
    width: Math.max(320, window.innerWidth - SIDEBAR_WIDTH),
    height: Math.max(240, window.innerHeight - TOPBAR_HEIGHT),
  };
}

async function syncBounds() {
  await applyLayout();
}

async function selectService(service) {
  await assignServiceToPane(activePane, service);
}

async function assignServiceToPane(pane, service) {
  activePane = pane;

  paneServices = {
    ...paneServices,
    [pane]: service,
  };

  if (paneServices.left.id === paneServices.right.id) {
    const fallback =
      services.find((candidate) => candidate.id !== service.id) ?? services[0];
    paneServices = {
      ...paneServices,
      [pane === "left" ? "right" : "left"]: fallback,
    };
  }

  await applyLayout();
}

async function applyLayout() {
  saveState();
  const left = paneServices.left;
  const right = paneServices.right;
  const title =
    layoutMode === "split" ? `${left.name} + ${right.name}` : left.name;
  const status =
    layoutMode === "split"
      ? `左右2分割: 左 ${left.name} / 右 ${right.name}`
      : `${left.name} を表示中`;

  document.getElementById("service-title").textContent = title;
  document.getElementById("status").textContent = status;

  document.querySelectorAll(".service-button").forEach((button) => {
    const serviceId = button.dataset.service;
    button.classList.toggle(
      "active",
      serviceId === paneServices[activePane].id,
    );
    button.classList.toggle("left-selected", serviceId === left.id);
    button.classList.toggle(
      "right-selected",
      layoutMode === "split" && serviceId === right.id,
    );
  });

  document
    .getElementById("single-mode-button")
    .classList.toggle("active", layoutMode === "single");
  document
    .getElementById("split-mode-button")
    .classList.toggle("active", layoutMode === "split");
  document
    .getElementById("left-pane-button")
    .classList.toggle("active", activePane === "left");
  document
    .getElementById("right-pane-button")
    .classList.toggle("active", activePane === "right");
  document
    .getElementById("left-drop-zone")
    .classList.toggle("active", activePane === "left");
  document
    .getElementById("right-drop-zone")
    .classList.toggle("active", activePane === "right");
  document.getElementById("left-drop-label").textContent = left.name;
  document.getElementById("right-drop-label").textContent = right.name;

  await invoke("show_layout", {
    layout: layoutMode,
    leftService: left.id,
    rightService: right.id,
    ...contentBounds(),
  });
}

async function reloadActive() {
  await invoke("reload_service", { service: paneServices[activePane].id });
}

async function openExternal() {
  await invoke("open_external", { service: paneServices[activePane].id });
}

function setLayoutMode(nextMode) {
  layoutMode = nextMode;
  if (nextMode === "single") {
    activePane = "left";
  }
  applyLayout();
}

function setActivePane(nextPane) {
  activePane = nextPane;
  if (nextPane === "right") {
    layoutMode = "split";
  }
  applyLayout();
}

function serviceFromId(serviceId) {
  return serviceById.get(serviceId);
}

function setupDropZones() {
  document.querySelectorAll(".drop-zone").forEach((zone) => {
    zone.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      zone.classList.add("drag-over");
    });
    zone.addEventListener("dragleave", () => {
      zone.classList.remove("drag-over");
    });
    zone.addEventListener("drop", (event) => {
      event.preventDefault();
      zone.classList.remove("drag-over");
      const service = serviceFromId(event.dataTransfer.getData("text/plain"));
      if (!service) return;
      const pane = zone.dataset.pane;
      if (pane === "right") {
        layoutMode = "split";
      }
      assignServiceToPane(pane, service);
    });
  });
}

function setupKeyboardShortcuts() {
  window.addEventListener("keydown", (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target;
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target?.isContentEditable
    ) {
      return;
    }

    const number = Number(event.key);
    if (number >= 1 && number <= services.length) {
      const service = services[number - 1];
      if (event.shiftKey) {
        layoutMode = "split";
        assignServiceToPane("right", service);
      } else {
        assignServiceToPane("left", service);
      }
      return;
    }

    if (event.key.toLowerCase() === "s") {
      setLayoutMode(layoutMode === "split" ? "single" : "split");
    } else if (event.key.toLowerCase() === "r") {
      reloadActive();
    } else if (event.key.toLowerCase() === "o") {
      openExternal();
    }
  });
}

function renderServices() {
  const nav = document.getElementById("services");
  nav.innerHTML = "";

  for (const service of services) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "service-button";
    button.draggable = true;
    button.dataset.service = service.id;
    button.style.setProperty("--accent", service.accent);
    button.innerHTML = `
      <span class="service-icon">${service.icon}</span>
      <span>
        <span class="service-name">${service.name}</span>
        <span class="service-url">${new URL(service.url).hostname}</span>
      </span>
    `;
    button.addEventListener("click", () => selectService(service));
    button.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", service.id);
      event.dataTransfer.effectAllowed = "move";
      button.classList.add("dragging");
    });
    button.addEventListener("dragend", () => {
      button.classList.remove("dragging");
      document
        .querySelectorAll(".drop-zone")
        .forEach((zone) => zone.classList.remove("drag-over"));
    });
    nav.appendChild(button);
  }
}

renderServices();
setupDropZones();
setupKeyboardShortcuts();
document
  .getElementById("single-mode-button")
  .addEventListener("click", () => setLayoutMode("single"));
document
  .getElementById("split-mode-button")
  .addEventListener("click", () => setLayoutMode("split"));
document
  .getElementById("left-pane-button")
  .addEventListener("click", () => setActivePane("left"));
document
  .getElementById("right-pane-button")
  .addEventListener("click", () => setActivePane("right"));
document.getElementById("reload-button").addEventListener("click", reloadActive);
document.getElementById("open-button").addEventListener("click", openExternal);
window.addEventListener("resize", syncBounds);

applyLayout();
