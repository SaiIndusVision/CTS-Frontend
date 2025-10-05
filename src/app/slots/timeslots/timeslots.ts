import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { HeaderComponent } from '../../shared/header/header';
import { SidebarComponent } from '../../shared/sidebar/sidebar';
import { ApiService, CategoryResponse, Category, Slot, SlotResponse, SlotCreateRequest, SlotUpdateRequest } from '../../service/api.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-timeslots',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSidenavModule,
    HeaderComponent,
    SidebarComponent
  ],
  templateUrl: './timeslots.html',
  styleUrls: ['./timeslots.scss']
})
export class TimeslotsComponent implements OnInit {
  displayedColumns: string[] = ['category', 'start_time', 'end_time', 'is_active', 'actions'];
  slots: Slot[] = [];
  categories: Category[] = [];
  totalCount = 0;
  pageSize = 10;
  viewMode: 'grid' | 'list' = 'grid';
  loading = false;
  errorMessage: string | null = null;
  dialogLoading = false;
  timeError: string | null = null;
  hours: string[] = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  minutes: string[] = ['00', '15', '30', '45'];
  @ViewChild('slotDialog') slotDialog!: TemplateRef<any>;

  filters = {
    category: null as number | null,
    is_active: null as boolean | null
  };

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadSlots(1, this.pageSize);
    this.loadCategories();
  }

  loadCategories() {
    this.apiService.listCategories(1, 100).subscribe({
      next: (response: CategoryResponse) => {
        this.categories = Array.isArray(response.data) ? response.data : [];
      },
      error: (err) => {
        console.error('Error loading categories for select:', err);
      }
    });
  }

  loadSlots(page: number, pageSize: number) {
    this.loading = true;
    this.errorMessage = null;
    const filters: any = { ...this.filters };
    if (filters.category === null) {
      delete filters.category;
    }
    if (filters.is_active === null) {
      delete filters.is_active;
    }

    console.log('Fetching slots with params:', { page, pageSize, filters });

    this.apiService.listSlots(page, pageSize, filters).subscribe({
      next: (response: SlotResponse) => {
        console.log('Slots response:', response);
        this.slots = Array.isArray(response.data) ? response.data : [];
        this.totalCount = response.total_count || 0;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching slots:', err);
        this.errorMessage = err.error?.message || 'Failed to load slots';
        this.snackBar.open(this.errorMessage || 'Failed to load slots', 'Close', {
          duration: 4000,
          panelClass: ['bg-red-600', 'text-white']
        });
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.loadSlots(1, this.pageSize);
  }

  onPageChange(event: PageEvent) {
    this.loadSlots(event.pageIndex + 1, event.pageSize);
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  openCreateDialog() {
    this.dialog.open(this.slotDialog, {
      data: {
        isEdit: false,
        slot: {
          category_id: this.categories.length > 0 ? this.categories[0].id : null,
          start_date: new Date(),
          start_hour: '09',
          start_minute: '00',
          end_date: new Date(),
          end_hour: '10',
          end_minute: '00',
          start_time: '',
          end_time: '',
          is_active: true
        }
      },
      width: '500px'
    });
  }

  openEditDialog(slot: Slot) {
    this.apiService.getSlot(slot.id).subscribe({
      next: (response: SlotResponse) => {
        console.log('Slot details response:', response);
        if (response.data && !Array.isArray(response.data)) {
          const startDate = new Date(response.data.start_time);
          const endDate = new Date(response.data.end_time);
          this.dialog.open(this.slotDialog, {
            data: {
              isEdit: true,
              slot: {
                id: response.data.id,
                category_id: response.data.category_id,
                start_date: startDate,
                start_hour: startDate.getHours().toString().padStart(2, '0'),
                start_minute: startDate.getMinutes().toString().padStart(2, '0'),
                end_date: endDate,
                end_hour: endDate.getHours().toString().padStart(2, '0'),
                end_minute: endDate.getMinutes().toString().padStart(2, '0'),
                start_time: response.data.start_time,
                end_time: response.data.end_time,
                is_active: response.data.is_active
              }
            },
            width: '500px'
          });
        }
      },
      error: (err) => {
        console.error('Error fetching slot:', err);
        this.snackBar.open(err.error?.message || 'Failed to load slot', 'Close', {
          duration: 4000,
          panelClass: ['bg-red-600', 'text-white']
        });
      }
    });
  }

  updateStartTime(slot: any) {
    if (slot.start_date && slot.start_hour && slot.start_minute) {
      const date = new Date(slot.start_date);
      date.setHours(parseInt(slot.start_hour, 10), parseInt(slot.start_minute, 10), 0, 0);
      slot.start_time = date.toISOString();
      this.validateTimes(slot);
    }
  }

  updateEndTime(slot: any) {
    if (slot.end_date && slot.end_hour && slot.end_minute) {
      const date = new Date(slot.end_date);
      date.setHours(parseInt(slot.end_hour, 10), parseInt(slot.end_minute, 10), 0, 0);
      slot.end_time = date.toISOString();
      this.validateTimes(slot);
    }
  }

  validateTimes(slot: any) {
    if (slot.start_time && slot.end_time) {
      const start = new Date(slot.start_time);
      const end = new Date(slot.end_time);
      if (end <= start) {
        this.timeError = 'End time must be after start time';
      } else {
        this.timeError = null;
      }
    } else {
      this.timeError = null;
    }
  }

  saveSlot(data: { isEdit: boolean; slot: any }) {
    this.dialogLoading = true;

    if (!data.slot.category_id || !data.slot.start_time || !data.slot.end_time) {
      this.snackBar.open('Please fill all required fields', 'Close', {
        duration: 4000,
        panelClass: ['bg-red-600', 'text-white']
      });
      this.dialogLoading = false;
      return;
    }

    if (this.timeError) {
      this.snackBar.open(this.timeError, 'Close', {
        duration: 4000,
        panelClass: ['bg-red-600', 'text-white']
      });
      this.dialogLoading = false;
      return;
    }

    if (data.isEdit) {
      const updateData: SlotUpdateRequest = {
        category: data.slot.category_id,
        start_time: data.slot.start_time,
        end_time: data.slot.end_time,
        is_active: data.slot.is_active
      };
      this.apiService.updateSlot(data.slot.id, updateData).subscribe({
        next: (response) => {
          console.log('Slot update response:', response);
          this.snackBar.open(response.message || 'Slot updated successfully', 'Close', {
            duration: 3000,
            panelClass: ['bg-green-600', 'text-white']
          });
          this.loadSlots(1, this.pageSize);
          this.dialog.closeAll();
          this.dialogLoading = false;
        },
        error: (err) => {
          console.error('Error updating slot:', err);
          this.snackBar.open(err.error?.message || 'Failed to update slot', 'Close', {
            duration: 4000,
            panelClass: ['bg-red-600', 'text-white']
          });
          this.dialogLoading = false;
        }
      });
    } else {
      const createData: SlotCreateRequest = {
        category: data.slot.category_id,
        start_time: data.slot.start_time,
        end_time: data.slot.end_time,
        is_active: data.slot.is_active ?? true
      };
      this.apiService.createSlot(createData).subscribe({
        next: (response) => {
          console.log('Slot create response:', response);
          this.snackBar.open(response.message || 'Slot created successfully', 'Close', {
            duration: 3000,
            panelClass: ['bg-green-600', 'text-white']
          });
          this.loadSlots(1, this.pageSize);
          this.dialog.closeAll();
          this.dialogLoading = false;
        },
        error: (err) => {
          console.error('Error creating slot:', err);
          this.snackBar.open(err.error?.message || 'Failed to create slot', 'Close', {
            duration: 4000,
            panelClass: ['bg-red-600', 'text-white']
          });
          this.dialogLoading = false;
        }
      });
    }
  }

  deleteSlot(id: number) {
    if (confirm('Are you sure you want to delete this slot?')) {
      this.loading = true;
      this.apiService.deleteSlot(id).subscribe({
        next: (response) => {
          console.log('Slot delete response:', response);
          this.snackBar.open(response.message || 'Slot deleted successfully', 'Close', {
            duration: 3000,
            panelClass: ['bg-green-600', 'text-white']
          });
          this.loadSlots(1, this.pageSize);
        },
        error: (err) => {
          console.error('Error deleting slot:', err);
          this.snackBar.open(err.error?.message || 'Failed to delete slot', 'Close', {
            duration: 4000,
            panelClass: ['bg-red-600', 'text-white']
          });
          this.loading = false;
        }
      });
    }
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}