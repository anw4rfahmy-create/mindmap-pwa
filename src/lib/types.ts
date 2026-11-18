import type { Node, Edge } from '@xyflow/react'

export type AttachmentType = 'image' | 'file' | 'link' | 'note' | 'audio' | 'video'

export interface Attachment {
  id: string
  type: AttachmentType
  name: string
  /** Object URL or remote URL or data URL */
  url: string
  /** For local files stored in IndexedDB */
  blobId?: string
  size?: number
  mimeType?: string
  createdAt: number
}

export interface MindNodeData {
  label: string
  color?: string
  icon?: string
  attachments: Attachment[]
  notes?: string
  collapsed?: boolean
  isRoot?: boolean
  [key: string]: unknown
}

export type MindNode = Node<MindNodeData>
export type MindEdge = Edge

export interface MindMapDocument {
  id: string
  title: string
  nodes: MindNode[]
  edges: MindEdge[]
  createdAt: number
  updatedAt: number
  /** Optional cloud sync metadata */
  cloudId?: string
  lastSyncedAt?: number
}

export type PresentationStep = {
  nodeId: string
  title: string
  attachments: Attachment[]
  durationMs: number
}
