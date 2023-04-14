import React from 'react'
import { comment } from '../Modal'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import { borderRadius } from '@mui/system'

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
    <div style={{ position: 'fixed', right: '-38%', borderRadius: '10px', padding: '0.5rem', width: '300px' }}>
      {comments.map(comment => (
        <div key={comment.id}>
          {comment.editable ? (
            <div
              style={{
                border: '2px solid zinc',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '10px',
                margin: '2rem 0',
                padding: '0 2rem',
                background: 'white'
              }}
            >
              <textarea
                style={{ width: '100%', outline: 'none' }}
                autoFocus
                value={comment.text}
                onChange={e =>
                  setComments(comments.map(c => (c.id === comment.id ? { ...c, text: e.target.value } : c)))
                }
              />
              <div>
                <button onClick={() => handleSave(comment.id, comment.text)}>
                  <SaveIcon style={{ fontSize: '25px' }} />
                </button>
                <button onClick={() => handleDelete(comment.id)}>
                  <DeleteIcon style={{ fontSize: '25px' }} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div
                className=' my-2 px-2 rounded-md bg-white'
                style={{
                  border: '2px solid zinc',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '10px',
                  background: 'white',
                  margin: '0 1rem',
                  padding: '0 1rem'
                }}
              >
                {comment.text}
                <div style={{ display: 'flex', gap: '4%' }}>
                  <button onClick={() => handleEdit(comment.id)}>
                    <EditIcon style={{ fontSize: '25px' }} />
                  </button>
                  <button onClick={() => handleDelete(comment.id)}>
                    <DeleteIcon style={{ fontSize: '25px' }} />
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
