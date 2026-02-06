import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatButtonModule,
  ],
  templateUrl: './records-dialog.component.html',
})
export class RecordsDialogComponent {

  displayedColumns = ['name', 'email', 'phone', 'actions'];
  dataSource = this.data;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any[],
    private dialogRef: MatDialogRef<RecordsDialogComponent>
  ) {}

  edit(row: any) {
    this.dialogRef.close({ action: 'edit', record: row });
  }

  delete(row: any) {
    if (confirm('Delete this record?')) {
      this.dialogRef.close({ action: 'delete', record: row });
    }
  }
}
