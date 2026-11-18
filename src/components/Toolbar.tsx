import {
  Plus,
  Save,
  FilePlus,
  Presentation,
  Video,
  ZoomIn,
  ZoomOut,
  Maximize,
} from 'lucide-react'
import { useMindMapStore } from '../store/useMindMapStore'
import { useReactFlow } from '@xyflow/react'
import { cn } from '../lib/utils'

export function Toolbar() {
  const {
    title,
    setTitle,
    addNode,
    selectedNodeId,
    saveDocument,
    createNewDocument,
    setPresentationMode,
    isPresentationMode,
  } = useMindMapStore()
  const { zoomIn, zoomOut, fitView } = useReactFlow()

  return (
    <div className="absolute left-4 top-4 z-20 flex flex-col gap-3">
      <div className="rounded-xl border border-slate-700/80 bg-slate-900/90 px-4 py-2 shadow-xl backdrop-blur">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-transparent text-sm font-semibold text-white outline-none placeholder:text-slate-500"
          placeholder="Mind map title..."
        />
      </div>

      <div className="flex flex-col gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900/90 p-2 shadow-xl backdrop-blur">
        <button
          onClick={() => addNode()}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
          title="Add floating node"
        >
          <Plus className="h-4 w-4" />
          Add Node
        </button>

        <button
          onClick={() => saveDocument()}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
        >
          <Save className="h-4 w-4" />
          Save Local
        </button>

        <button
          onClick={() => createNewDocument()}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
        >
          <FilePlus className="h-4 w-4" />
          New Map
        </button>

        <div className="my-1 h-px bg-slate-700" />

        <button
          onClick={() => setPresentationMode(true)}
          className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-2 text-sm',
            isPresentationMode
              ? 'bg-violet-600 text-white'
              : 'text-slate-200 hover:bg-slate-800'
          )}
        >
          <Presentation className="h-4 w-4" />
          Present
        </button>

        <button
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
          title="Use Present mode then Record Video"
        >
          <Video className="h-4 w-4" />
          Export Video
        </button>
      </div>

      <div className="flex gap-1 rounded-xl border border-slate-700/80 bg-slate-900/90 p-1.5 shadow-xl backdrop-blur">
        <button onClick={() => zoomIn()} className="rounded-lg p-2 text-slate-300 hover:bg-slate-800">
          <ZoomIn className="h-4 w-4" />
        </button>
        <button onClick={() => zoomOut()} className="rounded-lg p-2 text-slate-300 hover:bg-slate-800">
          <ZoomOut className="h-4 w-4" />
        </button>
        <button onClick={() => fitView({ padding: 0.2 })} className="rounded-lg p-2 text-slate-300 hover:bg-slate-800">
          <Maximize className="h-4 w-4" />
        </button>
      </div>

      {selectedNodeId && (
        <div className="rounded-xl border border-blue-500/40 bg-slate-900/90 px-3 py-2 text-xs text-blue-300 shadow-xl">
          Node selected — open panel →
        </div>
      )}
    </div>
  )
}
