export const commafy = (list) => {
  const len = list.length
  if(len === 0 || len === 1) {
    return list[0]
  } else if(len === 2) {
    return `${list[0]} & ${list[1]}}`
  } else {
    return [
      list.slice(0, len - 1).join(', '),
      list.slice(-1)[0]
    ].join(', & ')
  }
}

export const capitalize = (word) => (
  (word || '').split('-')
  .map(p => ((p[0] && p[0].toUpperCase()) || '') + p.slice(1))
  .join('-')
)

// https://stackoverflow.com/a/43208163
export const toRadian = degree => degree * Math.PI / 180
export const distanceBetween = (origin, destination) => {
  const p = {
    1: { lat: toRadian(origin.lat), lng: toRadian(origin.lng) },
    2: { lat: toRadian(destination.lat), lng: toRadian(destination.lng) },
  }
  const delta = { lat: p[2].lat - p[1].lat, lng: p[2].lng - p[1].lng }
  const a = (
    Math.pow(Math.sin(delta.lat / 2), 2)
    + Math.cos(p[1].lat) * Math.cos(p[2].lat)
    * Math.pow(Math.sin(delta.lng / 2), 2)
  )
  const c = 2 * Math.asin(Math.sqrt(a))
  const EARTH_RADIUS = 6371000 // meters
  return c * EARTH_RADIUS
}

export const chunk = (from, size) => {
  const isStr = typeof(from) === 'string'
  let arr = Array.from(from)
  let to = []
  while(arr.length) {
    const nxt = arr.splice(0, size)
    to.push(isStr ? nxt.join('') : nxt)
  }
  return to
}