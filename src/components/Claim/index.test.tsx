import { render, screen } from '@testing-library/react';
import Claim from './index';

describe('Claim', () => {
  test('renders the correct table rows', () => {
    const claim = {
      id: 1,
      title: 'My Claim',
      description: 'Lorem ipsum dolor sit amet',
      amount: 100
    };
    render(<Claim />);
    expect(screen.getByText('id')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('title')).toBeInTheDocument();
    expect(screen.getByText('My Claim')).toBeInTheDocument();
    expect(screen.getByText('description')).toBeInTheDocument();
    expect(screen.getByText('Lorem ipsum dolor sit amet')).toBeInTheDocument();
    expect(screen.getByText('amount')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });
});

