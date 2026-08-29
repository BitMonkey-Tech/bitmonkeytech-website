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
// Form submissions -> Google Apps Script -> email
//
// A static site has no server of its own, so it can't send email by
// itself. This posts each form's data to a Google Apps Script "Web App"
// (see APPS_SCRIPT_SETUP.md) which uses Gmail to email the submission to
// info@bitmonkeytech.com. Paste your deployed script's URL below.
// ---------------------------------------------------------------------
const GOOGLE_SCRIPT_URL =
  "AKfycbzXiFDQajW965qfuaLkTHdwV5D2jx8GSOCVuGgt4lX2RsV5Mf98g1A0_JJa17xrgpZF";

document.querySelectorAll(".js-form").forEach((form) => {
  const status = form.querySelector(".form-status");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (GOOGLE_SCRIPT_URL.includes("PASTE_YOUR")) {
      // Setup step skipped — tell whoever's testing it rather than
      // silently doing nothing.
      if (status) {
        status.textContent =
          "This form isn't connected yet — see APPS_SCRIPT_SETUP.md.";
        status.classList.add("error");
      }
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    // Apps Script Web Apps don't send back CORS headers, so with
    // mode: 'no-cors' the browser can't let us read the response —
    // it comes back "opaque". The request still reaches Google and the
    // email still sends; we just can't confirm success from here, so we
    // optimistically show the thank-you message once the request completes.
    fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      body: new FormData(form),
    })
      .then(() => {
        form.reset();
        if (status) {
          status.textContent = "Thanks! We'll be in touch soon.";
          status.classList.remove("error");
        }
      })
      .catch(() => {
        if (status) {
          status.textContent =
            "Something went wrong — please try again or email us directly.";
          status.classList.add("error");
        }
      })
      .finally(() => {
        if (submitBtn) submitBtn.disabled = false;
      });
  });
});
