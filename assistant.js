const assistant = (() => {
  const toggle = document.querySelector(".assistant-toggle");
  const panel = document.querySelector(".assistant-panel");
  const close = document.querySelector(".assistant-close");
  const form = document.querySelector(".assistant-form");
  const input = document.querySelector("#assistant-input");
  const messages = document.querySelector(".assistant-messages");
  const chips = document.querySelectorAll("[data-question]");

  const contact = "Customer care support is available on WhatsApp at 0700 549 161. You can also email mwfoundationm@gmail.com.";
  const whatsappLink = "https://wa.me/254700549161";
  const emailLink = "mailto:mwfoundationm@gmail.com?subject=MW%20Foundation%20Support";

  const answers = [
    {
      terms: ["what is mw", "what is mw foundation", "about mw", "about the foundation", "who are you", "who is mw foundation", "meaning of mw foundation"],
      reply: "MW Foundation is a Nairobi-based community nonprofit initiative that supports vulnerable children and youth. It helps children stay in school, build confidence, and access practical support such as learning materials, hygiene items, mentorship, and community care."
    },
    {
      terms: ["mission", "goal", "purpose", "vision", "why was it founded", "why started"],
      reply: "The purpose of MW Foundation is to become a helping hand for vulnerable children who need support, guidance, and basic resources. The foundation was inspired by lived experience and the belief that one act of support can change a young life."
    },
    {
      terms: ["offer", "offers", "what does it offer", "what do you offer", "services", "activities", "program", "programs"],
      reply: "MW Foundation offers school supplies, hygiene support such as sanitary pads, mentorship and motivational talks, community engagement, and support drives for vulnerable children and youth."
    },
    {
      terms: ["benefit", "benefits", "advantage", "advantages", "impact", "importance", "why support", "outcome", "outcomes"],
      reply: "The benefits of MW Foundation include improved school attendance, better access to learning materials, increased confidence among children, reduced pressure on families, stronger mentorship, dignity through hygiene support, and positive community impact."
    },
    {
      terms: ["how does it help", "help children", "help youth", "support children", "support youth"],
      reply: "MW Foundation helps children by providing essential school supplies, hygiene items, mentorship, motivation, and community support. These services reduce barriers that can keep vulnerable children away from school."
    },
    {
      terms: ["contact", "phone", "call", "whatsapp", "customer", "care", "number"],
      reply: `${contact} Use the WhatsApp button on this page for the fastest response.`
    },
    {
      terms: ["support", "donate", "donation", "sponsor", "sponsorship", "partner", "partnership"],
      reply: "You can support MW Foundation through financial support, sponsorship, partnerships, or supplies for the Back-to-School & Empowerment Drive. The estimated launch budget is $1,000."
    },
    {
      terms: ["volunteer", "help", "join"],
      reply: "Volunteers can help with school supply distribution, mentorship sessions, community engagement, and activity documentation. Contact customer care on WhatsApp to get started."
    },
    {
      terms: ["budget", "cost", "money", "usd", "fund"],
      reply: "The estimated drive budget is $1,000, with funds supporting school supplies, hygiene support, refreshments, logistics, and miscellaneous expenses."
    },
    {
      terms: ["beneficiaries", "children", "youth", "age", "ages", "orphans"],
      reply: "The target beneficiaries are 20 to 30 orphans and vulnerable children from low-income households."
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

    return "MW Foundation is a Nairobi-based community initiative supporting vulnerable children and youth through school supplies, hygiene support, mentorship, and community engagement. I can also help with benefits, programs, donations, volunteering, budget, proposal details, and customer care.";
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
