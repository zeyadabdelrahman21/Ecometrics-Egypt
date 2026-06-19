/* ============================================
   EcoMetrics Egypt — Shared JavaScript (Fixed)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initActiveNav();
  initMobileNav();
  initThemeToggle();
  initChatWidget();
  injectAnimatedBg();
  initSpotlightGlow();
  initBackgroundParallax();
  injectScrollProgress();
  injectBackToTop();
  lucide.createIcons();

  // Fallback: force reveal all elements after 2s in case observer fails
  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
      el.classList.add('visible');
    });
  }, 2500);
});

/* --- Animated Background Orbs --- */
function injectAnimatedBg() {
  const bg = document.createElement('div');
  bg.className = 'animated-bg';
  bg.setAttribute('aria-hidden', 'true');
  bg.innerHTML = `
    <div class="animated-bg__orb-wrapper animated-bg__orb-wrapper--1">
      <div class="animated-bg__orb animated-bg__orb--1"></div>
    </div>
    <div class="animated-bg__orb-wrapper animated-bg__orb-wrapper--2">
      <div class="animated-bg__orb animated-bg__orb--2"></div>
    </div>
    <div class="animated-bg__orb-wrapper animated-bg__orb-wrapper--3">
      <div class="animated-bg__orb animated-bg__orb--3"></div>
    </div>
    <div class="animated-bg__grid"></div>
  `;
  document.body.prepend(bg);
}

/* --- Scroll Reveal --- */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px 50px 0px' });

  reveals.forEach(el => observer.observe(el));

  // Also listen to scroll for fallback
  let scrollTimer;
  function checkReveal() {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      reveals.forEach(el => {
        if (el.classList.contains('visible')) return;
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 1.1 && rect.bottom > 0) {
          el.classList.add('visible');
        }
      });
    }, 50);
  }
  window.addEventListener('scroll', checkReveal, { passive: true });
  // Run once immediately
  checkReveal();
}

/* --- Active Nav --- */
function initActiveNav() {
  const page = document.body.getAttribute('data-page');
  if (!page) return;

  const pageMap = {
    'home': 'index.html',
    'story': 'story.html',
    'data': 'data.html',
    'analysis': 'analysis.html',
    'pipeline': 'pipeline.html',
    'recommendations': 'recommendations.html',
    'team': 'team.html',
    'resources': 'resources.html',
    'contact': 'contact.html'
  };

  const target = pageMap[page];
  if (!target) return;

  document.querySelectorAll('.navbar__link').forEach(link => {
    if (link.getAttribute('href') === target) link.classList.add('active');
  });

  document.querySelectorAll('.mobile-nav a').forEach(link => {
    if (link.getAttribute('href') === target) link.classList.add('active');
  });
}

/* --- Mobile Nav --- */
function initMobileNav() {
  const hamburger = document.querySelector('.navbar__hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    hamburger.innerHTML = isOpen
      ? '<i data-lucide="x" style="width:24px;height:24px;"></i>'
      : '<i data-lucide="menu" style="width:24px;height:24px;"></i>';
    lucide.createIcons();
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      hamburger.innerHTML = '<i data-lucide="menu" style="width:24px;height:24px;"></i>';
      lucide.createIcons();
      document.body.style.overflow = '';
    });
  });
}

/* --- Theme Toggle --- */
function initThemeToggle() {
  // Check LocalStorage or default to system preference immediately
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
  } else if (!savedTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    document.body.classList.add('light-theme');
    localStorage.setItem('theme', 'light');
  }

  const toggleBtn = document.querySelector('.theme-toggle');
  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });
}

/* --- Counter Animation --- */
function animateCounter(el, target, suffix = '', duration = 2000) {
  const start = 0;
  const startTime = performance.now();

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutExpo(progress);
    const current = Math.round(start + (target - start) * easedProgress);
    el.textContent = current + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.getAttribute('data-counter'));
        const suffix = entry.target.getAttribute('data-suffix') || '';
        animateCounter(entry.target, target, suffix);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  counters.forEach(el => observer.observe(el));
}

