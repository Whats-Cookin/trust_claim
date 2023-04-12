import Form, { IFormData, IFormProps } from '../useForm'

const Form1 = ({ isAuth }: any) => {
  return (
    <>
      <form>
        <Form
          toggleSnackbar={function (toggle: boolean): void {
            throw new Error('Function not implemented.')
          }}
          setSnackbarMessage={function (message: string): void {
            throw new Error('Function not implemented.')
          }}
          setLoading={function (isLoading: boolean): void {
            throw new Error('Function not implemented.')
          }}
        />
      </form>
    </>
  )
}

export default Form1
