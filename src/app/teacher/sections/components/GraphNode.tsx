import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { PlusIcon, TrashIcon, FolderIcon, BookIcon, FolderOpenIcon, TargetIcon, ChevronDownIcon, ChevronRightIcon } from '@/components/ui/Icon';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SectionNodeData {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    isRoot: boolean;
    childCount: number;
    taskCount: number;
    isExpanded: boolean;
    onExpandToggle: (id: string, expanded: boolean) => void;
    onDeleteRequest: (id: string) => void;
}

export default function GraphNode({ data }: { data: SectionNodeData }) {
    const { id, name, description, icon, isRoot, childCount, taskCount, isExpanded, onExpandToggle, onDeleteRequest } = data;
    const hasChildren = childCount > 0;
    const router = useRouter()
    return (
        <div
            onClick={() => router.push(`/teacher/sections/${id}`)}
            className={`nodrag nopan group cursor-pointer relative flex w-[320px] rounded-2xl border-2 transition-all duration-300 shadow-sm
      ${isRoot
                    ? "bg-gradient-to-r from-blue-50 to-blue-25 border-blue-200 hover:border-blue-400 hover:shadow-md"
                    : "bg-white border-gray-100 hover:border-blue-300 hover:shadow-md"
                }`}
        >
            <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-blue-300 !border-2 !border-white" />

            <div className="flex w-full p-4 items-start gap-3">
                {/* Expand Toggle */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onExpandToggle(id, !isExpanded);
                    }}
                    className={`p-1.5 rounded-lg transition-all duration-200 flex-shrink-0 
            ${!hasChildren ? "invisible" : "hover:bg-white"} 
            ${isExpanded ? "bg-white shadow-sm" : "bg-gray-50"}`}
                >
                    {hasChildren ? (
                        isExpanded ? (
                            <ChevronDownIcon className="w-5 h-5 text-blue-600" />
                        ) : (
                            <ChevronRightIcon className="w-5 h-5 text-blue-600" />
                        )
                    ) : (
                        <div className="w-5 h-5" />
                    )}
                </button>

                {/* Icon */}
                <div className="flex-shrink-0 relative">
                    {icon ? (
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md relative">
                            <img src={icon} alt={name} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className={`w-12 h-12 rounded-full shadow-sm flex items-center justify-center 
              ${isRoot
                                ? "bg-gradient-to-br from-blue-500 to-blue-600"
                                : hasChildren
                                    ? "bg-gradient-to-br from-yellow-500 to-yellow-600"
                                    : "bg-gradient-to-br from-green-500 to-green-600"
                            }`}
                        >
                            {hasChildren ? (
                                isExpanded ? <FolderOpenIcon className="w-6 h-6 text-white" /> : <FolderIcon className="w-6 h-6 text-white" />
                            ) : (
                                <BookIcon className="w-6 h-6 text-white" />
                            )}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col mb-1">
                        <span
                            className={`font-bold group-hover:text-blue-600 transition-colors text-base truncate block
                ${isRoot ? "text-gray-900" : "text-gray-800"}`}
                            title={name}
                        >
                            {name}
                        </span>
                        {isRoot && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-full font-medium self-start mt-0.5">
                                جذر
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {childCount > 0 && (
                            <span className="flex items-center gap-1 text-[10px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded-full border border-gray-100">
                                <FolderIcon className="w-3 h-3 text-yellow-500" />
                                {childCount} فرع
                            </span>
                        )}
                        {taskCount > 0 && (
                            <span className="flex items-center gap-1 text-[10px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded-full border border-gray-100">
                                <TargetIcon className="w-3 h-3 text-green-500" />
                                {taskCount} مهمة
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1 self-start">
                    <Link
                        href={`/teacher/sections/add?parent=${id}`}
                        className="p-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                        title="إضافة فرع جديد"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <PlusIcon className="w-4 h-4" />
                    </Link>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeleteRequest(id);
                        }}
                        className="p-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                        title="حذف القسم"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-blue-300 !border-2 !border-white" />
        </div>
    );
}
