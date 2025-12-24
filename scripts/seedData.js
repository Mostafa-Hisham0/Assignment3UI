// Note: This script should be run in a browser environment or with a Node.js IndexedDB polyfill
// For now, it's a reference implementation

const { v4: uuidv4 } = require('uuid')

// This would need to be adapted based on your environment
// For browser: use the actual storage module
// For Node: use a polyfill or different storage mechanism

const generateRandomTitle = () => {
  const titles = [
    'Implement user authentication',
    'Fix bug in payment processing',
    'Add dark mode support',
    'Optimize database queries',
    'Create user dashboard',
    'Update API documentation',
    'Refactor component structure',
    'Add unit tests',
    'Improve error handling',
    'Design new landing page',
    'Integrate third-party service',
    'Performance optimization',
    'Security audit',
    'Code review',
    'Deploy to production',
  ]
  return titles[Math.floor(Math.random() * titles.length)]
}

const generateRandomDescription = () => {
  const descriptions = [
    'This task requires careful attention to detail and thorough testing.',
    'Please ensure all edge cases are covered before marking as complete.',
    'Review the design specifications before starting implementation.',
    'Coordinate with the backend team before making API changes.',
    'Test on multiple browsers and devices.',
    'Follow the coding standards and best practices.',
    'Update documentation after completing this task.',
    'Get approval from the product owner before deployment.',
  ]
  return descriptions[Math.floor(Math.random() * descriptions.length)]
}

const generateRandomTags = () => {
  const allTags = ['frontend', 'backend', 'bug', 'feature', 'urgent', 'refactor', 'testing', 'documentation']
  const numTags = Math.floor(Math.random() * 3) + 1
  const tags = []
  for (let i = 0; i < numTags; i++) {
    const tag = allTags[Math.floor(Math.random() * allTags.length)]
    if (!tags.includes(tag)) {
      tags.push(tag)
    }
  }
  return tags
}

const seedData = async () => {
  console.log('Starting data seeding...')

  const listTitles = ['Backlog', 'Doing', 'Review', 'Done']
  const lists = []

  for (let i = 0; i < listTitles.length; i++) {
    const list = {
      id: generateId(),
      title: listTitles[i],
      order: i,
      archived: false,
      version: 1,
      lastModifiedAt: new Date().toISOString(),
    }
    lists.push(list)
    await storage.saveList(list)
  }

  console.log(`Created ${lists.length} lists`)

  const cards = []
  const cardsPerList = Math.ceil(500 / lists.length)

  for (let i = 0; i < lists.length; i++) {
    const listId = lists[i].id
    for (let j = 0; j < cardsPerList; j++) {
      const card = {
        id: generateId(),
        listId: listId,
        title: `${generateRandomTitle()} ${j + 1}`,
        description: Math.random() > 0.3 ? generateRandomDescription() : '',
        tags: Math.random() > 0.5 ? generateRandomTags() : [],
        order: j,
        version: 1,
        lastModifiedAt: new Date().toISOString(),
      }
      cards.push(card)
      await storage.saveCard(card)
    }
    console.log(`Created ${cardsPerList} cards for list: ${lists[i].title}`)
  }

  console.log(`Total cards created: ${cards.length}`)
  console.log('Data seeding completed!')
}

seedData().catch(console.error)

