<template>
    <div :class="['map-score-wrap', team.side]">
        <div v-for="(item, idx) in compressedItems" :key="idx"
            :class="['map-score-item', team.side, { win: item.isWin, decider: item.isDecider }]">
        </div>
    </div>
</template>

<style scoped lang="scss">
.map-score-wrap {
    position: absolute;
    left: 50%;
    top: 10px;
    transform: translateX(-50%);
    z-index: 3;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3px;

    &.T {
        flex-direction: row-reverse;
    }

    .map-score-item {
        width: 36px;
        height: 6px;
        background: var(--secondary-20);
        position: relative;
        overflow: hidden;
        transition: transform 0.2s ease, background 0.2s ease;

        &.CT {
            &.win {
                background: var(--ct-70)
            }
        }

        &.T {
            &.win {
                background: var(--t-70)
            }
        }
    }

}
</style>

<script setup lang="ts">
import type { Match, Team } from '@/csgo-extended'
import { computed } from 'vue'

const props = defineProps({
    match: {
        type: Object as () => Match,
        default: () => ({})
    },
    team: {
        type: Object as () => Team,
        default: () => ({})
    }
})

const matchObj = computed(() => {
    const m = props.match as Record<string, any> | undefined
    if (!m || typeof m !== 'object') return null
    const keys = Object.keys(m)
    const firstKey = keys[0]
    return firstKey ? m[firstKey] ?? null : null
})

// 系列类型与显示槽位映射
const seriesType = computed<string>(() => {
    const t = matchObj.value?.type
    return typeof t === 'string' ? t.toUpperCase() : 'BO1'
})

const slotCount = computed<number>(() => {
    switch (seriesType.value) {
        case 'BO1': return 1
        case 'BO2': return 2
        case 'BO3': return 2
        case 'BO4': return 3
        case 'BO5': return 3
        default: {
            const len = Array.isArray(matchObj.value?.maps) ? matchObj.value!.maps.length : 1
            // 未知系列类型时，按“赢半数+1”计算需要赢的场数
            return Math.max(1, Math.ceil(len / 2))
        }
    }
})

// 规范化分数：空串/无效值以0处理
function normalizeScore(s: unknown): number {
    const n = Number(s)
    return Number.isFinite(n) ? n : 0
}

// 统计当前队伍在全部地图中的胜场总数，并限制为系列需要的赢场数
const winsCountAll = computed(() => {
    const maps: any[] = Array.isArray(matchObj.value?.maps) ? matchObj.value!.maps : []
    const teamId = Number((props.team as any)?.infos?.id ?? (props.team as any)?.id)
    let wins = 0
    for (let i = 0; i < maps.length; i++) {
        const mp = maps[i] ?? {}
        const aId = Number(mp?.aid ?? mp?.team_a?.id)
        const bId = Number(mp?.bid ?? mp?.team_b?.id)
        const aScore = normalizeScore(mp?.ascore ?? mp?.team_a?.score)
        const bScore = normalizeScore(mp?.bscore ?? mp?.team_b?.score)
        if (!Number.isFinite(aScore) || !Number.isFinite(bScore)) continue
        if (aScore === bScore) continue
        const winnerId = aScore > bScore ? aId : bId
        if (Number.isFinite(teamId) && winnerId === teamId) wins++
    }
    return Math.min(wins, slotCount.value)
})

// 压缩显示：把获胜条聚拢到左侧，避免中间出现空隙
const compressedItems = computed((): Array<{ name: string, aScore: number, bScore: number, isWin: boolean, isDecider: boolean }> => {
    const count = slotCount.value
    const winsCount = winsCountAll.value
    const maps: any[] = Array.isArray(matchObj.value?.maps) ? matchObj.value!.maps : []
    const hasDecider = maps.some(m => Boolean(m?.decider))
    const result: Array<{ name: string, aScore: number, bScore: number, isWin: boolean, isDecider: boolean }> = []

    for (let i = 0; i < count; i++) {
        result.push({
            name: `Slot ${i + 1}`,
            aScore: 0,
            bScore: 0,
            isWin: i < winsCount,
            isDecider: hasDecider && winsCount < count && i === count - 1,
        })
    }
    return result
})


</script>
