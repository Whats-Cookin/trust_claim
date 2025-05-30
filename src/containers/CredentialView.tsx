import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import CredentialCertificate from '../components/credential/CredentialCertificate';
import * as api from '../api';
import { useAuth } from '../hooks/useAuth';

interface CredentialData {
  credential: any;
  relatedClaims?: any[];
}

const CredentialView: React.FC = () => {
  const { uri } = useParams<{ uri: string }>();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CredentialData | null>(null);

  useEffect(() => {
    if (!uri) {
      setError('No credential URI provided');
      setLoading(false);
      return;
    }

    const fetchCredential = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch credential from API
        const response = await api.getCredential(uri);
        
        if (!response.data || !response.data.credential) {
          throw new Error('Invalid credential data received');
        }

        setData(response.data);
      } catch (err) {
        console.error('Error fetching credential:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch credential');
      } finally {
        setLoading(false);
      }
    };

    fetchCredential();
  }, [uri]);

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='100vh'>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='100vh' p={3}>
        <Alert severity="error" sx={{ maxWidth: 600 }}>
          <Typography variant="h6" gutterBottom>Error Loading Credential</Typography>
          <Typography>{error}</Typography>
        </Alert>
      </Box>
    );
  }

  if (!data || !data.credential) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='100vh'>
        <Typography>No credential data found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <CredentialCertificate
        credential={data.credential}
        relatedClaims={data.relatedClaims}
        credentialUri={uri}
        currentUser={currentUser}
      />
    </Box>
  );
};

export default CredentialView;