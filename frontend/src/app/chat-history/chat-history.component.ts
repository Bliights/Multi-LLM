import {Component, OnInit} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {TrashIcon} from 'primeng/icons';
import {Conversations, ConversationsService} from '../../generated';
import {Router} from '@angular/router';
import {AuthGuard} from '../auth.service';
import {filter} from 'rxjs/operators';

@Component({
  selector: 'app-chat-history',
  imports: [
    NgForOf,
    TrashIcon,
  ],
  templateUrl: './chat-history.component.html',
  standalone: true,
  styleUrl: './chat-history.component.css'
})
export class ChatHistoryComponent implements OnInit{
  chatHistory: Conversations[] = [];
  userId: string = "";

  constructor(private conversationsService: ConversationsService,
              private router: Router,
              private authGuard: AuthGuard,
              ) {

  }

  ngOnInit(): void {
    this.authGuard.userId$.pipe(
      filter(userId => !!userId)
    ).subscribe(userId => {
      this.userId = userId!;
      this.loadConversation()
    });
  }

  loadConversation() {
    if (!this.userId) {
      console.warn("Not authenticated .");
      return;
    }

    this.conversationsService.conversationsUserIdGet(this.userId).subscribe({
      next: (conversations:Conversations[]) => {
        this.chatHistory = conversations.sort((a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
      },
      error: (err) => {
        console.error("Error loading conversation", err);
      }
    });
  }

  deleteConversation(idChat: string) {
    this.conversationsService.conversationsIdDelete(idChat).subscribe({
      next: () => {
        this.loadConversation();
      },
      error: (err) => {
        console.error('Error while deleting conversation', err);
      }
    });
  }

  openChat(idChat: string) {
    this.router.navigate([`/conv/${idChat}`]);
  }

  createNewConversation() {
    this.router.navigate([`/`]);
  }
}
