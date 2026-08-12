import { Component, signal } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
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
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  loginForm = new FormGroup({
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
  ) {}
  submitForm(): void {
    const loginFormData = new FormData();
    if (this.loginForm.valid) {
      loginFormData.append('email', this.loginForm.controls.email.value || '');
      loginFormData.append(
        'password',
        this.loginForm.controls.password.value || '',
      );
    }
    this._authService
      .login(loginFormData)
      .pipe(take(1))
      .subscribe((response) => {
        if (response && response.status) {
          this._authService.storeToken(response.data);
          this._router.navigate(['dashboard']);
        }
      });
  }
  removeServerError(): void {}
}
