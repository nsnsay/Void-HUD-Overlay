<template>
    <transition name="bomb-fade" appear>
        <div v-if="bomb.state === 'defusing' && team.side === 'CT'" :class="['bomb-defuse-wrap', team.side]">
            <div class="progress-bar-wrap">
                <div class="progress-bar" :style="progressBarStyle"></div>
            </div>
            <div class="bomb-defuse-column">
                <div class="bomb-defuse-text">
                    Defusing <span> by {{ bomb.player?.name }}</span>
                </div>
            </div>
            <div class="bomb-defuse-column">
                <div class="bomb-defuse-time">
                    {{ timeoutSeconds }}s
                </div>
            </div>
        </div>
    </transition>
</template>

<style scoped lang="scss">
.bomb-defuse-wrap {
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
            z-index: 0;
            transition: width 0.01s;
        }
    }

    .bomb-defuse-column {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-direction: row;
        width: 100%;

        .bomb-defuse-text {
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

        .bomb-defuse-time {
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
import { computed } from 'vue'


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

const progressMaxSeconds = computed(() => {
    if (props.bomb.player?.state.defusekit === true) {
        return 5
    } else {
        return 10
    }
});

const endsInRaw = computed(() => Number(props.bomb.countdown ?? progressMaxSeconds.value))
const timeoutEndsIn = computed(() => {
    const v = endsInRaw.value
    if (!Number.isFinite(v)) return progressMaxSeconds.value
    return Math.max(0, Math.min(progressMaxSeconds.value, v))
})
const timeoutSeconds = computed(() => Math.ceil(timeoutEndsIn.value))
const progressPercent = computed(() => {
    return +((timeoutEndsIn.value / progressMaxSeconds.value) * 100).toFixed(2)
})
const progressBarStyle = computed(() => ({ width: `${progressPercent.value}%` }))
</script>
