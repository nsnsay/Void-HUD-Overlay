<template>
    <div class="team-status-wrap">
        <Timeout :team="team" :map="map" :phase="phase" />
        <BombPlant :team="team" :bomb="bomb" />
        <BombDefuse :team="team" :bomb="bomb" />
    </div>
</template>

<style scoped lang="scss">
.team-status-wrap {
    position: absolute;
    top: calc(100% + 10px);
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;

    background: var(--primary-80);
    color: white;
}
</style>

<script setup lang="ts">
import type { Team, Map, PhaseRaw, Bomb } from '@/csgo-extended'
import Timeout from './components/Timeout.vue'
import BombPlant from './components/BombPlant.vue'
import BombDefuse from './components/BombDefuse.vue'

const props = defineProps({
    team: {
        type: Object as () => Team,
        default: () => ({})
    },
    map: {
        type: Object as () => Map,
        default: () => ({})
    },
    phase: {
        type: Object as () => PhaseRaw,
        default: () => ({})
    },
    bomb: {
        type: Object as () => Bomb,
        default: () => ({})
    }
})
</script>
