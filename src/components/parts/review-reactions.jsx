'use client';

import { reviewReaction } from '@/actions/tenant/reaction';
import { useState } from 'react';

// REMOVED DISLIKES
function ReactionButton({ type, reactions, setReactions }) {
  const handleReaction = async () => {
    try {
      let newLikes = [...reactions.likes];

      // let newDislikes = [...reactions.dislikes];
      if (type === 'like') {
        if (reactions.likes.includes(reactions.uid)) {
          newLikes = newLikes.filter((id) => id !== reactions.uid);
        } else {
          newLikes.push(reactions.uid);
          // newDislikes = newDislikes.filter((id) => id !== reactions.uid);
        }
        // } else if (type === "dislike") {
        //   if (reactions.dislikes.includes(reactions.uid)) {
        //     newDislikes = newDislikes.filter((id) => id !== reactions.uid);
        //   } else {
        //     newDislikes.push(reactions.uid);
        //     newLikes = newLikes.filter((id) => id !== reactions.uid);
        //   }
      }

      const updatedReactions = {
        ...reactions,
        likes: newLikes,
        // dislikes: newDislikes,
        type: type === reactions.type ? '' : type,
      };

      setReactions(updatedReactions);
      // Make the API call with the updated reaction
      await reviewReaction(updatedReactions);
    } catch (error) {
      console.error(error);
      // Handle errors
    }
  };

  return (
    <button onClick={handleReaction}>
      <i
        className={
          type === 'like'
            ? `fas fa-thumbs-up ${reactions.likes.includes(reactions.uid) ? 'reacted_on_like' : ''}`
            : '' /* `fas fa-thumbs-down ${
                reactions.dislikes.includes(reactions.uid)
                  ? "reacted_on_dislike"
                  : ""
              }` */
        }
      />
      <span className='review_reactions_counter'>
        {reactions.likes.length > 0 ? reactions.likes.length : ''}
      </span>
    </button>
  );
}

export default function ReviewReactions({ data }) {
  const [reactions, setReactions] = useState({
    ...data,
    type: '',
  });

  return (
    <div className='review_reactions d-flex'>
      <ReactionButton
        type='like'
        reactions={reactions}
        setReactions={setReactions}
      />
      {/* <ReactionButton
        type="dislike"
        reactions={reactions}
        setReactions={setReactions}
      /> */}
    </div>
  );
}
