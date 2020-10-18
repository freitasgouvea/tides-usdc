import { Component, EventEmitter, Output, OnInit } from "@angular/core";
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

    constructor(
        private sidebarService: SidebarService,
        public metamaskService: MetamaskService,
    ) {
        this.isCollapsed = true;
    }

    ngOnInit(): void {
    }

    connectMetamask(){
      this.metamaskService.connectWallet();
    }

}
