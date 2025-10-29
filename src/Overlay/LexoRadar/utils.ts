import { type Player, type Side, type Grenade } from '@/csgo-extended'
import maps, { type ScaleConfig, type MapConfig } from './maps'
import { type ExtendedGrenade, type RadarGrenadeObject, type RadarPlayerObject } from './interface'
import { type InfernoGrenade } from '@/csgo-extended'

export const playersStates: Player[][] = []
export const grenadesStates: Grenade[][] = []
const directions: { [key: string]: number } = {}

export const explosionPlaces: Record<string, number[]> = {}

type ShootingState = {
  ammo: number
  weapon: string
  lastShoot: number
}
let shootingState: Record<string, ShootingState> = {}

const calculateDirection = (player: Player) => {
  const existing = directions[player.steamid]
  if (existing !== undefined && !player.state.health) return existing

  const fwd = player.forward || [0, 1]
  const forwardV1 = fwd[0] ?? 0
  const forwardV2 = fwd[1] ?? 1
  let direction = 0

  const axisA = (Math.asin(forwardV1) * 180) / Math.PI
  const axisB = (Math.acos(forwardV2) * 180) / Math.PI

  if (axisB < 45) {
    direction = Math.abs(axisA)
  } else if (axisB > 135) {
    direction = 180 - Math.abs(axisA)
  } else {
    direction = axisB
  }

  if (axisA < 0) {
    direction = -(direction -= 360)
  }

  const previous = directions[player.steamid] ?? direction
  let modifier = previous
  modifier -= 360 * Math.floor(previous / 360)
  modifier = -(modifier -= direction)

  if (Math.abs(modifier) > 180) {
    modifier -= (360 * Math.abs(modifier)) / modifier
  }
  directions[player.steamid] = (directions[player.steamid] ?? direction) + modifier

  return directions[player.steamid]
}

export const round = (n: number) => {
  const r = 0.02
  return Math.round(n / r) * r
}

export const parsePosition = (position: number[], config: ScaleConfig): [number, number] => {
  const x = position[0] ?? 0
  const y = position[1] ?? 0
  const left = config.origin.x + x * config.pxPerUX
  const top = config.origin.y + y * config.pxPerUY

  return [round(left), round(top)]
}

export const parsePlayerPosition = (
  player: Player,
  mapConfig: ScaleConfig,
): [number, number, number] => {
  const playerData = playersStates
    .slice(0, 5)
    .map((players) => players.filter((pl) => pl.steamid === player.steamid)[0])
    .filter((pl): pl is Player => !!pl)
  if (playerData.length === 0) return [0, 0, calculateDirection(player) ?? 0]
  const positions: [number, number][] = playerData.map((playerEntry) =>
    parsePosition(playerEntry.position, mapConfig),
  )
  const entryAmount = positions.length
  let x = 0
  let y = 0
  for (const position of positions) {
    x += position[0]
    y += position[1]
  }

  const degree = calculateDirection(player) ?? 0
  return [x / entryAmount, y / entryAmount, Number(degree)]
}

const parseGrenadePosition = (
  grenade: ExtendedGrenade,
  config: ScaleConfig,
): [number, number] | null => {
  if (Object.prototype.hasOwnProperty.call(explosionPlaces, grenade.id))
    return parsePosition(explosionPlaces[grenade.id]!, config)
  const grenadeData = grenadesStates
    .slice(0, 5)
    .map((grenades) => grenades.filter((gr) => gr.id === grenade.id)[0])
    .filter((pl): pl is Grenade => !!pl)
  if (grenadeData.length === 0)
    return 'position' in grenade ? parsePosition(grenade.position, config) : null
  const positions: [number, number][] = grenadeData
    .map((grenadeEntry) =>
      'position' in grenadeEntry ? parsePosition(grenadeEntry.position, config) : null,
    )
    .filter((posData): posData is [number, number] => posData !== null)
  if (positions.length === 0) return null
  const entryAmount = positions.length
  let x = 0
  let y = 0
  for (const position of positions) {
    x += position[0]
    y += position[1]
  }

  return [x / entryAmount, y / entryAmount]
}

export const EXPLODE_TIME_FRAG = 1.6
export const EXPLODE_TIME_FLASH = 1.45

