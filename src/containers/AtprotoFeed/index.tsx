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
import SvgIcon from '@mui/material/SvgIcon'
import MainContainer from '../../components/MainContainer'
import { BACKEND_BASE_URL } from '../../utils/settings'

// Noun Project AT symbol icon (licensed)
function AtSymbolIcon(props: any) {
  return (
    <SvgIcon {...props} viewBox="0 0 1200 1200">
      <path d="m600 9.9844c-182.72 0.09375-355.08 84.797-466.78 229.4-111.66 144.61-150.05 332.81-103.92 509.63 46.172 176.76 171.61 322.22 339.71 393.79 168.14 71.625 359.9 61.266 519.37-27.984 14.438-8.1094 19.594-26.391 11.484-40.828-8.1094-14.484-26.391-19.641-40.875-11.531-136.31 76.406-299.44 88.688-445.69 33.656-146.26-55.031-260.76-171.79-312.94-319.08-52.219-147.32-36.703-310.13 42.281-444.98 79.031-134.81 213.52-227.9 367.5-254.39 154.03-26.484 311.86 16.359 431.39 117.05 119.48 100.69 188.44 249 188.48 405.28v125.11c0 68.297-55.359 123.66-123.66 123.66-68.297 0-123.66-55.359-123.66-123.66v-125.11c0-175.5-126.84-318.24-282.71-318.24s-282.71 142.74-282.71 318.24 126.71 318.24 282.71 318.24c96.094-2.0625 184.18-54.094 232.31-137.29 17.766 56.062 61.406 100.17 117.28 118.59 55.875 18.375 117.19 8.8125 164.81-25.734 47.621-34.547 75.75-89.859 75.609-148.69v-125.11c-0.1875-156.42-62.391-306.37-173.02-417s-260.58-172.82-417-173.02zm0 848.26c-122.81 0-222.71-116.02-222.71-258.24s99.891-258.24 222.71-258.24 222.71 116.02 222.71 258.24-99.891 258.24-222.71 258.24z" />
    </SvgIcon>
  )
}

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

// Convert at:// URI to pdsls.dev viewer URL
function atUriToViewerUrl(atUri: string): string | null {
  if (!atUri || !atUri.startsWith('at://')) return null
  // at://did:plc:xyz/collection/rkey → https://pdsls.dev/at/did:plc:xyz/collection/rkey
  return `https://pdsls.dev/${atUri.replace('at://', 'at/')}`
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

          {/* Footer: AT record link, DB match or import */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden', minWidth: 0 }}>
              {atUriToViewerUrl(record.uri) && (
                <a
                  href={atUriToViewerUrl(record.uri)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View ATProto record"
                  style={{ display: 'flex', alignItems: 'center', color: theme.palette.text.disabled, flexShrink: 0 }}
                >
                  <AtSymbolIcon sx={{ fontSize: 18, '&:hover': { color: theme.palette.primary.main } }} />
                </a>
              )}
              <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.disabled', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {record.uri}
              </Typography>
            </Box>
            {match ? (
              <Chip
                icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                label="Explore"
                size="small"
                color="success"
                variant="outlined"
                clickable
                component="a"
                href={`/explore/${match.id}`}
                sx={{ fontSize: 11, flexShrink: 0, ml: 1 }}
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
                sx={{ fontSize: 11, textTransform: 'none', flexShrink: 0, ml: 1 }}
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
