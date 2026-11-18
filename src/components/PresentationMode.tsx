import { useEffect, useState, useCallback, useRef } from 'react'
import { X, ChevronLeft, ChevronRight, Play, Pause, Video } from 'lucide-react'
import { useMindMapStore } from '../store/useMindMapStore'
import { useReactFlow } from '@xyflow/react'
import { cn } from '../lib/utils'

export function PresentationMode() {
  const {
    isPresentationMode,
    setPresentationMode,
    getPresentationSteps,
    nodes,
    isRecording,
    setIsRecording,
  } = useMindMapStore()
  const { setCenter, fitView } = useReactFlow()

  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const timerRef = useRef<number | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunks = useRef<Blob[]>([])

  const steps = getPresentationSteps()

  const goToStep = useCallback(
    (index: number) => {
      if (index < 0 || index >= steps.length) return
      setCurrentStep(index)
      const step = steps[index]
      const node = nodes.find((n) => n.id === step.nodeId)
      if (node) {
        setCenter(node.position.x + 100, node.position.y + 40, {
          zoom: 1.4,
          duration: 800,
        })
      }
    },
    [steps, nodes, setCenter]
  )

  useEffect(() => {
    if (isPresentationMode && steps.length > 0) {
      goToStep(0)
    }
  }, [isPresentationMode]) // eslint-disable-line

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      return
    }

    timerRef.current = window.setTimeout(() => {
      if (currentStep < steps.length - 1) {
        goToStep(currentStep + 1)
      } else {
        setIsPlaying(false)
      }
    }, 3500)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps.length, goToStep])

  const startRecording = async () => {
    try {
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: { displaySurface: 'browser' },
        audio: true,
        preferCurrentTab: true,
      })

      recordedChunks.current = []
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
      })

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `mindmap-pitch-${Date.now()}.webm`
        a.click()
        URL.revokeObjectURL(url)
        stream.getTracks().forEach((t: MediaStreamTrack) => t.stop())
        setIsRecording(false)
      }

      mediaRecorderRef.current = recorder
      recorder.start(1000)
      setIsRecording(true)
      setIsPlaying(true)
    } catch (err) {
      console.error('Recording failed', err)
      alert('Screen recording permission denied or not supported.')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsPlaying(false)
  }

  if (!isPresentationMode) return null

  const current = steps[currentStep]

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex flex-col">
      <div className="pointer-events-auto flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent px-6 py-4">
        <div className="text-sm font-medium text-white/80">
          Pitch Mode · {currentStep + 1} / {steps.length}
        </div>
        <div className="flex items-center gap-2">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-500"
            >
              <Video className="h-4 w-4" />
              Record Video
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 rounded-lg bg-rose-700 px-3 py-1.5 text-sm font-medium text-white animate-pulse"
            >
              ● Recording… Stop
            </button>
          )}
          <button
            onClick={() => {
              setPresentationMode(false)
              setIsPlaying(false)
              fitView({ padding: 0.2 })
            }}
            className="rounded-lg bg-slate-800 p-2 text-white hover:bg-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-auto pointer-events-auto">
        {current && (
          <div className="mx-auto mb-6 max-w-xl rounded-2xl border border-white/10 bg-slate-900/90 px-6 py-4 shadow-2xl backdrop-blur">
            <h2 className="text-xl font-semibold text-white">{current.title}</h2>
            {current.attachments.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {current.attachments.map((a) => (
                  <a
                    key={a.id}
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-blue-300 hover:bg-slate-700"
                  >
                    {a.name}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-center gap-4 bg-black/60 py-4">
          <button
            onClick={() => goToStep(currentStep - 1)}
            disabled={currentStep === 0}
            className="rounded-full bg-slate-800 p-3 text-white disabled:opacity-40"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={cn(
              'rounded-full p-4 text-white',
              isPlaying ? 'bg-amber-600' : 'bg-blue-600'
            )}
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </button>

          <button
            onClick={() => goToStep(currentStep + 1)}
            disabled={currentStep >= steps.length - 1}
            className="rounded-full bg-slate-800 p-3 text-white disabled:opacity-40"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
