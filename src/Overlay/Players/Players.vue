<template>

    <div :class="['player-card', player.team.side, { 'focused': player.isFocused, 'dead': player.state.health <= 0 }]">
        <div class="player-info">
            <div class="player-name">
                {{ player.infos?.name || player.name }}
                <div v-if="player.state.round_kills > 0" class="roundkills">
                    {{ player.state.round_kills }}
                </div>
            </div>
            <PlayerArmorAndHealth :player="player" />
            <PlayerAvatars :player="player" :sidebar="true" />
            <img v-if="player.state.health <= 0" class='dead-icon' src='./death.png' alt='dead-icon' />
            <PlayerHealthBar :player="player" />
            <PlayerStastics :player="player" />
        </div>
        <PlayerWeapons :player="player" />
        <PlayerAdditional :player="player" :map="map" :phase="phase" />
    </div>
</template>

<style scoped lang="scss">
.player-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: var(--players-card-width);
    height: var(--players-card-height);
    border-radius: var(--border-radius);
    padding: 3px;
    flex-direction: column;
    gap: 3px;
    transition: background-color 0.3s ease-in-out;
    position: relative;

    .player-info {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        flex-direction: column;
        width: 100%;
        height: calc(100% - 30px);
        border-radius: var(--border-radius);
        position: relative;
        background: var(--primary-60);
        transition: height 0.3s ease-in-out;

        .dead-icon {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            height: 85px;
            z-index: -1;
            opacity: 0.6;
        }

        .player-name {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            font-weight: 800;
            font-size: 17px;
            z-index: 2;
            padding: 6px;
            width: 100%;
            height: 30px;
            text-align: center;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            gap: 4px;

            .roundkills {
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2;
                background: white;
                color: black;
                font-weight: 800;
                width: 18px;
                height: 18px;
            }
        }
    }

    &.focused {
        box-shadow: 0 0 0px 2px white;
    }

    &.CT {
        background-color: var(--ct-30);
    }

    &.T {
        background-color: var(--t-30);

        .player-info {
            .player-name {
                justify-content: flex-start;
                flex-direction: row-reverse;
            }
        }
    }

    &.dead {
        background-color: var(--primary-30);
        height: 130px;
        transition: height 0.5s ease-in-out;
    }
}
</style>

<script setup lang="ts">
import type { Player, Map, PhaseRaw } from '../../csgo-extended'
import PlayerAvatars from '../Components/Avatars.vue';
import PlayerArmorAndHealth from './components/ArmorAndHealth.vue';
import PlayerHealthBar from './components/HealthBar.vue';
import PlayerWeapons from './components/Weapons.vue';
import PlayerStastics from './components/Stastics.vue';
import PlayerAdditional from './components/Additional.vue';

defineProps({
    player: {
        type: Object as () => Player,
        default: () => ({})
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
