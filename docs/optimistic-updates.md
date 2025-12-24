# Optimistic Updates

## Full Sequence of Events

Optimistic updates provide instant user feedback by updating the UI immediately, then synchronizing with the server in the background. This creates a responsive user experience even with network latency.

### User Action → Immediate UI Update

When a user performs an action (e.g., adding a card), the sequence begins:

1. **User Interaction**: User clicks "Add a card" and enters a title in `ListColumn.jsx` (line 36-44)
2. **Immediate Dispatch**: The `handleAddCard` callback dispatches `ADD_CARD` action to the reducer
3. **State Update**: The reducer (`boardReducer.js:ADD_CARD`, lines 58-72) immediately adds the card to state
4. **UI Re-render**: React re-renders all components consuming the board state, showing the new card instantly

### Local Queueing

After the UI update, the operation is queued for server synchronization:

1. **IndexedDB Persistence**: The card is saved to IndexedDB via `storage.saveCard()` in `Board.jsx:handleAddCard` (lines 200-210)
2. **Sync Queue**: If offline, the operation is added to the sync queue via `useOfflineSync.js:queueAction` (lines 95-107)
3. **Optimistic State**: The UI shows the card as if the server operation succeeded

### Server Sync

Background synchronization occurs through `useOfflineSync.js:syncWithServer` (lines 30-93):

1. **Online Check**: The hook checks if the browser is online (`isOnlineRef.current`)
2. **Fetch Server State**: Retrieves current server state via `api.fetchLists()` and `api.fetchCards()`
3. **Process Queue**: Iterates through the sync queue, sending each operation to the server
4. **Conflict Detection**: Compares local and server `lastModifiedAt` timestamps to detect conflicts
5. **Merge Logic**: If server version is newer, performs three-way merge using `mergeObjects()` helper

### Success/Failure Handling

**On Success** (`useOfflineSync.js:syncWithServer`, lines 85-87):
- Dispatch `SYNC_SUCCESS` action
- Clear sync queue
- Update `lastSyncTime` timestamp
- UI remains in optimistic state (no changes needed)

**On Failure** (`useOfflineSync.js:syncWithServer`, lines 88-91):
- Dispatch `SYNC_FAILURE` action
- Keep operation in sync queue for retry
- Log error to console
- UI remains in optimistic state (user doesn't see error unless they go offline)

### Reconnection Handling

The application listens for online/offline events (`useOfflineSync.js`, lines 109-125):

- **Online Event**: When browser comes online, immediately triggers `syncWithServer()`
- **Periodic Sync**: Runs `syncWithServer()` every 30 seconds while online
- **Automatic Retry**: Failed operations in the queue are retried on each sync attempt

### Personal Debugging Anecdote

I initially implemented optimistic updates without proper error handling. When the mock server was configured with a high failure rate, cards would appear in the UI but disappear after refresh because the server sync failed and the local state wasn't properly maintained. I fixed this by ensuring IndexedDB saves happen immediately (not just on successful sync) and by maintaining the sync queue even after failures. The key insight was separating "UI state" (optimistic) from "persistent state" (IndexedDB), ensuring data survives even if server sync fails.

