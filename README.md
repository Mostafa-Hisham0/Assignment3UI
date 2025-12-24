# Kanban Board - React Assignment

A fully-featured Kanban board application built with React, featuring offline support, conflict resolution, drag-and-drop, and comprehensive accessibility features.

## Features

- **Kanban Board Management**: Create, rename, and archive lists (columns)
- **Card Management**: Add, edit, delete cards with titles, descriptions, and tags
- **Drag & Drop**: Rearrange cards within lists and move cards between lists using @dnd-kit
- **Offline Support**: Full functionality without internet connection using IndexedDB
- **Optimistic Updates**: Instant UI updates with background server synchronization
- **Conflict Resolution**: Three-way merge with manual resolution UI
- **Undo/Redo**: Multi-level undo/redo for all board operations
- **Performance Optimized**: Virtualization for large lists (30+ cards), React.memo, useCallback, useMemo
- **Accessibility**: Full keyboard navigation, ARIA labels, WCAG AA compliant
- **Code Splitting**: Lazy-loaded components with React.Suspense

## Architecture Summary

The application follows a component-based architecture with centralized state management:

- **State Management**: Uses React Context API with useReducer for global state management. All board data (lists and cards) is stored in a single reducer with actions for all operations.

- **Data Persistence**: IndexedDB is used for offline storage. All changes are immediately persisted locally, and a sync queue tracks operations that need to be synchronized with the server.

- **Component Structure**: The application is organized into reusable components (Board, ListColumn, Card, CardDetailModal, etc.) with clear separation of concerns. Heavy components are lazy-loaded for better performance.

- **Custom Hooks**: Three custom hooks provide specialized functionality:
  - `useBoardState`: Wraps reducer actions for easier component usage
  - `useOfflineSync`: Handles persistence, sync queue, and server synchronization
  - `useUndoRedo`: Manages history state for undo/redo operations

- **Mock Server**: MSW (Mock Service Worker) provides a mock API server for development and testing, supporting all CRUD operations with configurable delays and failure rates.

- **Performance**: React-window is used for virtualizing long lists, and React.memo, useCallback, and useMemo are strategically applied to minimize re-renders.

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building

Build for production:
```bash
npm run build
```

### Testing

Run unit and integration tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

Run end-to-end tests:
```bash
npm run e2e
```

### Linting

Check code quality:
```bash
npm run lint
```

### Seeding Data

Generate 500+ cards for performance testing. The seeding script needs to run in the browser:

1. Start the development server: `npm run dev`
2. Open the browser console
3. Import and run the seeding function:
   ```javascript
   import { seedData } from './scripts/seedData.browser.js'
   seedData()
   ```

Alternatively, you can add a temporary button in the UI to trigger seeding during development.

## Project Structure

```
src/
├── components/          # React components
│   ├── Board.jsx
│   ├── ListColumn.jsx
│   ├── Card.jsx
│   ├── CardDetailModal.jsx
│   ├── Header.jsx
│   ├── Toolbar.jsx
│   ├── ConfirmDialog.jsx
│   └── InlineEditor.jsx
├── context/            # State management
│   ├── BoardProvider.jsx
│   └── boardReducer.js
├── hooks/              # Custom hooks
│   ├── useBoardState.js
│   ├── useOfflineSync.js
│   └── useUndoRedo.js
├── services/           # API and storage
│   ├── api.js
│   └── storage.js
├── utils/              # Utilities
│   ├── validators.js
│   └── helpers.js
├── styles/             # CSS files
│   ├── global.css
│   └── components.css
├── mocks/              # MSW handlers
│   ├── handlers.js
│   └── browser.js
└── App.jsx
```

## Keyboard Shortcuts

- **Enter/Space**: Activate focused element
- **Escape**: Close modals, cancel editing
- **Ctrl+Delete/Backspace**: Delete card (when focused)
- **Ctrl+Enter**: Save card in detail modal

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

Requires IndexedDB support for offline functionality.

## License

This project is created for educational purposes.

