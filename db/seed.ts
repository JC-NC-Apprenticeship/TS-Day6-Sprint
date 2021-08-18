import { MongoClient } from 'mongodb';
const DB_NAME = process.env.DB_NAME!;
export const seed = async (client: MongoClient) => {
  const firstComment = {
    postId: 1,
    author: 'barry',
    text: 'this post is great',
    createdOn: 1627285881983,
    modifiedOn: 1627285881983,
  };
  const secondComment = {
    postId: 1,
    author: 'charlie',
    text: 'such wow, great post',
    createdOn: 1627285882000,
    modifiedOn: 1627285882000,
  };
  if (!client.isConnected()) {
    console.log('connecting');
    client.connect();
  }

  const firstComments = await client
    .db(DB_NAME)
    .collection('comments')
    .insertMany([firstComment, secondComment])
    .then(({ ops: comments }) => {
      return comments.map(({ _id, ...comment }) => {
        return { id: _id, ...comment };
      });
    });
  const commentId = firstComments[0].id;

  const thirdComment = {
    postId: 1,
    author: 'charlie',
    replyToId: commentId,
    text: 'great comment barry!',
    createdOn: 1627287982588,
    modifiedOn: 1627287982588,
  };

  return client.db(DB_NAME).collection('comments').insertOne(thirdComment);
};
