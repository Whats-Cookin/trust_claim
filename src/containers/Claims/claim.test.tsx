import { render ,screen ,cleanup} from "@testing-library/react";
import Home  from "./index";
import { expect, describe, it, afterEach,test } from 'vitest';
import userEvent from "@testing-library/user-event";

test('renders the title', () => {
  render(<Home toggleSnackbar={undefined} setSnackbarMessage={undefined} setLoading={undefined} />);
  const title = screen.getByText(/claims list/i);
  expect(title).toBeInTheDocument();
});

test('displays fetched claims', () => {
  const claims = [
    { id: 1, claim: 'Claim 1', createdAt: '2022-01-01', source: 'https://example.com', subject: 'https://example.com/subject', statement: 'Statement 1' },
    { id: 2, claim: 'Claim 2', createdAt: '2022-02-01', source: 'https://example.org', subject: 'https://example.org/subject', statement: 'Statement 2' }
  ];
  window.localStorage.setItem('claims', JSON.stringify(claims));

  render(<Home toggleSnackbar={undefined} setSnackbarMessage={undefined} setLoading={undefined} />);
  const claim1 = screen.getByText(/Claim 1/i);
  const claim2 = screen.getByText(/Claim 2/i);
  expect(claim1).toBeInTheDocument();
  expect(claim2).toBeInTheDocument();
});
const  removeTrailingSlash =(url: string) => {
  if (typeof url != 'string') {
      return url
  }
  return url
    .replace(/\/+$/, "")
    .replace("https://", "")
    .replace("http://", "");
}

const getTopicFromDomain = (url: string) => {
  if (typeof url != 'string') {
      return url
  }
  if (url.includes("trustclaims.whatscookin.us")) {
    return url.split("/").at(-1);
  } else {
    return removeTrailingSlash(url);
  }
};

test('removes trailing slashes from URLs', () => {
  const url1 = 'https://example.com/';
  const url2 = 'http://example.org/';
  const url3 = 'https://example.net/test/';

  expect(removeTrailingSlash(url1)).toBe('example.com');
  expect(removeTrailingSlash(url2)).toBe('example.org');
  expect(removeTrailingSlash(url3)).toBe('example.net/test');
});

test('gets topic from domain', () => {
  const url1 = 'https://trustclaims.whatscookin.us/test';
  const url2 = 'https://example.com';
  const url3 = 'http://example.org/subject';

  expect(getTopicFromDomain(url1)).toBe('test');
  expect(getTopicFromDomain(url2)).toBe('example.com');
  expect(getTopicFromDomain(url3)).toBe('example.org/subject');
});




