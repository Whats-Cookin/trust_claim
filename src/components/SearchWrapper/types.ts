interface ISearchWrapper {
  onKeyUp: (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onSearchIconClick: () => void
  value: string
}

export default ISearchWrapper
