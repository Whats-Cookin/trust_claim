import React, { useEffect, useState, useCallback } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  TextField,
  IconButton,
  Chip,
  useTheme
} from '@mui/material'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import RefreshIcon from '@mui/icons-material/Refresh'
import DownloadIcon from '@mui/icons-material/Download'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import MainContainer from '../../components/MainContainer'
import { BACKEND_BASE_URL } from '../../utils/settings'

const ATPROTO_API = 'https://public.api.bsky.app'
const COLLECTION = 'com.linkedclaims.claim'

// Default repo — the LinkedClaims server account
const DEFAULT_REPO = 'did:plc:xztctnvt5ycnsippd3orwqk7'

// Use backend index when available, fall back to direct ATProto
const USE_BACKEND_INDEX = true

interface AtprotoClaim {
  uri: string
  cid: string
  value: {
    claimUri?: string
    subject?: string
    claimType?: string
    object?: string
    statement?: string
    confidence?: number
    stars?: number
    aspect?: string
    createdAt?: string
    effectiveDate?: string
    respondAt?: string
    source?: {
      uri?: string
      howKnown?: string
      digestMultibase?: string
      dateObserved?: string
      author?: string
      curator?: string
    }
    evidence?: Array<{
      uri?: string
      description?: string
      mediaType?: string
      digestMultibase?: string
    }>
    embeddedProof?: {
      type?: string
      verificationMethod?: string
      proofValue?: string
      proofPurpose?: string
      created?: string
    }
  }
}

interface DbMatch {
  id: number
  claimAddress?: string
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric'
    })
  } catch { return dateStr }
}

function truncUri(uri: string, max = 50): string {
  if (!uri) return ''
  if (uri.length <= max) return uri
  try {
    const u = new URL(uri)
    const path = u.pathname + u.search
    if (path.length > 30) return u.host + path.slice(0, 15) + '\u2026' + path.slice(-12)
    return u.host + path
  } catch { return uri.slice(0, max - 3) + '\u2026' }
}

function isImageUrl(url?: string): boolean {
  return !!url && /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url)
}

function isVideoUrl(url?: string): boolean {
  return !!url && /\.(mp4|webm|mov|ogg)(\?|$)/i.test(url)
}

function isLinkedTrustUrl(url?: string): boolean {
  if (!url) return false
  try {
    const h = new URL(url).hostname
    return h === 'live.linkedtrust.us' || h === 'dev.linkedtrust.us' || h.endsWith('.linkedtrust.us')
  } catch { return false }
}

function extractClaimId(respondAt?: string): string | null {
  if (!respondAt) return null
  const m = respondAt.match(/\/api\/claim\/(\d+)/)
  return m ? m[1] : null
}

