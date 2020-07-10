const { log } = require('../lib/logging');

describe('Test logger', () => {
  let env;

  beforeAll(async () => {
    env = process.env.NODE_ENV;

    // this prevents the console output killswitch in testing
    process.env.NODE_ENV = 'test2';
  });

  afterAll(async () => {
    process.env.NODE_ENV = env;
  });

  it('log the message', async () => {
    const consoleMock = jest.spyOn(console, 'log').mockImplementation();

    log('something');
    expect(console.log).toHaveBeenLastCalledWith('something');

    consoleMock.mockRestore();
  });
});
