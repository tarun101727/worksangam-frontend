// utils/countComment.js

/**
 * Recursively count all comments and replies
 * @param {Array} comments - array of comment objects with possible nested replies
 * @returns {string|number} total number of comments including replies, formatted with K/M/B
 */
export const countComments = (comments) => {
  if (!comments || comments.length === 0) return 0;

  let total = 0;

  const traverse = (commentList) => {
    commentList.forEach((c) => {
      total += 1; // count this comment
      if (c.replies && c.replies.length > 0) {
        traverse(c.replies); // count replies recursively
      }
    });
  };

  traverse(comments);

  // Format numbers: K for thousands, M for millions, B for billions
  if (total >= 1_000_000_000) {
    return (total / 1_000_000_000).toFixed(total % 1_000_000_000 === 0 ? 0 : 1) + "B";
  }

  if (total >= 1_000_000) {
    return (total / 1_000_000).toFixed(total % 1_000_000 === 0 ? 0 : 1) + "M";
  }

  if (total >= 1_000) {
    return (total / 1_000).toFixed(total % 1_000 === 0 ? 0 : 1) + "K";
  }

  return total;
};