/** Same aspect set as `RequestRating` for API compatibility. */
export const ratingAspectOptions = [
  { value: 'quality', label: 'Quality of Work' },
  { value: 'communication', label: 'Communication' },
  { value: 'reliability', label: 'Reliability' },
  { value: 'expertise', label: 'Expertise' },
  { value: 'value', label: 'Value for Money' },
  { value: 'responsiveness', label: 'Responsiveness' },
  { value: 'professionalism', label: 'Professionalism' },
  { value: 'other', label: 'Other' }
] as const
