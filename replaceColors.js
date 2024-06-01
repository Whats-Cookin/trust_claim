const fs = require('fs')
const path = require('path')

const colorMap = {
  '#ffffff': 'theme.palette.textc',
  '#0a1c1d': 'theme.palette.formbackground',
  '#009688': 'theme.palette.icons',
  '#00695f': 'theme.palette.Button',
  '#4C726F': 'theme.palette.date',
  '#172d2d': 'theme.palette.menubackground',
  '#1976d2': 'theme.palette.Link',
  '#000000': 'theme.palette.black',
  '#00796b': 'theme.palette.Buttonhover',
  '#2f0101': 'theme.palette.profilebutton',
  '#333333': 'theme.palette.dialogbackground',
  '#1a1a1a': 'theme.palette.footerbackground',
  '#2b4746': 'theme.palette.searchbarbackground'
}

const excludedFiles = ['replaceColors.js', 'extractHexColors.js', 'Theme.ts']

function replaceColors(filePath) {
  let fileContent = fs.readFileSync(filePath, 'utf-8')

  // Avoid replacing colors inside SVG tags
  const svgRegex = /<svg[\s\S]*?<\/svg>/g
  let svgMatches = []
  let match
  while ((match = svgRegex.exec(fileContent)) !== null) {
    svgMatches.push(match[0])
  }

  svgMatches.forEach(svg => {
    fileContent = fileContent.replace(svg, '__SVG_PLACEHOLDER__')
  })

  // Replace color codes with variables without curly braces
  Object.keys(colorMap).forEach(hexColor => {
    const variableName = `${colorMap[hexColor]}`
    const regex = new RegExp(`(['"])${hexColor}\\1`, 'gi')
    fileContent = fileContent.replace(regex, variableName)
  })

  // Ensure useTheme import is present
  const useThemeImport = "import { useTheme } from '@mui/material/styles'"
  if (!fileContent.includes(useThemeImport)) {
    if (fileContent.includes("'use client'")) {
      fileContent = fileContent.replace("'use client'", `'use client'\n${useThemeImport}`)
    } else {
      fileContent = `${useThemeImport}\n${fileContent}`
    }
  }

  // Remove redundant declarations of const theme = useTheme()
  const themeDeclaration = 'const theme = useTheme()'
  const themeDeclarationRegex = new RegExp(`\\b${themeDeclaration}\\b`, 'g')
  const themeDeclarations = fileContent.match(themeDeclarationRegex)
  if (themeDeclarations && themeDeclarations.length > 1) {
    fileContent = fileContent.replace(themeDeclarationRegex, '')
  }

  // Insert only one theme declaration at the top of the first function component
  const functionComponentRegex =
    /(function\s+\w+\s*\([^)]*\)\s*{)|(const\s+\w+\s*=\s*\(\s*\)\s*=>\s*{)|(export\s+default\s+function\s+\w+\s*\([^)]*\)\s*{)/g
  let functionsFound = functionComponentRegex.exec(fileContent)
  if (functionsFound) {
    const funcDeclaration = functionsFound[0]
    const funcBodyStartIndex = functionsFound.index + funcDeclaration.length
    fileContent =
      fileContent.slice(0, funcBodyStartIndex) + `\n  ${themeDeclaration}\n` + fileContent.slice(funcBodyStartIndex)
  }

  // Restore SVG content
  svgMatches.forEach(svg => {
    fileContent = fileContent.replace('__SVG_PLACEHOLDER__', svg)
  })

  fs.writeFileSync(filePath, fileContent, 'utf-8')
  console.log(`Updated file: ${filePath}`)
}

function scanDirectory(directoryPath) {
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return console.error(`Unable to scan directory: ${err}`)
    }

    files.forEach(file => {
      const filePath = path.join(directoryPath, file)
      const fileExt = path.extname(file).toLowerCase()

      if (fs.statSync(filePath).isDirectory()) {
        if (file !== 'node_modules') {
          scanDirectory(filePath)
        }
      } else if (
        fs.statSync(filePath).isFile() &&
        (fileExt === '.js' || fileExt === '.ts' || fileExt === '.tsx' || fileExt === '.jsx') &&
        !excludedFiles.includes(file)
      ) {
        replaceColors(filePath)
      }
    })
  })
}

const directoryPath = 'E:\\trust_claim\\src'
scanDirectory(directoryPath)
