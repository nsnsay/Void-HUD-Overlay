<template>
    <Transition name="timeout-fade" appear>
        <div v-if="displayWho" :class="['team-timeout-wrap', team.side]">
            <div class="progress-bar-wrap">
                <div class="progress-bar" :style="progressBarStyle"></div>
            </div>
            <div class="team-timeout-column">
                <div class="team-timeout-text">
                    Timeout
                </div>
                <div class="timeout-left">
                    {{ team.timeouts_remaining }} / 3 Left
                </div>
            </div>
            <div class="team-timeout-column">
                <div class="timeout-team">
                    by {{ team.infos?.name || team.name }}
                </div>
                <div class="timeout-time">
                    {{ timeoutSeconds }}s
                </div>
            </div>
        </div>
    </Transition>
</template>

<style scoped lang="scss">
.team-timeout-wrap {
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

        .team-timeout-column {
            flex-direction: row-reverse;
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
            transition: transform 0.2s ease-in-out;
            will-change: transform;
        }
    }

    .team-timeout-column {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-direction: row;
        width: 100%;

        .team-timeout-text {
            font-size: 1rem;
            font-weight: 800;
            z-index: 2;
        }

        .timeout-left {
            font-size: 0.85rem;
            font-weight: 600;
            z-index: 2;
        }

        .timeout-team {
            font-size: 0.85rem;
            font-weight: 600;
            z-index: 2;
        }

        .timeout-time {
            font-size: 0.85rem;
            font-weight: 600;
            z-index: 2;
        }
    }
}

/* Timeout 组件淡入淡出过渡样式 */
.timeout-fade-enter-active,
.timeout-fade-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.timeout-fade-enter-from {
    opacity: 0;
    transform: translateY(-20px);
}

.timeout-fade-enter-to {
    opacity: 1;
    transform: translateY(0);
}

.timeout-fade-leave-from {
    opacity: 1;
    transform: translateY(0);
}

.timeout-fade-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}
</style>

<script setup lang="ts">
import type { Team, Map, PhaseRaw } from '@/csgo-extended'
import { computed } from 'vue';

const progressMaxSeconds = 30;

const props = defineProps({
    team: {
        type: Object as () => Team,
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

const displayWho = computed(() => {
    if (props.phase.phase === 'timeout_ct' && props.team.side === 'CT') {
        return true;
    }
    if (props.phase.phase === 'timeout_t' && props.team.side === 'T') {
        return true;
    }
    return false;
})

const endsInRaw = computed(() => Number(props.phase?.phase_ends_in ?? progressMaxSeconds))
const timeoutEndsIn = computed(() => {
    const v = endsInRaw.value
    if (!Number.isFinite(v)) return progressMaxSeconds
    return Math.max(0, Math.min(progressMaxSeconds, v))
})
const timeoutSeconds = computed(() => Math.ceil(timeoutEndsIn.value))
const progressRatio = computed(() => {
    if (!displayWho.value) return 0
    return +((timeoutEndsIn.value / progressMaxSeconds)).toFixed(4)
})
const progressBarStyle = computed(() => ({ transform: `scaleX(${progressRatio.value})` }))

</script>
