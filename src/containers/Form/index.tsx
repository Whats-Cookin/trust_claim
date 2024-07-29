import IHomeProps from './types'
import { Form } from '../../components/Form'

const FormPage = ({ toggleSnackbar, setSnackbarMessage, setLoading }: IHomeProps) => {
  return <Form toggleSnackbar={toggleSnackbar} setSnackbarMessage={setSnackbarMessage} setLoading={setLoading} />
}

export default FormPage
