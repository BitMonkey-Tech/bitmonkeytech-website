// Mobile navigation toggle — same pattern as our other sites.
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    mainNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', mainNav.classList.contains('open'));
  });
}

// FAQ tabs + accordion (contact page only — these selectors simply won't
// match anything on pages that don't have a .faq section).
const faqTabs = document.querySelectorAll('.faq-tab');
const faqPanels = document.querySelectorAll('.faq-panel');

faqTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Switch the active tab button.
    faqTabs.forEach(t => t.setAttribute('aria-selected', 'false'));
    tab.setAttribute('aria-selected', 'true');

    // Show the matching panel (data-tab on the button points at the
    // panel's id) and hide the rest.
    const targetId = tab.dataset.tab;
    faqPanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === targetId);
    });
  });
});

// Each question toggles its own answer open/closed independently.
document.querySelectorAll('.faq-item').forEach(item => {
  const question = item.querySelector('.faq-question');
  question.addEventListener('click', () => {
    item.classList.toggle('open');
  });
});