const AtprotoFeed: React.FC = () => {
  const theme = useTheme()
  const [claims, setClaims] = useState<AtprotoClaim[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [repos, setRepos] = useState<string>(DEFAULT_REPO)
  const [repoInput, setRepoInput] = useState<string>(DEFAULT_REPO)
  const [dbMatches, setDbMatches] = useState<Record<string, DbMatch>>({})
  const [importing, setImporting] = useState<Record<string, boolean>>({})

  const fetchClaims = useCallback(async () => {
    setLoading(true)
    setError(null)
    setClaims([])
    setDbMatches({})

    try {
      let allClaims: AtprotoClaim[] = []
      const matches: Record<string, DbMatch> = {}

      // Try backend index first (has claims from ALL publishers via Jetstream)
      if (USE_BACKEND_INDEX) {
        try {
          const backendUrl = `${BACKEND_BASE_URL}/api/atproto/claims?subject=*&limit=100`
          const backendRes = await fetch(backendUrl)
          if (backendRes.ok) {
            const backendData = await backendRes.json()
            // Map backend Claim format back to AtprotoClaim shape for rendering
            allClaims = (backendData.claims || []).map((c: any) => ({
              uri: c.claimAddress || '',
              cid: c.proof || '',
              value: {
                claimUri: c.claimAddress,
                subject: c.subject,
                claimType: c.claim,
                object: c.object,
                statement: c.statement,
                confidence: c.confidence,
                stars: c.stars,
                aspect: c.aspect,
                createdAt: c.createdAt,
                effectiveDate: c.effectiveDate,
                respondAt: c.respondAt,
                source: c.sourceURI ? {
                  uri: c.sourceURI,
                  howKnown: c.howKnown,
                } : undefined,
                evidence: (c.images || []).map((img: any) => ({
                  uri: img.url,
                  digestMultibase: img.digestMultibase,
                  mediaType: img.metadata?.contentType || (img.metadata?.type === 'video' ? 'video/mp4' : undefined),
                  description: img.metadata?.description,
                })),
              },
              _dbId: c.id, // We already have it in DB
            }))

            // All backend claims are in DB by definition
            for (const c of allClaims) {
              if (c.uri && (c as any)._dbId) {
                matches[c.uri] = { id: (c as any)._dbId }
              }
            }
          }
        } catch (err) {
          console.warn('Backend index not available, falling back to direct ATProto', err)
        }
      }

      // Fall back to direct ATProto if backend returned nothing
      if (allClaims.length === 0) {
        const repoList = repos.split(',').map(r => r.trim()).filter(Boolean)

        for (const repo of repoList) {
          try {
            const url = `${ATPROTO_API}/xrpc/com.atproto.repo.listRecords?repo=${encodeURIComponent(repo)}&collection=${COLLECTION}&limit=100`
            const res = await fetch(url)
            if (!res.ok) {
              console.warn(`Failed to fetch from ${repo}: ${res.status}`)
              continue
            }
            const data = await res.json()
            if (data.records) {
              allClaims.push(...data.records)
            }
          } catch (err) {
            console.warn(`Error fetching from ${repo}:`, err)
          }
        }

        // Check which direct-fetched claims are in our DB
        for (const claim of allClaims) {
          const respondAt = claim.value.respondAt
          const ltClaimId = extractClaimId(respondAt)
          if (ltClaimId && isLinkedTrustUrl(respondAt)) {
            matches[claim.uri] = { id: parseInt(ltClaimId, 10) }
          }
        }
      }

      // Sort by date descending
      allClaims.sort((a, b) => {
        const da = a.value.effectiveDate || a.value.createdAt || ''
        const db = b.value.effectiveDate || b.value.createdAt || ''
        return da > db ? -1 : da < db ? 1 : 0
      })

      setClaims(allClaims)
      setDbMatches(matches)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch claims')
    } finally {
      setLoading(false)
    }
  }, [repos])

  useEffect(() => {
    fetchClaims()
  }, [fetchClaims])

  const handleRepoSearch = () => {
    const val = repoInput.trim()
    if (val) {
      setRepos(val)
    }
  }

  const renderEvidence = (evidence?: AtprotoClaim['value']['evidence']) => {
    if (!evidence || evidence.length === 0) return null
    return (
      <Box sx={{ mt: 1 }}>
        {evidence.map((item, i) => {
          const uri = item.uri || ''
          const desc = item.description || ''
          if (isVideoUrl(uri) || (item.mediaType && item.mediaType.startsWith('video/'))) {
            return (
              <Box key={i} sx={{ mb: 1 }}>
                <video
                  src={uri}
                  controls
                  preload="metadata"
                  playsInline
                  style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 4 }}
                />
                {desc && <Typography variant="caption" color="text.secondary">{desc}</Typography>}
              </Box>
            )
          }
          if (isImageUrl(uri) || (item.mediaType && item.mediaType.startsWith('image/'))) {
            return (
              <Box key={i} sx={{ mb: 1 }}>
                <img
                  src={uri}
                  alt={desc || 'evidence'}
                  loading="lazy"
                  style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 4 }}
                />
                {desc && <Typography variant="caption" color="text.secondary">{desc}</Typography>}
              </Box>
            )
          }
          if (uri) {
            return (
              <Box key={i} sx={{ mb: 0.5 }}>
                <a href={uri} target="_blank" rel="noopener noreferrer" style={{ color: theme.palette.primary.main, fontSize: 13 }}>
                  {desc || truncUri(uri, 60)}
                </a>
              </Box>
            )
          }
          if (desc) {
            return <Typography key={i} variant="caption" color="text.secondary">{desc}</Typography>
          }
          return null
        })}
      </Box>
    )
  }

  const renderClaim = (record: AtprotoClaim) => {
    const c = record.value
    const match = dbMatches[record.uri]
    const type = c.claimType || ''
    const date = formatDate(c.effectiveDate || c.createdAt)

    return (
      <Card key={record.uri} sx={{ mb: 1.5 }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'primary.main' }}>
                {type}
              </Typography>
              {c.object && (
                <Typography variant="caption" color="text.secondary">
                  &middot; {c.object}
                </Typography>
              )}
              {c.aspect && (
                <Typography variant="caption" color="text.secondary">
                  ({c.aspect})
                </Typography>
              )}
            </Box>
            <Typography variant="caption" color="text.secondary">{date}</Typography>
          </Box>

          {/* Statement */}
          {c.statement && (
            <Typography variant="body2" sx={{ fontStyle: 'italic', my: 0.5 }}>
              &ldquo;{c.statement}&rdquo;
            </Typography>
          )}

          {/* Stars */}
          {c.stars && (
            <Box sx={{ my: 0.5 }}>
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} style={{ color: i < c.stars! ? '#FFC107' : '#ccc', fontSize: 18 }}>&#9733;</span>
              ))}
              <Typography component="span" variant="caption" sx={{ ml: 0.5, fontWeight: 600, color: 'text.secondary' }}>
                {Number(c.stars).toFixed(1)}
              </Typography>
            </Box>
          )}

          {/* Confidence */}
          {c.confidence != null && (
            <Typography variant="caption" color="text.secondary">
              confidence: {Math.round(c.confidence * 100)}%
            </Typography>
          )}

          {/* Subject */}
          {c.subject && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              about:{' '}
              <a href={c.subject} target="_blank" rel="noopener noreferrer" style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>
                {truncUri(c.subject)}
              </a>
            </Typography>
          )}

          {/* Source */}
          {c.source?.uri && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              source:{' '}
              <a href={c.source.uri} target="_blank" rel="noopener noreferrer" style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>
                {truncUri(c.source.uri, 40)}
              </a>
              {c.source.howKnown && ` \u00b7 ${c.source.howKnown.replace(/_/g, ' ').toLowerCase()}`}
            </Typography>
          )}

          {/* Evidence */}
          {renderEvidence(c.evidence)}

          {/* Footer: DB match or AT-URI */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.disabled', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>
              {record.uri}
            </Typography>
            {match ? (
              <Chip
                icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                label="In LinkedTrust"
                size="small"
                color="success"
                variant="outlined"
                clickable
                component="a"
                href={`/claims/${match.id}`}
                sx={{ fontSize: 11 }}
              />
            ) : (
              <Button
                size="small"
                variant="outlined"
                startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
                disabled={importing[record.uri]}
                onClick={() => {
                  // Import placeholder — will be wired to backend endpoint later
                  setImporting(prev => ({ ...prev, [record.uri]: true }))
                  // TODO: POST to /api/atproto/import with the AT-URI
                  setTimeout(() => {
                    setImporting(prev => ({ ...prev, [record.uri]: false }))
                  }, 1000)
                }}
                sx={{ fontSize: 11, textTransform: 'none' }}
              >
                {importing[record.uri] ? 'Importing\u2026' : 'Import'}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <MainContainer>
      <Box sx={{ maxWidth: 700, mx: 'auto', width: '100%', py: 2, px: 1 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              ATProto Claims
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Live <code style={{ fontSize: 12 }}>com.linkedclaims.claim</code> records from the AT Protocol
            </Typography>
          </Box>
          <IconButton onClick={fetchClaims} disabled={loading} title="Refresh">
            <RefreshIcon />
          </IconButton>
        </Box>

        {/* Repo search */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            value={repoInput}
            onChange={e => setRepoInput(e.target.value)}
            placeholder="DID or handle (comma-separated for multiple)"
            onKeyDown={e => { if (e.key === 'Enter') handleRepoSearch() }}
            sx={{ '& .MuiInputBase-input': { fontSize: 13, fontFamily: 'monospace' } }}
          />
          <Button variant="contained" onClick={handleRepoSearch} sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}>
            Load
          </Button>
        </Box>

        {/* Loading */}
        {loading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={32} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Fetching from ATProto&hellip;
            </Typography>
          </Box>
        )}

        {/* Error */}
        {error && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        {/* Results */}
        {!loading && !error && (
          <>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              {claims.length} claim{claims.length !== 1 ? 's' : ''} found
            </Typography>
            {claims.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  No <code>com.linkedclaims.claim</code> records found in this repository.
                </Typography>
              </Box>
            ) : (
              claims.map(renderClaim)
            )}
          </>
        )}

        {/* Info box */}
        <Box sx={{ mt: 3, p: 2, borderRadius: 1, bgcolor: 'action.hover' }}>
          <Typography variant="caption" color="text.secondary">
            This page reads <code>com.linkedclaims.claim</code> records directly from ATProto&rsquo;s public API.
            Anyone can publish claims using the{' '}
            <a href="https://www.npmjs.com/package/@cooperation/claim-atproto" target="_blank" rel="noopener noreferrer" style={{ color: theme.palette.primary.main }}>
              @cooperation/claim-atproto
            </a>{' '}
            SDK. Claims with a LinkedTrust respondAt URL are linked to our database.
          </Typography>
        </Box>
      </Box>
    </MainContainer>
  )
}

export default AtprotoFeed
