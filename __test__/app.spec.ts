process.env.NODE_ENV = 'test';
import { expect } from 'chai';
import request from 'supertest';
import app from '../app';
import { client } from '../db/db';
import { seed } from '../db/seed';
before(() => {
  return seed(client);
});
after(() => {
  return client
    .db(process.env.DB_NAME)
    .collection('comments')
    .drop()
    .then(() => {
      return client.close();
    });
});

describe('app', () => {
  describe('POST Comment', () => {
    it('201: given new comment returns added comment', () => {
      const comment = {
        author: 'joe',
        text: 'we like to boogie',
        postId: 1,
      };
      return request(app)
        .post('/api/comments')
        .send(comment)
        .expect(201)
        .then((response) => {
          const comment = response.body.comment;
          expect(comment.author).to.equal('joe');
          expect(comment.text).to.equal('we like to boogie');
          expect(comment.postId).to.equal(1);
          expect(comment).to.haveOwnProperty('createdOn');
          expect(comment).to.haveOwnProperty('modifiedOn');
          expect(comment).to.haveOwnProperty('id');
        });
    });

    it('400: returns a bad request error when passed an unacceptable comment with no author', () => {
      const comment = { text: 'hello', postId: 1 };
      return request(app).post('/api/comments').send(comment).expect(400);
    });
    it('400: returns a bad request error when passed an unacceptable comment with no text', () => {
      const comment = { author: 'jim', postId: 1 };
      return request(app).post('/api/comments').send(comment).expect(400);
    });
    it('400: returns a bad request error when passed an unacceptable comment with no postId', () => {
      const comment = { author: 'sarah', text: 'hello' };
      return request(app).post('/api/comments').send(comment).expect(400);
    });
    it('400: returns a bad request when passed an unacceptable post_id', () => {
      const comment = {
        author: 'joe',
        text: 'we like to boogie',
        postId: 'hi',
      };
      return request(app).post('/api/comments').send(comment).expect(400);
    });
  });
  describe('GET Comment', () => {
    it('200: returns the correct comment', () => {
      const comment = {
        author: 'terri',
        text: 'anxious, nervous, worried?',
        postId: 1,
      };
      return request(app)
        .post('/api/comments')
        .send(comment)
        .then((response) => {
          const { id, createdOn, modifiedOn } = response.body.comment;
          return request(app)
            .get(`/api/comments/${id}`)
            .expect(200)
            .then((response) => {
              const { comment } = response.body;
              expect(comment).to.deep.equal({
                id: id,
                author: 'terri',
                text: 'anxious, nervous, worried?',
                postId: 1,
                createdOn: createdOn,
                modifiedOn: modifiedOn,
              });
            });
        });
    });
    it('404: returns an error message when provided with a valid id not found', () => {
      return request(app)
        .get('/api/comments/60d5b8c9e3eff8373c7e96b3')
        .expect(404)
        .then((response) => {
          const { msg } = response.body;
          expect(msg).to.equal('not found');
        });
    });
  });
  describe('GET Comments by PostId', () => {
    it('200: returns an array of comments', () => {
      return request(app)
        .get('/api/post/1/comments')
        .expect(200)
        .then((response) => {
          const { comments } = response.body;
          expect(Array.isArray(comments)).to.equal(true);
          expect(comments[0]).to.haveOwnProperty('id');
          expect(comments[0]).to.haveOwnProperty('text');
          expect(comments[0]).to.haveOwnProperty('author');
          expect(comments[0]).to.haveOwnProperty('createdOn');
          expect(comments[0]).to.haveOwnProperty('modifiedOn');
          expect(comments[0]).to.haveOwnProperty('postId', 1);

          expect(
            comments.every(({ postId }: { postId: number }) => postId === 1)
          ).to.equal(true);
        });
    });
    it('200: returns an empty array when provided with a non-existent postId', () => {
      return request(app)
        .get('/api/post/7/comments')
        .expect(200)
        .then((response) => {
          const { comments } = response.body;
          expect(comments).to.deep.equal([]);
        });
    });
  });
  describe('PATCH Comment', () => {
    it('200: updates and returns comment text', () => {
      const comment = {
        author: 'joe',
        text: 'we like to boogie',
        postId: 1,
      };
      return request(app)
        .post('/api/comments')
        .send(comment)
        .then((response) => {
          const { id } = response.body.comment;
          return Promise.all([
            response.body.comment,
            request(app)
              .patch(`/api/comments/${id}`)
              .send({
                text: 'new text',
              })
              .expect(200),
          ]);
        })
        .then(([{ modifiedOn }, response]) => {
          const { comment } = response.body;
          expect(comment.text).to.equal('new text');
          expect(comment.modifiedOn).to.not.equal(modifiedOn);
        });
    });
    it('200: will ignore irelevant KV pairs', () => {
      const comment = {
        author: 'joe',
        text: 'we like to boogie',
        postId: 1,
        shoeSize: 3,
      };
      return request(app)
        .post('/api/comments')
        .send(comment)
        .then((response) => {
          const { id } = response.body.comment;
          return Promise.all([
            response.body.comment,
            request(app)
              .patch(`/api/comments/${id}`)
              .send({
                text: 'new text',
              })
              .expect(200),
          ]);
        })
        .then(([{ modifiedOn }, response]) => {
          const { comment } = response.body;
          expect(comment.text).to.equal('new text');
          expect(comment.modifiedOn).to.not.equal(modifiedOn);
          expect(comment).to.not.haveOwnProperty('shoeSize');
        });
    });
    it('404: will return not found when given unavailable comment Id', () => {
      return request(app)
        .patch(`/api/comments/17`)
        .send({
          text: 'new text',
        })
        .expect(404);
    });
  });
  describe('DELETE Comment', () => {
    it('204, returns no content and successful delete', () => {
      const comment = {
        author: 'joe',
        text: 'we like to boogie',
        postId: 1,
      };
      return request(app)
        .post('/api/comments')
        .send(comment)
        .then((response) => {
          const { id } = response.body.comment;
          return Promise.all([
            response.body.comment,
            request(app).delete(`/api/comments/${id}`).expect(204),
          ]);
        })
        .then(([{ id }, response]) => {
          return request(app).get(`/api/comments/${id}`).expect(404);
        });
    });
    it('404: returns not found when given a non existent commentId', () => {
      return request(app).delete(`/api/comments/12`).expect(404);
    });
  });
});
