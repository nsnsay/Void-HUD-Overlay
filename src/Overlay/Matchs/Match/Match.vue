<template>
    <div class="match-wrap">
        <div class="match-round">Round {{ map.round + 1 }}</div>
        <div v-if="phase.phase !== 'bomb' && phase.phase !== 'timeout_ct' && phase.phase !== 'timeout_t' && phase.phase !== 'paused'"
            class="match-time">{{ secondToTime(Number(phase.phase_ends_in)) }}</div>
        <div v-else-if="phase.phase === 'bomb'" class="match-time bomb">SITE {{ bomb.site }}</div>
        <div v-else class="match-time paused">PAUSED</div>
    </div>
</template>

<style scoped lang="scss">
.match-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 6px;
    width: 90px;
    height: 100%;
    background: var(--primary-90);
    color: white;

    .match-round {
        font-size: 13px;
        font-weight: 700;
    }

    .match-time {
        font-weight: 800;
        font-size: 20px;

        &.bomb {
            font-size: 16px;
        }

        &.paused {
            font-size: 14px;
        }

        margin-bottom: 3px;
    }
}
</style>

<script setup lang="ts">
import type { Map, PhaseRaw, Bomb } from '@/csgo-extended'
const props = defineProps({
    phase: {
        type: Object as () => PhaseRaw,
        default: () => ({})
    },
    map: {
        type: Object as () => Map,
        default: () => ({})
    },
    bomb: {
        type: Object as () => Bomb,
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
