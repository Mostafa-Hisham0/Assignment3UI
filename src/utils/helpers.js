import { v4 as uuidv4 } from 'uuid'

export const generateId = () => uuidv4()

export const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleString()
}

export const getContrastColor = (hexColor) => {
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128 ? '#000000' : '#ffffff'
}

export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const throttle = (func, limit) => {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj))
}

export const mergeObjects = (base, local, server) => {
  if (!base && !local && !server) {
    return {}
  }
  if (!base) {
    return { ...(local || {}), ...(server || {}) }
  }
  if (!local) {
    return server || base || {}
  }
  if (!server) {
    return { ...(base || {}), ...(local || {}) }
  }

  const merged = { ...server }

  for (const key in local) {
    if (Object.prototype.hasOwnProperty.call(local, key)) {
      if (typeof local[key] === 'object' && local[key] !== null && !Array.isArray(local[key])) {
        merged[key] = mergeObjects(base[key], local[key], server[key] || {})
      } else if (Array.isArray(local[key])) {
        if (JSON.stringify(local[key]) !== JSON.stringify(base[key])) {
          merged[key] = local[key]
        }
      } else {
        if (local[key] !== base[key] && local[key] !== server[key]) {
          merged[key] = local[key]
        }
      }
    }
  }

  return merged
}

