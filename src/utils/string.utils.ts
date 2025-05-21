const camelCaseToSimpleString = (str: string) => {
  const result = str.replace(/([A-Z])/g, ' $1')
  const finalResult = result.charAt(0).toUpperCase() + result.slice(1)
  return finalResult
}

const extractProfileName = (url: string): string | null => {
  const capitalizeFirstLetter = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1)

  try {
    const formattedUri = url.startsWith('http') ? url : `https://${url}`
    const parsedUrl = new URL(formattedUri)
    const domain = parsedUrl.hostname.replace(/^www\./, '')

    const pathParts = parsedUrl.pathname.split('/').filter(Boolean)

    // Define common social media platforms and their username extraction logic
    const socialMediaPatterns: { [key: string]: number } = {
      'linkedin.com': 1, // linkedin.com/in/username
      'twitter.com': 0, // twitter.com/username
      'x.com': 0, // x.com/username
      'instagram.com': 0, // instagram.com/username
      'facebook.com': 0, // facebook.com/username or facebook.com/profile.php?id=xyz
      'tiktok.com': 1, // tiktok.com/@username
      'github.com': 0, // github.com/username
      'youtube.com': 1, // youtube.com/c/username or youtube.com/user/username
      'medium.com': 0, // medium.com/@username
      'reddit.com': 1 // reddit.com/user/username
    }

    // Extract username if domain is a known social media platform
    const usernameIndex = socialMediaPatterns[domain]
    if (usernameIndex !== undefined && pathParts.length > usernameIndex) {
      return capitalizeFirstLetter(pathParts[usernameIndex].replace('@', ''))
    }

    return capitalizeFirstLetter(domain.replace('.com', ''))
  } catch (error) {
    console.error('Failed to parse URL:', error)
    return null
  }
}

export const extractCredentialId = (claimAddress: string): string | null => {
  try {
    const url = new URL(claimAddress)
    const pathParts = url.pathname.split('/')
    const lastPart = pathParts[pathParts.length - 1]
    return lastPart || null
  } catch (error) {
    console.error('Failed to parse claimAddress:', error)
    return null
  }
}

export { camelCaseToSimpleString, extractProfileName }
