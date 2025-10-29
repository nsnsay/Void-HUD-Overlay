<template>
    <div :class="['player-stastics', player.team.side]">
        <div class="stastics-item">
            <div class="label">
                <img src="../kill.png" alt="kill-icon" />
            </div>
            <div class="value">{{ player.stats.kills }}</div>
        </div>
        <div class="stastics-item">
            <div class="label">
                <img src="../death.png" alt="death-icon" />
            </div>
            <div class="value">{{ player.stats.deaths }}</div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.player-stastics {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    position: absolute;
    opacity: 1;
    padding: 3px;

    &.CT {
        top: 0;
        left: 0;
    }

    &.T {
        top: 0;
        right: 0;

        .stastics-item {
            flex-direction: row-reverse;
        }
    }

    .stastics-item {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: row;
        gap: 3px;
        padding: 3px;

        .label {
            display: flex;
            align-items: center;
            justify-content: center;

            img {
                height: 13px;
            }
        }

        .value {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 15px;
            font-weight: 700;
            width: 15px;
        }
    }
}
</style>

<script setup lang="ts">
import type { Player } from '@/csgo-extended'
defineProps({
    player: {
        type: Object as () => Player,
        default: () => ({})
    }
})
</script>
