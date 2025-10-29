<template>
    <div :class="['player-healthbar-container', player.team.side]">
        <div class="player-healthbar" :style="{ height: player.state.health + '%' }"></div>
        <div v-if="player.state.health >= 0" :class="['Hurt', { 'show': showDamage }]"
            :style="{ height: damageDisplay + '%', bottom: player.state.health + '%' }"></div>
        <Transition name="fade">
            <div v-if="accumulatedDamage" class="hurt-text">-{{ accumulatedDamage }}</div>
        </Transition>
    </div>
</template>

<style scoped lang="scss">
.player-healthbar-container {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 100%;
    width: 100%;
    border-radius: var(--border-radius);
    z-index: 0;

    .Hurt {
        width: 100%;
        position: absolute;
        background: rgba(156, 141, 4, 0.3);
        transition: all 0.3s ease;
        opacity: 0;

        &.show {
            opacity: 1;
        }
    }

    .hurt-text {
        position: absolute;
        top: -45%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 24px;
        font-weight: 700;
        color: white;
        text-shadow: 0 0 3px rgba(0, 0, 0, 1);
        z-index: 1;
    }

    .player-healthbar {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        transition: height 0.2s ease-in-out;
    }

    &.CT {
        .player-healthbar {
            background: var(--ct-90);
        }
    }

    &.T {
        .player-healthbar {
            background: var(--t-90);
        }
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>

<script setup lang="ts">
import type { Player } from '@/csgo-extended'
import { ref, watch, onMounted } from 'vue';

const props = defineProps({
    player: {
        type: Object as () => Player,
        default: () => ({})
    }
})

// 血量监控相关状态
const damageDisplay = ref<number>(0);
const showDamage = ref<boolean>(false);
const previousHealth = ref<number>(100);
const damageTimer = ref<number | null>(null);
const accumulatedDamage = ref<number>(0);

// 初始化血量
onMounted(() => {
    if (props.player?.state?.health) {
        previousHealth.value = props.player.state.health;
    }
});

// 监控血量变化
watch(
    () => props.player?.state?.health,
    (newHealth, oldHealth) => {
        if (newHealth !== undefined && oldHealth !== undefined && newHealth < oldHealth) {
            const damage = oldHealth - newHealth;

            // 累积伤害
            accumulatedDamage.value += damage;
            damageDisplay.value = accumulatedDamage.value;
            showDamage.value = true;

            // 清除之前的定时器
            if (damageTimer.value) {
                clearTimeout(damageTimer.value);
            }

            damageTimer.value = setTimeout(() => {
                showDamage.value = false;
                accumulatedDamage.value = 0;
                damageDisplay.value = 0;
            }, 3000);
        }

        // 更新之前的血量
        if (newHealth !== undefined) {
            previousHealth.value = newHealth;
        }
    },
    { immediate: false }
);
</script>
