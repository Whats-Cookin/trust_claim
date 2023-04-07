import { useState } from "react";
import SendIcon from "@mui/icons-material/Send";

interface comment {
  body: string;
  comment:Array<comment>
}
const dummyComments: Array<comment> = [
  //{
//     body: "this is comment1",
//     comment:[]
//   },
//   {
//     body: "this is comment2",
//     comment:[]
//   },
//   {
//     body: "this is comment3",
//     comment:[]
//   },
];

export default function ClaimComment() {
  const [comments, setComments] = useState(dummyComments);
  const [commentBody, setCommentBody] = useState("");

  const onComment = () => {
    const newComment: comment = {
      body: commentBody,
      comment:[]
    };
    setComments((prev) => [newComment, ...prev]);
  };
  return (
    <>
      <div className="fixed bottom-0 flex w-full   ">
        <div className="w-3/5">
          <input
            type="text"
            className="border-[1px] border-zinc-400 p-4 w-full  outline-none"
            autoFocus
            value={commentBody}
            onChange={(event) => setCommentBody(event.target.value)}
            placeholder="type comment"
          />
        </div>
        <button
          onClick={() => onComment()}
          className="border-[1px] rounded-full border-zinc-400 p-[0.5rem] bg-[#80b8bd]"
        >
          <SendIcon />
        </button>
      </div>
      <div className="fixed right-[-38%] flex flex-col gap-4 p-[0.5rem] rounded-md w-[300px] bg-white">
        {comments.map((comment) => (
          <CommentItem comment={comment} />
        ))}
      </div>
    </>
  );
}

interface CommentItemProps {
  comment: comment;
}
const CommentItem = ({ comment }: CommentItemProps) => {
  const [isReplying, setIsReplying] = useState(false);
//   const [first, setfirst] = useState(second)
  return (
    <div className="flex flex-col border-[1px] border-zinc-400 ">
      <span>{comment.body}</span>
      {isReplying? (
         <button className="border-[1px] rounded-full border-zinc-400 w-2/5"
         onClick={()=> setIsReplying(false)}
         >
           cancel
         </button>
      ):(
        <button className="border-[1px] rounded-full border-zinc-400 w-2/5"
        onClick={()=> setIsReplying(true )}
        >
          Reply
        </button>
      )}
      {isReplying && (
        <input
          type="text"
          placeholder="what are your thoughts?"
          className="border-[1px] border-zinc-400 p-4 w-full  outline-none"
        />
      )}
    </div>
  );
};
