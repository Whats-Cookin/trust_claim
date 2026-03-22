import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { BACKEND_BASE_URL } from '../../utils/settings'

// Bare embed page — no chrome, just the badge web component.
// Used as the iframe target for third-party site embeds.

export default function BadgeEmbedPage() {
  const { claimId } = useParams<{ claimId: string }>()

  useEffect(() => {
    if (document.querySelector('script[data-badge-script]')) return
    const script = document.createElement('script')
    script.src = '/badge.js'
    script.defer = true
    script.setAttribute('data-badge-script', 'true')
    document.head.appendChild(script)
  }, [])

  if (!claimId) return null

  return (
    <div style={{ margin: '16px', background: 'transparent' }}>
      <linked-badge claim-id={claimId} layout='row' api-base={BACKEND_BASE_URL} />
    </div>
  )
}
