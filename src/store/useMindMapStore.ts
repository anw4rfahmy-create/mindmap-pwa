import { create } from 'zustand'
import {
  applyNodeChanges,
  applyEdgeChanges,
  type OnNodesChange,
  type OnEdgesChange,
  type Connection,
  addEdge,
} from '@xyflow/react'
import type { MindNode, MindEdge, MindNodeData, Attachment, MindMapDocument } from '../lib/types'
import { generateId, NODE_COLORS } from '../lib/utils'
import { db } from '../lib/db'

interface MindMapState {
  documentId: string
  title: string
  nodes: MindNode[]
  edges: MindEdge[]
  selectedNodeId: string | null
  isPresentationMode: boolean
  isRecording: boolean
  setTitle: (title: string) => void
  onNodesChange: OnNodesChange<MindNode>
  onEdgesChange: OnEdgesChange
  onConnect: (connection: Connection) => void
  addNode: (parentId?: string, position?: { x: number; y: number }) => void
  updateNodeLabel: (nodeId: string, label: string) => void
  updateNodeData: (nodeId: string, data: Partial<MindNodeData>) => void
  deleteNode: (nodeId: string) => void
  setSelectedNode: (id: string | null) => void
  addAttachment: (nodeId: string, attachment: Omit<Attachment, 'id' | 'createdAt'>) => void
  removeAttachment: (nodeId: string, attachmentId: string) => void
  setPresentationMode: (on: boolean) => void
  setIsRecording: (on: boolean) => void
  saveDocument: () => Promise<void>
  loadDocument: (id: string) => Promise<void>
  createNewDocument: () => void
  getPresentationSteps: () => { nodeId: string; title: string; attachments: Attachment[] }[]
}

const createRootNode = (): MindNode => ({
  id: generateId(),
  type: 'mindNode',
  position: { x: 0, y: 0 },
  data: {
    label: 'Central Idea',
    color: NODE_COLORS[0],
    attachments: [],
    isRoot: true,
  },
})

export const useMindMapStore = create<MindMapState>((set, get) => ({
  documentId: generateId(),
  title: 'Untitled Mind Map',
  nodes: [createRootNode()],
  edges: [],
  selectedNodeId: null,
  isPresentationMode: false,
  isRecording: false,

  setTitle: (title) => set({ title }),

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) })
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) })
  },

  onConnect: (connection) => {
    set({
      edges: addEdge(
        {
          ...connection,
          id: generateId(),
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#64748b', strokeWidth: 2 },
        },
        get().edges
      ),
    })
  },

  addNode: (parentId, position) => {
    const id = generateId()
    const color = NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)]
    const newNode: MindNode = {
      id,
      type: 'mindNode',
      position: position ?? { x: Math.random() * 400 - 200, y: Math.random() * 300 - 150 },
      data: { label: 'New Topic', color, attachments: [] },
    }
    const updates: Partial<MindMapState> = { nodes: [...get().nodes, newNode] }
    if (parentId) {
      updates.edges = [
        ...get().edges,
        {
          id: generateId(),
          source: parentId,
          target: id,
          type: 'smoothstep',
          style: { stroke: '#64748b', strokeWidth: 2 },
        },
      ]
    }
    set(updates)
  },

  updateNodeLabel: (nodeId, label) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, label } } : n
      ),
    })
  },

  updateNodeData: (nodeId, data) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
      ),
    })
  },

  deleteNode: (nodeId) => {
    const { nodes, edges, selectedNodeId } = get()
    set({
      nodes: nodes.filter((n) => n.id !== nodeId),
      edges: edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: selectedNodeId === nodeId ? null : selectedNodeId,
    })
  },

  setSelectedNode: (id) => set({ selectedNodeId: id }),

  addAttachment: (nodeId, attachment) => {
    const full: Attachment = { ...attachment, id: generateId(), createdAt: Date.now() }
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, attachments: [...n.data.attachments, full] } }
          : n
      ),
    })
  },

  removeAttachment: (nodeId, attachmentId) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              data: {
                ...n.data,
                attachments: n.data.attachments.filter((a) => a.id !== attachmentId),
              },
            }
          : n
      ),
    })
  },

  setPresentationMode: (on) => set({ isPresentationMode: on }),
  setIsRecording: (on) => set({ isRecording: on }),

  saveDocument: async () => {
    const { documentId, title, nodes, edges } = get()
    const doc: MindMapDocument = {
      id: documentId,
      title,
      nodes,
      edges,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    await db.documents.put(doc)
  },

  loadDocument: async (id) => {
    const doc = await db.documents.get(id)
    if (doc) {
      set({
        documentId: doc.id,
        title: doc.title,
        nodes: doc.nodes,
        edges: doc.edges,
      })
    }
  },

  createNewDocument: () => {
    set({
      documentId: generateId(),
      title: 'Untitled Mind Map',
      nodes: [createRootNode()],
      edges: [],
      selectedNodeId: null,
    })
  },

  getPresentationSteps: () => {
    const { nodes, edges } = get()
    const roots = nodes.filter((n) => n.data.isRoot || !edges.some((e) => e.target === n.id))
    const visited = new Set<string>()
    const steps: { nodeId: string; title: string; attachments: Attachment[] }[] = []
    const queue = [...roots]
    while (queue.length) {
      const node = queue.shift()!
      if (visited.has(node.id)) continue
      visited.add(node.id)
      steps.push({
        nodeId: node.id,
        title: node.data.label,
        attachments: node.data.attachments,
      })
      const children = edges
        .filter((e) => e.source === node.id)
        .map((e) => nodes.find((n) => n.id === e.target))
        .filter(Boolean) as MindNode[]
      queue.push(...children)
    }
    return steps
  },
}))
