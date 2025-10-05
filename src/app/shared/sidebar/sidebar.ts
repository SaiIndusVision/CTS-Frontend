import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../service/api.service';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class SidebarComponent implements OnInit {
  isCollapsed = false;
  role: string | null = null;
  navItems: { route: string; icon: string; label: string }[] = [];

  private adminNavItems = [
    { route: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { route: '/users', icon: 'people', label: 'Users' },
    { route: '/category', icon: 'category', label: 'Category' },
    { route: '/slots', icon: 'event', label: 'Slots' }
  ];

  private userNavItems = [
    { route: '/slots', icon: 'event', label: 'Slots' },
    { route: '/my-bookings', icon: 'book_online', label: 'My Bookings' }
  ];

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    // Get the user's role from ApiService
    this.role = this.apiService.getRoleName();
    // Set navigation items based on role
    this.navItems = this.role === 'User' ? this.userNavItems : this.adminNavItems;
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  logout(): void {
    this.apiService.clearTokens();
    this.router.navigate(['/login']);
  }
}