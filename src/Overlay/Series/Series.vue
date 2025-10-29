<template>
    <Transition name="fade">
        <div v-if="matchObj && props.data.phase_countdowns.phase !== 'over' && props.data.phase_countdowns.phase !== 'live'"
            class="match-wrap">
            <div v-for="(map, index) in matchMaps" :key="index"
                :class="['match-item', { 'currentMap': data.map.name === map.name }]">
                <img v-if="!map.decider" class="pickby" :src="pickByAvatar(map.pickby)" alt="">
                <img v-else class="pickby decider" src="./decider.png" />
                <div v-if="map.ascore || map.bscore" class="score">
                    <div class="a">{{ map.ascore }}</div>
                    <div class="vs">:</div>
                    <div class="b">{{ map.bscore }}</div>
                </div>
                <img class="mapBg" :src="`background/${map.name}.png`" alt="">
            </div>
        </div>
    </Transition>
</template>

<style scoped lang="scss">
.fade-enter-active,
.fade-leave-active {
    transition: all 0.7s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.match-wrap {
    position: fixed;
    right: var(--safezone-x);
    top: var(--safezone-y);
    border-radius: var(--border-radius);
    padding: 4px;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;

    width: calc(120px * 3 + 6px * 4);
    flex-wrap: wrap;
    flex-grow: 1;

    .match-item {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        height: 130px;
        width: 120px;
        border-radius: var(--border-radius);
        overflow: hidden;
        z-index: 1;
        position: relative;
        border: 1px solid var(--secondary-50);
        gap: 6px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);

        &.currentMap {
            border: 2px solid var(--secondary-90);

            .mapBg {
                filter: brightness(0.5) contrast(1.2);
            }
        }

        .mapBg {
            position: absolute;
            z-index: 1;
            height: 100%;
            width: 100%;
            object-fit: cover;
            filter: brightness(0.5) contrast(1.2) blur(2px);
        }

        .pickby {
            height: 4rem;
            z-index: 5;
        }

        .score {
            z-index: 3;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1px;

            .a,
            .b {
                font-weight: bold;
                color: white;
            }
        }
    }
}
</style>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { CSGO } from '@/csgo-extended'
const props = defineProps({
    data: {
        type: Object as () => CSGO,
        default: () => ({})
    }
})

const matchObj = computed(() => {
    const m = (props.data as any)?.match as Record<string, any> | undefined
    if (!m || typeof m !== 'object') return null
    const keys = Object.keys(m)
    const firstKey = keys[0]
    return firstKey ? m[firstKey] ?? null : null
})

const matchMaps = computed(() => {
    const maps = matchObj.value?.maps
    return Array.isArray(maps) ? maps : []
})

function pickByAvatar(pickby: string | number | undefined): string {
    const m = matchObj.value as any
    if (!m) return '?'
    const teamA = m.team_a
    const teamB = m.team_b
    if (pickby === teamA?.id) {
        return teamA?.avatar || '?'
    }
    if (pickby === teamB?.id) {
        return teamB?.avatar || '?'
    }
    return '?'
}
</script>
