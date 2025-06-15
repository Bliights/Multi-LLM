import { Component } from '@angular/core';
import {HomeIcon} from 'primeng/icons';
import {RouterLink} from '@angular/router';
import { UsersService } from '../../generated';
import { Users } from '../../generated';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  imports: [
    RouterLink,
    HomeIcon,
  ],
  templateUrl: './nav-bar.component.html',
  standalone: true,
  styleUrl: './nav-bar.component.css'
})
export class NavBarComponent {
  connected: boolean = false;

  constructor(private usersService: UsersService, private router: Router) {}

  ngOnInit(): void {
    this.checkAuth();
  }

  checkAuth(): void {
    this.usersService.usersInfoMeGet().subscribe({
      next: (user:Users ) => {
        if (user && user.id) {
          this.connected = true;
        }
      },
      error: () => {
        this.connected = false;
      }
    });
  }

  logout(): void {
    this.usersService.usersLogoutPost().subscribe(() => {
      this.connected = false;
      this.router.navigate(['/login']);
    });
  }
}
