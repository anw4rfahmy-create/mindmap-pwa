import { memo, useState, useCallback } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Paperclip, Plus, Trash2 } from 'lucide-react'
import type { MindNodeData } from '../lib/types'
import { cn } from '../lib/utils'
import { useMindMapStore } from '../store/useMindMapStore'

function CustomNodeComponent({ id, data, selected }: NodeProps & { data: MindNodeData }) {
  const [isEditing, setIsEditing] = useState(false)
  const [label, setLabel] = useState(data.label)
  const updateNodeLabel = useMindMapStore((s) => s.updateNodeLabel)
  const setSelectedNode = useMindMapStore((s) => s.setSelectedNode)
  const addNode = useMindMapStore((s) => s.addNode)
  const deleteNode = useMindMapStore((s) => s.deleteNode)

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true)
  }, [])

  const handleBlur = useCallback(() => {
    setIsEditing(false)
    if (label.trim()) {
      updateNodeLabel(id, label.trim())
    } else {
      setLabel(data.label)
    }
  }, [id, label, data.label, updateNodeLabel])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleBlur()
      if (e.key === 'Escape') {
        setLabel(data.label)
        setIsEditing(false)
      }
    },
    [handleBlur, data.label]
  )

  const attachmentCount = data.attachments?.length ?? 0

  return (
    <div
      className={cn(
        'group relative min-w-[160px] max-w-[280px] rounded-xl border-2 bg-slate-900/95 shadow-lg backdrop-blur transition-all',
        selected
          ? 'border-blue-400 shadow-blue-500/30 scale-105'
          : 'border-slate-700 hover:border-slate-500',
        data.isRoot && 'border-blue-500/60'
      )}
      style={{
        borderColor: selected ? undefined : data.color,
        boxShadow: selected
          ? undefined
          : `0 0 0 1px ${data.color}33, 0 4px 20px -4px ${data.color}44`,
      }}
      onClick={() => setSelectedNode(id)}
    >
      <div
        className="absolute left-0 top-0 h-full w-1.5 rounded-l-xl"
        style={{ backgroundColor: data.color || '#3b82f6' }}
      />

      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border-2 !border-slate-900 !bg-slate-400"
      />

      <div className="px-4 py-3 pl-5">
        {isEditing ? (
          <input
            autoFocus
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full rounded bg-slate-800 px-2 py-1 text-sm text-white outline-none ring-2 ring-blue-500"
          />
        ) : (
          <div
            className="cursor-text text-sm font-medium text-slate-100 leading-snug"
            onDoubleClick={handleDoubleClick}
          >
            {data.label}
          </div>
        )}

        {attachmentCount > 0 && (
          <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
            <Paperclip className="h-3 w-3" />
            <span>{attachmentCount} attachment{attachmentCount > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      <div className={cn('absolute -right-2 -top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100')}>
        <button
          onClick={(e) => {
            e.stopPropagation()
            addNode(id)
          }}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white shadow hover:bg-blue-500"
          title="Add child"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        {!data.isRoot && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              deleteNode(id)
            }}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white shadow hover:bg-rose-500"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !border-2 !border-slate-900 !bg-slate-400"
      />
    </div>
  )
}

export const CustomNode = memo(CustomNodeComponent)
