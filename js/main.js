// Mobile navigation toggle — same pattern as our other sites.
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    mainNav.classList.toggle("open");
    menuToggle.setAttribute(
      "aria-expanded",
      mainNav.classList.contains("open"),
    );
  });
}

// FAQ tabs + accordion (contact page only — these selectors simply won't
// match anything on pages that don't have a .faq section).
const faqTabs = document.querySelectorAll(".faq-tab");
const faqPanels = document.querySelectorAll(".faq-panel");

faqTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    // Switch the active tab button.
    faqTabs.forEach((t) => t.setAttribute("aria-selected", "false"));
    tab.setAttribute("aria-selected", "true");

    // Show the matching panel (data-tab on the button points at the
    // panel's id) and hide the rest.
    const targetId = tab.dataset.tab;
    faqPanels.forEach((panel) => {
      panel.classList.toggle("active", panel.id === targetId);
    });
  });
});

// Each question toggles its own answer open/closed independently.
document.querySelectorAll(".faq-item").forEach((item) => {
  const question = item.querySelector(".faq-question");
  question.addEventListener("click", () => {
    item.classList.toggle("open");
  });
});

// ---------------------------------------------------------------------
// Form submissions -> postbox -> email
//
// A static site has no server of its own, so each form POSTs its data to
// postbox (the BitMonkey Tech mail service at postbox.bitmonkeytech.com),
// which emails the submission to info@bitmonkeytech.com via Resend. FORM_ID
// is this site's key in postbox's clients.json; every form on the site
// shares it, and the hidden "form_name" field distinguishes them in the
// email. Each .js-form also carries a hidden "_gotcha" honeypot input —
// bots fill it, real people don't, and postbox silently drops those.
// ---------------------------------------------------------------------
const POSTBOX_ENDPOINT = "https://postbox.bitmonkeytech.com";
const FORM_ID = "bitmonkeytech";

document.querySelectorAll(".js-form").forEach((form) => {
  const status = form.querySelector(".form-status");
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitBtn) submitBtn.disabled = true;
    if (status) {
      status.textContent = "Sending…";
      status.classList.remove("error");
    }

    try {
      // postbox sends proper CORS headers, so unlike the old Apps Script
      // setup we can actually read the response and report real success
      // or failure.
      const res = await fetch(`${POSTBOX_ENDPOINT}/f/${FORM_ID}`, {
        method: "POST",
        body: new FormData(form),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok) {
        form.reset();
        if (status) {
          status.textContent = "Thanks! We'll be in touch soon.";
          status.classList.remove("error");
        }
      } else {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
    } catch (err) {
      if (status) {
        status.textContent =
          "Something went wrong — please try again or email us directly.";
        status.classList.add("error");
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
});
