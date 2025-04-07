import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  IconButton,
  Stack
} from '@mui/material';
import badge from '../../assets/images/badge.svg';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';

interface Validation {
  author: string;
  statement: string;
  date?: string;
  confidence?: number;
  howKnown?: string;
  sourceURI?: string;
  image?: string;
  mediaUrl?: string;
}

interface CertificateProps {
  curator: string;
  subject: string;
  statement?: string;
  effectiveDate?: string;
  sourceURI?: string;
  validations: Validation[];
  claimId?: string;
  image?: string;
}

const Certificate: React.FC<CertificateProps> = ({
  curator,
  subject,
  statement,
  effectiveDate,
  sourceURI,
  validations,
  claimId,
  image
}) => {
  const navigate = useNavigate();
  // You would typically fetch the certificate data from your frontend state
  // or use the data passed via props/context if navigating from a report page
  
  // This is a simplified version - you'd replace this with your actual data
  const certificateData = {
    curator: curator,
    subject: subject,
    statement: statement || "This certificate validates skills in React and TypeScript",
    effectiveDate: effectiveDate || new Date().toISOString(),
    validations: validations
  };
  
  const handleExport = () => {
    const element = document.getElementById('certificate-content');
    if (element) {
      const opt = {
        margin: 1,
        filename: 'certificate.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      html2pdf().set(opt).from(element).save();
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1000px', margin: '0 auto' }}>
      <Card sx={{ 
        borderRadius: '20px', 
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        p: 4
      }}>
        <IconButton 
          onClick={() => navigate(-1)} 
          sx={{ position: 'absolute', top: 16, right: 16 }}
        >
          <CloseIcon />
        </IconButton>
        
        <Box id="certificate-content" sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center'
        }}>
          <img 
            src={badge} 
            alt="Certificate Badge" 
            style={{ 
              width: 150, 
              height: 150, 
              marginBottom: 30 
            }} 
          />
          
          <Typography variant="h3" color="#2D6A4F" fontWeight={600} textAlign="center">
            Certificate
          </Typography>
          
          <Typography 
            variant="subtitle1" 
            color="#666" 
            letterSpacing={2} 
            textTransform="uppercase" 
            marginBottom={4}
          >
            OF SKILL VALIDATION
          </Typography>
          
          <Typography variant="h4" color="#2D6A4F" fontWeight={500} marginBottom={3}>
            {curator}
          </Typography>
          
          <Typography variant="h5" color="#333" fontWeight={500} marginBottom={3}>
            {subject}
          </Typography>
          
          <Typography variant="body1" color="#666" textAlign="center" maxWidth={600} marginBottom={4}>
            {statement}
          </Typography>
          
          {effectiveDate && (
            <Typography variant="body2" color="#495057">
              Issued on: {new Date(effectiveDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Typography>
          )}
          
          {validations && validations.length > 0 && (
            <Box sx={{ width: '100%', mt: 4 }}>
              <Typography variant="h6" color="#2D6A4F" textAlign="center" marginBottom={3}>
                Endorsed by:
              </Typography>
              
              <Stack direction="row" spacing={2} justifyContent="center">
                {validations.map((validation, index) => (
                  <Card key={index} sx={{ 
                    width: 284, 
                    height: 168, 
                    p: 2.5, 
                    boxShadow: '0px 2px 14px rgba(0, 0, 0, 0.25)', 
                    borderRadius: 2 
                  }}>
                    <Typography color="#2D6A4F" fontWeight={500} fontSize={20} marginBottom={1}>
                      {validation.author}
                    </Typography>
                    <Typography color="#212529" fontSize={16}>
                      {validation.statement}
                    </Typography>
                  </Card>
                ))}
              </Stack>
            </Box>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button 
            variant="contained" 
            onClick={handleExport}
            sx={{ 
              backgroundColor: '#2D6A4F', 
              color: 'white',
              '&:hover': { backgroundColor: '#1B4332' },
              textTransform: 'none',
              fontSize: 16,
              fontWeight: 500,
              padding: '8px 24px'
            }}
          >
            Export Certificate
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default Certificate;