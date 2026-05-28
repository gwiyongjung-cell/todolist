'use strict';

const { hashPassword, comparePassword } = require('../utils/hashUtils');

describe('hashUtils', () => {
  describe('hashPassword(plain)', () => {
    it('문자열을 반환해야 한다', async () => {
      const result = await hashPassword('myPassword123');
      expect(typeof result).toBe('string');
    });

    it('반환값이 평문과 달라야 한다', async () => {
      const plain = 'myPassword123';
      const hashed = await hashPassword(plain);
      expect(hashed).not.toBe(plain);
    });

    it('bcrypt 해시 형식($2b$)으로 반환해야 한다', async () => {
      const hashed = await hashPassword('myPassword123');
      expect(hashed).toMatch(/^\$2[ab]\$/);
    });

    it('동일한 평문을 두 번 해싱하면 서로 다른 해시값이 나와야 한다 (salt)', async () => {
      const plain = 'myPassword123';
      const hash1 = await hashPassword(plain);
      const hash2 = await hashPassword(plain);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword(plain, hashed)', () => {
    let hashed;

    beforeAll(async () => {
      hashed = await hashPassword('correctPassword');
    });

    it('올바른 비밀번호를 비교하면 true를 반환해야 한다', async () => {
      const result = await comparePassword('correctPassword', hashed);
      expect(result).toBe(true);
    });

    it('틀린 비밀번호를 비교하면 false를 반환해야 한다', async () => {
      const result = await comparePassword('wrongPassword', hashed);
      expect(result).toBe(false);
    });

    it('빈 문자열 비밀번호는 false를 반환해야 한다', async () => {
      const result = await comparePassword('', hashed);
      expect(result).toBe(false);
    });

    it('대소문자가 다른 비밀번호는 false를 반환해야 한다', async () => {
      const result = await comparePassword('CORRECTPASSWORD', hashed);
      expect(result).toBe(false);
    });
  });
});
