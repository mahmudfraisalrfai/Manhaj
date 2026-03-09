# Quickstart: Sections Tree Redesign

## Setup

1. **Install Dependencies**:
   ```bash
   npm install @xyflow/react dagre @types/dagre
   ```

2. **Components Implemented**:
   - `src/app/teacher/sections/components/SectionsGraph.tsx`: Wrapper and layout logic mapping recursive children to a flattened graph array.
   - `src/app/teacher/sections/components/GraphNode.tsx`: The visual custom node for each section, rendering expand/collapse icons and CRUD actions.
   - `src/app/teacher/sections/components/GraphEdge.tsx`: The custom smoothstep edge used for connections.
   - `src/lib/utils/tree-utils.ts`: The `dagre` calculation hook that shifts tree x/y positions based on the `TB` (top-to-bottom) setting.

3. **Key Logical Steps**:
   - The tree layout is automatically recalculated whenever `expandedMap` changes in the `SectionsGraph` component.
   - The `onExpandToggle` function in `page.tsx` was converted to `useCallback` to prevent unnecessary re-renders when panning around the canvas.

## Running the New View
The new view automatically replaces the old list view in `page.tsx`. Navigate to `/teacher/sections` to see the new layout.
