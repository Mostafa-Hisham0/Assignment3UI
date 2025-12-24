# Architecture Choices

## System Design and Component Hierarchy

The Kanban board application follows a component-based architecture with centralized state management. The overall system design prioritizes maintainability, performance, and offline functionality.

### Component Hierarchy

The application structure follows a clear hierarchy:
- **App.jsx** (root) → **BoardProvider** → **Header, Toolbar, Board** → **ListColumn** → **Card**

This hierarchy ensures unidirectional data flow, with state managed at the top level through the BoardProvider context. Each component receives only the data and callbacks it needs, following the principle of prop drilling minimization.

### State Ownership

All board data (lists and cards) is owned by the `BoardProvider` component, which uses `useReducer` for state management. The reducer (`boardReducer.js`) handles all state mutations through well-defined actions. This centralized approach ensures:

1. **Single source of truth**: All components read from the same state
2. **Predictable updates**: All state changes go through the reducer
3. **Easy debugging**: State changes are traceable through action types

The state structure includes:
- `lists`: Array of list objects
- `cards`: Array of card objects
- `history`: Array of previous states for undo/redo
- `historyIndex`: Current position in history
- `syncQueue`: Pending operations to sync with server
- `lastSyncTime`: Timestamp of last successful sync

### Data Flow

Data flows unidirectionally:
1. User interaction → Component event handler
2. Event handler → Reducer action dispatch
3. Reducer → State update
4. State update → Context provider re-render
5. Context update → Consumer components re-render

For example, when adding a card (see `Board.jsx:handleAddCard`):
- User clicks "Add a card" button in `ListColumn.jsx`
- `ListColumn` calls `onAddCard` prop
- `Board` component's `handleAddCard` dispatches `ADD_CARD` action
- Reducer updates state and saves to IndexedDB
- All components consuming board state re-render with new card

### Folder Structure Reasoning

The folder structure (`src/components/`, `src/context/`, `src/hooks/`, etc.) was chosen to:

1. **Separate concerns**: Components, state logic, and utilities are clearly separated
2. **Enable code splitting**: Related files are grouped, making lazy loading easier
3. **Improve maintainability**: Developers can quickly locate files by their purpose
4. **Support testing**: Test files mirror the source structure (`__tests__` folders)

### Personal Debugging Anecdote

During development, I encountered an issue where card moves weren't persisting after page refresh. The problem was in `Board.jsx:handleDragEnd` - the drag operation updated the reducer state but didn't immediately save to IndexedDB. I added explicit `storage.saveCard()` calls after each drag operation (lines 145-150), which resolved the persistence issue. This taught me the importance of explicitly handling side effects (like persistence) rather than relying solely on useEffect hooks.

