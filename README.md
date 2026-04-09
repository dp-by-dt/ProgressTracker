# NEET Progress Tracker (single user)

A lightweight personal web app to track mock test scores during NEET preparation — built because spreadsheets are boring and progress deserves better than a table.

---

## What it does

Mock tests pile up fast. This tracker turns those stacks of scores into something you can actually *read* — clean charts, smart insights, and at-a-glance stats, all in one place on your phone.

- **Subject-wise tracking** — Physics, Chemistry, Botany, Zoology, each with their own colour and chart
- **Multi-subject comparison** — overlay any combination of subjects on one chart (scaled to % so the axes stay sane)
- **Rank tracking** — with an inverted Y-axis, because lower really is better here
- **Smart insights** — not just "you improved." The app cross-checks your score *and* rank to figure out if the test was harder, the competition was stiffer, or you genuinely levelled up
- **Summary stats** — latest score, best rank, average percentage — right at the top
- **Negative marking aware** — scores can go below zero, and the chart handles it gracefully

---

## Tech stack

| Layer | Tool |
|---|---|
| Backend | Python · Flask |
| Data | JSON flat file |
| Frontend | Vanilla JS · Chart.js |
| Styling | Pure CSS (no frameworks) |

No databases. No authentication. No bloat. Just a Flask server, a JSON file, and a browser.

---

## Project structure

```
progress_tracker/
│
├── app.py              # Flask routes + data logic
├── data.json           # All test entries live here
│
├── templates/
│   ├── dashboard.html  # Main view — charts, stats, insights
│   └── add.html        # Form to log a new test
│
├── static/
│   ├── style.css       # All styling
│   └── script.js       # Chart logic, insights, form UX
```

---

## Running it locally

```bash
# Clone and enter the project
git clone https://github.com/yourusername/neet-progress-tracker.git
cd neet-progress-tracker

# Install dependencies
pip install flask

# Run
python app.py
```

Then open `http://localhost:5000` in your browser. Works great on mobile too — just open it on your phone's browser while connected to the same network.

---

## How the insight engine works

After each test, the app compares your latest score and rank against the previous one. Four outcomes are possible:

| Score | Rank | Verdict |
|---|---|---|
| ↓ lower | ↓ worse | Test was probably harder than usual |
| ↑ higher | ↓ worse | You did better — but so did everyone else |
| ↑ higher | ↑ better | Genuine improvement 🚀 |
| ↓ lower | ↑ better | Easier test, or others dropped off |

The delta chips below the insight line show the exact numbers — marks gained/lost per subject, rank shift — so you're never left guessing.

---

## Why I built this

Tracking NEET prep across 6–7 mock tests in a notebook (or worse, a WhatsApp message to yourself) gets old quickly. I wanted something that lived on my phone, didn't require an account, and actually made the data *useful* — not just stored.

It also turned into a good excuse to get hands-on with Flask, Chart.js, and building a genuinely mobile-first UI from scratch without reaching for a framework.

---

## Possible future additions

- [ ] Export data as CSV
- [ ] Target score line on the chart
- [ ] Per-test notes / annotations
- [ ] PWA support (install on home screen)

---

*Built with Python + Flask · Designed for mobile · No external dependencies beyond Chart.js*