const fs = require('fs')
const path = require('path')

// Updated regex to match hex color codes with or without quotes
const hexColorRegex = /#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})\b/g

function findFilesInDir(startPath, filter) {
  let results = []
  if (!fs.existsSync(startPath)) {
    console.log('no dir ', startPath)
    return
  }

  const files = fs.readdirSync(startPath)
  for (const file of files) {
    const filename = path.join(startPath, file)
    const stat = fs.lstatSync(filename)
    if (stat.isDirectory()) {
      // Skip the node_modules directory
      if (file === 'node_modules') {
        continue
      }
      results = results.concat(findFilesInDir(filename, filter))
    } else if (filter.test(filename)) {
      results.push(filename)
    }
  }
  return results
}

function extractHexColors(file) {
  const content = fs.readFileSync(file, 'utf8')
  const matches = content.match(hexColorRegex)
  return matches || []
}

const files = findFilesInDir('./', /\.(js|jsx|ts|tsx)$/)
const hexColorCounts = {}

files.forEach(file => {
  const colors = extractHexColors(file)
  colors.forEach(color => {
    if (hexColorCounts[color]) {
      hexColorCounts[color]++
    } else {
      hexColorCounts[color] = 1
    }
  })
})

const sortedHexColors = Object.entries(hexColorCounts).sort((a, b) => b[1] - a[1])

const outputContent = sortedHexColors.map(([color, count]) => `${color}: ${count}`).join('\n')
fs.writeFileSync('hex_colors_with_counts.txt', outputContent, 'utf8')

console.log(`Found ${Object.keys(hexColorCounts).length} unique hex colors.`)