export const extendGrenade = ({
  grenade,
  mapName,
  side,
}: {
  side: Side
  grenade: Grenade
  mapName: string
}) => {
  const extGrenade: ExtendedGrenade = {
    ...grenade,
    side,
  }
  const safeMaps = maps as Record<string, MapConfig>
  const map = safeMaps[mapName]
  if (!map) return null

  if (extGrenade.type === 'inferno') {
    const mapFlame = (flame: InfernoGrenade['flames'][number]) => {
      if ('config' in map) {
        return {
          position: parsePosition(flame.position, map.config),
          id: `${flame.id}_${extGrenade.id}`,
          visible: true,
        }
      }
      return map.configs.map((config) => ({
        id: `${flame.id}_${extGrenade.id}_${config.id}`,
        visible: config.isVisible(flame.position[2] ?? 0),
        position: parsePosition(flame.position, config.config),
      }))
    }
    const flames = extGrenade.flames.map(mapFlame).flat()
    const flameObjects: RadarGrenadeObject[] = flames.map((flame) => ({
      ...flame,
      side: extGrenade.side,
      type: 'inferno',
      state: 'landed',
    }))
    return flameObjects
  }

  if ('config' in map) {
    const position = parseGrenadePosition(extGrenade, map.config)

    if (!position) return null
    const grenadeObject: RadarGrenadeObject = {
      type: extGrenade.type,
      state: 'inair',
      side: extGrenade.side,
      position,
      id: extGrenade.id,
      visible: true,
    }
    if (extGrenade.type === 'smoke') {
      if (extGrenade.effecttime !== 0) {
        grenadeObject.state = 'landed'
        if (extGrenade.effecttime >= 16.5) {
          grenadeObject.state = 'exploded'
        }
      }
    } else if (
      (extGrenade.type === 'flashbang' && extGrenade.lifetime >= EXPLODE_TIME_FLASH) ||
      (extGrenade.type === 'frag' && extGrenade.lifetime >= EXPLODE_TIME_FRAG)
    ) {
      grenadeObject.state = 'exploded'
    }
    return grenadeObject
  }
  return map.configs
    .map((config) => {
      const position = parseGrenadePosition(extGrenade, config.config)
      if (!position) return null
      const grenadeObject: RadarGrenadeObject = {
        type: extGrenade.type,
        state: 'inair',
        side: extGrenade.side,
        position,
        id: `${extGrenade.id}_${config.id}`,
        visible: config.isVisible(extGrenade.position[2] ?? 0),
      }
      if (extGrenade.type === 'smoke') {
        if (extGrenade.effecttime !== 0) {
          grenadeObject.state = 'landed'
          if (extGrenade.effecttime >= 16.5) {
            grenadeObject.state = 'exploded'
          }
        }
      } else if (
        (extGrenade.type === 'flashbang' && extGrenade.lifetime >= EXPLODE_TIME_FLASH) ||
        (extGrenade.type === 'frag' && extGrenade.lifetime >= EXPLODE_TIME_FRAG)
      ) {
        grenadeObject.state = 'exploded'
      }
      return grenadeObject
    })
    .filter((grenade): grenade is RadarGrenadeObject => grenade !== null)
}

export const extendPlayer = ({
  player,
  steamId,
  mapName,
}: {
  mapName: string
  player: Player
  steamId: string | null
}): RadarPlayerObject | RadarPlayerObject[] | null => {
  const weapons = player.weapons ? Object.values(player.weapons) : []
  const weapon = weapons.find(
    (weapon) =>
      weapon.state === 'active' &&
      weapon.type !== 'C4' &&
      weapon.type !== 'Knife' &&
      weapon.type !== 'Grenade',
  )

  const shooting: ShootingState = {
    ammo: (weapon && weapon.ammo_clip) || 0,
    weapon: (weapon && weapon.name) || '',
    lastShoot: 0,
  }

  const lastShoot = shootingState[player.steamid] || shooting

  let isShooting = false

  if (shooting.weapon === lastShoot.weapon && shooting.ammo < lastShoot.ammo) {
    isShooting = true
  }

  shooting.lastShoot = isShooting ? new Date().getTime() : lastShoot.lastShoot

  shootingState[player.steamid] = shooting
  const safeMaps = maps as Record<string, MapConfig>
  const map = safeMaps[mapName]
  if (!map) return null

  const playerObject: RadarPlayerObject = {
    id: player.steamid,
    label: player.observer_slot !== undefined ? player.observer_slot : '',
    side: player.team.side,
    position: [],
    visible: true,
    isActive: steamId === player.steamid,
    forward: 0,
    scale: 1,
    steamid: player.steamid,
    flashed: player.state.flashed > 35,
    shooting: isShooting,
    lastShoot: shooting.lastShoot,
    isAlive: player.state.health > 0,
    hasBomb: !!Object.values(player.weapons).find((weapon) => weapon.type === 'C4'),
    player,
  }
  if ('config' in map) {
    const scale =
      map.config.originHeight === undefined
        ? 1
        : 1 + ((player.position[2] ?? 0) - map.config.originHeight) / 1000

    playerObject.scale = scale

    const position = parsePlayerPosition(player, map.config)
    playerObject.position = position

    return playerObject
  }
  return map.configs.map((config) => {
    const scale =
      config.config.originHeight === undefined
        ? 1
        : 1 + ((player.position[2] ?? 0) - config.config.originHeight) / 750

    playerObject.scale = scale

    return {
      ...playerObject,
      position: parsePlayerPosition(player, config.config),
      id: `${player.steamid}_${config.id}`,
      visible: config.isVisible(player.position[2] ?? 0),
    }
  })
}
