import { Component } from '@angular/core';
import {NavBarComponent} from '../nav-bar/nav-bar.component';
import {ChatHistoryComponent} from '../chat-history/chat-history.component';
import {ChatZoneComponent} from '../chat-zone/chat-zone.component';
import {AuthGuard} from '../auth.service';

@Component({
  selector: 'app-home-page',
  imports: [
    NavBarComponent,
    ChatHistoryComponent,
    ChatZoneComponent
  ],
  templateUrl: './home-page.component.html',
  standalone: true,
  styleUrl: './home-page.component.css'
})
export class HomePageComponent {
}
