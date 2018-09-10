import { IssacProcessusModule } from './issac-processus.module';

describe('IssacProcessusModule', () => {
  let issacProcessusModule: IssacProcessusModule;

  beforeEach(() => {
    issacProcessusModule = new IssacProcessusModule();
  });

  it('should create an instance', () => {
    expect(issacProcessusModule).toBeTruthy();
  });
});
