import { Component, OnInit, Input } from '@angular/core';

import {Canal} from 'src/app/communication';
import { Processus } from 'src/app/models/Processus';

@Component({
  selector: 'app-processus-form',
  templateUrl: './processus-form.component.html',
  styleUrls: ['./processus-form.component.css']
})
export class ProcessusFormComponent implements OnInit {

  @Input()
  canal: Canal<Processus> = new Canal<Processus>();

  public editable = false;  
  public displayModal = false;
  public processus: Processus;
  

  constructor() { }

  ngOnInit() {
    this.canal.flowIn$.subscribe((processusAndOptions) => {
      if (!processusAndOptions) return;
      console.log(processusAndOptions);
      this.processus = processusAndOptions.data;
      (<{editable}>processusAndOptions.options).editable ? this.editable = true : this.editable = false;
      this.displayModal = true;
    })
  };

  ngAfterViewInit() {

  }


  onSubmitProcessus() {
    this.displayModal = false;
    this.canal.passOut(this.processus);
  }
}
