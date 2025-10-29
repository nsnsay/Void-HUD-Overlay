<template>
    <Overlay v-if="isReady" :data="lastProcessed!.data" />
</template>

<style scoped></style>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { io, Socket } from 'socket.io-client'
import Overlay from './Overlay/Overlay.vue'
import type { CSGO } from './csgo-extended'

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error'

type StatsEntry = { count: number; sum: number; min: number; max: number; mean: number }
type WorkerProcessed = { data: CSGO; stats?: Record<string, StatsEntry>; summary?: any }

const status = ref<ConnectionStatus>('disconnected')
const lastProcessed = ref<WorkerProcessed | null>(null)
const isReady = computed(() => !!lastProcessed.value?.data)
const lastMeta = ref<{ receivedAt: number; processedAt: number; latencyMs: number } | null>(null)
const logs = ref<{ ts: string; level: 'info' | 'warn' | 'error'; msg: string }[]>([])
let socket: Socket | null = null
let rtSocket: Socket | null = null
let worker: Worker | null = null

function log(level: 'info' | 'warn' | 'error', msg: any, data?: any) {
    const line = `${typeof msg === 'string' ? msg : JSON.stringify(msg)}${data ? ' ' + (typeof data === 'string' ? data : JSON.stringify(data)) : ''}`
    const entry = { ts: new Date().toLocaleTimeString(), level, msg: line }
    logs.value.push(entry)
    if (logs.value.length > 200) logs.value.shift()
    console[level === 'info' ? 'log' : level](`[${entry.ts}] ${entry.level.toUpperCase()}: ${line}`)
}

function setupSocket() {
    status.value = 'connecting'
    socket = io('http://127.0.0.1:5031', {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        autoConnect: true,
    })

    socket.on('connect', () => {
        status.value = 'connected'
        log('info', 'Socket connected', { id: socket?.id })
    })

    socket.on('disconnect', (reason) => {
        status.value = 'disconnected'
        log('warn', 'Socket disconnected', { reason })
    })

    socket.on('connect_error', (err) => {
        status.value = 'error'
        log('error', 'Connect error', { message: err.message })
    })

    socket.on('reconnect_attempt', (attempt) => {
        status.value = 'reconnecting'
        log('warn', 'Reconnect attempt', { attempt })
    })

    socket.on('reconnect', (attempt) => {
        status.value = 'connected'
        log('info', 'Reconnected', { attempt })
    })

    socket.on('reconnect_failed', () => {
        status.value = 'error'
        log('error', 'Reconnect failed')
    })

    socket.on('error', (err) => {
        log('error', 'Socket error', { message: (err as any)?.message ?? String(err) })
    })

    // Subscribe to gsi-data
    socket.on('gsi-data', (payload: any) => {
        worker?.postMessage({ type: 'gsi-data', payload })
    })
}

function setupRealtimeSocket() {
    rtSocket = io('http://127.0.0.1:5031/realtime', {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        autoConnect: true,
    })

    rtSocket.on('connect', () => {
        log('info', 'Realtime socket connected', { id: rtSocket?.id })
    })

    rtSocket.on('disconnect', (reason) => {
        log('warn', 'Realtime socket disconnected', { reason })
    })

    rtSocket.on('connect_error', (err) => {
        log('error', 'Realtime connect error', { message: err.message })
    })

    rtSocket.on('error', (err) => {
        log('error', 'Realtime socket error', { message: (err as any)?.message ?? String(err) })
    })

    // Listen for refresh-now and reload the page
    rtSocket.on('refresh-now', () => {
        log('warn', 'Received refresh-now; reloading page')
        window.location.reload()
    })
}

function setupWorker() {
    worker = new Worker(new URL('./workers/gsiWorker.ts', import.meta.url), { type: 'module' })
    worker.addEventListener('message', (e: MessageEvent) => {
        const msg = e.data
        if (msg?.type === 'gsi-processed') {
            lastProcessed.value = msg.payload as WorkerProcessed
            lastMeta.value = msg.meta
        } else if (msg?.type === 'gsi-error') {
            log('error', 'Worker error', msg.error)
        }
    })
    worker.addEventListener('error', (err) => {
        log('error', 'Worker runtime error', { message: err.message })
    })
}

function clearLogs() {
    logs.value = []
}

function reconnect() {
    if (!socket) return
    try {
        log('warn', 'Manual reconnect requested')
        socket.connect()
    } catch (e) {
        log('error', 'Manual reconnect failed', e)
    }
}

onMounted(() => {
    setupWorker()
    setupSocket()
    setupRealtimeSocket()
})

onUnmounted(() => {
    socket?.off('gsi-data')
    socket?.removeAllListeners()
    socket?.close()
    rtSocket?.off('refresh-now')
    rtSocket?.removeAllListeners()
    rtSocket?.close()
    worker?.terminate()
})
</script>