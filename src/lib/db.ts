import Dexie, { type Table } from 'dexie'
import type { MindMapDocument } from './types'

export interface BlobRecord {
  id: string
  blob: Blob
  createdAt: number
}

class MindMapDB extends Dexie {
  documents!: Table<MindMapDocument, string>
  blobs!: Table<BlobRecord, string>

  constructor() {
    super('MindMapPWA')
    this.version(1).stores({
      documents: 'id, title, updatedAt, cloudId',
      blobs: 'id, createdAt',
    })
  }
}

export const db = new MindMapDB()

export async function saveBlob(blob: Blob): Promise<string> {
  const id = crypto.randomUUID()
  await db.blobs.put({ id, blob, createdAt: Date.now() })
  return id
}

export async function getBlob(id: string): Promise<Blob | undefined> {
  const record = await db.blobs.get(id)
  return record?.blob
}

export async function deleteBlob(id: string) {
  await db.blobs.delete(id)
}
