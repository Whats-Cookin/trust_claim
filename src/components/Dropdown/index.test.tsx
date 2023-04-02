import { render, screen } from '@testing-library/react';
import Dropdown from './index';
import { expect, vi } from 'vitest'

describe('Dropdown', () => {

    const mockOptions = ["Option 1", "Option 2", "Option 3"];
  
    test("renders label ", () => {
        const mockSetter = vi.fn();
  
      render(<Dropdown label="Test Label" value="Option 1" setter={mockSetter} options={mockOptions} />);
  
      const selectElement = screen.getByText("Test Label");
      expect(selectElement).toBeInTheDocument();
  
    });

    test("Renders options correctly", ()=> {
        const mockSetter = vi.fn();
  
        render(<Dropdown label="Test Label" value="Option 1" setter={mockSetter} options={mockOptions} />);
        
        const option1Element = screen.getAllByText("Option 1");
        option1Element.forEach((element) => {
        expect(element).toBeInTheDocument();
        });
    });
   
});