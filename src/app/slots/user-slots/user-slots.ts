import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SidebarComponent } from '../../shared/sidebar/sidebar';
import { HeaderComponent } from '../../shared/header/header';
import { ApiService, Slot, SlotResponse, BookingResponse, BookingCreateRequest, Category, CategoryResponse } from '../../service/api.service';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-user-slots',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule,
    RouterModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTooltipModule,
    MatDividerModule,
    MatSidenavModule,
    MatDialogModule,
    SidebarComponent,
    HeaderComponent
  ],
  templateUrl: './user-slots.html',
  styleUrls: ['./user-slots.scss']
})
export class UserSlotsComponent implements OnInit {
  selectedCategory: number | null = null;
  categories: Category[] = [];
  slots: Slot[] = [];
  bookings: { [slotId: number]: BookingResponse } = {};
  currentWeekStart: Date = new Date();
  loading = false;
  errorMessage = '';
  userId: number | null = null;

  constructor(
    private apiService: ApiService, 
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() - this.currentWeekStart.getDay() + (this.currentWeekStart.getDay() === 0 ? -6 : 1));
  }

  ngOnInit(): void {
    this.userId = parseInt(this.apiService.getUserId() || '0', 10);
    if (!this.userId) {
      console.error('No user ID found in localStorage');
      this.snackBar.open('Please log in to continue', 'Close', { duration: 5000 });
    }
    this.loadCategories();
    this.loadSlots();
  }

  loadCategories(): void {
    this.loading = true;
    this.apiService.listCategories(1, 100, { is_active: true }).subscribe({
      next: (response: CategoryResponse) => {
        this.categories = Array.isArray(response.data) ? response.data : [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.errorMessage = 'Failed to load categories';
        this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  loadSlots(): void {
    this.loading = true;
    this.slots = [];
    this.bookings = {};
    this.apiService.listSlots(1, 100, { 
      category: this.selectedCategory || undefined,
      is_active: true
    }).subscribe({
      next: (response: SlotResponse) => {
        this.slots = Array.isArray(response.data) ? response.data : [];
        console.log('Loaded slots:', this.slots);
        this.loadBookingsForSlots();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading slots:', err);
        this.errorMessage = 'Failed to load slots';
        this.snackBar.open(this.errorMessage, 'Close', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  loadBookingsForSlots(): void {
    this.slots.forEach(slot => {
      this.apiService.listBookings(1, 1, { slot_id: slot.id }).subscribe({
        next: (response: BookingResponse) => {
          if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            this.bookings[slot.id] = response;
            console.log(`Booking for slot ${slot.id}:`, response.data);
          }
        },
        error: (err) => {
          console.error(`Failed to load booking for slot ${slot.id}:`, err);
        }
      });
    });
  }

  bookSlot(slotId: number): void {
    if (!this.userId) {
      this.snackBar.open('User not logged in', 'Close', { duration: 5000 });
      return;
    }
    this.loading = true;
    const bookingData: BookingCreateRequest = { slot: slotId, user: this.userId };
    this.apiService.createBooking(bookingData).subscribe({
      next: () => {
        this.snackBar.open('Slot booked successfully', 'Close', { duration: 5000 });
        this.loadSlots();
      },
      error: (err) => {
        console.error('Error booking slot:', err);
        this.snackBar.open(err.error?.message || 'Failed to book slot', 'Close', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  cancelBooking(slotId: number): void {
    const booking = this.bookings[slotId]?.data;
    if (!booking || !Array.isArray(booking) || booking.length === 0) {
      console.error(`No booking found for slot ${slotId}`);
      this.snackBar.open('No booking found for this slot', 'Close', { duration: 5000 });
      return;
    }

    const bookingId = booking[0].id;
    
    // Show confirmation dialog
    const confirmed = confirm('Are you sure you want to cancel this booking?');
    
    if (!confirmed) {
      return;
    }

    console.log(`Attempting to cancel booking ID ${bookingId} for slot ${slotId}`);

    this.loading = true;
    this.apiService.deleteBooking(bookingId).pipe(
      catchError((err) => {
        if (err.status === 401) {
          const refreshToken = this.apiService.getRefreshToken();
          if (refreshToken) {
            return this.apiService.refreshToken(refreshToken).pipe(
              switchMap((response) => {
                this.apiService.setAccessToken(response.access);
                return this.apiService.deleteBooking(bookingId);
              }),
              catchError((refreshErr) => {
                console.error('Token refresh failed:', refreshErr);
                this.apiService.logout();
                this.snackBar.open('Session expired. Please log in again.', 'Close', { duration: 5000 });
                return throwError(() => refreshErr);
              })
            );
          } else {
            this.apiService.logout();
            this.snackBar.open('Session expired. Please log in again.', 'Close', { duration: 5000 });
            return throwError(() => err);
          }
        }
        return throwError(() => err);
      })
    ).subscribe({
      next: () => {
        this.snackBar.open('Booking cancelled successfully', 'Close', { duration: 5000 });
        this.loadSlots();
      },
      error: (err) => {
        console.error('Error cancelling booking:', err);
        this.snackBar.open(err.error?.message || 'Failed to cancel booking', 'Close', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.loadSlots();
  }

  resetFilters(): void {
    this.selectedCategory = null;
    this.loadSlots();
  }

  previousWeek(): void {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
    this.loadSlots();
  }

  nextWeek(): void {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
    this.loadSlots();
  }

  getWeekEnd(): Date {
    const endDate = new Date(this.currentWeekStart);
    endDate.setDate(this.currentWeekStart.getDate() + 6);
    return endDate;
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  calculateDuration(startTime: string, endTime: string): string {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end.getTime() - start.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours > 0 ? hours + 'h ' : ''}${minutes > 0 ? minutes + 'm' : ''}`.trim() || '0m';
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getWeekDates(): Date[] {
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(this.currentWeekStart);
      date.setDate(this.currentWeekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  }

  getSlotsForDate(date: Date): Slot[] {
    const dateStr = this.formatDate(date);
    return this.slots.filter(slot => slot.start_time.startsWith(dateStr));
  }

  isSlotBooked(slotId: number): boolean {
    const bookingData = this.bookings[slotId]?.data;
    return Array.isArray(bookingData) && bookingData.length > 0;
  }

  isBookedByCurrentUser(slotId: number): boolean {
    const bookingData = this.bookings[slotId]?.data;
    return Array.isArray(bookingData) && bookingData.length > 0 && bookingData[0].user === this.userId;
  }
}