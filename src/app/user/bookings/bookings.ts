import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService, BookingResponse, Booking } from '../../service/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HeaderComponent } from '../../shared/header/header';
import { SidebarComponent } from '../../shared/sidebar/sidebar';

@Component({
selector: 'app-bookings',
standalone: true,
imports: [
CommonModule,
FormsModule,
MatTableModule,
MatPaginatorModule,
MatFormFieldModule,
MatInputModule,
MatSelectModule,
MatDatepickerModule,
MatNativeDateModule,
MatButtonModule,
MatIconModule,
MatProgressSpinnerModule,
MatSidenavModule,
MatSnackBarModule,
HeaderComponent,
SidebarComponent
],
templateUrl: './bookings.html',
styleUrls: ['./bookings.scss']
})
export class BookingsComponent implements OnInit {
bookings: Booking[] = [];
displayedColumns: string[] = ['id', 'slot', 'status', 'created_at', 'updated_at'];
totalCount = 0;
pageSize = 10;
currentPage = 1;
userId: number | null = null;
loading = false;
errorMessage = '';
viewMode: 'grid' | 'list' = 'grid';
filters = {
slot_id: '' as string,
status: '' as string,
from_date: null as Date | null,
to_date: null as Date | null
};

constructor(
private apiService: ApiService,
private route: ActivatedRoute,
private snackBar: MatSnackBar
) {}

ngOnInit(): void {
this.route.paramMap.subscribe(params => {
const encryptedUserId = params.get('userId');
if (encryptedUserId) {
this.userId = this.apiService.decryptUserId(encryptedUserId);
if (this.userId) {
this.fetchBookings();
} else {
this.errorMessage = 'Invalid or corrupted user ID';
this.snackBar.open(this.errorMessage, 'Close', { duration: 5000, panelClass: ['bg-red-600', 'text-white'] });
}
} else {
this.errorMessage = 'No user ID provided';
this.snackBar.open(this.errorMessage, 'Close', { duration: 5000, panelClass: ['bg-red-600', 'text-white'] });
}
});
}

fetchBookings(): void {
if (!this.userId) return;

// 🔸 Validate date range
if (this.filters.from_date && this.filters.to_date) {
  if (this.filters.to_date < this.filters.from_date) {
    this.snackBar.open('To Date cannot be earlier than From Date.', 'Close', {
      duration: 4000,
      panelClass: ['bg-red-600', 'text-white']
    });
    return;
  }
}

this.loading = true;
this.errorMessage = '';

const filters: any = {
  user_id: this.userId,
  slot_id: this.filters.slot_id ? parseInt(this.filters.slot_id, 10) : undefined,
  status: this.filters.status || undefined,
  from_date: this.filters.from_date ? this.formatDate(this.filters.from_date) : undefined,
  to_date: this.filters.to_date ? this.formatDate(this.filters.to_date) : undefined
};

console.log('Fetching bookings with params:', { page: this.currentPage, pageSize: this.pageSize, filters });

this.apiService.listBookings(this.currentPage, this.pageSize, filters).subscribe({
  next: (response: BookingResponse) => {
    this.bookings = Array.isArray(response.data) ? response.data : [];
    this.totalCount = response.count || 0;
    this.loading = false;
  },
  error: (err) => {
    this.bookings = [];
    this.totalCount = 0;
    this.errorMessage = err.error?.message || 'Failed to fetch bookings. Please try again.';
    this.snackBar.open(this.errorMessage, 'Close', { duration: 5000, panelClass: ['bg-red-600', 'text-white'] });
    this.loading = false;
  }
});

}

onPageChange(event: PageEvent): void {
this.currentPage = event.pageIndex + 1;
this.pageSize = event.pageSize;
this.fetchBookings();
}

applyFilters(): void {
this.currentPage = 1;
this.fetchBookings();
}

toggleViewMode(): void {
this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
}

private formatDate(date: Date): string {
const year = date.getFullYear();
const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
const day = String(date.getDate()).padStart(2, '0');
return `${year}-${month}-${day}`;
}
}
