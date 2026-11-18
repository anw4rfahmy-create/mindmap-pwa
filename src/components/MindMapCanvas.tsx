import { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type NodeTypes,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { CustomNode } from './CustomNode'
import { Toolbar } from './Toolbar'
import { SidePanel } from './SidePanel'
import { PresentationMode } from './PresentationMode'
import { useMindMapStore } from '../store/useMindMapStore'

const nodeTypes: NodeTypes = {
  mindNode: CustomNode,
}

export function MindMapCanvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNode,
  } = useMindMapStore()

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: any) => {
      setSelectedNode(node.id)
    },
    [setSelectedNode]
  )

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [setSelectedNode])

  const proOptions = useMemo(() => ({ hideAttribution: true }), [])

  return (
    <div className="h-full w-full bg-slate-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.15}
        maxZoom={2.5}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { stroke: '#475569', strokeWidth: 2 },
        }}
        proOptions={proOptions}
        className="bg-slate-950"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="#1e293b"
        />
        <Controls
          showInteractive={false}
          className="!bg-slate-900 !border-slate-700 !shadow-xl [&>button]:!bg-slate-800 [&>button]:!border-slate-600 [&>button]:!text-slate-300"
        />
        <MiniMap
          nodeColor={(n) => (n.data as any)?.color || '#3b82f6'}
          maskColor="rgb(15 23 42 / 0.8)"
          className="!bg-slate-900 !border-slate-700"
        />

        <Toolbar />
        <SidePanel />
        <PresentationMode />
      </ReactFlow>
    </div>
  )
}
