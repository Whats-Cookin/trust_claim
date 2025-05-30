import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

interface QuickCredentialDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  currentUser?: any;
}

export const QuickCredentialDialog: React.FC<QuickCredentialDialogProps> = ({
  open,
  onClose,
  onSubmit,
  currentUser
}) => {
  const [formData, setFormData] = useState({
    recipientName: '',
    recipientEmail: '',
    achievementName: '',
    achievementDescription: '',
    credentialType: 'skill-verification',
    skills: [] as string[],
    criteria: '',
    validityDays: 365
  });
  const [currentSkill, setCurrentSkill] = useState('');

  const credentialTypes = [
    { value: 'skill-verification', label: 'Skill Verification' },
    { value: 'course-completion', label: 'Course Completion' },
    { value: 'volunteer-recognition', label: 'Volunteer Recognition' },
    { value: 'employee-achievement', label: 'Employee Achievement' },
    { value: 'custom', label: 'Custom Credential' }
  ];

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const addSkill = () => {
    if (currentSkill.trim()) {
      setFormData({
        ...formData,
        skills: [...formData.skills, currentSkill.trim()]
      });
      setCurrentSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== index)
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Quick Credential</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Create a credential that can be sent to someone or claimed with a link.
          </Typography>

          <FormControl fullWidth>
            <InputLabel>Credential Type</InputLabel>
            <Select
              value={formData.credentialType}
              onChange={(e) => setFormData({ ...formData, credentialType: e.target.value })}
              label="Credential Type"
            >
              {credentialTypes.map(type => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Recipient Name"
            value={formData.recipientName}
            onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
            fullWidth
            required
            helperText="Name that will appear on the credential"
          />

          <TextField
            label="Recipient Email (Optional)"
            type="email"
            value={formData.recipientEmail}
            onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
            fullWidth
            helperText="If provided, they'll receive an invitation link"
          />

          <TextField
            label="Achievement Name"
            value={formData.achievementName}
            onChange={(e) => setFormData({ ...formData, achievementName: e.target.value })}
            fullWidth
            required
            placeholder="e.g., Python Developer, Customer Service Excellence"
          />

          <TextField
            label="Description"
            value={formData.achievementDescription}
            onChange={(e) => setFormData({ ...formData, achievementDescription: e.target.value })}
            fullWidth
            multiline
            rows={2}
            placeholder="Describe what this credential represents"
          />

          <TextField
            label="Criteria"
            value={formData.criteria}
            onChange={(e) => setFormData({ ...formData, criteria: e.target.value })}
            fullWidth
            multiline
            rows={2}
            placeholder="What criteria were met to earn this credential?"
          />

          {/* Skills Section */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Skills (Optional)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                size="small"
                placeholder="Add a skill"
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                sx={{ flexGrow: 1 }}
              />
              <Button onClick={addSkill} variant="outlined" size="small">
                Add
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {formData.skills.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  onDelete={() => removeSkill(index)}
                  size="small"
                />
              ))}
            </Box>
          </Box>

          <TextField
            label="Validity Period (days)"
            type="number"
            value={formData.validityDays}
            onChange={(e) => setFormData({ ...formData, validityDays: parseInt(e.target.value) || 365 })}
            fullWidth
            helperText="How long is this credential valid?"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.recipientName || !formData.achievementName}
        >
          Create Credential
        </Button>
      </DialogActions>
    </Dialog>
  );
};