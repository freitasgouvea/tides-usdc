import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-approve-form',
  templateUrl: './approve-form.component.html',
  styleUrls: ['./approve-form.component.css']
})
export class ApproveFormComponent implements OnInit {

  txOff;

  constructor() { }

  ngOnInit(): void {
    this.txOff = true;
  }

}
