export const validateCard = (card) => {
  if (!card || typeof card !== 'object') {
    return { valid: false, error: 'Card must be an object' }
  }
  if (!card.title || typeof card.title !== 'string' || card.title.trim().length === 0) {
    return { valid: false, error: 'Card title is required' }
  }
  if (card.title.length > 200) {
    return { valid: false, error: 'Card title must be 200 characters or less' }
  }
  if (card.description && card.description.length > 2000) {
    return { valid: false, error: 'Card description must be 2000 characters or less' }
  }
  if (card.tags && !Array.isArray(card.tags)) {
    return { valid: false, error: 'Tags must be an array' }
  }
  return { valid: true }
}

export const validateList = (list) => {
  if (!list || typeof list !== 'object') {
    return { valid: false, error: 'List must be an object' }
  }
  if (!list.title || typeof list.title !== 'string' || list.title.trim().length === 0) {
    return { valid: false, error: 'List title is required' }
  }
  if (list.title.length > 100) {
    return { valid: false, error: 'List title must be 100 characters or less' }
  }
  return { valid: true }
}

export const validateTag = (tag) => {
  if (!tag || typeof tag !== 'string' || tag.trim().length === 0) {
    return { valid: false, error: 'Tag must be a non-empty string' }
  }
  if (tag.length > 30) {
    return { valid: false, error: 'Tag must be 30 characters or less' }
  }
  return { valid: true }
}

