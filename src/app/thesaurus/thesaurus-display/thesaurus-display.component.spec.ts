import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThesaurusDisplayComponent } from './thesaurus-display.component';

describe('ThesaurusDisplayComponent', () => {
  let component: ThesaurusDisplayComponent;
  let fixture: ComponentFixture<ThesaurusDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThesaurusDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThesaurusDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
