import { ConcatenatePipe } from './concatenate.pipe';

describe('ConcatenatePipe', () => {
  it('create an instance', () => {
    const pipe = new ConcatenatePipe();
    expect(pipe).toBeTruthy();
  });
});
