import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MermaidComponent } from './mermaid.component';

describe('MermaidComponent', () => {
  let component: MermaidComponent;
  let fixture: ComponentFixture<MermaidComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MermaidComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MermaidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
