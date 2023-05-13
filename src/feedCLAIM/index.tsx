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
import { red } from '@mui/material/colors'
import FavoriteIcon from '@mui/icons-material/Favorite'
import ShareIcon from '@mui/icons-material/Share'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { Box } from '@mui/system'
import polygon3 from '../assets/Polygon 3.png'

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
  const [expanded, setExpanded] = React.useState(false)

  const handleExpandClick = () => {
    setExpanded(!expanded)
  }

  return (
    <Box
      sx={{
        position: 'static',
        width: '50%',
        height: 'auto',
        p: '10px',
        background: '#FFFFFF',
        mr: '300px',
        ml: '310px',
        mt: '90px',
        boxShadow: 20,
        bgcolor: 'background.paper',
        borderRadius: '4px'
      }}
    >
      <Card sx={{ maxWidth: 'fit', m: '20px', borderRadius: '4px', border: '2px solid #80B8BD' }}>
        <CardMedia component='img' height='194' src={polygon3} />
        <CardContent>
          <Typography sx={{ top: '10px', padding: '10px 0 0 10px' }}>
            subject: 'https://www.bcorporation.net/',
          </Typography>
          <Typography sx={{ padding: '10px 0 0 10px' }}>claim: 'rated',</Typography>
          <Typography sx={{ padding: '10px 0 0 10px' }}>
            object: 'http://trustclaims.whatscookin.us/local/company/VEJA',
          </Typography>
        </CardContent>
        <CardActions disableSpacing>
          <ExpandMore expand={expanded} onClick={handleExpandClick} aria-expanded={expanded} aria-label='show more'>
            <ExpandMoreIcon />
          </ExpandMore>
        </CardActions>
        <Collapse in={expanded} timeout='auto' unmountOnExit>
          <CardContent>
            <Typography sx={{ padding: '10px 0 0 10px' }}>
              Statement: 'The VEJA project creates a positive chain. Sneakers are made differently using organic,
              agroecological and fairtrade cotton to make the sneakers canvas, wild rubber from the Amazonian Forest for
              its soles and innovative materials such as recycled plastic bottles to create a new mesh. VEJA is about
              minimalism and innovation. Their logistics and shipping run by Ateliers Sans Frontières, a rehabilitation
              association. Made in Brazil.', ,
            </Typography>
            <Typography sx={{ padding: '10px 0 0 10px' }}>Aspect: 'social:impact'</Typography>
            <Typography sx={{ padding: '10px 0 0 10px' }}>
              SourceURI: 'https://data.world/blab/b-corp-impact-data'
            </Typography>
            <Typography sx={{ padding: '10px 0 0 10px' }}>EffectiveDate: null</Typography>
            <Typography sx={{ padding: '10px 0 0 10px' }}> Confidence: 0.8 </Typography>
          </CardContent>
        </Collapse>
      </Card>

      <Card sx={{ maxWidth: 'fit', m: '20px', borderRadius: '4px', border: '2px solid #80B8BD' }}>
        <CardMedia component='img' height='194' src={polygon3} />
        <CardContent>
          <Typography sx={{ top: '10px', padding: '10px 0 0 10px' }}>
            subject: 'https://www.bcorporation.net/',
          </Typography>
          <Typography sx={{ padding: '10px 0 0 10px' }}>claim: 'rated',</Typography>
          <Typography sx={{ padding: '10px 0 0 10px' }}>
            object: 'http://trustclaims.whatscookin.us/local/company/VEJA',
          </Typography>
        </CardContent>
        <CardActions disableSpacing>
          <ExpandMore expand={expanded} onClick={handleExpandClick} aria-expanded={expanded} aria-label='show more'>
            <ExpandMoreIcon />
          </ExpandMore>
        </CardActions>
        <Collapse in={expanded} timeout='auto' unmountOnExit>
          <CardContent>
            <Typography sx={{ padding: '10px 0 0 10px' }}>
              Statement: 'The VEJA project creates a positive chain. Sneakers are made differently using organic,
              agroecological and fairtrade cotton to make the sneakers canvas, wild rubber from the Amazonian Forest for
              its soles and innovative materials such as recycled plastic bottles to create a new mesh. VEJA is about
              minimalism and innovation. Their logistics and shipping run by Ateliers Sans Frontières, a rehabilitation
              association. Made in Brazil.', ,
            </Typography>
            <Typography sx={{ padding: '10px 0 0 10px' }}>Aspect: 'social:impact'</Typography>
            <Typography sx={{ padding: '10px 0 0 10px' }}>
              SourceURI: 'https://data.world/blab/b-corp-impact-data'
            </Typography>
            <Typography sx={{ padding: '10px 0 0 10px' }}>EffectiveDate: null</Typography>
            <Typography sx={{ padding: '10px 0 0 10px' }}> Confidence: 0.8 </Typography>
          </CardContent>
        </Collapse>
      </Card>
    </Box>
  )
}

export default FeedClaim
