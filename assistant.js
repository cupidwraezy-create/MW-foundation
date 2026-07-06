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
      terms: ["what is mw", "what is mw foundation", "about mw", "about the foundation", "who are you", "who is mw foundation", "meaning of mw foundation", "introduction", "background", "tell me about mw", "tell me about the foundation"],
      reply: "MW Foundation is a Nairobi-based community nonprofit initiative that supports vulnerable children and youth. It helps children stay in school, build confidence, and access practical support such as learning materials, hygiene items, mentorship, and community care."
    },
    {
      terms: ["mission", "goal", "purpose", "vision", "why was it founded", "why started", "objectives", "objective", "aim", "aims", "target", "targets"],
      reply: "The purpose of MW Foundation is to become a helping hand for vulnerable children who need support, guidance, and basic resources. The foundation was inspired by lived experience and the belief that one act of support can change a young life."
    },
    {
      terms: ["offer", "offers", "what does it offer", "what do you offer", "services", "activities", "program", "programs", "initiatives", "projects", "work", "what do you do"],
      reply: "MW Foundation offers school supplies, hygiene support such as sanitary pads, mentorship and motivational talks, community engagement, and support drives for vulnerable children and youth."
    },
    {
      terms: ["school supplies", "books", "exercise books", "pens", "pencils", "writing materials", "learning materials", "education materials", "stationery"],
      reply: "School supply support includes exercise books, writing materials, and other essential learning items. These supplies help children attend class prepared and reduce pressure on families who may be struggling financially."
    },
    {
      terms: ["hygiene", "sanitary", "sanitary pads", "pads", "period", "menstrual", "basic hygiene", "hygiene kits"],
      reply: "MW Foundation provides hygiene support, including sanitary pads and basic hygiene items, so children can attend school with dignity and confidence."
    },
    {
      terms: ["mentorship", "mentor", "guidance", "motivation", "motivational", "talks", "confidence", "discipline", "hope"],
      reply: "Mentorship at MW Foundation includes motivational talks and guidance sessions. The goal is to help children build confidence, discipline, hope, and a stronger belief in their future."
    },
    {
      terms: ["community engagement", "community outreach", "outreach", "families", "local supporters", "community care", "accountable", "accountability"],
      reply: "Community engagement means working with families, volunteers, sponsors, and local supporters so each drive is practical, accountable, and connected to the real needs of children."
    },
    {
      terms: ["benefit", "benefits", "advantage", "advantages", "impact", "importance", "why support", "outcome", "outcomes"],
      reply: "The benefits of MW Foundation include improved school attendance, better access to learning materials, increased confidence among children, reduced pressure on families, stronger mentorship, dignity through hygiene support, and positive community impact."
    },
    {
      terms: ["how does it help", "help children", "help youth", "support children", "support youth", "help boys", "help girls", "child support", "student support"],
      reply: "MW Foundation helps children by providing essential school supplies, hygiene items, mentorship, motivation, and community support. These services reduce barriers that can keep vulnerable children away from school."
    },
    {
      terms: ["contact", "phone", "call", "whatsapp", "customer", "care", "number", "email", "reach", "reach out", "talk to someone", "get in touch"],
      reply: `${contact} Use the WhatsApp button on this page for the fastest response.`
    },
    {
      terms: ["mpesa", "m pesa", "mobile money", "paystack", "card", "payment", "pay", "secure donation", "donate securely"],
      reply: "The donation section supports secure giving by card or mobile money. Choose an amount, enter your details, and follow the payment prompts on the page."
    },
    {
      terms: ["support", "donate", "donation", "sponsor", "sponsorship", "partner", "partnership", "contribute", "contribution", "give", "giving", "fundraise", "fundraising"],
      reply: "You can support MW Foundation through financial support, sponsorship, partnerships, or supplies for the Back-to-School & Empowerment Drive. The estimated launch budget is $1,000."
    },
    {
      terms: ["how are donations used", "donations used", "where does money go", "how is money used", "use of funds", "monitor", "monitored", "transparency", "updates"],
      reply: "Donations are directed toward school supplies, hygiene kits, mentorship activities, community outreach, food and refreshments, and logistics. Supporters are kept updated through email and WhatsApp."
    },
    {
      terms: ["volunteer", "volunteers", "help", "join", "join the foundation", "become a volunteer", "volunteer work", "assist", "participate"],
      reply: "Volunteers can help with school supply distribution, mentorship sessions, community engagement, and activity documentation. Contact customer care on WhatsApp to get started."
    },
    {
      terms: ["budget", "cost", "money", "usd", "fund", "funds", "breakdown", "estimated budget", "how much", "target amount"],
      reply: "The estimated drive budget is $1,000: $400 for school supplies, $200 for sanitary and hygiene support, $160 for food and refreshments, $140 for logistics, and $100 for miscellaneous needs."
    },
    {
      terms: ["beneficiaries", "children", "youth", "age", "ages", "orphans", "vulnerable children", "low income", "low-income", "who receives help", "who do you help"],
      reply: "The target beneficiaries are 20 to 30 orphans and vulnerable children from low-income households."
    },
    {
      terms: ["location", "where", "nairobi", "kenya", "based", "area", "community", "communities", "map", "regional", "local"],
      reply: "MW Foundation is a Nairobi, Kenya community-based nonprofit initiative."
    },
    {
      terms: ["back to school", "back-to-school", "empowerment drive", "current project", "first drive", "drive", "campaign"],
      reply: "The current project is the MW Back-to-School & Empowerment Drive. It will equip vulnerable children with school supplies, hygiene support, refreshments, mentorship, and community outreach."
    },
    {
      terms: ["food", "refreshments", "meals", "snacks", "logistics", "transport", "miscellaneous"],
      reply: "The drive budget includes food and refreshments for children and volunteers, logistics for organizing and distributing support, and a small miscellaneous amount for unexpected needs."
    },
    {
      terms: ["regular drives", "long term", "long-term", "sustainable", "future plans", "next drive", "sustainability", "grow"],
      reply: "MW Foundation is seeking long-term partners, sponsors, volunteers, and supporters to help organize regular drives and build sustainable community programs."
    },
    {
      terms: ["how many", "20", "30", "target number", "number of children"],
      reply: "The first Back-to-School & Empowerment Drive is planned to support about 20 to 30 orphans and vulnerable children."
    },
    {
      terms: ["boys", "girls", "gender", "who qualifies", "eligibility"],
      reply: "MW Foundation supports vulnerable children and youth, both boys and girls, especially those affected by financial hardship, limited mentorship, and inadequate basic support."
    },
    {
      terms: ["proposal", "pdf", "download"],
      reply: "You can download the MW Foundation proposal from the Download Proposal button near the top of this page."
    },
    {
      terms: ["thank", "thanks", "asante", "appreciate"],
      reply: "You are welcome. I am here to help with MW Foundation programs, donations, volunteering, budget details, proposal information, and customer care."
    },
    {
      terms: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"],
      reply: "Hello. I can help you learn about MW Foundation, the Back-to-School & Empowerment Drive, donations, volunteering, sponsorship, and customer care."
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

    return "MW Foundation is a Nairobi-based community initiative supporting vulnerable children and youth through school supplies, hygiene support, mentorship, and community engagement. I can also help with the Back-to-School Drive, donation use, M-Pesa or card giving, volunteering, sponsorship, budget details, proposal downloads, and customer care.";
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
