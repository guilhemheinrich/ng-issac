import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateProcessusComponent } from './create-processus/create-processus.component'; // <-- NgModel lives here

import {SidebarModule} from 'primeng/sidebar';
import { AgentPanelComponent } from './agent-panel/agent-panel.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SidebarModule
  ],
  declarations: [CreateProcessusComponent, AgentPanelComponent]
})
export class IssacProcessusModule { }
