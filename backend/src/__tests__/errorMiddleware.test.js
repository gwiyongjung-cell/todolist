'use strict';

const errorMiddleware = require('../middlewares/errorMiddleware');

/**
 * mock req/res/next 객체 생성 헬퍼
 */
function createMockReq() {
  return {};
}

function createMockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function createMockNext() {
  return jest.fn();
}

describe('errorMiddleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = createMockReq();
    res = createMockRes();
    next = createMockNext();
  });

  describe('status가 있는 에러', () => {
    it('에러의 status 코드로 응답해야 한다 (400)', () => {
      const err = new Error('잘못된 요청입니다');
      err.status = 400;

      errorMiddleware(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('에러의 status 코드로 응답해야 한다 (401)', () => {
      const err = new Error('인증이 필요합니다');
      err.status = 401;

      errorMiddleware(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('에러의 status 코드로 응답해야 한다 (404)', () => {
      const err = new Error('찾을 수 없습니다');
      err.status = 404;

      errorMiddleware(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('응답 body가 { message: "..." } 형식이어야 한다', () => {
      const err = new Error('잘못된 요청입니다');
      err.status = 400;

      errorMiddleware(err, req, res, next);

      expect(res.json).toHaveBeenCalledWith({ message: '잘못된 요청입니다' });
    });
  });

  describe('status가 없는 에러', () => {
    it('status가 없으면 500으로 응답해야 한다', () => {
      const err = new Error('예상치 못한 오류');

      errorMiddleware(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('status가 undefined면 500으로 응답해야 한다', () => {
      const err = new Error('서버 오류');
      err.status = undefined;

      errorMiddleware(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('응답 body가 { message: "..." } 형식이어야 한다', () => {
      const err = new Error('내부 서버 오류');

      errorMiddleware(err, req, res, next);

      expect(res.json).toHaveBeenCalledWith({ message: '내부 서버 오류' });
    });
  });

  describe('응답 체이닝', () => {
    it('res.status().json() 순서로 호출되어야 한다', () => {
      const err = new Error('오류 발생');
      err.status = 422;

      errorMiddleware(err, req, res, next);

      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledTimes(1);
    });

    it('next는 호출되지 않아야 한다', () => {
      const err = new Error('오류 발생');

      errorMiddleware(err, req, res, next);

      expect(next).not.toHaveBeenCalled();
    });
  });
});
