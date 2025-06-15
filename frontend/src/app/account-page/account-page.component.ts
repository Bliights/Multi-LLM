import {Component, OnInit} from '@angular/core';
import {NavBarComponent} from '../nav-bar/nav-bar.component';
import {AuthGuard} from '../auth.service';
import {ModelService, UsersService, Users, UserAPIKeysService} from '../../generated';
import {filter} from 'rxjs/operators';
import {NgIf, NgForOf} from '@angular/common';
import {NgbToast} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule} from '@angular/forms';
import { Model } from '../../generated';

@Component({
  selector: 'app-account-page',
  imports: [
    NavBarComponent,
    NgIf,
    NgForOf,
    NgbToast,
    FormsModule
  ],
  templateUrl: './account-page.component.html',
  standalone: true,
  styleUrl: './account-page.component.css'
})
export class AccountPageComponent implements OnInit{
  userId: string = "";
  user: Users | null  =  null;
  updatedUser: Partial<Users> = {};
  passwordConfirm: string = "";
  toastMessage: string = '';
  toastHeader: string = '';
  showToastFlag: boolean = false;
  aiModels: Model[] = [];
  apiKeysMap: { [modelId: string]: string } = {};
  apiKeysInput: { [modelId: string]: string } = {};

  constructor(private authGuard: AuthGuard,
              private userService: UsersService,
              private modelService: ModelService,
              private apiKeyService: UserAPIKeysService
              )
  {
  }

  ngOnInit(): void {
    this.authGuard.userId$.pipe(
      filter(userId => !!userId)
    ).subscribe(userId => {
      this.userId = userId!;
      this.loadUser();
      this.loadModels();
      this.loadAPIKeys();
    });

    console.log(`User id : `,this.userId)
  }

  loadUser() {
    this.userService.usersIdGet(this.userId ).subscribe({
      next: (user: Users) => {
        this.user = user;
      },
      error: (err) => {
        console.error('Error while loading user', err);
      }
    });
  }

  loadModels() {
    this.modelService.modelsGet().subscribe({
      next: (models: Model[]) => this.aiModels = models,
      error: (err) => {
        console.error('Error while loading models', err);
      }
    });
  }

  loadAPIKeys() {
    this.apiKeyService.userApiKeysUserIdGet(this.userId).subscribe({
      next: (keys: any[]) => {
        this.apiKeysMap = {};
        keys.forEach(key => {
          this.apiKeysMap[key.model_id] = key.api_key;
        });
      },
      error: err => console.error('Error loading API keys', err)
    });
  }

  updateUser() {
    if (!this.userId || !this.user) return;

    if (this.updatedUser.password && this.updatedUser.password !== this.passwordConfirm) {
      this.showToast("Passwords do not match.", 'Error');
      return;
    }

    this.userService.usersIdPut(this.updatedUser, this.userId).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.showToast("Profile updated successfully!", 'Success');
        this.loadUser();
        this.updatedUser = {}
        this.passwordConfirm = "";
      },
      error: (err) => {
        console.error("Error updating user:", err);
        this.showToast('Failed to update. Please try again.', 'Error');
      }
    });
  }

  submitAPIKey(modelId: string) {
    const keyInput = this.apiKeysInput[modelId]?.trim();
    const model_id = this.aiModels.find(m => m.model === modelId)?.id;

    if (!keyInput) {
      this.showToast("API key cannot be empty.", "Warning");
      return;
    }

    this.apiKeyService.userApiKeysUserIdModelIdGet(this.userId, model_id).subscribe({
      next: existingKey => {
        if (existingKey.length > 0) {
          const updateBody = {
            id: existingKey.id,
            user_id: this.userId,
            model_id: model_id,
            api_key: keyInput
          };
          this.apiKeyService.userApiKeysPut(updateBody).subscribe({
            next: () => {
              this.showToast("API Key updated successfully.", "Success");
              this.loadAPIKeys();
              this.apiKeysInput[modelId] = "";
            },
            error: () => this.showToast("Failed to update API key.", "Error")
          });
        }
        else{
          // Key not found: create new one
          const newKey = {
            user_id: this.userId,
            model_id: model_id,
            api_key: keyInput
          };
          this.apiKeyService.userApiKeysPost(newKey).subscribe({
            next: () => {
              this.showToast("API Key added successfully.", "Success");
              this.loadAPIKeys();
              this.apiKeysInput[modelId]="";
            },
            error: () => this.showToast("Failed to add API key.", "Error")
          });
        }
      },
      error: () => {
        this.showToast("Failed to fetch existing API keys.", "Error");
      }
    });
  }

  // Show toast message
  showToast(message: string, header: string) {
    this.toastMessage = message;
    this.toastHeader = header || 'Notification';
    this.showToastFlag = true; // Show the toast
  }

  // Hide toast message
  onToastHidden() {
    this.showToastFlag = false;
  }
}
