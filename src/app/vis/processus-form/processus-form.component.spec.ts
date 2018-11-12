import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessusFormComponent } from './processus-form.component';

describe('ProcessusFormComponent', () => {
  let component: ProcessusFormComponent;
  let fixture: ComponentFixture<ProcessusFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessusFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessusFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
