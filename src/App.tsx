import { ReactFlowProvider } from '@xyflow/react'
import { MindMapCanvas } from './components/MindMapCanvas'

function App() {
  return (
    <div className="h-screen w-screen overflow-hidden">
      <ReactFlowProvider>
        <MindMapCanvas />
      </ReactFlowProvider>
    </div>
  )
}

export default App
