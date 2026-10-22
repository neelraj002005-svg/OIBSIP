# FocusFlow

FocusFlow is a productivity website that helps users manage tasks and work in focused sessions using a Pomodoro timer.

## Features

### 1. Focus Timer
- 25-minute focus session
- 5-minute short break
- 15-minute long break
- Custom timer duration
- Start, pause, resume, and reset controls
- Circular timer progress indicator
- Sound notification when a session ends
- Optional browser notifications
- Daily completed focus-session counter

### 2. Automatic Breaks
- Automatically starts a break after a focus session when enabled
- Uses a 5-minute short break for regular sessions
- Starts a 15-minute long break after every fourth completed focus session
- Returns to the focus timer after a break
- Option to turn automatic breaks on or off

### 3. Focus Mode
- Fullscreen timer view
- Start and pause controls
- Displays the current session and remaining time
- Exit using the button or the `Esc` key

### 4. Weekly Focus Chart
- Displays completed focus sessions from Monday to Sunday
- Highlights the current day
- Shows the total sessions completed during the week
- Stores session history in the browser

### 5. Task Manager
- Add new tasks
- Mark tasks as completed
- Delete individual tasks
- Track task completion progress
- Clear all completed tasks
- Save tasks in the browser using `localStorage`

### 6. Light and Dark Themes
- Switch between light and dark themes
- Saves the selected theme in the browser
- Restores the selected theme when the website is opened again

### 7. Command Palette
Open the command palette using `Ctrl + K` on Windows/Linux or `Cmd + K` on macOS.

Available keyboard controls:
- Arrow keys to navigate commands
- `Enter` to select a command
- `Esc` to close the command palette

The palette provides shortcuts for timer controls, themes, notifications, tasks, focus mode, and page navigation.

### 8. Contact Section
- Contact button and email link
- Opens the default email application
- Provides quick access to the developer's contact information

### 9. Responsive Layout
- Navigation links for the main sections
- Layout adapts to different screen sizes
- Footer links for quick navigation

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Browser Local Storage
- Web Notifications API
- Web Audio API
- Fullscreen API

## Project Structure

```text
FocusFlow/
├── index.html
├── style.css
├── script.js
├── favicon.svg
├── og-image.png
└── README.md
```

Keep the image and icon files in the same folder as the HTML file if the code references them using relative paths.

## How to Run Locally

1. Download or clone the project files.
2. Open the `FocusFlow` folder in Visual Studio Code.
3. Install the Live Server extension if it is not already installed.
4. Right-click `index.html`.
5. Select **Open with Live Server**.

The website will open in your default browser.

## Data Storage and Privacy

FocusFlow stores tasks, timer preferences, theme settings, and session history in the browser using `localStorage`.

The application does not require an account or a separate backend server for these features. Clearing the browser's site data may remove saved information.

## Author

**Neel Raj**

Email: neelraj001987@gmail.com

## Purpose

This project was created as part of a web development learning and internship project. It helped me practise HTML, CSS, JavaScript, responsive design, and browser-based functionality.
