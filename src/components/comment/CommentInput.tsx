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
    <form action='' onSubmit={handleSubmit} className='fixed bottom-0 gap-4  flex w-full'>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        className='w-3/5 border-zinc-400 outline-none px-[0.5rem] rounded-md'
      />
      <button className='bg-[#80B8BD] text-white font-bold px-[1rem] rounded-md border-none'> comment</button>
    </form>
  )
}

export default CommentInput
