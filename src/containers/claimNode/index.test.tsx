import { render, screen, fireEvent } from '@testing-library/react'
import NewClaim from './index'
import {describe,vi,it,expect} from 'vitest'
describe('NewClaim component', () => {
  it('should render correctly', () => {
    render(<NewClaim open={true} setOpen={() => {}} />)
    const submitButton = screen.getByRole('button', { name: /submit/i })
    expect(submitButton).toBeInTheDocument()
  })

  it('should submit the form with correct payload', async () => {
    

    type MockPayload = {
        subject: string;
        claim: string;
        object: string;
        statement: string;
        sourceURI: string;
      }
      
      const mockPayload: MockPayload = {
        subject: 'test subject',
        claim: 'test claim',
        object: 'test object',
        statement: 'test statement',
        sourceURI: 'test source URI'
      }
      
    const mockSubmitFn = vi.fn()
    render(<NewClaim open={true} setOpen={() => {}} handleSubmit={mockSubmitFn} />)
   
    const inputFields = screen.getAllByRole('textbox')
    inputFields.forEach((input, index) => {
      const key = Object.keys(mockPayload)[index] as keyof MockPayload;
      fireEvent.change(input, { target: { value: mockPayload[key] } })
    })



    
    const submitButton = screen.getByRole('button', { name: /submit/i })
    fireEvent.click(submitButton)
    expect(mockSubmitFn).toHaveBeenCalledWith(mockPayload)
  })
})

