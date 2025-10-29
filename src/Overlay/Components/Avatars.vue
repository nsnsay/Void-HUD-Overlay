<template>
    <div
        :class="['player-avatar-container', player.team.side, { 'sidebar': sidebar, 'focused': focused, 'dead': player.state.health <= 0 }]">
        <img class="player-avatar" :src="player.infos?.avatar ?? (player.team.side === 'CT' ? CTAvatar : TAvatar)"
            alt="">
    </div>
</template>

<style scoped lang="scss">
.player-avatar-container {
    &.sidebar {
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        border-radius: var(--border-radius);
        position: absolute;
        inset: 0;
        top: -24px;
        width: 100%;
        z-index: 1;
        mask-image: linear-gradient(to top, transparent 0%, black 30%);


        &.dead {
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
        }

        .player-avatar {
            position: relative;
            transform: translateY(40%) scale(1.8);
            height: 100%;
            z-index: 1;
        }
    }

    &.focused {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 150px;
        width: 100%;
        position: absolute;
        bottom: 100%;
        z-index: 2;
        mask-image: linear-gradient(to top, transparent 0%, black 30%);

        .player-avatar {
            height: 100%;
            transform: translateY(40%) scale(1.8);
        }
    }
}
</style>

<script setup lang="ts">
import type { Player } from '../../csgo-extended'
import { CTAvatar, TAvatar } from '../Icons/Icons'


defineProps({
    player: {
        type: Object as () => Player,
        default: () => ({})
    },
    sidebar: {
        type: Boolean,
        default: false
    },
    focused: {
        type: Boolean,
        default: false
    }
})
</script>