/* ============================================
   Gemini AI Chat Widget — with Offline Fallback
   ============================================ */

const GEMINI_ENDPOINT = '/api/chat';

const SYSTEM_CONTEXT = `You are EcoBot, a warm, friendly, and knowledgeable AI assistant for the EcoMetrics Egypt project.
You talk like a real helpful human friend — casual, warm, enthusiastic, and clear. Use emojis occasionally to stay engaging 😊🌿♻️.

ABOUT THE PROJECT:
- EcoMetrics Egypt is a Business Intelligence capstone project built under the Digital Egypt Pioneers Initiative (DEPI).
- Supervised by Eng. Mahmoud Seraj, through Computik Learning Solutions.
- The team: Mohamed Ali (Giza), Sondos Yasser (Cairo), Zeyad Mohamed (Giza), Menna Tallah Khaled (Cairo), and Khaled Amr (Cairo). All from the DEPI Data Analytics track.

KEY PROJECT DATA:
- Egypt generates 100M+ tons of waste annually — one of the highest in MENA.
- Recycling rate jumped from 10% (2018) to 37% (2024). Egypt Vision 2030 targets 60% by 2027.
- Collection efficiency averages 73%, constrained by vehicle fleet availability.
- Top 3 downtime causes = 67% of all downtime: Mechanical failure (34%), Feedstock contamination (21%), Maintenance overruns (12%).
- Sorting accuracy has a 2.3x multiplier: every 1% accuracy gain = 2.3% more recovered material.
- Built a star schema data model in Power BI with 1 fact table and 5 dimension tables.
- Three dashboard pages: National Waste Performance, Investment Opportunities, Research & Analytics.
- Five strategic recommendations: (1) Prioritize sorting infrastructure, (2) Predictive maintenance, (3) Optimize collection routing, (4) Share best practices from top plants, (5) Data governance framework.

RULES:
1. Answer questions about this project logically and helpfully. Be conversational but informative.
2. Keep responses concise (2-4 sentences max) so they fit in a chat bubble.
3. If someone asks about the team, list all 5 members with their cities.
4. STRICTLY REFUSE any question NOT related to: this project, waste management, recycling, Egypt's environment, or data analytics.
   For off-topic questions, say something like: "That's a great question, but I'm only here to help with the EcoMetrics Egypt project! 🌿 Ask me about our findings, team, or recommendations!"
5. Never make up data. Only use the facts provided above.
`;

