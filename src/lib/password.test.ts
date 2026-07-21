import { hashPassword, verifyPassword } from './password';

describe('passwords', () => {
  it('takes the password it was given', () => {
    const stored = hashPassword('oakmere-Consulting-two-19');
    expect(verifyPassword('oakmere-Consulting-two-19', stored)).toBe(true);
  });

  it('turns down anything else', () => {
    const stored = hashPassword('oakmere-Consulting-two-19');
    expect(verifyPassword('oakmere-Consulting-two-19'.toLowerCase(), stored)).toBe(false);
    expect(verifyPassword('', stored)).toBe(false);
  });

  it('salts, so the same password hashes differently twice', () => {
    expect(hashPassword('same')).not.toBe(hashPassword('same'));
  });

  it('turns down a stored value that is not one of ours', () => {
    expect(verifyPassword('anything', 'not-a-hash')).toBe(false);
    expect(verifyPassword('anything', '')).toBe(false);
  });
});
