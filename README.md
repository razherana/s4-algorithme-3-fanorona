# Fanorona 3

A web implementation of **Fanorona 3**, a miniature 3×3 variant of *Fanorona* — the traditional board game from Madagascar — in which you play against an AI opponent powered by **Minimax with alpha–beta pruning**.

- **Backend** — Python / Flask REST API that computes the best move for a given position.
- **Frontend** — React single-page application that renders the board and lets you play against the bot.

---

## Table of Contents

- [About the Game](#about-the-game)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [How the AI Works](#how-the-ai-works)
- [Project Structure](#project-structure)
- [Notes & Troubleshooting](#notes--troubleshooting)

---

## About the Game

Fanorona 3 is played on a **3×3 grid of intersections** (9 points). Two players — **Player 1 (black)** and **Player 2 (white)** — alternate turns. The game is split into two phases:

1. **Placement phase** — each player places **3 pieces** (6 in total), one per turn, on any empty intersection.
2. **Movement phase** — once all 6 pieces are on the board, players take turns moving one of their pieces to an **adjacent empty intersection**. Moves must follow the lines drawn on the board:
   - **horizontally / vertically** between neighbouring intersections;
   - **diagonally** only along the two long diagonal lines (through the centre) — i.e. between the centre and a corner.

**Winning:** the first player to line up **3 of their pieces** — horizontally, vertically, or diagonally (all 8 lines, like tic-tac-toe) — wins immediately. If the board is completely filled without any such line, the game is a **draw**.

### Board coordinates

Each intersection is identified by an `"x,y"` key, with `(0,0)` at the top-left:

```
(0,0) ── (1,0) ── (2,0)
  │ ╲       │      ╱ │
  │   ╲     │    ╱   │
(0,1) ── (1,1) ── (2,1)
  │   ╱     │    ╲   │
  │ ╱       │      ╲ │
(0,2) ── (1,2) ── (2,2)
```

Cell values used by the API and the UI:

| Value  | Meaning                          |
| ------ | -------------------------------- |
| `null` | empty intersection               |
| `1`    | Player 1's piece (black)         |
| `2`    | Player 2's piece (white)         |
| `-1`   | blocked intersection (ignored by the game and the AI) |

---

## Features

- Complete game logic: placement → movement phases, turn switching, win and draw detection.
- AI opponent using **minimax + alpha–beta pruning** with **iterative deepening**.
- "Ask BOT" button to request a move on demand, plus automatic bot play for Player 2.
- Loading overlay while the bot is thinking.
- Custom puzzles: **right-click** any intersection to toggle it as **blocked** (`-1`).
- "Reset Game" / "Play Again" support.

---

## Tech Stack

| Layer     | Technology                                                              |
| --------- | ----------------------------------------------------------------------- |
| Backend   | Python 3.9+, Flask, Flask-CORS, Flask-SQLAlchemy, SQLite, python-dotenv |
| AI        | Minimax with alpha–beta pruning, iterative deepening, static evaluation |
| Frontend  | React 19, Axios, styled-components, Tailwind CSS                        |

---

## Getting Started

### Prerequisites

- **Python** 3.9 or newer
- **Node.js** (LTS recommended) and **npm**

### 1. Run the Backend

```bash
cd backend

# Create a virtual environment (skip if backend/myenv already exists)
python3 -m venv myenv

# Activate it
source myenv/bin/activate        # Linux / macOS
# myenv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt
pip install flask-cors flask-sqlalchemy

# Start the API
python run.py
```

The API starts on **http://localhost:5000** in debug mode. On the first run a SQLite database is created automatically in `backend/instance/`.

Optionally, create a `backend/.env` file for secrets:

```env
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///site.db
```

### 2. Run the Frontend

```bash
cd frontend

npm install
npm start
```

The app opens on **http://localhost:3000**. It expects the backend to be reachable at `http://localhost:5000` (hardcoded in `src/App.js` — change it there if your API runs elsewhere).

### Frontend Scripts

| Command         | Description                                |
| --------------- | ------------------------------------------ |
| `npm start`     | Run the development server                 |
| `npm test`      | Run the test suite                         |
| `npm run build` | Build the production bundle into `build/`  |

---

## API Reference

### `POST /next_move`

Computes the best move for the given player and position.

**Request body**

| Field      | Type    | Description                                                                                             |
| ---------- | ------- | ------------------------------------------------------------------------------------------------------- |
| `board`    | object  | Map of `"x,y"` → `null` (empty), `1`, `2`, or `-1` (blocked)                                             |
| `playerId` | integer | `1` or `2` — the player to move                                                                          |
| `state`    | string  | `"placement"` or `"movement"` (informational; the server re-derives the phase from the piece count)      |

**Example request**

```json
{
  "board": {
    "0,0": null, "0,1": null, "0,2": null,
    "1,0": null, "1,1": null, "1,2": null,
    "2,0": null, "2,1": null, "2,2": null
  },
  "playerId": 1,
  "state": "placement"
}
```

**Responses**

| Scenario           | Body                                                        |
| ------------------ | ----------------------------------------------------------- |
| Placement phase    | `{ "best_move": "1,1", "state": "placement" }`               |
| Movement phase     | `{ "from": "0,0", "to": "1,1", "state": "mouvement" }`       |
| No move available  | `{ "error": "No valid move found" }` (HTTP 200)              |
| Invalid request    | `{ "error": "Invalid JSON body" }` / `{ "error": "Missing required fields" }` (HTTP 400) |

> **Note:** the server uses the French spelling `"mouvement"` in the returned `state` field for the movement phase.

---

## How the AI Works

The AI lives entirely in `backend/app/functions.py` (the `Board` class):

- **Minimax with alpha–beta pruning** — `minimax_placement()` and `minimax_mouvement()` search the game tree; terminal states reward quicker wins and penalise quicker losses.
- **Iterative deepening** — `find_best_placement_move()` (depths 1 → 8) and `find_best_movement_move()` (depths 1 → 6) increase the search depth until roughly half of the ~1 second time budget is spent, guaranteeing a reasonable response time.
- **Static evaluation** — `evaluate_position()` scores non-terminal positions by counting near-complete lines (offense weight 10, defense weight 15), the centre (5 points) and the corners (3 points each).
- **Opening trap heuristic** — a near-winning score is awarded when the opponent occupies the centre while the player controls a corner, steering the AI out of the classic early trap.
- **Phase detection** — `best_move()` picks the phase automatically: fewer than 6 pieces on the board means the placement phase, otherwise the movement phase.

---

## Project Structure

```
3-fanorona/
├── backend/
│   ├── app/
│   │   ├── __init__.py      # Flask app factory (CORS, SQLAlchemy, blueprints)
│   │   ├── config.py        # Environment-based configuration
│   │   ├── functions.py     # Board logic + Minimax AI
│   │   ├── models.py        # SQLAlchemy models (example User model)
│   │   └── routes.py        # /next_move API endpoint
│   ├── instance/            # SQLite database (created at runtime)
│   ├── requirements.txt     # Python dependencies
│   └── run.py               # Backend entry point
│
├── frontend/
│   ├── public/              # Static assets (index.html, manifest, robots.txt)
│   ├── src/
│   │   ├── App.js           # Board UI, game logic and API calls
│   │   ├── index.js         # React entry point
│   │   ├── App.css / index.css / output.css
│   │   └── reportWebVitals.js, setupTests.js
│   ├── build/               # Production build output
│   ├── package.json
│   ├── postcss.config.js    # PostCSS (Tailwind + Autoprefixer)
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   └── webpack.config.js    # CSS loader rules
│
└── README.md
```

---

## Notes & Troubleshooting

- **CORS** is enabled for all routes, so the frontend can call the API directly from the browser.
- **Playing as Player 2 manually:** `src/App.js` defines a constant `isAutomatic` (currently `true`). When `true`, Player 2 (white) is played automatically by the bot. Set it to `false` to play both sides yourself and request bot moves only via the **Ask BOT** button.
- **Blocked cells:** right-click an intersection to toggle it as blocked (`-1`). Blocked cells are excluded from play and ignored by the AI — useful for setting up custom puzzles.
- **Port conflicts:** the backend always runs on port `5000` and the frontend dev server on `3000`. If you change the backend port, update the Axios URL in `src/App.js` accordingly.
- **Missing packages:** if the API fails to start, make sure `flask-cors` and `flask-sqlalchemy` are installed (see the backend setup steps above).

---

## Acknowledgements

*Fanorona* is a traditional strategy game from Madagascar. This project is an educational implementation built for the S4 Algorithms course (*Algorithme — Mr Tsinjo*).