const FALLBACK_RESPONSES = [
  { triggers: ['team', 'members', 'who built', 'who made', 'who work', 'who are'], response: 'Our amazing team has five data analytics researchers from the DEPI track! 🎉 Mohamed Ali (Giza), Sondos Yasser (Cairo), Zeyad Mohamed (Giza), Menna Tallah Khaled (Cairo), and Khaled Amr (Cairo). We were supervised by the awesome Eng. Mahmoud Seraj!' },
  { triggers: ['ecometrics', 'what is this', 'about the project', 'what is the project', 'tell me about'], response: 'EcoMetrics Egypt is a Business Intelligence project we built for our DEPI capstone! 🌿 We analyzed waste and recycling operations across Egypt using Power BI, Power Query, and star schema models to help hit Egypt\'s Vision 2030 recycling targets!' },
  { triggers: ['finding', 'insights', 'discover', 'results', 'analysis'], response: 'Great question! 📊 Here are our key findings: Collection efficiency averages 73% (limited by vehicle availability). Sorting accuracy has a 2.3x multiplier effect. Three issues cause 67% of downtime — mechanical failure (34%), contamination (21%), and maintenance overruns (12%). Top facilities outperform average by 40%!' },
  { triggers: ['pipeline', 'how did you build', 'methodology', 'process', 'etl'], response: 'Our BI pipeline has 4 stages! 🔧 (1) Data ingestion from multiple sources, (2) Power Query + M language for cleaning, (3) Star schema modeling (1 fact table, 5 dimensions), and (4) Three interactive Power BI dashboard pages with drill-through capability!' },
  { triggers: ['vision 2030', '2030', 'target', 'goal'], response: 'Egypt\'s Vision 2030 targets a 60% recycling rate by 2027! 🎯 We\'ve jumped from 10% (2018) to 37% (2024), but there\'s still a 23-point gap. Our project proposes 5 strategic actions that could close this gap — mainly through better sorting and predictive maintenance!' },
  { triggers: ['recommend', 'suggestion', 'action', 'what should', 'improve'], response: 'We have 5 big recommendations! 💡 (1) Prioritize sorting infrastructure — highest ROI. (2) Predictive maintenance to cut mechanical downtime. (3) Optimize truck routing to push efficiency past 85%. (4) Share best practices from top plants (zero-capital fix!). (5) Strong data governance framework.' },
  { triggers: ['recycling rate', 'recycling', 'recycle', 'rate'], response: 'Egypt\'s recycling rate is currently ~37% as of 2024 — a massive jump from just 10% in 2018! 📈 The Vision 2030 target is 60% by 2027. Our project proposes interventions that could add 15-20 more percentage points!' },
  { triggers: ['downtime', 'failure', 'breakdown', 'maintenance'], response: 'Downtime is a major bottleneck! ⚠️ Our Pareto analysis showed 3 root causes make up 67% of it: Mechanical Failure (34%), Feedstock Contamination (21%), and Maintenance Overruns (12%). That\'s why predictive maintenance is recommendation #2!' },
  { triggers: ['supervisor', 'mahmoud', 'seraj', 'professor', 'instructor'], response: 'Our project was supervised by the brilliant Eng. Mahmoud Seraj! 👨‍🏫 He guided us through the entire DEPI Data Analytics capstone through Computik Learning Solutions.' },
  { triggers: ['power bi', 'dashboard', 'report', 'pages'], response: 'We built 3 Power BI dashboard pages! 📊 Page 1: National Waste Performance (waste volumes, recycling rates by governorate). Page 2: Investment Opportunities (coverage gaps, ROI analysis). Page 3: Research & Analytics (correlations, statistical modeling).' },
  { triggers: ['waste', 'tons', 'generation', 'how much'], response: 'Egypt generates over 100 million tons of waste annually — one of the highest rates in the MENA region! 🗑️ Cairo alone produces ~280k tons per month. That\'s why our data-driven approach is so critical for managing this challenge.' },
  { triggers: ['hello', 'hi', 'hey', 'good morning', 'good evening', 'greet'], response: 'Hey there! 👋😊 Welcome to EcoMetrics Egypt! I\'m EcoBot, your project assistant. Ask me anything about our waste analytics project, the team, our findings, or Egypt\'s recycling goals!' }
];

const FALLBACK_DEFAULT = 'Hey there! 👋 I\'m EcoBot, your EcoMetrics Egypt assistant! I can tell you about our key findings, the 5-person team, the BI pipeline, dashboard pages, or our strategic recommendations. What would you like to know? 😊';

function getFallbackResponse(question) {
  const q = question.toLowerCase();
  for (const item of FALLBACK_RESPONSES) {
    if (item.triggers.some(trigger => q.includes(trigger))) {
      return item.response;
    }
  }
  return FALLBACK_DEFAULT;
}

const SUGGESTED_QUESTIONS = [
  "What is EcoMetrics Egypt?",
  "What were the key findings?",
  "Who are the team members?",
  "How does the BI pipeline work?",
  "What is Egypt's Vision 2030 recycling target?"
];

// Conversation history for multi-turn context
const chatHistory = [];

