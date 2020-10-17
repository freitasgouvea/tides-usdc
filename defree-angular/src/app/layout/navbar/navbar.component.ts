import { Component, EventEmitter, Output, OnInit } from "@angular/core";
import { SidebarService } from '../../services/sidebar.service';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['navbar.component.css']
})
export class NavbarComponent implements OnInit {
    isCollapsed: boolean;

    constructor(
        private sidebarService: SidebarService,
    ) {
        this.isCollapsed = true;
    }

    ngOnInit(): void {
    }

}
