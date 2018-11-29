import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { MenuItem } from 'primeng/api';
import * as $ from 'jquery';
import { Agent } from '../authentification/user';
import { SessionStorage } from 'ngx-webstorage';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  collapse: boolean = true;
  private items: MenuItem[];

  constructor(
    private route: ActivatedRoute,
    private location: Location
  ) { }

  ngOnInit() {
    this.items = [
      {
        label: "Home",
        icon: 'fa fa-home',
        routerLink: "/home"
      },
      {
        label: 'Processus',
        icon: 'fa fa-cog',
        items: [
          { label: 'New', icon: 'fa fa-plus', routerLink: "/processus/edit" },
          { label: 'Browse', icon: 'fa fa-search', routerLink: "/processus/index" }
        ]
      },
      {
        label: "Workbench",
        icon: 'fa fa-cogs',
        routerLink: "/workbench"
      }
    ];
  }


}
