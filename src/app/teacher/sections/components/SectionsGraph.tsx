'use client';

import React, { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    ReactFlow,
    Controls,
    Background,
    MiniMap,
    Node,
    Edge,
    MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import GraphNode from './GraphNode';
import GraphEdge from './GraphEdge';
import { getLayoutedElements } from '@/lib/utils/tree-utils';

interface Section {
    id: string;
    name: string;
    description?: string | null;
    parentSectionId: string | null;
    icon?: string | null;
    _count: {
        tasks: number;
        children: number;
    };
    children?: Section[];
}

const nodeTypes = {
    sectionNode: GraphNode,
};

const edgeTypes = {
    sectionEdge: GraphEdge,
};

interface SectionsGraphProps {
    sections: Section[];
    expandedMap: string[];
    onExpandToggle: (id: string, expanded: boolean) => void;
    onDeleteRequest: (id: string) => void;
}

export default function SectionsGraph({
    sections,
    expandedMap,
    onExpandToggle,
    onDeleteRequest,
}: SectionsGraphProps) {
    const router = useRouter();

    // Transform hierarchical data into flat React Flow nodes/edges
    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
        const flatNodes: Node[] = [];
        const flatEdges: Edge[] = [];

        const traverse = (nodeData: Section, isRoot: boolean) => {
            // Create Node
            flatNodes.push({
                id: nodeData.id,
                type: 'sectionNode',
                data: {
                    id: nodeData.id,
                    name: nodeData.name,
                    description: nodeData.description,
                    icon: nodeData.icon,
                    isRoot,
                    childCount: nodeData._count?.children || 0,
                    taskCount: nodeData._count?.tasks || 0,
                    isExpanded: expandedMap.includes(nodeData.id),
                    onExpandToggle,
                    onDeleteRequest,
                },
                position: { x: 0, y: 0 }, // Dagre will overwrite this
            });

            // If it has children and is expanded, process them and create edges
            if (nodeData.children && expandedMap.includes(nodeData.id)) {
                nodeData.children.forEach((child) => {
                    // Create Edge
                    flatEdges.push({
                        id: `e-${nodeData.id}-${child.id}`,
                        source: nodeData.id,
                        target: child.id,
                        type: 'sectionEdge',
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            color: '#93C5FD',
                        },
                    });

                    traverse(child, false);
                });
            }
        };

        sections.forEach((rootSection) => traverse(rootSection, true));

        return getLayoutedElements(flatNodes, flatEdges, 'TB');
    }, [sections, expandedMap, onExpandToggle, onDeleteRequest]);

    if (!initialNodes || initialNodes.length === 0) {
        return null;
    }

    return (
        <div style={{ width: '100%', height: '70vh', minHeight: '600px' }} className="rounded-2xl overflow-hidden border border-gray-100 shadow-inner bg-gray-50/50">
            <ReactFlow
                nodes={initialNodes}
                edges={initialEdges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                minZoom={0.2}
                maxZoom={1.5}
                nodesDraggable={false} // Disable dragging to keep the clean tree layout
                nodesConnectable={false}
                elementsSelectable={false}
                onNodeClick={(_, node) => router.push(`/teacher/sections/${node.id}`)}
            >
                <Background gap={24} size={2} color="#E2E8F0" />
                <Controls showInteractive={false} className="bg-white rounded-xl shadow-md border-gray-100" />
                <MiniMap
                    nodeColor={(n) => {
                        if (n.data.isRoot) return '#3B82F6';
                        if (n.data.childCount && (n.data.childCount as number) > 0) return '#EAB308';
                        return '#22C55E';
                    }}
                    className="rounded-xl overflow-hidden shadow-md border-gray-100"
                />
            </ReactFlow>
        </div>
    );
}
