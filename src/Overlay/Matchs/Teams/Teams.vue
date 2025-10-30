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
    background: var(--primary-90);
    color: white;
    padding: 12px;
    position: relative;

    &.T {
        flex-direction: row-reverse;

        border-right: 8px solid var(--t-color);

        .team-name {
            justify-content: flex-start;
        }

        .team-logo {
            &::after {
                content: '';
                position: absolute;
                top: 10%;
                bottom: 10%;
                left: 0;
                right: 0;
                transform: translateX(-10px);
                border-left: 2px solid var(--t-70);
            }
        }
    }

    &.CT {
        border-left: 8px solid var(--ct-color);

        .team-logo {
            &::after {
                content: '';
                position: absolute;
                top: 10%;
                bottom: 10%;
                left: 0;
                right: 0;
                transform: translateX(10px);
                border-right: 2px solid var(--ct-70);
            }
        }
    }

    .team-logo {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: row;
        flex-shrink: 1;
        height: 40px;
        position: relative;

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
        margin-top: 8px;
    }

    .team-score {
        font-size: 1.4rem;
        font-weight: 800;
        padding: 12px;
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
