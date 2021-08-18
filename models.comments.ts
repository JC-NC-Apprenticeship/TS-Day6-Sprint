import { ObjectID } from 'bson';
import { client } from './db/db';
import { Comment } from './types';

export const addComment = (commentToAdd: {
  text: string;
  author: string;
  postId: number;
}) => {
  const { id, ...newComment } = makeComment(commentToAdd);
  return client
    .db(process.env.DB_NAME)
    .collection('comments')
    .insertOne({ _id: id, ...newComment })
    .then((data) => {
      const { _id, ...addedComment } = data.ops[0];
      return { id: _id, ...addedComment };
    });
};

export const fetchComment = (comment_id: string) => {
  return client
    .db(process.env.DB_NAME)
    .collection('comments')
    .findOne({ _id: comment_id })
    .then((comment) => {
      if (comment !== null) {
        const { _id, ...restOfComment } = comment;
        return { id: _id, ...restOfComment };
      } else {
        return Promise.reject({ msg: 'not found' });
      }
    });
};
export const fetchCommentsByPostId = (postId: string) => {
  return client
    .db(process.env.DB_NAME)
    .collection('comments')
    .find({ postId: Number(postId) })
    .toArray()
    .then((comments) => {
      return comments.map(({ _id, ...comment }) => {
        return { id: _id, ...comment };
      });
    });
};

export const editComment = (comment_id: string, { text }: { text: string }) => {
  return client
    .db(process.env.DB_NAME)
    .collection('comments')
    .updateOne(
      { _id: comment_id },
      { $set: { text: text, modifiedOn: Date.now() } }
    )
    .then(() => {
      return client
        .db(process.env.DB_NAME)
        .collection('comments')
        .findOne({ _id: comment_id })
        .then((comment) => {
          if (comment === null) {
            return Promise.reject({ msg: 'not found' });
          } else {
            const { _id, ...restOfComment } = comment;
            return { id: _id, ...restOfComment };
          }
        });
    });
};

function makeComment(comment: {
  text: string;
  author: string;
  postId: number;
}): Comment {
  const newComment: Comment = {
    ...comment,
    id: new ObjectID().toString(),
    createdOn: Date.now(),
    modifiedOn: Date.now(),
  };
  return newComment;
}
export const removeCommentById = (commentId: string) => {
  return client
    .db(process.env.DB_NAME)
    .collection('comments')
    .deleteOne({ _id: commentId })
    .then(({ deletedCount }) => {
      if (deletedCount === 0) {
        return Promise.reject({ msg: 'not found' });
      } else {
        return deletedCount;
      }
    });
};
