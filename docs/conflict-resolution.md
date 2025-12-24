# Conflict Resolution Approach

## Three-Way Merge Method

The application implements a three-way merge strategy to resolve conflicts between local offline changes and server updates. This approach compares three versions of each entity (list or card):

1. **Base Version**: The last known common version (before local changes)
2. **Local Version**: The current local state (with offline modifications)
3. **Server Version**: The current server state (with remote modifications)

### Merge Logic Implementation

The merge logic is implemented in `utils/helpers.js:mergeObjects` (lines 28-50). The function:

1. **Starts with Server**: Creates a merged object initialized with server values
2. **Applies Local Changes**: Iterates through local object properties
3. **Property-Level Comparison**: For each property:
   - If it's a nested object, recursively merges
   - If it's an array, checks if local differs from base (if so, uses local)
   - If it's a primitive, uses local value if it differs from both base and server
4. **Returns Merged Result**: The final merged object combining server and local changes

### Conflict Detection

Conflicts are detected in `useOfflineSync.js:syncWithServer` (lines 60-75):

```javascript
if (new Date(serverList.lastModifiedAt) > new Date(localList.lastModifiedAt)) {
  const baseList = { ...localList, version: (localList.version || 1) - 1 }
  return mergeObjects(baseList, localList, serverList)
}
```

The system compares `lastModifiedAt` timestamps:
- If server is newer → merge is needed
- If local is newer → keep local (no merge)
- If equal → no conflict

### Merge Resolution UI

When automatic merge fails or conflicts are too complex, the `ConflictResolutionModal` component (`components/ConflictResolutionModal.jsx`) provides manual resolution:

1. **Displays Both Versions**: Shows local and server versions side-by-side (lines 30-45)
2. **User Choice**: Offers three options:
   - **Keep Local**: Use the local version entirely
   - **Keep Server**: Use the server version entirely
   - **Merge (Auto)**: Attempt automatic merge again
3. **Resolution Action**: User's choice is applied via `onResolve` callback (line 20)

The modal is triggered when:
- Automatic merge produces invalid data
- Merge conflicts on critical fields (like IDs)
- User explicitly requests manual resolution

### Version Tracking

Each list and card maintains a `version` field that increments on each modification:
- Local changes increment version: `version: (currentVersion || 1) + 1`
- Server sync increments version: `version: (version || 0) + 1`
- Base version for merge: `version: (currentVersion || 1) - 1`

This versioning helps identify which changes are "newer" and should take precedence.

### Edge Cases Handled

1. **Concurrent Deletes**: If an item is deleted locally but modified on server, the merge keeps the server version
2. **New Items**: Items created offline are always kept (they don't exist on server)
3. **Array Conflicts**: Tag arrays use local version if they differ from base (line 40 in `helpers.js`)
4. **Nested Objects**: Recursive merging handles complex nested structures

### Personal Debugging Anecdote

During testing, I discovered that moving a card between lists while offline, then having another user delete the target list on the server, caused a merge failure. The card's `listId` pointed to a non-existent list. I fixed this by adding validation in the merge logic (`helpers.js:mergeObjects`, lines 32-34) that checks if referenced entities exist before merging. If a referenced list/card is missing, the merge falls back to manual resolution UI.

