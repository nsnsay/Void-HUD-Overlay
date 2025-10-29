<template>
    <div class="match-wrap">
        <div class="match-round">Round {{ map.round + 1 }}</div>
        <div class="match-time">{{ secondToTime(Number(phase.phase_ends_in)) }}</div>
    </div>
</template>

<style scoped lang="scss">
.match-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 6px;
    width: 100px;
    height: 100%;
    background: var(--primary-50);
    color: white;

    .match-round {
        font-size: 13px;
        font-weight: 700;
    }

    .match-time {
        font-weight: 800;
        font-size: 20px;
    }
}
</style>

<script setup lang="ts">
import type { Map, PhaseRaw } from '@/csgo-extended'
const props = defineProps({
    phase: {
        type: Object as () => PhaseRaw,
        default: () => ({})
    },
    map: {
        type: Object as () => Map,
        default: () => ({})
    }
})

function secondToTime(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = Math.floor(totalSeconds % 60)
    totalSeconds = Math.max(0, totalSeconds)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}
</script>
