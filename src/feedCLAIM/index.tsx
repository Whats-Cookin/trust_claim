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
import feed from '../assets/feed.jpg'

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
        <CardMedia
          component='img'
          height='500'
          sx={{ width: 350, position: 'center', p: 2, pl: 5, pr: 5, ml: 15, mr: 20 }}
          src={feed}
        />
        <CardContent></CardContent>
        <CardActions disableSpacing>
          <ExpandMore expand={expanded} onClick={handleExpandClick} aria-expanded={expanded} aria-label='show more'>
            <ExpandMoreIcon />
          </ExpandMore>
        </CardActions>
        <Collapse in={expanded} timeout='auto' unmountOnExit>
          <CardContent></CardContent>
        </Collapse>
      </Card>
    </Box>
  )
}

export default FeedClaim
