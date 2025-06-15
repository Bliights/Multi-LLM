import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {InputText} from 'primeng/inputtext';
import {ButtonDirective} from 'primeng/button';
import {UsersService} from '../../generated';
import {NgIf} from '@angular/common';


@Component({
  selector: 'app-login-page',
  imports: [
    ReactiveFormsModule,
    InputText,
    ButtonDirective,
    RouterLink,
    NgIf
  ],
  templateUrl: './login-page.component.html',
  standalone: true,
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {
  LoginForm: FormGroup;
  errorMessage: string = '';

  constructor(private router:Router,
              private formBuilder: FormBuilder,
              private usersService: UsersService,

  ) {
    this.LoginForm = formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onLogin(): void {
    if (this.LoginForm.valid) {
      const credentials = this.LoginForm.value;
      this.usersService.usersLoginPost(credentials).subscribe({
        next: () => {
          this.router.navigate(['/']); // Redirect to homepage on success
        },
        error: (err) => {
          this.errorMessage = 'Invalid email or password.';
          console.error('Login failed', err);
        }
      });
    }
  }
}
