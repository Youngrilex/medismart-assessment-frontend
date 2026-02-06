import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from "@angular/material/card";
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RecordsDialogComponent } from '../../shared/components/records-dialog/records-dialog.component';
import { RegistrationService } from '../../core/services/registration.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule
  ],
})
export class RegistrationComponent implements OnInit {
  registrationForm!: FormGroup;

  genders = ['Male', 'Female', 'Other', 'Prefer not to say'];

records: any[] = [];
editingId: number | null = null;


  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private registrationService: RegistrationService
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  private buildForm(): void {
    this.registrationForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [
        Validators.required,
        Validators.pattern(/^(\+234|0)[0-9]{10}$/)

      ]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required]
    });
  }

submit(): void {
  if (this.registrationForm.invalid) {
    this.registrationForm.markAllAsTouched();

    const firstError = document.querySelector('.mat-form-field-invalid');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  const payload = this.registrationForm.value;

  // UPDATE
  if (this.editingId) {
    this.registrationService.update(this.editingId, payload).subscribe({
      next: () => {
        this.resetForm();
        this.editingId = null;
        alert('Record updated successfully');
      },
      error: () => alert('Failed to update record')
    });
    return;
  }

  // CREATE
  this.registrationService.create(payload).subscribe({
    next: () => {
      this.resetForm();
      alert('Registration saved successfully');
    },
    error: () => alert('Failed to save registration')
  });
}


  resetForm(): void {
    this.registrationForm.reset();
    this.registrationForm.markAsPristine();
    this.registrationForm.markAsUntouched();

    Object.keys(this.registrationForm.controls).forEach(key => {
      const control = this.registrationForm.get(key);
      control?.setErrors(null);
    });
  }

openRecords(): void {
  this.registrationService.getAll().subscribe({
    next: records => {
      const dialogRef = this.dialog.open(RecordsDialogComponent, {
        width: '900px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        data: records,
        panelClass: 'records-dialog'
      });

      dialogRef.afterClosed().subscribe(result => {
        if (!result) return;

        // EDIT
        if (result.action === 'edit') {
          this.editingId = result.record.id;
          this.registrationForm.patchValue(result.record);

          window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // DELETE
        if (result.action === 'delete') {
          if (confirm(`Delete ${result.record.firstName} ${result.record.lastName}?`)) {
            this.deleteRecord(result.record.id);
          }
        }
      });
    },
    error: () => alert('Failed to load records')
  });
}

private deleteRecord(id: number): void {
  this.registrationService.delete(id).subscribe({
    next: () => alert('Record deleted'),
    error: () => alert('Failed to delete record')
  });
}

  getErrorMessage(controlName: string): string {
    const control = this.registrationForm.get(controlName);

    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) {
      return `${this.formatFieldName(controlName)} is required`;
    }

    if (control.errors['email']) {
      return 'Please enter a valid email address';
    }

    if (control.errors['minlength']) {
      return `${this.formatFieldName(controlName)} must be at least ${control.errors['minlength'].requiredLength} characters`;
    }

    if (control.errors['pattern']) {
      if (controlName === 'phone') {
        return 'Please enter a valid phone number';
      }
    }

    return 'Invalid value';
  }

  private formatFieldName(fieldName: string): string {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace('Date Of Birth', 'Date of Birth');
  }

  // Optional: Success message
  private showSuccessMessage(): void {
    // For now, just log to console
    const name = this.registrationForm.value.firstName + ' ' + this.registrationForm.value.lastName;
    console.log(`Thank you ${name}! Your registration has been submitted.`);
  }

  get isFormValid(): boolean {
    return this.registrationForm.valid;
  }

  get isFormDirty(): boolean {
    return this.registrationForm.dirty;
  }

  get isFormPristine(): boolean {
    return this.registrationForm.pristine;
  }
}
