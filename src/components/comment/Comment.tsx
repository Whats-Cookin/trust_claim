import {useState} from "react";
import SendIcon from "@mui/icons-material/Send";

const Comment = () => {
    const [input, setInput] = useState('')
  return (
    <div>
      <div>
        <input
          type="text"
          className="border-[1px] border-zin-400 p-4 w-3/4"
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="type comment"
        />
      </div>
      <button className="border-[1px] rounded-full border-zinc-400">
        <SendIcon />
      </button>
    </div>
  );
};

export default Comment;
