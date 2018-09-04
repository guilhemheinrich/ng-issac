import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatChipsModule, MatGridListModule } from '@angular/material';
import {MatDividerModule} from '@angular/material/divider';
import {MatCardModule} from '@angular/material/card';
@NgModule({
  imports: [
    CommonModule,
    MatChipsModule,
    MatGridListModule,
    MatDividerModule,
    MatCardModule
  ],
  exports: [
    MatChipsModule,
    MatGridListModule,
    MatDividerModule,
    MatCardModule
  ],
  declarations: []
})
export class MaterialCustomModule { }
