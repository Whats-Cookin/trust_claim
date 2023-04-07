const camelCaseToSimpleString = (str: string) => {
  const result = str.replace(/([A-Z])/g, ' $1')
  const finalResult = result.charAt(0).toUpperCase() + result.slice(1)
  return finalResult
}

export { camelCaseToSimpleString }
