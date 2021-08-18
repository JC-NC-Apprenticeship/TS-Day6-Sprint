import { RequestHandler } from 'express';
import {
  addComment,
  fetchComment,
  fetchCommentsByPostId,
  editComment,
  removeCommentById,
} from './models.comments';

export const postComment: RequestHandler = (req, res, next) => {
  const { text, author, postId } = req.body;
  addComment({ text, author, postId })
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

export const getCommentById: RequestHandler = (req, res, next) => {
  const { comment_id } = req.params;
  fetchComment(comment_id)
    .then((comment) => {
      res.status(200).send({ comment });
    })
    .catch(next);
};

export const getCommentsByPostId: RequestHandler = (req, res, next) => {
  const { postId } = req.params;
  fetchCommentsByPostId(postId)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

export const patchCommentById: RequestHandler = (req, res, next) => {
  const { comment_id } = req.params;
  const { text } = req.body;
  editComment(comment_id, { text })
    .then((comment) => {
      res.status(200).send({ comment });
    })
    .catch(next);
};

export const deleteCommentById: RequestHandler = (req, res, next) => {
  const { comment_id } = req.params;
  removeCommentById(comment_id)
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};
