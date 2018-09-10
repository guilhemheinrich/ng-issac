import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentPanelComponent } from './agent-panel.component';

describe('AgentPanelComponent', () => {
  let component: AgentPanelComponent;
  let fixture: ComponentFixture<AgentPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgentPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
