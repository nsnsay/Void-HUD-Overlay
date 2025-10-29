<template>
    <div :class="['player-additional', { 'active': isBuyingPhase(phase.phase) }]">
        <div class="money">
            <div class="label">$</div>
            <div class="value">{{ formatMoney(player.state.money) }}</div>
        </div>
        <div class="money decease">
            <div class="label">-$</div>
            <div class="value">{{ formatMoney(moneyDecease) }}</div>
        </div>
    </div>
    <div v-if="player.state.health <= 0" :class="['money1', player.team.side]">
        ${{ player.state.money }}
    </div>
</template>

<style scoped lang="scss">
.money1 {
    position: absolute;
    padding: 8px;
    font-size: 14px;
    font-weight: 800;
    color: white;
    opacity: 0.6;

    &.CT {
        right: 0;
        top: 0;
    }

    &.T {
        left: 0;
        top: 0;
    }
}

.player-additional {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
    width: 100%;
    height: 30px;
    gap: 0px;

    position: absolute;
    top: -35px;
    left: 0;

    background: var(--primary-50);
    border: 1px solid white;
    border-radius: var(--border-radius);

    transition: all 0.3s ease-in-out;

    transform: translateY(150%);
    opacity: 0;

    &.active {
        transform: translateY(0);
        opacity: 1;
        transition: all 0.3s ease-in-out;
    }

    .money {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: row;
        height: 100%;
        color: rgb(4, 255, 16);
        font-size: 14px;
        width: 50%;

        .label {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: row;
            font-weight: 800;
        }

        .value {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: row;
            font-weight: 800;
        }

        &.decease {
            color: red;
        }
    }
}
</style>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Player, Map, PhaseRaw } from '@/csgo-extended';
const props = defineProps({
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

const moneyDecease = ref(0)
const freezeStartMoney = ref<number | null>(null)

const BUY_PHASES = new Set(['freezetime', 'timeout', 'timeout_ct', 'timeout_t'])
const isBuyingPhase = (p?: string) => !!p && BUY_PHASES.has(p)

watch(() => props.phase?.phase, (newPhase) => {
    if (isBuyingPhase(newPhase)) {
        freezeStartMoney.value = props.player?.state?.money ?? 0
        moneyDecease.value = 0
    } else {
        freezeStartMoney.value = null
        moneyDecease.value = 0
    }
}, { immediate: true })

watch(() => props.player?.state?.money, (newMoney) => {
    if (freezeStartMoney.value != null) {
        const spent = freezeStartMoney.value - (newMoney ?? 0)
        moneyDecease.value = spent > 0 ? spent : 0
    }
})

function formatMoney(money: number) {
    return Math.round(money).toLocaleString('en-US')
}
</script>
