import { Component, OnInit, Input } from '@angular/core';

import {Canal} from 'src/app/communication';
import { IssacProcessus } from 'src/app/issac-definitions/processus';

@Component({
  selector: 'app-processus-form',
  templateUrl: './processus-form.component.html',
  styleUrls: ['./processus-form.component.css']
})
export class ProcessusFormComponent implements OnInit {

  @Input()
  canal: Canal<IssacProcessus> = new Canal<IssacProcessus>();

  constructor() { }

  ngOnInit() {
    this.canal.flowIn$.subscribe((obj) => {
      if (!obj) return;
      console.log(obj.data.label);
      let processus = obj.data;
      processus.label = 'Oh really ?';
      this.canal.passOut(processus);
    })
  };

  ngAfterViewInit() {

  }

}
