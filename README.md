# English Practice · Daily Translation

A browser-based CET-6 English translation practice system. One exercise per day with multi-dimensional analysis.

## How to Use

1. Open `index.html` in any modern browser (Chrome/Edge/Firefox)
2. Read the Chinese sentence
3. Type your English translation
4. Click **Submit** (or press `Ctrl+Enter`)
5. Review the analysis:
   - ✅ Your translation vs reference
   - 🔍 Grammar notes
   - 💡 Vocabulary tips (synonyms & usage)
   - 🔄 Alternative expressions
6. Track your progress in the stats panel

## Features

- **Daily exercises** — one CET-6 level translation per day
- **Multi-dimensional analysis** — grammar, vocabulary, synonym replacement, alternative expressions
- **Progress tracking** — streak, completion rate, history
- **Keyboard shortcut** — `Ctrl+Enter` to submit
- **No internet required** — all data is embedded; works offline

## Project Structure

```
english-practice/
├── index.html       # Main page
├── style.css        # Styles
├── js/
│   ├── questions.js # Question bank (40 questions)
│   └── app.js       # Application logic
└── README.md        # This file
```

## Data

All progress is stored in your browser's `localStorage`. Clearing browser data will reset your progress.
