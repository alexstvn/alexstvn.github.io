// ============================================================
// Data loading
// ============================================================
async function loadData(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function imgWithFallback(src, alt, fallbackText) {
  return `<img src="${src}" alt="${alt}" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'placeholder',textContent:'${fallbackText}'}))">`;
}

// ============================================================
// Hero typing intro — "Hello, I'm" in French / Thai / code
// ============================================================
function initHeroTyping() {
  const phrases = ["Hello, I'm", "Bonjour, je m'appelle", "สวัสดี ฉันคือ", "console.log(\"Hi, I'm\")"];
  const el = document.getElementById("hero-greeting-text");
  if (!el) return;
  let phraseIndex = 0, charIndex = 0, deleting = false;

  function tick() {
    const current = phrases[phraseIndex];
    if (!deleting) {
      charIndex++;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(tick, 1400);
        return;
      }
    } else {
      charIndex--;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
    }
    setTimeout(tick, deleting ? 45 : 85);
  }
  tick();
}

// ============================================================
// Interests player ("beyond my screen")
// ============================================================
let interestsData = [];
let playerIndex = 0;

function renderPlayer() {
  const interest = interestsData[playerIndex];
  if (!interest) return;

  document.getElementById("player-photo").innerHTML = interest.image
    ? imgWithFallback(interest.image, interest.name, interest.icon)
    : `<div class="placeholder">${interest.icon}</div>`;

  const nameEl = document.getElementById("player-name");
  nameEl.style.fontSize = "";       // reset before measuring
  nameEl.textContent = interest.name;
  fitPlayerName(nameEl);

  document.getElementById("player-counter").textContent = `${playerIndex + 1} of ${interestsData.length}`;
}

// Shrinks the title font-size step-by-step until it fits the reserved
// 2-line box, so the player's height never jumps between cards.
function fitPlayerName(el) {
  const maxHeight = el.clientHeight; // fixed by CSS min-height (2 lines)
  let size = parseFloat(getComputedStyle(el).fontSize);
  const minSize = 11; // px floor so text never becomes unreadable

  while (el.scrollHeight > maxHeight && size > minSize) {
    size -= 1;
    el.style.fontSize = `${size}px`;
  }
}

function stepPlayer(delta) {
  playerIndex = (playerIndex + delta + interestsData.length) % interestsData.length;
  renderPlayer();
}

function openInterestDetail(interest) {
  const modal = document.getElementById("modal-overlay");
  const body = document.getElementById("modal-body");
  const related = interest.relatedProjects
    .map(id => {
      const p = projectsData.find(pr => pr.id === id);
      return p ? `<a href="${p.githubLink}" target="_blank" rel="noopener">${p.title}</a>` : "";
    })
    .filter(Boolean).join(", ");

  body.innerHTML = `
    <h3>${interest.icon} ${interest.name}</h3>
    <p>${interest.description}</p>
    ${related ? `<div class="modal-links"><strong>Related projects:</strong> ${related}</div>` : ""}
  `;
  modal.classList.add("open");
}

// ============================================================
// Experience + Education + Skills
// ============================================================
function renderExperience(experience) {
  const el = document.getElementById("experience-list");
  if (!el) return;
  el.innerHTML = experience.map(exp => `
    <div class="timeline-item">
      <h3>${exp.roleTitle}</h3>
      <div class="meta">${exp.company} · ${exp.startDate} – ${exp.endDate}</div>
      <button class="exp-toggle" aria-expanded="false">
        <span class="exp-caret" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z" /></svg>
        </span>
        <span class="exp-brief">${exp.briefDescription}</span>
      </button>
      <div class="exp-details">
        <ul>${exp.responsibilities.map(r => `<li>${r}</li>`).join("")}</ul>
      </div>
    </div>
  `).join("");

  const toggles = el.querySelectorAll(".exp-toggle");
  toggles.forEach(btn => {
    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      // Close every item first so only one stays open at a time.
      toggles.forEach(other => {
        other.setAttribute("aria-expanded", "false");
        other.closest(".timeline-item").classList.remove("open");
      });
      if (!isOpen) {
        btn.setAttribute("aria-expanded", "true");
        btn.closest(".timeline-item").classList.add("open");
      }
    });
  });
}

function renderEducation(education) {
  const el = document.getElementById("education-list");
  if (!el) return;
  el.innerHTML = education.map(ed => `
    <div class="edu-card">
      <div class="logo-badge">${imgWithFallback(ed.logo, ed.universityName, "🎓")}</div>
      <div>
        <h3>${ed.universityName}</h3>
        <div class="meta">${ed.degree}</div>
        <div class="meta">${ed.startYear} – ${ed.endYear} · ${ed.gpa}</div>
      </div>
    </div>
  `).join("");
}

