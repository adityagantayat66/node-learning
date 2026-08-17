import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../auth.service';
import { take } from 'rxjs';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    RouterLink,
  ],
  templateUrl: './register.component.html',
  providers: [AuthService],
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  registerForm = new FormGroup({
    fullName: new FormControl('aditya', [
      Validators.required,
      Validators.minLength(6),
    ]),
    age: new FormControl('28', [Validators.required]),
    email: new FormControl('adi@mail.com', [
      Validators.required,
      Validators.email,
    ]),
    password: new FormControl('qwertyu', [
      Validators.required,
      Validators.minLength(6),
    ]),
  });
  serverError = '';
  constructor(
    private _authService: AuthService,
    private _router: Router,
  ) { }
  submitForm(): void {
    const regFormData = new FormData();
    if (this.registerForm.valid) {
      regFormData.append('email', this.registerForm.controls.email.value || '');
      regFormData.append(
        'fullName',
        this.registerForm.controls.fullName.value || '',
      );
      regFormData.append(
        'age',
        this.registerForm.controls.age.value?.toString() || '',
      );
      regFormData.append(
        'password',
        this.registerForm.controls.password.value || '',
      );
    }
    this._authService
      .register(regFormData)
      .pipe(take(1))
      .subscribe((data) => {
        if (data && data.status) {
          this._router.navigate(['login']);
        }
      });
  }
  removeServerError(): void { }
}
