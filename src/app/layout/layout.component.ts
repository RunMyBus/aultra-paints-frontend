import { Component, OnInit } from '@angular/core';
import {CommonModule} from "@angular/common";
import {Router, RouterModule} from "@angular/router";
import {AuthService} from "../services/auth.service";

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnInit {
  // Sidebar + menu state, managed via Angular bindings only. No jQuery.
  // The previous $(document).ready block broke SSR and leaked handlers on
  // every navigation; template-side [ngClass] replaces it.
  isSidebarCollapsed: boolean = false;
  sidenavToggled: boolean = false;
  active: boolean = false;
  orderActive: boolean = false;
  currentUser: any = {};

  constructor(private router: Router, private AuthService: AuthService) {
    this.currentUser = this.AuthService.currentUserValue;
  }

  ngOnInit(): void {
    // Role-based default landing page.
    const currentUrl = this.router.url;
    if (currentUrl === '/' || currentUrl === '') {
      if (this.currentUser?.accountType === 'SuperUser') {
        this.router.navigate(['/piechart-dashboard']);
      } else {
        this.router.navigate(['/dashboard']);
      }
    }
  }

  toggleSidenav(): void {
    this.sidenavToggled = !this.sidenavToggled;
  }

  // Toggle the sidebar between collapsed and expanded states
  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  // Navigate to a new route
  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  // Logout functionality
  logout(): void {
    this.AuthService.logOut();
  }

  
    // if (!this.config.multi) {
    //   this.menuGet.filter((menu: { active: any; }, i: number) => i !== index && menu.active).forEach((menu: { active: boolean; }) => menu.active = !menu.active);
    // }
    // this.menuGet[index].active = !this.menuGet[index].active;

  
    toggleOrderMenu() {
      this.orderActive = !this.orderActive;
      if (this.orderActive) {
        this.active = false; // Close Masters menu when Order menu is opened
      }
    }
  
    toggle() {
      this.active = !this.active;
      if (this.active) {
        this.orderActive = false; // Close Order menu when Masters menu is opened
      }
    }
  
    
}
