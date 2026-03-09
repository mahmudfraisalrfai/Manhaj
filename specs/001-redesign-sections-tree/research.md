# Research: React Flow Integration for Sections Tree

## Decision: React Flow (@xyflow/react)

### Rationale
- **Custom Nodes**: Allows us to keep the exact aesthetic (glassmorphism/icons/badges) requested.
- **Interactivity**: Built-in viewport controls (Zoom/Pan) satisfy navigation requirements for deep trees.
- **Performance**: Virtualized rendering handles large trees efficiently.
- **Ecosystem**: Large community and clear documentation for hierarchical layouts.

### Alternatives Considered
- **D3-Tree**: Rejected because customizing the node UI with React components is significantly more complex.
- **Vanilla SVG**: Rejected due to high development overhead for pan/zoom and layout logic.

## Layout Strategy: Dagre or Flex Tree

### Decision: Dagre (Vertical)
- **Rationale**: Dagre is the standard for auto-positioning nodes in React Flow to create hierarchical trees. It will handle the vertical spacing and centering of the "Top-to-Bottom" layout automatically.

## State Management: Local + Sync

### Decision: React Flow State + Expansion Map
- **Rationale**: Maintain the current `expanded` state (list of IDs) from `page.tsx`. Filter the nodes/edges injected into React Flow based on this map.

## Best Practices
- **Custom Node Type**: Create a single `SectionNode` type that handles all visual states (Root, Parent, Leaf).
- **Memoization**: Ensure `SectionNode` and its dependencies are memoized to prevent re-renders during pan/zoom.
- **Edge Styling**: Use smooth step or bezier edges with blue-200 color-to-gradient matching the site's theme.
