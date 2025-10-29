<template>
    <div :class="['player-weapon', player.team.side]">
        <div v-if="player.state.health > 0" class="weapon">
            <component v-if="player.primary_weapon?.name" :is="returnWeaponIcon(player.primary_weapon?.name)"
                :class="['weapon-icon', 'primary', player.primary_weapon?.state]" />
            <component v-else-if="player.secondary_weapon?.name" :is="returnWeaponIcon(player.secondary_weapon?.name)"
                :class="['weapon-icon', 'secondary', player.secondary_weapon?.state]" />
            <component v-else="player.active_weapon?.name" :is="returnWeaponIcon(player.active_weapon?.name)"
                :class="['weapon-icon', 'primary', player.active_weapon?.state]" />
        </div>
        <div v-if="player.state.health > 0" class="grenades">
            <div v-for="grenade in player.grenades" :key="grenade.id" :class="['grenade', grenade.state]">
                <component style="color: white;" :is="returnWeaponIcon(grenade.name)" class="grenade-icon" />
            </div>
        </div>
        <div v-else class="dead">
            <div class="label">ROUND DMG</div>
            <div class="value">{{ player.state.round_totaldmg }}</div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.player-weapon {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-direction: row;
    width: 100%;
    height: calc(100% - 100% - 30px);
    flex-shrink: 1;
    flex-grow: 1;
    background: var(--primary-40);
    border-radius: var(--border-radius);
    padding: 5px;

    &.T {
        flex-direction: row-reverse;

        .weapon {
            .weapon-icon {
                transform: rotateY(180deg);
            }
        }
    }

    .weapon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 50%;
        height: 100%;

        .weapon-icon {
            height: 24px;
            display: block;
            opacity: 0.5;

            &.primary {
                height: 22px;
            }

            &.active {
                opacity: 1;
            }
        }
    }

    .grenades {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 50%;
        height: 100%;
        gap: 1px;

        .grenade {
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0.5;

            &.active {
                opacity: 1;
            }

            .grenade-icon {
                height: 17px;
                color: white;
            }
        }
    }

    .dead {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: row;
        line-height: 13px;
        width: 100%;
        font-size: 12px;
        color: white;
        gap: 2px;

        .label {
            font-weight: 400;
        }

        .value {
            font-weight: 900;
        }
    }
}

:deep(.weapon-icon path),
:deep(.weapon-icon circle),
:deep(.weapon-icon rect),
:deep(.weapon-icon polygon),
:deep(.grenade-icon path),
:deep(.grenade-icon circle),
:deep(.grenade-icon rect),
:deep(.grenade-icon polygon) {
    fill: currentColor;
    stroke: currentColor;
}
</style>

<script setup lang="ts">
import type { Player } from '@/csgo-extended'
import * as icons from '@/Overlay/Icons/Icons'

const props = defineProps({
    player: {
        type: Object as () => Player,
        default: () => ({})
    }
})


const returnWeaponIcon = (weapon?: string) => {
    if (!weapon) return null
    const iconsRecord = icons as Record<string, any>
    const lower = weapon.toLowerCase()
    const stripped = lower.startsWith('weapon_') ? lower.slice(7) : lower
    const normalized = stripped.replace(/-/g, '_')
    return iconsRecord[normalized] ?? null
}
</script>