function renderSkills(skills) {
  const el = document.getElementById("skills-block-content");
  if (!el) return;
  el.innerHTML = `
    <div class="skill-group">
      <div class="label">Languages</div>
      <div class="skill-tags">${skills.languages.map(s => `<span class="skill-tag">${s}</span>`).join("")}</div>
    </div>
    <div class="skill-group">
      <div class="label">Data Science</div>
      <div class="skill-tags">${skills.dataScience.map(s => `<span class="skill-tag">${s}</span>`).join("")}</div>
    </div>
    <div class="skill-group">
      <div class="label">Front-End</div>
      <div class="skill-tags">${skills.webTech.map(s => `<span class="skill-tag">${s}</span>`).join("")}</div>
    </div>
    <div class="skill-group">
      <div class="label">Other Tools</div>
      <div class="skill-tags">${skills.otherTools.map(s => `<span class="skill-tag">${s}</span>`).join("")}</div>
    </div>
  `;
}

// ============================================================
// Projects at a glance
// ============================================================
let projectsData = [];
let activeFilter = "all";

function renderFilters() {
  const fields = ["all", ...new Set(projectsData.map(p => p.field))];
  const years = [...new Set(projectsData.map(p => p.year))].sort((a, b) => b - a);
  const el = document.getElementById("project-filters");
  if (!el) return;
  el.innerHTML = fields.map(f =>
    `<button class="filter-chip ${f === "all" ? "active" : ""}" data-filter="field:${f}">${f === "all" ? "All" : f}</button>`
  ).join("") + years.map(y =>
    `<button class="filter-chip" data-filter="year:${y}">${y}</button>`
  ).join("");

  el.querySelectorAll(".filter-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      el.querySelectorAll(".filter-chip").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.filter;
      renderProjects();
    });
  });
}

function renderProjects() {
  const el = document.getElementById("project-carousel");
  if (!el) return;
  let list = projectsData;
  if (activeFilter !== "field:all" && activeFilter !== "all") {
    const [type, value] = activeFilter.split(":");
    list = projectsData.filter(p => String(p[type]) === value);
  }
  el.innerHTML = list.map(projectCardHTML).join("");
  el.querySelectorAll("[data-project-id]").forEach(btn => {
    btn.addEventListener("click", () => openProjectDetail(btn.dataset.projectId));
  });
}

function projectCardHTML(p) {
  return `
    <div class="project-card">
      <div class="thumb">${imgWithFallback(p.previewImage, p.title, "IMAGE")}</div>
      <div class="body">
        <h3>${p.title}</h3>
        <div class="field">${p.field} · ${p.month} ${p.year}</div>
        <p>${p.shortDescription}</p>
        <button data-project-id="${p.id}">Learn more</button>
      </div>
    </div>
  `;
}

function openProjectDetail(id) {
  const p = projectsData.find(pr => pr.id === id);
  if (!p) return;
  const modal = document.getElementById("modal-overlay");
  const body = document.getElementById("modal-body");
  body.innerHTML = `
    <h3>${p.title}</h3>
    <div class="field">${p.field} · ${p.month} ${p.year}</div>
    <p>${p.longDescription}</p>
    <p style="font-style:italic; color:var(--ink-soft);">${p.motivation}</p>
    <div class="modal-tags">${p.techStack.map(t => `<span class="skill-tag">${t}</span>`).join("")}</div>
    <div class="modal-links"><a href="${p.githubLink}" target="_blank" rel="noopener">View on GitHub →</a></div>
  `;
  modal.classList.add("open");
}

// ============================================================
// Nav
// ============================================================
function initNav() {
  const nav = document.querySelector(".site-nav");
  const toggle = document.querySelector(".nav-toggle");
  const list = document.querySelector(".site-nav ul");
  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 40);
  });
  if (toggle) {
    toggle.addEventListener("click", () => list.classList.toggle("open"));
    list.querySelectorAll("a").forEach(a => a.addEventListener("click", () => list.classList.remove("open")));
  }
}

// ============================================================
// Modal close
// ============================================================
function initModal() {
  const modal = document.getElementById("modal-overlay");
  document.getElementById("modal-close").addEventListener("click", () => modal.classList.remove("open"));
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("open"); });

  // Resume preview modal
  const resumeOverlay = document.getElementById("resume-overlay");
  const resumeBtn = document.getElementById("resume-btn");
  if (resumeOverlay && resumeBtn) {
    resumeBtn.addEventListener("click", () => resumeOverlay.classList.add("open"));
    document.getElementById("resume-close").addEventListener("click", () => resumeOverlay.classList.remove("open"));
    resumeOverlay.addEventListener("click", (e) => { if (e.target === resumeOverlay) resumeOverlay.classList.remove("open"); });
  }
}

// ============================================================
// Init
// ============================================================
async function init() {
  initHeroTyping();
  initNav();
  initModal();

  const [projects, experience, education, interests, skills] = await Promise.all([
    loadData("data/projects.json"),
    loadData("data/experience.json"),
    loadData("data/education.json"),
    loadData("data/interests.json"),
    loadData("data/skills.json"),
  ]);

  projectsData = projects;
  interestsData = interests;

  renderPlayer();
  document.getElementById("player-prev").addEventListener("click", () => stepPlayer(-1));
  document.getElementById("player-next").addEventListener("click", () => stepPlayer(1));
  document.getElementById("player-play").addEventListener("click", () => openInterestDetail(interestsData[playerIndex]));

  renderExperience(experience);
  renderEducation(education);
  renderSkills(skills);

  renderFilters();
  renderProjects();
  initAutoscroll();
}

document.addEventListener("DOMContentLoaded", init);