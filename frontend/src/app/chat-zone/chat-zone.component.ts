import { Converter } from 'showdown';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {
  ModelService,
  Model,
  Messages,
  MessagesService,
  ConversationsService,
  ConversationsBody, Conversations
} from '../../generated';
import {AuthGuard} from '../auth.service';
import {FormsModule} from '@angular/forms';
import {Observable} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import { filter } from 'rxjs/operators';
import { AiService } from '../ai.service';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';


@Component({
  selector: 'app-chat-zone',
  imports: [
    NgForOf,
    FormsModule,
    CdkTextareaAutosize,
    NgIf
  ],
  templateUrl: './chat-zone.component.html',
  standalone: true,
  styleUrl: './chat-zone.component.css'
})
export class ChatZoneComponent implements OnInit, AfterViewInit{
  aiModels: Model[] = []
  aiChats: Messages[] = []
  conversationId: string = "";
  userId: string = "";
  userMessage: string = "";
  model_chosen: string = "";
  pendingConversationId: string = "";
  isThinking: boolean = false;
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  @ViewChild('bottomChat') bottomChat!: ElementRef;

  constructor(private modelService: ModelService,
              private messagesService: MessagesService,
              private conversationsService: ConversationsService,
              private route: ActivatedRoute,
              private router: Router,
              private authGuard: AuthGuard,
              private aiService: AiService) {}

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  ngOnInit(): void {
    this.loadModel();
    this.authGuard.userId$.pipe(
      filter(userId => !!userId)
    ).subscribe(userId => {
      this.userId = userId!;
    });
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.conversationId = id;
        this.loadMessages();
        this.loadConversation();
        setTimeout(() => {
          this.scrollToBottom();
        }, 300);
      } else {
        this.conversationId = "";
      }
    });
    console.log(`User id : `,this.userId)
    console.log(`Conversation id : `, this.conversationId)
  }

  loadModel() {
    this.modelService.modelsGet().subscribe({
      next: (data: Model[]) => {
        this.aiModels = data;
      },
      error: (err) => {
        console.error('Error while loading model', err);
      }
    });
  }

  loadMessages() {
    this.messagesService.messagesConversationIdGet(this.conversationId).subscribe({
      next: (data: Messages[]) => {
        this.aiChats = data;
      },
      error: (err) => {
        console.error('Error while loading messages', err);
      }
    });
  }

  loadConversation() {
    if (!this.conversationId) {
      console.warn("No conversation selected.");
      return;
    }
    this.conversationsService.conversationIdGet(this.conversationId).subscribe({
      next: (conversations:Conversations[]) => {
        if (!conversations || conversations.length === 0) {
          console.warn("Invalid conversation or model not defined.");
          return;
        }
        const conversation = conversations[0];

        const modelFound = this.aiModels.find(model => model.id === conversation.model_id);
        if (modelFound) {
          this.model_chosen = modelFound.model;
          console.log(`Chosen model: ${this.model_chosen}`);
        } else {
          console.warn("Model not found in the available models list.");
        }
      },
      error: (err) => {
        console.error("Error loading conversation", err);
      }
    });
  }

  sendMessage() {
    if (!this.userMessage.trim() || !this.model_chosen) {
      console.warn("Message or model not selected");
      return;
    }
    const selectedModel = this.aiModels.find(model => model.model === this.model_chosen);
    if (!selectedModel || this.model_chosen=="GPT") {
      console.warn("Selected model not found in the list or not yet implemented");
      this.userMessage = "";
      return;
    }

    if (!this.conversationId) {
      const maxTitleLength = 20;
      let conversationTitle = this.userMessage.substring(0, maxTitleLength);

      if (this.userMessage.length > maxTitleLength) {
        const lastSpaceIndex = conversationTitle.lastIndexOf(" ");
        if (lastSpaceIndex > 0) {
          conversationTitle = conversationTitle.substring(0, lastSpaceIndex);
        }
      }

      const conversationBody: ConversationsBody = {
        user_id: this.userId,
        model_id: selectedModel.id, // Using the retrieved modelId
        title: conversationTitle || "New Conversation",
      };
      console.log(`Conversation body : `, conversationBody)

      this.conversationsService.conversationsPost(conversationBody).subscribe({
        next: (response: any) => {
          this.pendingConversationId = response.id;
          this.sendUserMessage();
        },
        error: (err) => {
          console.error("Error creating conversation", err);
        }
      });
    } else {
      this.sendUserMessage();
    }
  }

  sendUserMessage() {
    this.isThinking = true;
    // Create a user message object and add it to the chat history
    const userMessageObject = { sender: "User", message: this.userMessage };
    this.aiChats.push(userMessageObject);
    this.scrollToBottom();

    // Send the user message to the backend
    this.messagesService.messagesPost({
      conversation_id: this.conversationId || this.pendingConversationId,
      sender: "User",
      message: this.userMessage
    }).subscribe();

    // Format chat history for API request
    let formattedChats = this.aiChats.map(chat => ({
      role: chat.sender === "AI"
        ? (this.model_chosen === "Mistral" ? "assistant" : "model")
        : "user",
      ...(this.model_chosen === "Gemini"
        ? { parts: [{ text: chat.message }] }
        : { content: chat.message })
    }));

    // Prepare request body based on the selected AI model
    let messageBody: any;
    if (this.model_chosen === "Gemini") {
      messageBody = {
        user_id: this.userId,
        contents: [...formattedChats],
      };
    } else {
      messageBody = {
        user_id: this.userId,
        contents: [...formattedChats],
      };
    }

    // Create an AI message placeholder in the chat history
    const aiMessageObject = { sender: "AI", message: "" };
    this.aiChats.push(aiMessageObject);
    this.scrollToBottom();

    // Determine the AI model and initialize the streaming request
    let stream$: Observable<string>;

    switch (this.model_chosen) {
      case "Gemini":
        stream$ = this.aiService.geminiStream(messageBody);
        break;
      case "Mistral":
        stream$ = this.aiService.mistralStream(messageBody);
        break;
      default:
        console.warn("Unrecognized model");
        return;
    }

    // Subscribe to the AI streaming response
    stream$.subscribe({
      next: (chunk) => {
        console.log("New message received:", chunk);
        aiMessageObject.message += chunk; // Append received text progressively
        this.scrollToBottom();
      },
      error: (err) => {
        console.error("Streaming error", err);
      },
      complete: () => {
        console.log("Stream ended.");
        this.isThinking = false;
        this.scrollToBottom();

        // Save the AI response message in the backend
        this.messagesService.messagesPost({
          conversation_id: this.conversationId || this.pendingConversationId,
          sender: "AI",
          message: aiMessageObject.message
        }).subscribe(() => {
          const selectedModel = this.aiModels.find(model => model.model === this.model_chosen);
          if (selectedModel) {
            const updateBody = { model_id: selectedModel.id };
            this.conversationsService.conversationsIdPut(updateBody, this.conversationId)
              .subscribe({
                next: () => console.log("Conversation model updated successfully."),
                error: (err) => console.error("Error updating conversation model", err)
              });
          }

          // Update conversation ID if it was pending
          if (!this.conversationId && this.pendingConversationId) {
            this.conversationId = this.pendingConversationId;
            this.pendingConversationId = "";
            this.router.navigate([`/conv/${this.conversationId}`]);
          }
        });
      }
    });

    // Clear the user input field after sending the message
    this.userMessage = "";
  }

  scrollToBottom(): void {
    try {
      setTimeout(() => {
        if (this.bottomChat) {
          this.bottomChat.nativeElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    } catch (err) {
      console.error("Scrolling error", err);
    }
  }

  formatMessage(message: string) {
    const converter = new Converter({ tables: true });
    return converter.makeHtml(message);
  }
}
