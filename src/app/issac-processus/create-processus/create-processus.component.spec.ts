import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateProcessusComponent } from './create-processus.component';

describe('CreateProcessusComponent', () => {
  let component: CreateProcessusComponent;
  let fixture: ComponentFixture<CreateProcessusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateProcessusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateProcessusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
