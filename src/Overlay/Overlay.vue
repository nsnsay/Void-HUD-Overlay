<template>
    <FocusedPlayer v-if="data.player && data.settings.overlayFocusedPlayer" :player="data.player ?? undefined" />
    <AllPlayers v-if="data.players && data.settings.overlaySidebars" :players="data.players" :map="data.map"
        :phase="data.phase_countdowns as any" />
    <GameRadars v-if="data.players && data.settings.overlayRadar" :data="data" />
    <Matchs v-if="data && data.settings.overlayTopbar" :data="data" />
    <Series v-if="data" :data="data" />
</template>

<style scoped lang="scss"></style>

<script setup lang="ts">
import type { CSGO } from '../csgo-extended'
import { onMounted } from 'vue'
import FocusedPlayer from './Player/Player.vue'
import AllPlayers from './Players/PlayersContainer.vue'
import GameRadars from './Radar/RadarContainer.vue'
import Matchs from './Matchs/Matchs.vue'
import Series from './Series/Series.vue'



const props = defineProps({
    data: {
        type: Object as () => CSGO,
        default: () => ({})
    }
})

function hexToRgb(hex: string) {
    const bigint = parseInt(hex.slice(1), 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255
    return `${r}, ${g}, ${b}`
}

function configureColors() {
    const ctColor = '#' + props.data.settings.ctColor.toUpperCase()
    const tColor = '#' + props.data.settings.tColor.toUpperCase()
    setCounterTerroristThemeColor(ctColor)
    setTerroristThemeColor(tColor)
}

function configureOthers() {
    const borderRadius = props.data.settings.borderRadius
    setBorderRadius(borderRadius)
}

function setCounterTerroristThemeColor(color: string) {
    document.documentElement.style.setProperty('--ct-color', color)
    document.documentElement.style.setProperty('--ct-color-rgb', hexToRgb(color))
}
function setTerroristThemeColor(color: string) {
    document.documentElement.style.setProperty('--t-color', color)
    document.documentElement.style.setProperty('--t-color-rgb', hexToRgb(color))
}

function setBorderRadius(radius: string) {
    // if radius value doesn't exist px, else add px
    if (!radius.includes('px')) {
        radius += 'px'
    }
    if (radius) {
        document.documentElement.style.setProperty('--border-radius', radius)
    }
    else {
        document.documentElement.style.setProperty('--border-radius', '8px')
    }
}

onMounted(() => {
    configureColors()
    configureOthers()
})
</script>
