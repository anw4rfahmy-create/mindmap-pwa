import { useRef } from 'react'
import { X, Paperclip, Link2, FileText, Trash2, Image as ImageIcon } from 'lucide-react'
import { useMindMapStore } from '../store/useMindMapStore'
import { formatBytes, cn } from '../lib/utils'
import { saveBlob } from '../lib/db'
import type { Attachment } from '../lib/types'

export function SidePanel() {
  const {
    selectedNodeId,
    nodes,
    setSelectedNode,
    addAttachment,
    removeAttachment,
    updateNodeData,
  } = useMindMapStore()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const node = nodes.find((n) => n.id === selectedNodeId)

  if (!selectedNodeId || !node) return null

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return

    for (const file of Array.from(files)) {
      const blobId = await saveBlob(file)
      const url = URL.createObjectURL(file)

      let type: Attachment['type'] = 'file'
      if (file.type.startsWith('image/')) type = 'image'
      else if (file.type.startsWith('audio/')) type = 'audio'
      else if (file.type.startsWith('video/')) type = 'video'

      addAttachment(selectedNodeId, {
        type,
        name: file.name,
        url,
        blobId,
        size: file.size,
        mimeType: file.type,
      })
    }
    e.target.value = ''
  }

  const handleAddLink = () => {
    const url = prompt('Enter URL:')
    if (!url) return
    const name = prompt('Display name (optional):') || url
    addAttachment(selectedNodeId, { type: 'link', name, url })
  }

  return (
    <div className="absolute right-4 top-4 z-20 flex w-80 flex-col gap-3">
      <div className="rounded-xl border border-slate-700/80 bg-slate-900/95 shadow-2xl backdrop-blur">
        <div className="flex items-center justify-between border-b border-slate-700/80 px-4 py-3">
          <div className="truncate text-sm font-semibold text-white">{node.data.label}</div>
          <button
            onClick={() => setSelectedNode(null)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-slate-700/80 px-4 py-3">
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">Color</div>
          <div className="flex flex-wrap gap-2">
            {['#3b82f6','#8b5cf6','#ec4899','#f43f5e','#f97316','#eab308','#22c55e','#14b8a6','#06b6d4','#64748b'].map((c) => (
              <button
                key={c}
                onClick={() => updateNodeData(selectedNodeId, { color: c })}
                className={cn(
                  'h-6 w-6 rounded-full border-2 transition',
                  node.data.color === c ? 'border-white scale-110' : 'border-transparent'
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="border-b border-slate-700/80 px-4 py-3">
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">Notes</div>
          <textarea
            value={node.data.notes || ''}
            onChange={(e) => updateNodeData(selectedNodeId, { notes: e.target.value })}
            placeholder="Add notes for this topic..."
            rows={3}
            className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-blue-500"
          />
        </div>

        <div className="px-4 py-3">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs font-medium uppercase tracking-wider text-slate-500">Attachments</div>
            <div className="flex gap-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg bg-slate-800 p-1.5 text-slate-300 hover:bg-slate-700 hover:text-white"
                title="Upload file / image"
              >
                <Paperclip className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleAddLink}
                className="rounded-lg bg-slate-800 p-1.5 text-slate-300 hover:bg-slate-700 hover:text-white"
                title="Add link"
              >
                <Link2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
            className="hidden"
            onChange={handleFileSelect}
          />

          {node.data.attachments.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-700 py-6 text-center text-xs text-slate-500">
              No attachments yet
            </div>
          ) : (
            <ul className="space-y-2 max-h-64 overflow-y-auto">
              {node.data.attachments.map((att) => (
                <li
                  key={att.id}
                  className="group flex items-start gap-2 rounded-lg border border-slate-700/60 bg-slate-800/50 p-2"
                >
                  <div className="mt-0.5 shrink-0 text-slate-400">
                    {att.type === 'image' ? (
                      <ImageIcon className="h-4 w-4" />
                    ) : att.type === 'link' ? (
                      <Link2 className="h-4 w-4" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate text-xs font-medium text-blue-400 hover:underline"
                    >
                      {att.name}
                    </a>
                    {att.size && (
                      <div className="text-[10px] text-slate-500">{formatBytes(att.size)}</div>
                    )}
                    {att.type === 'image' && (
                      <img src={att.url} alt={att.name} className="mt-1 max-h-24 rounded object-cover" />
                    )}
                  </div>
                  <button
                    onClick={() => removeAttachment(selectedNodeId, att.id)}
                    className="shrink-0 rounded p-1 text-slate-500 opacity-0 hover:bg-rose-500/20 hover:text-rose-400 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
