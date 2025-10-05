import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ApiService } from '../../service/api.service';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

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
  userId: number | null = null;
  navItems: { route: string; icon: string; label: string }[] = [];

  private adminNavItems = [
    { route: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { route: '/users', icon: 'people', label: 'Users' },
    { route: '/category', icon: 'category', label: 'Category' },
    { route: '/slots', icon: 'event', label: 'Slots' }
  ];

  private userNavItems = [
    { route: '/user-slot', icon: 'event', label: 'Slots' }
    // 'My Bookings' route will be added dynamically with userId
  ];

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.role = this.apiService.getRoleName();
    const userIdStr = this.apiService.getUserId();
    this.userId = userIdStr ? parseInt(userIdStr, 10) : null;

    console.log('Sidebar initialized with role:', this.role, 'userId:', this.userId);

    if (this.role === 'User' && this.userId) {
      this.navItems = [
        ...this.userNavItems,
        { route: `/bookings/${this.userId}`, icon: 'book_online', label: 'My Bookings' }
      ];
    } else {
      this.navItems = this.adminNavItems;
    }

    // Log route changes to verify active state
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        console.log('Current route:', event.url);
      });
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  logout(): void {
    this.apiService.clearTokens();
    this.router.navigate(['/login']);
  }
}