async function sendUserMessage(text) {
  addUserMessage(text);
  addLoadingDots();

  // Add user message to history
  chatHistory.push({ role: "user", parts: [{ text: text }] });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        message: text,
        contents: chatHistory,
        systemInstruction: {
          parts: [{ text: SYSTEM_CONTEXT }]
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500
        }
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn('Gemini HTTP error:', response.status);
      removeLoadingDots();
      const fallback = getFallbackResponse(text);
      chatHistory.push({ role: "model", parts: [{ text: fallback }] });
      addBotMessage(fallback);
      return;
    }

    const data = await response.json();
    removeLoadingDots();

    if (data.error) {
      console.warn('Gemini API error:', data.error);
      const fallback = getFallbackResponse(text);
      chatHistory.push({ role: "model", parts: [{ text: fallback }] });
      addBotMessage(fallback);
      return;
    }

    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      const reply = data.candidates[0].content.parts[0].text;
      chatHistory.push({ role: "model", parts: [{ text: reply }] });
      addBotMessage(reply);
    } else {
      console.warn('Unexpected Gemini response:', data);
      const fallback = getFallbackResponse(text);
      chatHistory.push({ role: "model", parts: [{ text: fallback }] });
      addBotMessage(fallback);
    }
  } catch (err) {
    console.warn('Chat error:', err.message);
    removeLoadingDots();
    const fallback = getFallbackResponse(text);
    chatHistory.push({ role: "model", parts: [{ text: fallback }] });
    addBotMessage(fallback);
  }
}

function initChatWidget() {
  // Create chat trigger
  const trigger = document.createElement('div');
  trigger.className = 'chat-trigger';
  trigger.innerHTML = `
    <button class="chat-trigger__btn" aria-label="Open AI Chat Assistant">
      <span class="chat-trigger__pulse"></span>
      <i data-lucide="message-circle" style="width:24px;height:24px;"></i>
      <span class="chat-trigger__badge">AI</span>
    </button>
  `;

  // Create chat panel
  const panel = document.createElement('div');
  panel.className = 'chat-panel';
  panel.id = 'chatPanel';
  panel.innerHTML = `
    <div class="chat-panel__header">
      <div class="chat-panel__header-info">
        <span class="chat-panel__header-title">🤖 EcoBot</span>
        <span class="chat-panel__header-sub">AI Project Assistant</span>
      </div>
      <button class="chat-panel__close" aria-label="Close chat">
        <i data-lucide="x" style="width:18px;height:18px;"></i>
      </button>
    </div>
    <div class="chat-panel__messages" id="chatMessages"></div>
    <div class="chat-suggestions" id="chatSuggestions">
      ${SUGGESTED_QUESTIONS.map(q => `<button class="chat-suggestions__pill">${q}</button>`).join('')}
    </div>
    <div class="chat-panel__input">
      <input type="text" id="chatInput" placeholder="Ask about the project..." />
      <button id="chatSend" aria-label="Send message">
        <i data-lucide="send" style="width:16px;height:16px;"></i>
      </button>
    </div>
  `;

  document.body.appendChild(trigger);
  document.body.appendChild(panel);
  lucide.createIcons();

  let isOpen = false;
  let welcomeSent = false;

  const triggerBtn = trigger.querySelector('.chat-trigger__btn');
  const closeBtn = panel.querySelector('.chat-panel__close');

  triggerBtn.addEventListener('click', () => {
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
    if (isOpen && !welcomeSent) {
      addBotMessage("Hi! I'm EcoBot 👋 I'm here to help you learn about the EcoMetrics Egypt project. You can ask me about our data findings, the team, the BI pipeline, or Egypt's recycling goals. What would you like to know?");
      welcomeSent = true;
    }
  });

  closeBtn.addEventListener('click', () => {
    isOpen = false;
    panel.classList.remove('open');
  });

  // Suggestion pills
  const suggestionsContainer = document.getElementById('chatSuggestions');
  suggestionsContainer.querySelectorAll('.chat-suggestions__pill').forEach(pill => {
    pill.addEventListener('click', () => {
      sendUserMessage(pill.textContent);
      suggestionsContainer.style.display = 'none';
    });
  });

  // Input
  const chatInput = document.getElementById('chatInput');
  const chatSend = document.getElementById('chatSend');

  chatSend.addEventListener('click', () => {
    const msg = chatInput.value.trim();
    if (msg) {
      sendUserMessage(msg);
      chatInput.value = '';
      if (suggestionsContainer) suggestionsContainer.style.display = 'none';
    }
  });

  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') chatSend.click();
  });
}

