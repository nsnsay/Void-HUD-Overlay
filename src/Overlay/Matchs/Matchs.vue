<template>
    <div class="matchs-wrap">
        <Teams v-if="data.map.team_ct" :team="data.map.team_ct" :map="data.map" :phase="data.phase_countdowns as any"
            :bomb="data.bomb ?? undefined" :match="data.match" />
        <Match v-if="data.map.team_ct" :phase="data.phase_countdowns as any" :map="data.map" />
        <Teams v-if="data.map.team_t" :team="data.map.team_t" :map="data.map" :phase="data.phase_countdowns as any"
            :bomb="data.bomb ?? undefined" :match="data.match" />
    </div>
</template>

<style scoped lang="scss">
.matchs-wrap {
    position: fixed;
    top: var(--safezone-y);
    left: 50%;
    transform: translate(-50%);
    height: 55px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
</style>

<script setup lang="ts">
import type { CSGO } from '@/csgo-extended'
import Teams from './Teams/Teams.vue'
import Match from './Match/Match.vue'
defineProps({
    data: {
        type: Object as () => CSGO,
        default: () => ({})
    }
})
</script>
