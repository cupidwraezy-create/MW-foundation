const assistant = (() => {
  const toggle = document.querySelector(".assistant-toggle");
  const panel = document.querySelector(".assistant-panel");
  const close = document.querySelector(".assistant-close");
  const form = document.querySelector(".assistant-form");
  const input = document.querySelector("#assistant-input");
  const messages = document.querySelector(".assistant-messages");
  const chips = document.querySelectorAll("[data-question]");

  const contact = "Customer care support is available on WhatsApp at 0700 549 161. You can also email milkayahw@gmail.com.";
  const whatsappLink = "https://wa.me/254700549161";
  const emailLink = "mailto:milkayahw@gmail.com?subject=MW%20Foundation%20Support";

  const answers = [
    {
      terms: ["contact", "phone", "call", "whatsapp", "customer", "care", "number"],
      reply: `${contact} Use the WhatsApp button on this page for the fastest response.`
    },
    {
      terms: ["support", "donate", "donation", "sponsor", "sponsorship", "partner", "partnership"],
      reply: "You can support MW Foundation through financial support, sponsorship, partnerships, or supplies for the Back-to-School & Empowerment Drive. The estimated launch budget is KSh 50,000."
    },
    {
      terms: ["volunteer", "help", "join"],
      reply: "Volunteers can help with school supply distribution, mentorship sessions, community engagement, and activity documentation. Contact customer care on WhatsApp to get started."
    },
    {
      terms: ["program", "programs", "offer", "services", "activities"],
      reply: "MW Foundation focuses on school supplies, mentorship, hygiene support, and community engagement for vulnerable children and youth."
    },
    {
      terms: ["budget", "cost", "money", "ksh", "fund"],
      reply: "The estimated drive budget is KSh 50,000: school supplies KSh 20,000, hygiene support KSh 10,000, refreshments KSh 8,000, logistics KSh 7,000, and miscellaneous KSh 5,000."
    },
    {
      terms: ["beneficiaries", "children", "youth", "age", "ages", "orphans"],
      reply: "The target beneficiaries are orphans and vulnerable children from low-income households, especially children and youth ages 8-18."
    },
    {
      terms: ["location", "where", "nairobi", "kenya"],
      reply: "MW Foundation is a Nairobi, Kenya community-based nonprofit initiative."
    },
    {
      terms: ["proposal", "pdf", "download"],
      reply: "You can download the MW Foundation proposal from the Download Proposal button near the top of this page."
    }
  ];

  function openPanel() {
    panel.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    requestAnimationFrame(() => input.focus());
  }

  function closePanel() {
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.focus();
  }

  function addMessage(text, type) {
    const message = document.createElement("div");
    message.className = `assistant-message ${type}`;
    message.textContent = text;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
  }

  function normalize(text) {
    return text.toLowerCase().replace(/[^\w\s]/g, " ");
  }

  function getReply(text) {
    const value = normalize(text);
    const match = answers.find((answer) => answer.terms.some((term) => value.includes(term)));
    if (match) {
      return match.reply;
    }

    return `${contact} I can also help with programs, volunteering, donations, the budget, and proposal details.`;
  }

  function ask(question) {
    const trimmed = question.trim();
    if (!trimmed) return;
    addMessage(trimmed, "user");
    window.setTimeout(() => addMessage(getReply(trimmed), "bot"), 250);
  }

  toggle.addEventListener("click", () => {
    if (panel.hidden) {
      openPanel();
    } else {
      closePanel();
    }
  });

  close.addEventListener("click", closePanel);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    ask(input.value);
    input.value = "";
  });

  chips.forEach((chip) => {
    chip.addEventListener("click", () => ask(chip.dataset.question || chip.textContent));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      closePanel();
    }
  });

  return { ask, whatsappLink, emailLink };
})();
