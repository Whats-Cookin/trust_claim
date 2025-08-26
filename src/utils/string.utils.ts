const camelCaseToSimpleString = (str: string) => {
  const result = str.replace(/([A-Z])/g, ' $1')
  const finalResult = result.charAt(0).toUpperCase() + result.slice(1)
  return finalResult
}

/**
 * Extracts a display name from various social platform URLs
 * Supports LinkedIn, GitHub, Google accounts, and generic email addresses
 */
const extractProfileName = (url: string): string => {
  if (!url) return ''
  
  try {
    // Handle LinkedIn URLs
    const linkedinMatch = url.match(/linkedin\.com\/(?:in|company)\/([^\/\?]+)/)
    if (linkedinMatch) {
      return linkedinMatch[1].replace(/-/g, ' ').replace(/\./g, ' ')
    }
    
    // Handle GitHub URLs
    const githubMatch = url.match(/github\.com\/([^\/\?]+)/)
    if (githubMatch) {
      return githubMatch[1].replace(/-/g, ' ').replace(/\./g, ' ')
    }
    
    // Handle Google account URLs (various formats)
    const googleMatch = url.match(/(?:accounts\.google\.com|plus\.google\.com)\/(?:u\/\d+\/)?(?:\+|profile\/)?([^\/\?]+)/)
    if (googleMatch) {
      return googleMatch[1].replace(/\+/g, ' ').replace(/\./g, ' ')
    }
    
    // Handle email addresses (extract name before @)
    const emailMatch = url.match(/^mailto:([^@]+)@/ ) || url.match(/^([^@]+)@[\w.-]+\.[a-zA-Z]{2,}$/)
    if (emailMatch) {
      return emailMatch[1].replace(/[._-]/g, ' ')
    }
    
    // Handle generic URLs - extract domain or path
    try {
      const urlObj = new URL(url)
      const pathSegments = urlObj.pathname.split('/').filter(segment => segment && segment !== 'profile' && segment !== 'user')
      if (pathSegments.length > 0) {
        return pathSegments[0].replace(/[-_.]/g, ' ')
      }
      return urlObj.hostname.replace(/^www\./, '').replace(/\./g, ' ')
    } catch {
      // If URL parsing fails, return the original string
      return url
    }
  } catch {
    return url
  }
}

/**
 * Checks if a string is a valid URL
 */
const isValidUrl = (string: string): boolean => {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

export { camelCaseToSimpleString, extractProfileName, isValidUrl }
