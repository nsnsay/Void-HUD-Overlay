<template>
    <div v-if="player.state.health > 0" :class="['player-armor-and-health', player.team.side]">
        <div :class="['health', player.team.side]">
            {{ player.state.health }}
        </div>
        <div class="armor">
            <img v-if="player.state.helmet && player.state.armor" :src="ArmorHelmet" alt="armor" />
            <img v-else-if="player.state.armor" :src="ArmorFull" alt="armor" />
        </div>
    </div>
</template>

<style scoped lang="scss">
.player-armor-and-health {
    position: absolute;
    right: 0;
    top: 0;
    z-index: 3;
    padding: 4px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    flex-direction: column;
    gap: 0;

    &.T {
        right: unset;
        left: 0;
        align-items: flex-start;
    }

    .health {
        display: flex;
        align-items: center;
        line-height: 13px;
        font-size: 16px;
        font-weight: 900;
    }

    .armor {
        img {
            height: 16px;
        }
    }
}
</style>

<script setup lang="ts">
import { ArmorFull, ArmorHelmet } from '../../Icons/Icons'
import type { Player } from '@/csgo-extended'
defineProps({
    player: {
        type: Object as () => Player,
        default: () => ({})
    }
})
</script>