function addBotMessage(text) {
  const container = document.getElementById('chatMessages');
  const msg = document.createElement('div');
  msg.className = 'chat-msg chat-msg--bot';
  msg.innerHTML = `
    <div class="chat-msg__avatar">E</div>
    <div class="chat-msg__bubble">${text}</div>
  `;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

function addUserMessage(text) {
  const container = document.getElementById('chatMessages');
  const msg = document.createElement('div');
  msg.className = 'chat-msg chat-msg--user';
  msg.innerHTML = `<div class="chat-msg__bubble">${text}</div>`;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

function addLoadingDots() {
  const container = document.getElementById('chatMessages');
  const dots = document.createElement('div');
  dots.className = 'chat-msg chat-msg--bot';
  dots.id = 'chatLoading';
  dots.innerHTML = `
    <div class="chat-msg__avatar">E</div>
    <div class="chat-dots"><span></span><span></span><span></span></div>
  `;
  container.appendChild(dots);
  container.scrollTop = container.scrollHeight;
}

function removeLoadingDots() {
  const dots = document.getElementById('chatLoading');
  if (dots) dots.remove();
}



/* --- Photo fallback --- */
function handlePhotoError(img) {
  img.style.display = 'none';
  const fallback = img.nextElementSibling;
  if (fallback && fallback.classList.contains('team-card__initials')) {
    fallback.style.display = 'flex';
  }
}

/* --- External Chatbot Trigger Hook --- */
window.triggerBotMessage = function (text) {
  const triggerBtn = document.querySelector('.chat-trigger__btn');
  const panel = document.getElementById('chatPanel');
  if (!panel || !triggerBtn) return;

  // Open panel if closed
  if (!panel.classList.contains('open')) {
    triggerBtn.click();
  }

  // Find input and send
  const chatInput = document.getElementById('chatInput');
  if (chatInput) {
    chatInput.value = text;
    sendUserMessage(text);
    chatInput.value = '';
    const suggestionsContainer = document.getElementById('chatSuggestions');
    if (suggestionsContainer) suggestionsContainer.style.display = 'none';
  }
};

/* --- Spotlight Hover Glow --- */
function initSpotlightGlow() {
  document.addEventListener('mousemove', (e) => {
    const card = e.target.closest('.glass-card, .btn-primary, .btn-outline, .btn-download, .rec-card, .kpi-card, .quick-nav__card, .team-card');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  });
}

/* --- Background Orb Parallax --- */
function initBackgroundParallax() {
  const wrappers = document.querySelectorAll('.animated-bg__orb-wrapper');
  if (!wrappers.length) return;
  document.addEventListener('mousemove', (e) => {
    const x = (window.innerWidth / 2 - e.clientX) / window.innerWidth;
    const y = (window.innerHeight / 2 - e.clientY) / window.innerHeight;
    wrappers.forEach((wrap, index) => {
      const factor = (index + 1) * 25; // 25px, 50px, 75px max displacement
      wrap.style.transform = `translate3d(${x * factor}px, ${y * factor}px, 0)`;
    });
  }, { passive: true });
}

/* --- Scroll Progress Indicator --- */
function injectScrollProgress() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress-bar';
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight <= 0) return;
    const progress = (window.scrollY / totalHeight) * 100;
    bar.style.width = `${progress}%`;
  }, { passive: true });
}

/* --- Floating Back to Top Progress Ring --- */
function injectBackToTop() {
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = `
    <svg class="back-to-top__ring" width="40" height="40">
      <circle class="back-to-top__circle" stroke="var(--accent-teal)" stroke-width="3" fill="transparent" r="18" cx="20" cy="20"/>
    </svg>
    <i data-lucide="arrow-up" style="width:16px;height:16px;position:relative;z-index:2;"></i>
  `;
  document.body.appendChild(btn);

  const circle = btn.querySelector('.back-to-top__circle');
  const radius = circle.r.baseVal.value;
  const circumference = radius * 2 * Math.PI;
  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  circle.style.strokeDashoffset = circumference;

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPos = window.scrollY;

    if (scrollPos > 300) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }

    if (totalHeight > 0) {
      const progress = scrollPos / totalHeight;
      const offset = circumference - (progress * circumference);
      circle.style.strokeDashoffset = offset;
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
