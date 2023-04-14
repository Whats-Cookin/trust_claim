import React, { useState } from 'react'

export interface commentInputProps {
  onSubmit: (text: string) => void
}

const CommentInput: React.FC<commentInputProps> = ({ onSubmit }) => {
  const [text, setText] = useState<string>('')
  const handleSubmit = (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault()
    onSubmit(text)
    setText('')
  }
  return (
    <form
      action=''
      onSubmit={handleSubmit}
      style={{ position: 'fixed', bottom: 0, gap: '4%', display: 'flex', width: '100%' }}
    >
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        style={{ width: '60%', border: '1px solid zinc', outline: 'none', padding:'0 0.5rem', borderRadius: '10px' }}
      />
      <button
        style={{
          background: '#80B8BD',
          color: 'white',
          fontWeight: 'bold',
          padding: '0 1rem',
          borderRadius: '10px',
          border: 'none'
        }}
      >
        {' '}
        comment
      </button>
    </form>
  )
}

export default CommentInput
