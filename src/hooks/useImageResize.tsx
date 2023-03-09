import {useCallback} from 'react'
import Resizer from 'react-image-file-resizer'

function useImageResize() {
  const imageResize = useCallback(async (file: Blob) => {
    return new Promise(resolve => {
      try {
        setTimeout(() => {
          resolve(null)
        }, 3000) //handle no error message
        Resizer.imageFileResizer(
          file, // Is the file of the image which will resized.
          1280, // Is the maxWidth of the resized new image.
          1280, // Is the maxHeight of the resized new image.
          'JPEG', // Is the compressFormat of the resized new image.
          90, // Is the quality of the resized new image.
          0, // Is the degree of clockwise rotation to apply to uploaded image.
          uri => {
            resolve(uri)
          }, // Is the callBack function of the resized new image URI.
          'file' // Is the output type of the resized new image.
        )
      } catch (err) {
        resolve(null)
      }
    })
  }, [])

  return imageResize
}
export default useImageResize
