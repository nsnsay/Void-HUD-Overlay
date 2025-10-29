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
    bottom: 0;
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
        width: 42px;
        height: 8px;
        background: var(--primary-30);
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
        case 'BO3': return 2 // 按需求显示2个
        case 'BO4': return 3
        case 'BO5': return 3
        default: return Array.isArray(matchObj.value?.maps) ? matchObj.value.maps.length : 1
    }
})

// 规范化分数：空串/无效值以0处理
function normalizeScore(s: unknown): number {
    const n = Number(s)
    return Number.isFinite(n) ? n : 0
}

const displayItems = computed(() => {
    const maps: any[] = Array.isArray(matchObj.value?.maps) ? matchObj.value!.maps : []
    const teamId = Number((props.team as any)?.infos?.id ?? (props.team as any)?.id)
    const count = Math.min(slotCount.value, maps.length)
    const items = [] as Array<{ name: string, aScore: number, bScore: number, isWin: boolean, isDecider: boolean }>

    for (let i = 0; i < count; i++) {
        const mp = maps[i] ?? {}
        const name = String(mp?.name ?? `Map ${i + 1}`)
        const aId = Number(mp?.aid ?? mp?.team_a?.id)
        const bId = Number(mp?.bid ?? mp?.team_b?.id)
        const aScore = normalizeScore(mp?.ascore ?? mp?.team_a?.score)
        const bScore = normalizeScore(mp?.bscore ?? mp?.team_b?.score)

        let winnerId: number | null = null
        if (aScore !== bScore) {
            winnerId = aScore > bScore ? aId : bId
        }

        const isWin = (winnerId !== null) && (Number.isFinite(teamId)) && (winnerId === teamId)
        const isDecider = i === count - 1

        items.push({ name, aScore, bScore, isWin, isDecider })
    }
    return items
})

// 压缩显示：把获胜条聚拢到左侧，避免中间出现空隙
const compressedItems = computed((): Array<{ name: string, aScore: number, bScore: number, isWin: boolean, isDecider: boolean }> => {
    const base = displayItems.value
    const count = base.length
    const winsCount = base.filter(i => i.isWin).length
    const result: Array<{ name: string, aScore: number, bScore: number, isWin: boolean, isDecider: boolean }> = []

    for (let i = 0; i < count; i++) {
        const src = base[i]
        result.push({
            name: src?.name ?? `Map ${i + 1}`,
            aScore: src?.aScore ?? 0,
            bScore: src?.bScore ?? 0,
            isWin: i < winsCount,
            isDecider: i === count - 1,
        })
    }
    return result
})


</script>
