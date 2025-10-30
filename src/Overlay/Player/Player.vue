<template>
    <div :class="['player-container', player.team.side]">
        <Avatars :player="player" :focused="true" />
        <div v-if="player.state.health > 0" :class="['player-armor-and-health', player.team.side]">
            <div :class="['health', player.team.side]">
                {{ player.state.health }}
            </div>
            <div class="armor">
                <img v-if="player.state.helmet && player.state.armor" :src="ArmorHelmet" alt="armor" />
                <img v-else-if="player.state.armor" :src="ArmorFull" alt="armor" />
            </div>
        </div>
        <div class="player-name">{{ player.infos?.name || player.name }}</div>
        <div class="player-ammo">
            <img src="./bullets.png" alt="">
            <div class="clip">{{ player.active_weapon?.ammo_clip }}</div>
            <div class="reserve">/{{ player.active_weapon?.ammo_reserve }}</div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.player-container {
    position: fixed;
    bottom: var(--safezone-y);
    left: 50%;
    transform: translateX(-50%);

    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-direction: row;
    width: 320px;
    border-radius: var(--border-radius);
    outline: 1px solid var(--secondary-70);

    &.CT {
        background: var(--ct-80);
    }

    &.T {
        background: var(--t-80);
    }

    .player-armor-and-health {
        z-index: 3;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: row-reverse;
        width: 60px;
        gap: 2px;

        .health {
            display: flex;
            align-items: center;
            line-height: 13px;
            font-size: 16px;
            font-weight: 800;
            width: 30px;
        }

        .armor {
            img {
                height: 16px;
            }
        }
    }

    .player-name {
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text);
        height: 32px;
        font-weight: 900;
        border-radius: var(--border-radius);
        flex-shrink: 1;
        flex-grow: 1;
    }

    .player-ammo {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: row;
        color: var(--text);
        font-weight: 600;
        border-radius: var(--border-radius);
        width: 70px;

        img {
            height: 16px;
            transform: scaleY(0.8) scaleX(1.1);
        }

        .clip {
            font-weight: 700;
        }

        .reserve {
            margin-top: 2px;
            font-size: 12px;
            font-weight: 500;
        }
    }
}
</style>

<script setup lang="ts">
import type { Player } from '../../csgo-extended'
import Avatars from '../Components/Avatars.vue'
import { ArmorFull, ArmorHelmet } from '../Icons/Icons'

const props = defineProps({
    player: {
        type: Object as () => Player,
        default: () => ({})
    }
})
</script>
