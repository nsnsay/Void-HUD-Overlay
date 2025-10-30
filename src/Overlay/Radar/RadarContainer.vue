<template>
    <div class="radar-container">
        <SeriesName v-if="data.settings" :settings="data.settings" />
        <div class="map-container" :style="containerStyle">
            <template v-if="isSupportedMap">
                <div class="map" :style="mapStyle">
                    <!-- Players -->
                    <div v-for="player in playersExtended" :key="player.id" :class="playerClasses(player)"
                        :style="playerStyle(player)">
                        <div class="content" :style="playerContentStyle(player)">
                            <div class="background-fire"
                                :style="{ transform: `rotate(${-90 + (player.position[2] ?? 0)}deg)`, opacity: isShootingNow(player.lastShoot) ? 1 : 0 }">
                                <div class="bg" />
                            </div>
                            <div class="background"
                                :style="{ transform: `rotate(${45 + (player.position[2] ?? 0)}deg)` }" />
                            <div class="label">
                                <!-- If result is 10, return 0-->
                                {{ player.label === 9 ? 0 : Number(player.label) + 1 }}
                            </div>
                        </div>
                    </div>

                    <!-- Grenades (skip inferno flames) -->
                    <div v-for="grenade in grenadesRenderable" :key="grenade.id" :class="grenadeClasses(grenade)"
                        :style="grenadeStyle(grenade)">
                        <div class="content"
                            :style="grenade.type === 'smoke' && (grenade.state === 'landed' || grenade.state === 'exploded') ? { width: `${lexoConfig.smokeSize}px`, height: `${lexoConfig.smokeSize}px` } : {}">
                            <div class="explode-point" />
                            <div class="background" />
                        </div>
                    </div>

                    <!-- Bomb -->
                    <template v-if="bombRenderable">
                        <div v-for="bombEl in bombElements" :key="bombEl.key" :class="bombEl.class"
                            :style="bombEl.style">
                            <div class="content">
                                <div class="explode-point" />
                                <div class="background" />
                            </div>
                        </div>
                    </template>
                </div>
            </template>
            <template v-else>
                <div class="map"
                    style="width:1024px;height:1024px;display:flex;align-items:center;justify-content:center">
                    Unsupported map</div>
            </template>
        </div>
    </div>
</template>

<style lang="scss">
@use '@/Overlay/LexoRadar/index.scss';

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}

.radar-container {
    position: absolute;
    top: var(--safezone-x);
    left: var(--safezone-y);

    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
}
</style>

<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import type { CSGO, Bomb, Player, Grenade, FragOrFireBombOrFlashbandGrenade } from '@/csgo-extended'
import maps, { type MapConfig, type ZoomAreas } from '@/Overlay/LexoRadar/maps'
import { parsePosition, extendPlayer, extendGrenade, playersStates, grenadesStates, EXPLODE_TIME_FRAG, explosionPlaces } from '@/Overlay/LexoRadar/utils'
import lexoConfig from '@/Overlay/LexoRadar/config'
import type { RadarPlayerObject, RadarGrenadeObject } from '@/Overlay/LexoRadar/interface'
import SeriesName from './seriesName.vue'

const props = defineProps({
    data: { type: Object as () => CSGO, default: () => ({}) },
    size: { type: Number, default: 400 }
})

const DESCALE_ON_ZOOM = true

// Keep last snapshot for explosion detection
const lastData = ref<CSGO | null>(null)

// Push history for smoothing and detect explosion places on each data update
watch(
    () => props.data,
    (data) => {
        const currentGrenades: Grenade[] = data?.grenades || []
        grenadesStates.unshift(currentGrenades)
        grenadesStates.splice(5)

        const currentPlayers: Player[] = data?.players || []
        playersStates.unshift(currentPlayers)
        playersStates.splice(5)

        // Detect frag explosion crossing threshold
        if (lastData.value) {
            const prev = lastData.value
            for (const grenade of currentGrenades.filter((g): g is FragOrFireBombOrFlashbandGrenade => g.type === 'frag')) {
                const old = (prev.grenades || []).find((og): og is FragOrFireBombOrFlashbandGrenade => og.id === grenade.id)
                if (!old) continue
                if (grenade.lifetime >= EXPLODE_TIME_FRAG && old.lifetime < EXPLODE_TIME_FRAG) {
                    explosionPlaces[grenade.id] = grenade.position
                }
            }
            // Cleanup explosion places when grenade disappears
            for (const grenadeId of Object.keys(explosionPlaces)) {
                const exists = currentGrenades.some((g) => g.id === grenadeId)
                if (!exists) delete explosionPlaces[grenadeId]
            }
        }

        lastData.value = data
    },
    { immediate: true }
)

const offset = computed(() => (props.size - (props.size * props.size) / 1024) / 2)
const containerStyle = computed(() => ({
    width: `${props.size}px`,
    height: `${props.size}px`,
    transform: `scale(${(props.size / 1024).toFixed(4)})`,
    top: `-${offset.value}px`,
    left: `-${offset.value}px`
}))

const mapName = computed(() => props.data?.map?.name || '')
const safeMaps = maps as Record<string, MapConfig>
const isSupportedMap = computed(() => !!mapName.value && Object.prototype.hasOwnProperty.call(safeMaps, mapName.value))

