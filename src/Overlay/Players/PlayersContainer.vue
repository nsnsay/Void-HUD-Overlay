<template>
    <div class="players-container">
        <div class="player-container CT">
            <div class="player-for" v-for="player in players.filter(p => p.team.side === 'CT')" :key="player.steamid">
                <PlayerComponents :player="player" :map="map" :phase="phase" />
            </div>
        </div>

        <div class="player-container T">
            <div class="player-for" v-for="player in players.filter(p => p.team.side === 'T')" :key="player.steamid">
                <PlayerComponents :player="player" :map="map" :phase="phase" />
            </div>
        </div>
    </div>

</template>

<style scoped lang="scss">
.player-container {
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: flex-end;
    width: 700px;

    &.CT {
        position: fixed;
        left: var(--safezone-x);
        bottom: var(--safezone-y);
        justify-content: flex-start;
    }

    &.T {
        position: fixed;
        right: var(--safezone-x);
        bottom: var(--safezone-y);
        justify-content: flex-end;
    }
}
</style>

<script setup lang="ts">
import type { Player, Map, PhaseRaw } from '../../csgo-extended'
import PlayerComponents from './Players.vue'

defineProps({
    players: {
        type: Array as () => Player[],
        default: () => []
    },
    map: {
        type: Object as () => Map,
        default: () => ({})
    },
    phase: {
        type: Object as () => PhaseRaw,
        default: () => ({})
    }
})
</script>
