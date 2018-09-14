import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContextDisplayComponent } from './context-display.component';

describe('ContextDisplayComponent', () => {
  let component: ContextDisplayComponent;
  let fixture: ComponentFixture<ContextDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContextDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContextDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