const mapConfig = computed<MapConfig | null>(() => (isSupportedMap.value ? safeMaps[mapName.value]! : null))

// Extend players and grenades into radar entities
const playersExtended = computed<RadarPlayerObject[]>(() => {
    const playerSteamId = props.data?.player?.steamid || null
    const rawPlayers = props.data?.players || []
    return rawPlayers
        .map((pl) => extendPlayer({ player: pl, steamId: playerSteamId, mapName: mapName.value }))
        .filter((pl): pl is RadarPlayerObject => pl !== null)
        .flat()
})

const grenadesExtended = computed<RadarGrenadeObject[]>(() => {
    const rawGrenades = props.data?.grenades || []
    return rawGrenades
        .map((gr) => extendGrenade({ grenade: gr, side: playersExtended.value.find((p) => p.steamid === gr.owner)?.side || 'CT', mapName: mapName.value }))
        .filter((entry) => entry !== null)
        .flat() as RadarGrenadeObject[]
})

const zooms = computed<ZoomAreas[]>(() => ((mapConfig.value && 'zooms' in mapConfig.value && mapConfig.value.zooms) ? mapConfig.value.zooms! : []))
const activeZoom = computed<ZoomAreas | undefined>(() => zooms.value.find((z) => z.threshold(playersExtended.value.map((p) => p.player))))
const reverseZoom = computed(() => {
    const rz = 1 / ((activeZoom.value && activeZoom.value.zoom) || 1)
    return DESCALE_ON_ZOOM ? rz.toFixed(2) : '1'
})

const mapStyle = computed(() => {
    if (!mapConfig.value) return {}
    const bg = { backgroundImage: `url(${mapConfig.value.file})` }
    if (activeZoom.value) {
        return {
            ...bg,
            transform: `scale(${activeZoom.value.zoom})`,
            transformOrigin: `${activeZoom.value.origin[0]}px ${activeZoom.value.origin[1]}px`
        }
    }
    return bg
})

// Players rendering helpers
const isShootingNow = (lastShoot: number) => new Date().getTime() - lastShoot <= 250
const playerClasses = (player: RadarPlayerObject) => `player ${player.shooting ? 'shooting' : ''} ${player.flashed ? 'flashed' : ''} ${player.side} ${player.hasBomb ? 'hasBomb' : ''} ${player.isActive ? 'active' : ''} ${!player.isAlive ? 'dead' : ''} ${player.visible ? 'visible' : 'hidden'}`
const playerStyle = (player: RadarPlayerObject) => ({
    transform: `translateX(${(player.position[0] ?? 0).toFixed(2)}px) translateY(${(player.position[1] ?? 0).toFixed(2)}px) translateZ(10px) scale(${reverseZoom.value})`
})
const playerContentStyle = (player: RadarPlayerObject) => ({ width: `${lexoConfig.playerSize * player.scale}px`, height: `${lexoConfig.playerSize * player.scale}px` })

// Grenades rendering helpers
const grenadesRenderable = computed(() => grenadesExtended.value.filter((g) => !('flames' in (g as any))))
const grenadeClasses = (grenade: RadarGrenadeObject) => `grenade ${grenade.type} ${grenade.state} ${grenade.side || ''} ${grenade.visible ? 'visible' : 'hidden'}`
const grenadeStyle = (grenade: RadarGrenadeObject) => ({
    transform: `translateX(${(grenade.position[0] ?? 0).toFixed(2)}px) translateY(${(grenade.position[1] ?? 0).toFixed(2)}px) translateZ(10px) scale(${reverseZoom.value})`
})

// Bomb rendering helpers
const bombRenderable = computed(() => {
    const bomb = props.data?.bomb
    if (!bomb) return false
    return !(bomb.state === 'carried' || bomb.state === 'planting')
})

type BombElement = { key: string; class: string; style: { transform: string } }
const bombElements = computed<BombElement[]>(() => {
    const bomb = props.data?.bomb as Bomb | null
    if (!bombRenderable.value || !bomb || !mapConfig.value) return [] as BombElement[]
    if ('config' in mapConfig.value) {
        const pos = parsePosition(bomb.position, mapConfig.value.config)
        if (!pos) return []
        return [
            {
                key: `bomb_single`,
                class: `bomb ${bomb.state} visible`,
                style: { transform: `translateX(${(pos[0] ?? 0).toFixed(2)}px) translateY(${(pos[1] ?? 0).toFixed(2)}px) translateZ(10px) scale(${reverseZoom.value})` }
            }
        ]
    }
    // double layer
    const elements = mapConfig.value.configs.map((cfg) => {
        const pos = parsePosition(bomb.position, cfg.config)
        if (!pos) return null
        return {
            key: `bomb_${cfg.id}`,
            class: `bomb ${bomb.state} ${cfg.isVisible(bomb.position[2] ?? 0) ? 'visible' : 'hidden'}`,
            style: { transform: `translateX(${(pos[0] ?? 0).toFixed(2)}px) translateY(${(pos[1] ?? 0).toFixed(2)}px) translateZ(10px) scale(${reverseZoom.value})` }
        } as BombElement
    })
    return elements.filter((b): b is BombElement => b !== null)
})
</script>
