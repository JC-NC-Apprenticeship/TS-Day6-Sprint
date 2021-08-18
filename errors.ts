import { ErrorRequestHandler } from 'express';

export const handle400s: ErrorRequestHandler = (err, req, res, next) => {
  if (err.message === 'bad comment body') {
    res.status(400).send({ msg: 'bad request' });
  } else {
    next(err);
  }
};

export const handle404s: ErrorRequestHandler = (err, req, res, next) => {
  if (err.msg === 'not found') {
    res.status(404).send({ msg: 'not found' });
  } else {
    next(err);
  }
};

export const handle500s: ErrorRequestHandler = (err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: 'Server Error' });
};
