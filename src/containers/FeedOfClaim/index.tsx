import * as React from 'react'
import { styled } from '@mui/material/styles'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Collapse from '@mui/material/Collapse'
import Avatar from '@mui/material/Avatar'
import IconButton, { IconButtonProps } from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown';
import { Box } from '@mui/system'
import SchemaIcon from '@mui/icons-material/Schema';
import download from './../../../mockdate/download.png'
import feed from './../../../mockdate/feed.jpg'

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props
  return <IconButton {...other} />
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest
  })
}))

const FeedClaim = () => {
  const [expanded, setExpanded] = React.useState<number | null>(null);
  const handleExpandClick = (index: number) => {
    if (expanded === index) {
      setExpanded(null);
    } else {
      setExpanded(index);
    }
  };
 



  return (
    <Box
      sx={{
        position: 'center',
        justifyContent: 'center',
        width: '75%',      
        p: '10px',
        background: '#FFFFFF',
        ml: '170px',
        mt: '90px',
        boxShadow: 20,
        bgcolor: 'background.paper',
      }}
    >
      <div>
      <Card
        sx={{
          maxWidth: 'fit',
          height: 'fit',
          m: '20px',
          borderRadius: '20px',
          border: '2px solid #009688',
          display: 'fixed',  
        }}
      >
        <CardMedia alt='Avatar' component='img' src={download} sx={{ width: '130px', height: '140px', p: '10px' ,borderRadius:"30px", boxShadow:30}} />
       <div>
        <CardContent>
        
          <Typography sx={{  padding: '5px 0 0 5px' }}>
            subject:
          </Typography>
          <Typography sx={{ padding: '5px 0 0 5px' }}>claim: </Typography>
          <Typography sx={{ padding: '5px 0 0 5px' }}>
            object: 
          </Typography>
        </CardContent>

        <Collapse in={expanded === 1}  timeout='auto' unmountOnExit>
          <CardContent sx={{display: 'block'}}>
            <Typography sx={{ padding: '5px 0 0 5px' }}>
              Statement:  ,
            </Typography>
            <Typography sx={{ padding: '5px 0 0 5px' }}>Aspect: </Typography>
            <Typography sx={{ padding: '5px 0 0 5px' }}>
              SourceURI: 
            </Typography>
            <Typography sx={{ padding: '5px 0 0 5px' }}>EffectiveDate: </Typography>
            <Typography sx={{ padding: '5px 0 0 5px' }}> Confidence:  </Typography>
          </CardContent>
        </Collapse>
        </div>
        <div >
        <CardActions disableSpacing  sx={{p:"20px" ,ml: '560px' }}>
        <SchemaIcon sx={{color:"#009688"}} />
        </CardActions>
        <CardActions disableSpacing >
          <ExpandMore
            expand={expanded===1}
            onClick={() => handleExpandClick(1)}
            aria-expanded={expanded ===1}
            aria-label='show more'
            sx={{ ml: '560px' }}
          >
            <ExpandCircleDownIcon sx={{color:"#009688"}}  />
          </ExpandMore>
        </CardActions>
        </div>
      </Card>
      </div>
      <div>
      <Card
        sx={{
          maxWidth: 'fit',
          height: 'fit',
          m: '20px',
          borderRadius: '20px',
          border: '2px solid #009688',
          display: 'fixed'
        }}
      >
        <CardMedia alt='Avatar' component='img' src={feed} sx={{ width: '130px', height: '140px', p: '10px',borderRadius:"30px", boxShadow:"130px"
}} />
       <div>
        <CardContent>
        
          <Typography sx={{  padding: '5px 0 0 5px' }}>
            subject:
          </Typography>
          <Typography sx={{ padding: '5px 0 0 5px' }}>
           claim:</Typography>
           <Typography sx={{ padding: '5px 0 0 5px' }}>
            object: 
          </Typography>
        </CardContent>
        <Collapse in={expanded === 2} timeout='auto' unmountOnExit >
          <CardContent sx={{display: 'block'}}>
          <Typography sx={{ padding: '5px 0 0 5px' }}>
              Statement:  
            </Typography>
            <Typography sx={{  padding: '5px 0 0 5px' }}>
              Aspect: 
              </Typography>
              <Typography sx={{  padding: '5px 0 0 5px' }}>
              SourceURI: 
            </Typography>
            <Typography sx={{  padding: '5px 0 0 5px' }}>
              EffectiveDate: </Typography>
              <Typography sx={{  padding: '5px 0 0 5px' }}>
            Confidence:  </Typography>
          </CardContent>
        </Collapse>
        </div>
        <div >
        <CardActions disableSpacing  sx={{p:"20px" ,ml: '560px' }}>
        <SchemaIcon sx={{color:"#009688"}} />
        </CardActions>
        <CardActions disableSpacing >
          
             <ExpandMore
              expand={expanded === 2}
              onClick={() => handleExpandClick(2)}
              aria-expanded={expanded === 2}
              aria-label='show more'
              sx={{ ml: '560px' }}
            >
            <ExpandCircleDownIcon sx={{color:"#009688"}}  />
          </ExpandMore>
        </CardActions>
        </div>
      </Card>
      </div>
    </Box>
  )
}

export default FeedClaim
