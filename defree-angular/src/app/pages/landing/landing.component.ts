import { Component, OnInit } from '@angular/core';
import { MetamaskService } from 'src/app/services/metamask.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {

  constructor(
    public metamaskService: MetamaskService
  ) { }

  ngOnInit(): void {
  }

}
