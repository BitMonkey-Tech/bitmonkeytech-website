# BitMonkey Tech — site source

A hand-coded recreation of bitmonkeytech.com, rebuilt as plain HTML, CSS,
and JavaScript — no build step, no framework.

## Structure

- `index.html` — home page (hero, intro, services, "tailored for your
  business", testimonials, flexible packages, CTA)
- `services.html` — the 7 pricing/package cards + a "Get Started" form
- `contact.html` — contact form + FAQ (tabbed accordion)
- `css/style.css` — all styling, using CSS custom properties for the
  brand colors and fonts (see `:root` at the top of the file)
- `js/main.js` — mobile menu toggle + the FAQ tabs/accordion
- `images/mascot.svg` — the BitMonkey superhero mascot illustration,
  extracted directly from the live site's inline SVG
- `images/mascot-icon.png` — the small logo mark used in the header/footer

## Running it locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in a browser.

## Notes / known simplifications

- The contact, "Get Started", and newsletter forms don't submit anywhere
  yet — they need a backend (a form service like Formspree, or a small
  serverless function) to actually send the data somewhere.
- The live site uses several large custom illustrations (Wix stock
  vector art) beyond the mascot — the "tailored for your business" scene
  and the "team building a website" scene near the footer. Those were
  left out here and replaced with simpler decorative elements, since
  reproducing every stock illustration exactly would be a lot of extra
  weight for content that isn't brand-specific. The mascot itself (their
  actual brand asset) was pulled in exactly.
- Fonts (Space Grotesk / Poppins) are loaded from Google Fonts.
