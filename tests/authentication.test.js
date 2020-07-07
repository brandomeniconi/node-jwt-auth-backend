const authentication = require('../lib/authentication');

test('password validation', () => {
  const pwd = 'testpassword';
  const validHash = '$2b$10$X9WzetOCR2421CssSRl7MObPTpEg4HI1J7huzmS5CBNyOvJwvO2VK';
  const notMatchinghash = '$2b$10$X9WzetOCR2421CssSRl7MObPTpEg4HI1J7huzmS5CBNyOvJwvO2VE';
  const malformedHash = 'aaabbbcccddeefgghhhttt';

  expect(authentication.validatePassword(pwd, validHash)).resolves.toBe(true);
  expect(authentication.validatePassword(pwd, notMatchinghash)).resolves.toBe(false);
  expect(authentication.validatePassword(pwd, malformedHash)).resolves.toBe(false);
  expect(authentication.validatePassword(pwd, '')).resolves.toBe(false);
  expect(authentication.validatePassword('', '')).resolves.toBe(false);
});

test('password hashing', () => {
  const pwd = 'testpassword';

  expect(
    authentication
      .hashPassword(pwd)
      .then(hash => authentication.validatePassword(pwd, hash))
  ).resolves.toBe(true);
});
