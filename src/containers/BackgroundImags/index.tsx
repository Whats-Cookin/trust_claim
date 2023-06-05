import polygon1 from '../../assets/circle.png'
import polygon2 from '../../assets/Polygon 2.png'
import polygon3 from '../../assets/Polygon 3.png'
import { CardMedia } from '@mui/material'

const BackgroundImages = () => {
  return (
    <>
      <CardMedia
        component='img'
        image={polygon1}
        sx={{ width: { xs: '50%', md: '520px' }, position: 'absolute', top: '3%', left: '-10%' }}
      />
      <CardMedia
        component='img'
        image={polygon2}
        sx={{ width: { xs: '50%', md: '381px' }, position: 'absolute', top: '50%', right: '20%' }}
      />
      <CardMedia
        component='img'
        image={polygon3}
        sx={{ width: { xs: '50%', md: '200px' }, position: 'absolute', right: { xs: '10%', md: '20%' }, top: '5%' }}
      />
    </>
  )
}

export default BackgroundImages
