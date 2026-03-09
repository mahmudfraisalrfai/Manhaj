# Data Model: Sections Tree Nodes & Edges

## Entities

### Section (Current Prisma Model)
- **id**: string (UUID)
- **name**: string
- **description**: string?
- **parentSectionId**: string? (Relationship: Self-referential)
- **icon**: string?
- **_count**: { tasks: number, children: number }

## Visual Mapping (React Flow)

### Node
- **id**: Matching `Section.id`
- **type**: 'sectionNode' (Custom type)
- **data**:
    - `label`: `Section.name`
    - `description`: `Section.description`
    - `icon`: `Section.icon`
    - `isRoot`: `parentSectionId === null`
    - `childCount`: `_count.children`
    - `taskCount`: `_count.tasks`
    - `isExpanded`: Boolean (Controlled by global `expanded` state)
- **position**: Calculated by `dagre` (x, y)

### Edge
- **id**: `e-${parentId}-${childId}`
- **source**: `parentId`
- **target**: `childId`
- **type**: 'smoothstep'
- **style**: { stroke: '#93C5FD' } (blue-300)

## Implementation Logic
1. **Fetch**: Call `/api/sections/tree` to get the recursive JSON structure.
2. **Flatten**: Recursively convert the nested JSON into an array of `Nodes` and `Edges`.
3. **Layout**: Apply `dagre` positioning to the flattened array.
4. **Render**: Inject into `ReactFlow` component.
