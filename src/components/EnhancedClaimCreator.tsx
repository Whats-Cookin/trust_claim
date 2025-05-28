import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  Alert
} from '@mui/material';
import { QuickCredentialDialog } from './QuickCredentialDialog';
import { apiService } from '../api/apiService';

const CLAIM_TYPES = [
  { value: 'rated', label: 'Rate/Review' },
  { value: 'same_as', label: 'Same As' },
  { value: 'impact', label: 'Impact' },
  { value: 'credential', label: 'Issue Credential' },
  { value: 'endorses', label: 'Endorse' },
  { value: 'validates', label: 'Validate' },
  { value: 'custom', label: 'Custom' }
];

export const EnhancedClaimCreator: React.FC = () => {
  const [claimType, setClaimType] = useState('rated');
  const [showCredentialDialog, setShowCredentialDialog] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    claim: 'rated',
    object: '',
    statement: '',
    confidence: 0.8,
    stars: 3,
    amt: '',
    unit: '',
    aspect: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClaimTypeChange = (newType: string) => {
    setClaimType(newType);
    if (newType === 'credential') {
      setShowCredentialDialog(true);
    } else {
      setFormData({ ...formData, claim: newType });
    }
  };

  const handleCreateCredential = async (credentialData: any) => {
    try {
      setSubmitting(true);
      setError(null);
      
      // Call the admin endpoint to create credential
      const response = await apiService.post('/api/credentials/admin/create', {
        recipientEmail: credentialData.recipientEmail,
        recipientName: credentialData.recipientName,
        achievementName: credentialData.achievementName,
        achievementDescription: credentialData.achievementDescription,
        skills: credentialData.skills,
        criteria: credentialData.criteria,
        validityPeriod: credentialData.validityDays
      });

      if (response.data.inviteLink) {
        setSuccess(`Credential created! Invite link: ${response.data.inviteLink}`);
      } else {
        setSuccess('Credential created successfully!');
      }
      
      setShowCredentialDialog(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create credential');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitClaim = async () => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const claimData: any = {
        subject: formData.subject,
        claim: formData.claim,
        confidence: formData.confidence
      };

      // Add type-specific fields
      if (formData.claim === 'rated') {
        claimData.stars = formData.stars;
        claimData.statement = formData.statement;
      } else if (formData.claim === 'impact') {
        claimData.amt = parseFloat(formData.amt);
        claimData.unit = formData.unit;
        claimData.aspect = formData.aspect;
        claimData.statement = formData.statement;
      } else if (formData.claim === 'same_as') {
        claimData.object = formData.object;
      } else {
        claimData.object = formData.object;
        claimData.statement = formData.statement;
      }

      const response = await apiService.post('/api/claims', claimData);
      setSuccess('Claim created successfully!');
      
      // Reset form
      setFormData({
        ...formData,
        subject: '',
        object: '',
        statement: '',
        stars: 3,
        amt: '',
        unit: '',
        aspect: ''
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create claim');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Create Claim
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Claim Type</InputLabel>
          <Select
            value={claimType}
            onChange={(e) => handleClaimTypeChange(e.target.value)}
            label="Claim Type"
          >
            {CLAIM_TYPES.map(type => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {claimType !== 'credential' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Subject (URI)"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              fullWidth
              required
              placeholder="https://example.com or did:example:123"
            />

            {/* Rating specific fields */}
            {claimType === 'rated' && (
              <>
                <Box>
                  <Typography gutterBottom>Rating: {formData.stars} stars</Typography>
                  <Slider
                    value={formData.stars}
                    onChange={(e, value) => setFormData({ ...formData, stars: value as number })}
                    min={1}
                    max={5}
                    marks
                    step={1}
                  />
                </Box>
                <TextField
                  label="Review"
                  value={formData.statement}
                  onChange={(e) => setFormData({ ...formData, statement: e.target.value })}
                  fullWidth
                  multiline
                  rows={3}
                />
              </>
            )}

            {/* Impact specific fields */}
            {claimType === 'impact' && (
              <>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Amount"
                    type="number"
                    value={formData.amt}
                    onChange={(e) => setFormData({ ...formData, amt: e.target.value })}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    sx={{ flex: 1 }}
                    placeholder="people, tons CO2, dollars"
                  />
                </Box>
                <TextField
                  label="Aspect"
                  value={formData.aspect}
                  onChange={(e) => setFormData({ ...formData, aspect: e.target.value })}
                  fullWidth
                  placeholder="impact:social, impact:environmental"
                />
                <TextField
                  label="Description"
                  value={formData.statement}
                  onChange={(e) => setFormData({ ...formData, statement: e.target.value })}
                  fullWidth
                  multiline
                  rows={2}
                />
              </>
            )}

            {/* Same As and other claims */}
            {(claimType === 'same_as' || claimType === 'endorses' || claimType === 'validates') && (
              <TextField
                label="Object (URI)"
                value={formData.object}
                onChange={(e) => setFormData({ ...formData, object: e.target.value })}
                fullWidth
                required
                placeholder="URI of the thing you're linking to"
              />
            )}

            {/* Custom claim */}
            {claimType === 'custom' && (
              <>
                <TextField
                  label="Claim Predicate"
                  value={formData.claim}
                  onChange={(e) => setFormData({ ...formData, claim: e.target.value })}
                  fullWidth
                  placeholder="e.g., KNOWS, WORKED_AT, CREATED"
                />
                <TextField
                  label="Object"
                  value={formData.object}
                  onChange={(e) => setFormData({ ...formData, object: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Statement"
                  value={formData.statement}
                  onChange={(e) => setFormData({ ...formData, statement: e.target.value })}
                  fullWidth
                  multiline
                  rows={2}
                />
              </>
            )}

            {/* Confidence slider */}
            <Box>
              <Typography gutterBottom>
                Confidence: {Math.round(formData.confidence * 100)}%
              </Typography>
              <Slider
                value={formData.confidence}
                onChange={(e, value) => setFormData({ ...formData, confidence: value as number })}
                min={0}
                max={1}
                step={0.1}
              />
            </Box>

            <Button
              variant="contained"
              onClick={handleSubmitClaim}
              disabled={submitting || !formData.subject}
              fullWidth
            >
              {submitting ? 'Creating...' : 'Create Claim'}
            </Button>
          </Box>
        )}

        <QuickCredentialDialog
          open={showCredentialDialog}
          onClose={() => setShowCredentialDialog(false)}
          onSubmit={handleCreateCredential}
        />
      </CardContent>
    </Card>
  );
};