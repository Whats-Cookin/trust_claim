
import { render, screen } from '@testing-library/react';
import Claim from './index';

describe('Claim', () => {
  
  test("renders a list of fields", () => {
    const claim = {
      id: 1,
      claim: "Some claim",
      createdAt: new Date().toISOString(),
      source: "https://example.com",
      subject: "https://example.com/subject",
      statement: "Some statement",
    };
  
    render(<Claim {...claim} />);
  
    const fieldArr = Object.keys(claim);
  
    fieldArr.forEach((field) => {
      expect(screen.getByText(field)).toBeInTheDocument();
    });
  });
  
});

