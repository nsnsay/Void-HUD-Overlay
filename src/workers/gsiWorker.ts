/// <reference lib="webworker" />

export type GsiIncoming = any

interface WorkerInput {
  type: 'gsi-data'
  payload: GsiIncoming
}

interface WorkerOutput {
  type: 'gsi-processed'
  payload: any
  meta: { receivedAt: number; processedAt: number; latencyMs: number }
}

self.addEventListener('message', (event: MessageEvent) => {
  const data = event.data as WorkerInput
  try {
    if (!data || data.type !== 'gsi-data') return
    const receivedAt = performance.now()
    const payload = data.payload

    const processed = processPayload(payload)

    const processedAt = performance.now()
    const out: WorkerOutput = {
      type: 'gsi-processed',
      payload: processed,
      meta: {
        receivedAt,
        processedAt,
        latencyMs: processedAt - receivedAt,
      },
    }

    const transferables: Transferable[] = []
    collectTransferables(out.payload, transferables)
    self.postMessage(out, transferables)
  } catch (err: any) {
    self.postMessage({
      type: 'gsi-error',
      error: serializeError(err),
    })
  }
})

function processPayload(payload: any) {
  const summary: any = { receivedAtIso: new Date().toISOString() }
  try {
    const cloned = typeof (globalThis as any).structuredClone === 'function'
      ? (globalThis as any).structuredClone(payload)
      : JSON.parse(JSON.stringify(payload))

    const stats: Record<string, { count: number; sum: number; min: number; max: number; mean: number }> = {}
    traverse(cloned, (val, path) => {
      if (Array.isArray(val) && val.length && val.every((x) => typeof x === 'number')) {
        const sum = val.reduce((a, b) => a + b, 0)
        const min = Math.min(...val)
        const max = Math.max(...val)
        const mean = sum / val.length
        stats[path.join('.')] = { count: val.length, sum, min, max, mean }
      }
    })

    return { data: cloned, stats, summary }
  } catch {
    return { data: payload, summary }
  }
}

function traverse(obj: any, fn: (val: any, path: string[]) => void, path: string[] = []) {
  if (Array.isArray(obj)) {
    fn(obj, path)
    obj.forEach((v, i) => traverse(v, fn, path.concat(String(i))))
    return
  }
  if (obj && typeof obj === 'object') {
    Object.keys(obj).forEach((k) => traverse(obj[k], fn, path.concat(k)))
  }
}

function collectTransferables(obj: any, out: Transferable[]) {
  if (!obj) return
  if (obj instanceof ArrayBuffer) {
    out.push(obj)
    return
  }
  if (ArrayBuffer.isView(obj)) {
    out.push((obj as ArrayBufferView).buffer)
    return
  }
  if (Array.isArray(obj)) {
    obj.forEach((v) => collectTransferables(v, out))
    return
  }
  if (typeof obj === 'object') {
    for (const k in obj) collectTransferables(obj[k], out)
  }
}

function serializeError(err: any) {
  return { message: err?.message ?? String(err), stack: err?.stack }
}