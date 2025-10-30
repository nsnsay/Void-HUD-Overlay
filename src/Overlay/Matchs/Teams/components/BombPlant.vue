<template>
    <transition name="bomb-fade" appear>
        <div v-if="displayWho" :class="['bomb-plant-wrap', team.side]">
            <div v-show="bomb.state !== 'exploded'" class="progress-bar-wrap">
                <div class="progress-bar" :style="progressBarStyle"></div>
            </div>
            <div class="bomb-plant-column">
                <div :class="['bomb-plant-text', currentState]">{{ currentState }} <span
                        v-if="bomb.state === 'planted'">on {{ bomb.site }}</span> <span
                        v-if="bomb.state === 'planting'">
                        by {{
                            bomb.player?.name }}</span>
                </div>
            </div>
            <div class="bomb-plant-column">
                <div v-if="bomb.state === 'planting' || bomb.state === 'planted' || bomb.state === 'defusing'"
                    class="bomb-plant-time">{{ timeoutSeconds
                    }}s</div>
            </div>
        </div>
    </transition>
</template>

<style scoped lang="scss">
.bomb-plant-wrap {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-direction: column;
    width: 100%;
    height: 60px;
    padding: 12px;
    outline: 1px solid var(--secondary-90);
    position: absolute;
    top: 0;
    left: 0;
    background: var(--primary-80);

    &.T {
        .progress-bar-wrap {
            transform: scaleX(-1);

            .progress-bar {
                background: var(--t-60);
            }
        }
    }

    &.CT {
        .progress-bar-wrap {
            .progress-bar {
                background: var(--ct-60);
            }
        }
    }

    .progress-bar-wrap {
        position: absolute;
        inset: 0;
        z-index: 1;
        overflow: hidden;

        .progress-bar {
            height: 100%;
            width: 100%;
            z-index: 0;
            transform-origin: left center;
            transition: transform 0.1s ease-in-out;
            will-change: transform;
        }
    }

    .bomb-plant-column {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-direction: row;
        width: 100%;

        .bomb-plant-text {
            font-size: 1rem;
            font-weight: 800;
            z-index: 2;

            @keyframes shine-text {
                0% {
                    opacity: 1;
                }

                50% {
                    opacity: 0.5;
                }

                100% {
                    opacity: 0;
                }
            }

            &.Exploded {
                animation: shine-text 1s linear infinite forwards;
            }

            &.Defused {
                animation: shine-text 1s linear infinite forwards;
            }
        }

        .bomb-plant-time {
            font-size: 0.85rem;
            font-weight: 600;
            z-index: 4;
        }
    }
}

.bomb-fade-enter-active,
.bomb-fade-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.bomb-fade-enter-from {
    opacity: 0;
    transform: translateY(-20px);
}

.bomb-fade-enter-to {
    opacity: 1;
    transform: translateY(0);
}

.bomb-fade-leave-from {
    opacity: 1;
    transform: translateY(0);
}

.bomb-fade-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}
</style>

<script setup lang="ts">
import type { Team, Bomb } from '@/csgo-extended'
import { computed, ref, watch, onBeforeUnmount } from 'vue';

const props = defineProps({
    team: {
        type: Object as () => Team,
        default: () => ({})
    },
    bomb: {
        type: Object as () => Bomb,
        default: () => ({})
    }
})

const displayWho = computed(() => {
    // If current team is T, and bomb.state === planting or planted or defusing or defused
    if (props.team.side === 'T' && (props.bomb.state === 'planting' || props.bomb.state === 'planted' || props.bomb.state === 'defusing' || props.bomb.state === 'defused' || props.bomb.state === 'exploded')) {
        return true;
    }
})

const currentState = computed(() => {
    if (props.bomb.state === 'planting') {
        return 'Planting'
    }
    if (props.bomb.state === 'planted') {
        return 'Planted'
    }
    if (props.bomb.state === 'defusing') {
        return 'Defusing'
    }
    if (props.bomb.state === 'defused') {
        return 'Defused'
    }
    if (props.bomb.state === 'exploded') {
        return 'Exploded'
    }
})

// 固定阶段时长（秒）
const plantDuration = 3
const plantedDuration = 40

// planted 阶段内部计时器
const plantedEndsAt = ref<number | null>(null)
const plantedRemaining = ref<number>(plantedDuration)
const ticker = ref<number | null>(null)

const stopTicker = () => {
    if (ticker.value !== null) {
        clearInterval(ticker.value)
        ticker.value = null
    }
}

const startTicker = () => {
    // 保持已有结束时间，避免在 defusing 阶段被重置
    stopTicker()
    if (plantedEndsAt.value === null) {
        plantedEndsAt.value = Date.now() + plantedDuration * 1000
    }
    ticker.value = window.setInterval(() => {
        const endsAt = plantedEndsAt.value ?? Date.now()
        const msLeft = endsAt - Date.now()
        const secLeft = msLeft / 1000
        plantedRemaining.value = Math.max(0, Math.min(plantedDuration, secLeft))
        if (msLeft <= 0) {
            stopTicker()
        }
    }, 100)
}

// 监听炸弹状态，进入 planted 时启动内部倒计时；其他状态停止
watch(() => props.bomb.state, (state) => {
    if (state === 'planted' || state === 'defusing') {
        // planted 开始倒计时；defusing 继续倒计时，不重置结束时间
        startTicker()
    } else {
        // 其他阶段停止内部倒计时（例如 planting/defused/exploded）
        stopTicker()
        plantedEndsAt.value = null
        plantedRemaining.value = plantedDuration
    }
}, { immediate: true })

onBeforeUnmount(() => {
    stopTicker()
})

const progressMaxSeconds = computed(() => (
    props.bomb.state === 'planting' ? plantDuration : plantedDuration
))

const timeoutEndsIn = computed(() => {
    if (props.bomb.state === 'planting') {
        const v = Number(props.bomb.countdown ?? plantDuration)
        return Math.max(0, Math.min(plantDuration, v))
    }
    // planted 阶段使用内部计时器剩余时间
    return plantedRemaining.value
})

const timeoutSeconds = computed(() => Math.ceil(timeoutEndsIn.value))

const progressRatio = computed(() => {
    if (!displayWho.value) return 0
    return +((timeoutEndsIn.value / progressMaxSeconds.value)).toFixed(4)
})

const progressBarStyle = computed(() => ({ transform: `scaleX(${progressRatio.value})` }))
</script>
