
import { render, screen } from '@testing-library/react';
import Loader from './index';
import { expect, test, describe} from 'vitest'

describe('Loader', ()=> {

   test("renders correctly with open prop", () => {
    render(<Loader open={true} />);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });

  test("does not render with closed prop", () => {
    render(<Loader open={false} />);
    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });

});