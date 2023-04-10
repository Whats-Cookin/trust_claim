import React from 'react'
import { comment } from '../Modal'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'

interface CommentListProps {
  comments: comment[]
  setComments: (comments: comment[]) => void
}

const CommentList: React.FC<CommentListProps> = ({ comments, setComments }) => {
  const handleEdit = (commentId: number) => {
    setComments(
      comments.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, editable: true }
        }
        return comment
      })
    )
  }
  const handleSave = (commentId: number, newText: string) => {
    setComments(
      comments.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, text: newText, editable: false }
        }
        return comment
      })
    )
  }
  const handleDelete = (commentId: number) => {
    setComments(comments.filter(comment => comment.id !== commentId))
  }
  return (
    <div className='fixed right-[-38%] rounded-md p-[0.5rem] w-[300px] '>
      {comments.map(comment => (
        <div key={comment.id}>
          {comment.editable ? (
            <div className='border-[2px] border-zinc-400 flex flex-col my-2 px-2 rounded-md bg-white'>
              <textarea
                className='w-full outline-none'
                autoFocus
                value={comment.text}
                onChange={e =>
                  setComments(comments.map(c => (c.id === comment.id ? { ...c, text: e.target.value } : c)))
                }
              />
              <div>
                <button onClick={() => handleSave(comment.id, comment.text)}>
                  <SaveIcon className='w-[10px]' />
                </button>
                <button onClick={() => handleDelete(comment.id)}>
                  <DeleteIcon />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className='border-[2px] border-zinc-400 flex flex-col my-2 px-2 rounded-md bg-white'>
                {comment.text}
                <div className='flex gap-4 '>
                  <button onClick={() => handleEdit(comment.id)}>
                    <EditIcon className='w-[10px]' />
                  </button>
                  <button onClick={() => handleDelete(comment.id)}>
                    <DeleteIcon />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}

export default CommentList
