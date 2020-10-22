import { Component, EventEmitter, Output, OnInit } from "@angular/core";
import { of } from 'rxjs/internal/observable/of';
import { MetamaskService } from 'src/app/services/metamask.service';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['navbar.component.css']
})
export class NavbarComponent implements OnInit {

  isCollapsed: boolean;
  isConected: boolean;
  userAddress: "0x00";

  constructor(
    private sidebarService: SidebarService,
    public metamaskService: MetamaskService,
  ) {
    this.isCollapsed = true;
  }

  ngOnInit(): void {
    //this.getAddress();
  }

  connectMetamask() {
    this.metamaskService.connectWallet();
  }

  getAddress() {
    this.metamaskService.getAccount().then(function (result) {
      //this.userAddress = result;
      console.log(this.userAddress)
    });
  }
}
