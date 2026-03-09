# Tasks: Redesign Sections Tree View

**Input**: Design documents from `/specs/001-redesign-sections-tree/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `-[ ] [ID] [P] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependencies

- [x] T001 Install React Flow and dagre dependencies: `npm install @xyflow/react dagre @types/dagre`
- [x] T002 [P] Create components directory: `src/app/teacher/sections/components/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core logic and utilities for node positioning

- [x] T003 [P] Implement tree transformation utilities in `src/lib/utils/tree-utils.ts`
- [x] T004 Implement layout calculation logic (dagre) in `src/lib/utils/tree-utils.ts`
- [x] T005 Define custom node type and basic styling in `src/app/teacher/sections/components/GraphNode.tsx`

---

## Phase 3: User Story 1 - View Sections as a Graph (Priority: P1) 🎯 MVP

**Goal**: Render the hierarchical section tree vertically using React Flow

**Independent Test**: Navigate to `/teacher/sections`. Verify top-level sections appear as root nodes and children are connected visually.

### Implementation for User Story 1

- [x] T006 [P] [US1] Finalize `src/app/teacher/sections/components/GraphNode.tsx` with name, icons, and stats display
- [x] T007 [P] [US1] Create basic edge styling in `src/app/teacher/sections/components/GraphEdge.tsx`
- [x] T008 [US1] Create `src/app/teacher/sections/components/SectionsGraph.tsx` as the main React Flow container
- [x] T009 [US1] Integrate `SectionsGraph` into `src/app/teacher/sections/page.tsx`, replacing the old list view
- [x] T010 [US1] Verify data fetching and graph rendering parity with previous list data

**Checkpoint**: User Story 1 functional - basic graph visualization is live.

---

## Phase 4: User Story 2 - Expand/Collapse Branches (Priority: P1)

**Goal**: Toggle sub-section visibility via buttons on nodes

**Independent Test**: Click the expand button on a parent node. Verify children appear/disappear smoothly.

### Implementation for User Story 2

- [x] T011 [US2] Update `GraphNode.tsx` to include the expand/collapse toggle button
- [x] T012 [US2] Implement state-driven node filtering in `SectionsGraph.tsx` based on the expansion map
- [x] T013 [US2] Add layout re-calculation (dagre) on expansion state changes for smooth transitions

**Checkpoint**: User Story 2 functional - branches can be toggled without page reload.

---

## Phase 5: User Story 3 - Maintain Action Functionality (Priority: P2)

**Goal**: Perform CRUD actions (View, Add, Delete) directly from the graph nodes

**Independent Test**: Add a sub-section from a node. Verify redirection and that the new node appears correctly on return.

### Implementation for User Story 3

- [x] T014 [US3] Add "Add Sub-section" button with redirection logic to `GraphNode.tsx`
- [x] T015 [US3] Add "Delete" button with confirmation modal logic to `GraphNode.tsx`
- [x] T016 [US3] Ensure clicking the node body navigates to the section's tasks page
- [x] T017 [US3] Verify that stats (tasks/children counts) in nodes match database values

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Responsiveness and final UI/UX refinements

- [x] T018 [P] Implement glassmorphism and premium gradients in `GraphNode.tsx` and `GraphEdge.tsx`
- [x] T019 Configure responsive viewport (fitView) and zoom limits in `SectionsGraph.tsx`
- [x] T020 [P] Documentation updates in `quickstart.md`
- [x] T021 Manual verification across browser sizes (Desktop, Tablet, Mobile)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Must complete T001 first.
- **Foundational (Phase 2)**: Depends on T002 completion.
- **User Stories (Phase 3-5)**: All depend on T003-T005 completion.
- **Polish (Phase N)**: Depends on all user stories being functionally complete.

### Parallel Opportunities

- T003 and T005 can start simultaneously.
- T006 and T007 (US1 visual components) can be worked on in parallel.
- US3 actions (T014, T015) can be implemented independently within the node component once US1 is done.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Setup environment and tree utilities (T001-T004).
2. Build the graph wrapper and basic node (T005, T008).
3. Connect real data and verify rendering (T009, T010).

---

## Notes

- [P] tasks = different logic blocks, minimal conflict risk
- [Story] label ensures traceability to spec.md
- Use React Flow v12 (@xyflow/react) for best Next.js compatibility.
