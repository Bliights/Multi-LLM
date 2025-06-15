import { Component } from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import {Router, RouterLink} from '@angular/router';
import { UsersService } from '../../generated';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-sign-up-page',
  templateUrl: './sign-up-page.component.html',
  styleUrls: ['./sign-up-page.component.css'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, InputTextModule, PasswordModule, ButtonModule, RouterLink, NgIf]
})
export class SignUpPageComponent {
  signUpForm: FormGroup;
  errorMessage: string = '';

  private passwordsMatch(formGroup: FormGroup): { [key: string]: boolean } | null {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword ? null : { passwordsMismatch: true };
  }


  constructor(private router: Router, private formBuilder: FormBuilder, private usersService: UsersService) {
    this.signUpForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(4)]]
    }, { validators: this.passwordsMatch });
  }

  onSignUp(): void {
    if (this.signUpForm.valid) {
      const { name, email, password, confirmPassword } = this.signUpForm.value;

      if (password !== confirmPassword) {
        this.errorMessage = "Passwords do not match.";
        return;
      }

      this.usersService.usersRegisterPost({ name, email, password }).subscribe({
        next: (response) => {
          console.log('Registration successful', response);

          // Now attempt to log in
          this.usersService.usersLoginPost({ email, password }).subscribe({
            next: () => {
              this.router.navigate(['/']); // Redirect to homepage on success
            },
            error: (err) => {
              this.errorMessage = 'Login failed after registration.';
              console.error('Login error:', err);
            }
          });

        },
        error: (err) => {
          this.errorMessage = 'Registration failed. Try again.';
          console.error('Sign-up error', err);
        }
      });
    }
  }

}
