import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatChipsModule} from '@angular/material';
@NgModule({
  imports: [
    CommonModule,
    MatChipsModule
  ],
  exports: [
    MatChipsModule
  ],
  declarations: []
})
export class MaterialCustomModule { }
