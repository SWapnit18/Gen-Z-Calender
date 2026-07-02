#  Gen Z Calendar
> Live · Learn · Grow · Balance. The ultimate life tracker for the modern era.

Gen Z Calendar is a state-of-the-art, premium productivity dashboard designed with a sleek glassmorphism aesthetic, ambient color glow, and micro-animations. It operates on a custom, optimized calendar system designed to align daily vibes, balance life axis parameters, track streaks, and generate smart insights.

---

##  Custom 14-Month Calendar System
Unlike standard calendars, this calendar operates on a dedicated balance framework containing **14 months**:
* **Months 1 to 13:** Each month consists of exactly **25 days**.
* **Month 14 (Reflect):** Consists of **40 days** (41 in leap years) for comprehensive year-end review, recovery, and goal setting.
* Every month carries a unique developmental theme (e.g., *Ignite, Focus, Discipline, Gratitude, Reflect*).
* Days are categorized into specific archetypes: **Grind**, **Skill**, **Creator**, **Vibe**, or **Bunk**.

---

##  Key Features

### 🛠️ In-Place CRUD Checklist (Manual & Auto Modes)
* **Automatic Mode:** Instantly populate optimized daily recommendations matching the day's theme.
* **Manual Mode:** Fully custom dashboard control. Add, edit, or delete items instantly.
* **Inline In-place Editing:** Click the edit icon (✎) to instantly morph any checklist row into an editable text field. No annoying popup dialogs. Use `Enter` to save and `Esc` to cancel.

###  Dual Themes (Premium Light & Dark Modes)
* Includes a fully optimized **Light Mode** defaulting to a clean off-white design with warm pastel gradients.
* **Dark Mode** features deep-space glassmorphism with neon outlines.
* Theme toggle dynamically sets the system color scheme without visual flash on reload.

###  Smart Balance Analytics
* **Habit Trackers:** Log daily parameters (Mind, Body, Skills, Focus, Relationships, Fun, Growth).
* **Smart Insights:** Interactive rule-based engine analyzing unchecked sleep, balance goals, and trends.
* **Last 7 Days Trend:** Real-time habit tracking bars with visual glow highlights.

###  Developer Command Console
* Hit `⌘` or `/` in the top bar console to search commands.
* Command system parses syntax like `/help`, `/vibe`, and database operations locally.

---

##  Project Structure
* **`frontend/`**: The entire frontend UI code (HTML, JS, CSS, PWA assets).
  * **`frontend/img/`**: Brand logo, favicon, and PWA icon graphics.
* **`backend/`**: Database integration and API sync stubs.

---

##  How to Run Locally

Since the application is built using standard, lightweight web technologies, it can be run instantly without heavy installation processes:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SWapnit18/Gen-Z-Calender.git
   cd Gen-Z-Calender
   ```
2. **Open the app:**
   * Double-click `frontend/index.html` to open it directly in your browser.
   * *For the best experience (and to avoid local browser file-protocol sandbox warnings), run it using a local static server like VS Code's **Live Server** extension or Node's `http-server` inside the `frontend/` directory.*

---

##  Technology Stack
* **Markup:** Semantic HTML5
* **Styling:** Premium Vanilla CSS3 (custom variables, modern grids, backdrop filters, spring animations)
* **Logic:** Plain ES6 JavaScript (LocalStorage state management, async parallel fetches, lifecycle event handlers)
