import React, { useEffect, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { Box, Typography, CircularProgress } from '@mui/material'
import Certificate from '../components/certificate'
import { BACKEND_BASE_URL } from '../utils/settings'

const CertificateView: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const location = useLocation()

  useEffect(() => {
    // Check if we have state data (passed from ClaimDetails)
    if (location.state && location.state.claimData) {
      // Use the data passed through navigation state
      setData(location.state.claimData)
      setLoading(false)
      return;
    }

    const fetchClaimData = async () => {
      try {
        // Fetch claim data using the same endpoint as ClaimDetails
        const claimResponse = await fetch(`${BACKEND_BASE_URL}/claims/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!claimResponse.ok) {
          if (claimResponse.status === 404) {
            setError('Certificate not found. Please make sure the ID is correct.');
          } else {
            const errorData = await claimResponse.json().catch(() => ({}));
            setError(errorData.message || 'Failed to fetch claim data');
          }
          setLoading(false);
          return;
        }

        const claimData = await claimResponse.json();
        console.log('Fetched claim data:', claimData);

        // Fetch validations exactly as in ClaimDetails
        const validationsResponse = await fetch(`${BACKEND_BASE_URL}/validations?claimId=${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!validationsResponse.ok) {
          // If validations endpoint fails but we have claim data, still proceed
          setData({
            claim: claimData,
            edge: claimData.edge || { startNode: { name: claimData.claim?.subject || 'Certificate' } },
            validations: []
          });
        } else {
          const validationsData = await validationsResponse.json();
          console.log('Fetched validations:', validationsData);
          
          setData({
            claim: claimData,
            edge: claimData.edge || { startNode: { name: claimData.claim?.subject || 'Certificate' } },
            validations: validationsData || []
          });
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchClaimData();
  }, [id, location.state]);

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='100vh'>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='100vh'>
        <Typography color='error'>{error}</Typography>
      </Box>
    );
  }

  if (!data || !data.claim || !data.claim.claim) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='100vh'>
        <Typography>No claim data found. Please check if the certificate exists.</Typography>
      </Box>
    );
  }

  const claim = data.claim.claim;

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
      <Certificate
        curator={claim.curator}
        subject={claim.subject}
        statement={claim.statement}
        effectiveDate={claim.effectiveDate}
        sourceURI={claim.sourceURI}
        validations={data.validations || []}
        claimId={id}
        image={data.claim.image}
      />
    </Box>
  );
};

export default CertificateView;