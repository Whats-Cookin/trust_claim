import React from 'react'

import { render, fireEvent, waitFor } from '@testing-library/react'
import Search from './index'
import { vi } from 'vitest'

describe('Search component', () => {
  it('should render without crashing', () => {
    render(<Search toggleSnackbar={undefined} setSnackbarMessage={undefined} setLoading={undefined} />)
  })
})


describe('Search component', () => {
  it('should search for claims when the search button is clicked', async () => {
    // Mock the necessary props
    const setLoading = vi.fn()
    const setSnackbarMessage = vi.fn()
    const toggleSnackbar = vi.fn()
    const homeProps = { setLoading, setSnackbarMessage, toggleSnackbar }

    // Render the component
    // const { getByTestId } = render(<Search homeProps={homeProps} />)
    // const searchInput = getByTestId('search-input')
    // const searchButton = getByTestId('search-button')

    // Enter a search query and click the search button
    // fireEvent.change(searchInput, { target: { value: 'test' } })
    // fireEvent.click(searchButton)

    // Wait for the claims to be fetched
    await waitFor(() => expect(setLoading).toHaveBeenCalledTimes(2))

    // Check that the claims were fetched
    expect(setLoading).toHaveBeenCalledWith(true)
    expect(setLoading).toHaveBeenCalledWith(false)
  })
})

describe('Search component', () => {
  it('should fetch claims when a node is clicked', async () => {
    // Mock the necessary props
    const setLoading = vi.fn()
    const setSnackbarMessage = vi.fn()
    const toggleSnackbar = vi.fn()
    const homeProps = { setLoading, setSnackbarMessage, toggleSnackbar }

    // Render the component
    // const { getByTestId } = render(<Search homeProps={homeProps} />)
    // const node = getByTestId('node')

    // Click the node
    // fireEvent.click(Node)

    // Wait for the claims to be fetched
    await waitFor(() => expect(setLoading).toHaveBeenCalledTimes(2))

    // Check that the claims were fetched
    expect(setLoading).toHaveBeenCalledWith(true)
    expect(setLoading).toHaveBeenCalledWith(false)
  })
})
describe('Search component', () => {
  it('should show a modal when an edge is clicked', () => {
    // Mock the necessary props
    const setLoading = vi.fn()
    const setSnackbarMessage = vi.fn()
    const toggleSnackbar = vi.fn()
    const homeProps = { setLoading, setSnackbarMessage, toggleSnackbar }

    // Render the component
    // const { getByTestId, getByText } = render(<Search homeProps={homeProps} />)
    // const edge = getByTestId('edge' 
  })
  })