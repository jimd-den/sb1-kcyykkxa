# Session Tracker

## Project Description

Session Tracker is an application designed to help users track and manage their sessions. Users can start a new session, add comments and pictures during the session, and view past sessions with detailed information.

## Features and Functionalities

- Start a new session with a title and goal time
- Add comments and pictures during the session
- Track session progress with a timer and progress bar
- Pause and resume sessions
- End sessions and add an optional after picture
- View past sessions with detailed information, including comments and pictures
- Delete past sessions

## Instructions

### Starting a New Session

1. Click on "Start New Session" on the home page.
2. Enter a session title and goal time.
3. Optionally, add a before picture.
4. Click "Start Session" to begin.

### Adding Comments and Pictures

1. During a session, enter a comment in the text area.
2. Optionally, add a picture by clicking "📷 Add Image".
3. Click "Add Comment" to save the comment and picture.

### Tracking Progress

1. Use the progress buttons to update the session progress.
2. The progress bar will reflect the current progress.

### Pausing and Resuming Sessions

1. Click "Pause" to pause the session.
2. Click "Resume" to continue the session.

### Ending a Session

1. Click "End Session" to finish the session.
2. Optionally, add an after picture.
3. Click "Complete Session" to save the session.

### Viewing Past Sessions

1. Click on a session in the "Your Sessions" list to view details.
2. View comments, pictures, and session information.

### Deleting Past Sessions

1. Click the delete button (×) on a session card to delete the session.

## Dependencies

- `@sveltejs/vite-plugin-svelte`: ^3.1.2
- `@tsconfig/svelte`: ^5.0.4
- `svelte`: ^4.2.19
- `svelte-check`: ^3.8.6
- `tslib`: ^2.7.0
- `typescript`: ^5.5.3
- `vite`: ^5.4.2
- `svelte-routing`: ^2.13.0
- `uuid`: ^9.0.1

## Scripts

- `dev`: Start the development server using Vite.
- `build`: Build the application for production.
- `preview`: Preview the production build.
- `check`: Run type checking using `svelte-check` and `tsc`.
