import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
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
import { ApiService, Category, CategoryCreateRequest, CategoryUpdateRequest } from '../../service/api.service';

@Component({
selector: 'app-category',
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
templateUrl: './category.html',
styleUrls: ['./category.scss']
})
export class CategoryComponent implements OnInit {
displayedColumns: string[] = ['name', 'description', 'is_active', 'created_by_name', 'created_at', 'actions'];
categories: Category[] = [];
totalCount = 0;
pageSize = 10;
viewMode: 'grid' | 'list' = 'grid';
loading = false;
errorMessage: string | null = null;
dialogLoading = false;
@ViewChild('categoryDialog') categoryDialog!: TemplateRef<any>;

filters = {
name: '',
is_active: null as boolean | null,
from_date: null as Date | null,
to_date: null as Date | null
};

constructor(
private apiService: ApiService,
private dialog: MatDialog,
private snackBar: MatSnackBar
) {}

ngOnInit() {
this.loadCategories(1, this.pageSize);
}

loadCategories(page: number, pageSize: number) {
this.loading = true;
this.errorMessage = null;

// 🔸 Validate date range
if (this.filters.from_date && this.filters.to_date) {
  if (this.filters.to_date < this.filters.from_date) {
    this.snackBar.open('To Date cannot be earlier than From Date.', 'Close', {
      duration: 4000,
      panelClass: ['bg-red-600', 'text-white']
    });
    this.loading = false;
    return;
  }
}

const filters: any = { ...this.filters };

if (filters.from_date) {
  filters.from_date = this.formatDate(filters.from_date);
} else {
  delete filters.from_date;
}

if (filters.to_date) {
  filters.to_date = this.formatDate(filters.to_date);
} else {
  delete filters.to_date;
}

if (!filters.name) {
  delete filters.name;
}

if (filters.is_active === null) {
  delete filters.is_active;
}

console.log('Fetching categories with params:', { page, pageSize, filters });

this.apiService.listCategories(page, pageSize, filters).subscribe({
  next: (response: any) => {
    console.log('Raw API response:', response);
    
    if (response) {
      this.categories = Array.isArray(response.data) ? response.data : [];
      this.totalCount = response.total_count || 0;
      console.log('Categories loaded:', this.categories.length, 'Total:', this.totalCount);
    } else {
      this.categories = [];
      this.totalCount = 0;
    }
    
    this.loading = false;
  },
  error: (err) => {
    console.error('Error fetching categories:', err);
    this.errorMessage = err.error?.message || 'Failed to load categories';
    this.snackBar.open(this.errorMessage || 'Failed to load categories', 'Close', {
      duration: 4000,
      panelClass: ['bg-red-600', 'text-white']
    });
    this.categories = [];
    this.totalCount = 0;
    this.loading = false;
  }
});

}

applyFilters() {
this.loadCategories(1, this.pageSize);
}

onPageChange(event: PageEvent) {
this.loadCategories(event.pageIndex + 1, event.pageSize);
}

toggleViewMode() {
this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
}

openCreateDialog() {
this.dialog.open(this.categoryDialog, {
data: {
isEdit: false,
category: { name: '', description: '', is_active: true } as CategoryCreateRequest
},
width: '400px'
});
}

openEditDialog(category: Category) {
this.apiService.getCategory(category.id).subscribe({
next: (response: any) => {
console.log('Category details response:', response);
if (response.data && !Array.isArray(response.data)) {
this.dialog.open(this.categoryDialog, {
data: {
isEdit: true,
category: { ...response.data } as CategoryUpdateRequest
},
width: '400px'
});
}
},
error: (err) => {
console.error('Error fetching category:', err);
this.snackBar.open(err.error?.message || 'Failed to load category', 'Close', {
duration: 4000,
panelClass: ['bg-red-600', 'text-white']
});
}
});
}

saveCategory(data: { isEdit: boolean; category: CategoryCreateRequest | CategoryUpdateRequest }) {
this.dialogLoading = true;
const userId = this.apiService.getUserId();

if (data.isEdit) {
  const updateData: CategoryUpdateRequest = {
    name: data.category.name || undefined,
    description: data.category.description || undefined,
    is_active: data.category.is_active,
    updated_by: userId ? parseInt(userId) : undefined
  };
  this.apiService.updateCategory((data.category as any).id, updateData).subscribe({
    next: (response) => {
      console.log('Category update response:', response);
      this.snackBar.open(response.message || 'Category updated successfully', 'Close', {
        duration: 3000,
        panelClass: ['bg-green-600', 'text-white']
      });
      this.loadCategories(1, this.pageSize);
      this.dialog.closeAll();
      this.dialogLoading = false;
    },
    error: (err) => {
      console.error('Error updating category:', err);
      this.snackBar.open(err.error?.message || 'Failed to update category', 'Close', {
        duration: 4000,
        panelClass: ['bg-red-600', 'text-white']
      });
      this.dialogLoading = false;
    }
  });
} else {
  const createData: CategoryCreateRequest = {
    name: data.category.name || '',
    description: data.category.description || undefined,
    is_active: data.category.is_active ?? true,
    created_by: userId ? parseInt(userId) : undefined
  };
  this.apiService.createCategory(createData).subscribe({
    next: (response) => {
      console.log('Category create response:', response);
      this.snackBar.open(response.message || 'Category created successfully', 'Close', {
        duration: 3000,
        panelClass: ['bg-green-600', 'text-white']
      });
      this.loadCategories(1, this.pageSize);
      this.dialog.closeAll();
      this.dialogLoading = false;
    },
    error: (err) => {
      console.error('Error creating category:', err);
      this.snackBar.open(err.error?.message || 'Failed to create category', 'Close', {
        duration: 4000,
        panelClass: ['bg-red-600', 'text-white']
      });
      this.dialogLoading = false;
    }
  });
}

}

deleteCategory(id: number) {
if (confirm('Are you sure you want to delete this category?')) {
this.loading = true;
this.apiService.deleteCategory(id).subscribe({
next: (response) => {
console.log('Category delete response:', response);
this.snackBar.open(response.message || 'Category deleted successfully', 'Close', {
duration: 3000,
panelClass: ['bg-green-600', 'text-white']
});
this.loadCategories(1, this.pageSize);
},
error: (err) => {
console.error('Error deleting category:', err);
this.snackBar.open(err.error?.message || 'Failed to delete category', 'Close', {
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
const year = date.getFullYear();
const month = String(date.getMonth() + 1).padStart(2, '0');
const day = String(date.getDate()).padStart(2, '0');
return `${year}-${month}-${day}`;
}
}
