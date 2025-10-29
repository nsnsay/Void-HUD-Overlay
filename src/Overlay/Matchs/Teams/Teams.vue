<template>
    <div :class="['team-wrap', team.side]">
        <div class="team-logo" v-if="team.infos?.avatar">
            <img :src="team.infos?.avatar" alt="">
        </div>
        <div class="team-name">{{ team.infos?.name || team.name }}</div>
        <div class="team-score">{{ team.score }}</div>
        <TeamStatus :team="team" :map="map" :phase="phase" :bomb="bomb" />
        <MapScore :team="team" :match="match" />
    </div>
</template>

<style scoped lang="scss">
.team-wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-direction: row;
    width: 300px;
    height: 100%;
    background: var(--secondary-90);
    color: black;
    padding: 12px;
    position: relative;

    &.T {
        flex-direction: row-reverse;

        border-right: 8px solid var(--t-color);

        .team-name {
            justify-content: flex-start;
        }
    }

    &.CT {
        border-left: 8px solid var(--ct-color);
    }

    .team-logo {
        height: 40px;

        img {
            height: 100%;
            filter: brightness(90%);
        }
    }

    .team-name {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        flex-direction: row;

        font-size: 1.2rem;
        font-weight: 800;
        padding: 12px;
    }

    .team-score {
        font-size: 1.4rem;
        font-weight: 800;
        padding: 12px;
        color: black;
    }
}
</style>

<script setup lang="ts">
import type { Team, Map, PhaseRaw, Bomb, Match } from '@/csgo-extended'
import TeamStatus from './TeamStatus.vue'
import MapScore from './components/MapScore.vue'


defineProps({
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
    },
    match: {
        type: Object as () => Match,
        default: () => ({})
    }
})
</script>
