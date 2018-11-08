import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatChipsModule, MatGridListModule } from '@angular/material';
import {MatDividerModule} from '@angular/material/divider';
import {MatCardModule} from '@angular/material/card';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

@NgModule({
  imports: [
    CommonModule,
    MatChipsModule,
    MatGridListModule,
    MatDividerModule,
    MatCardModule,
    MatButtonToggleModule
  ],
  exports: [
    MatChipsModule,
    MatGridListModule,
    MatDividerModule,
    MatCardModule,
    MatButtonToggleModule
  ],
  declarations: []
})
export class MaterialCustomModule { }
