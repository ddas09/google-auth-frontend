import { Component } from '@angular/core';
import { SocialAuthService, GoogleLoginProvider } from "angularx-social-login";
import { AuthenticationService } from './authentication.service';
import { first } from 'rxjs/operators';
import { User } from './User';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title: string = "google-auth"
  user!: User;
  isLoggedIn: boolean = false;
  idToken: string = '';
  errorMsg: string = '';
  errorCode?: number;

  constructor(
    private googleService: SocialAuthService,
    private authService: AuthenticationService
  ) { }

  // when sign in button clicked
  async onSignIn() {
    await this.getIdToken();
    await this.loginUser();
    if (this.errorCode !== undefined) {
      if (this.errorCode === 606) {
        const prompt: string = 
        `Your google account is not registered with us!\n
        Do you want to sign up for a new account?`;
        if (this.getUserConfirmation(prompt))
        {
          this.registerUser();
        } else {
          this.logoutUser();
        }
      } 
      this.autoHideErrorMsg();
    }
  }

  // when sign up button clicked
  async onSignUp() {
    await this.getIdToken();
    await this.registerUser();
    if (this.errorCode !== undefined) {
      if (this.errorCode === 606) {
        const prompt: string = 
        `Your google account is already registered with us!\n
        Do you want to log in to your existing account?`; 
        if (this.getUserConfirmation(prompt))
        {
          this.loginUser();
        } else {
          this.logoutUser();
        }
      } 
      this.autoHideErrorMsg();
    }
  }

  async getIdToken() {
    await this.googleService.signIn(GoogleLoginProvider.PROVIDER_ID);
    await this.googleService.authState.pipe(first()).toPromise()
      .then((user) => this.idToken = user.idToken)
      .catch((err) => console.log(err));
  }

  // observer for login / register
  private authObserver = {
    next: (user: User) => {
      this.user = user;
      this.isLoggedIn = true;
    },
    error: (err: any) => {
      if ("errorCode" in err) {
        this.errorCode = err.errorCode;
        if (err.errorCode !== 606) {
          this.errorMsg = err.message;
        }
      } else {
        this.errorCode = 500;
        this.errorMsg = "INTERNAL SERVER ERROR";
      }
    }
  }

  // verify id token in the backend to authenticate user
  async loginUser() {
    await this.authService.loginUser(this.idToken).toPromise()
      .then(this.authObserver.next)
      .catch(this.authObserver.error);
  }

  async registerUser() {
    await this.authService.registerUser(this.idToken).toPromise()
      .then(this.authObserver.next)
      .catch(this.authObserver.error);
  }

  // shows a prompt to user and gets confirmation
  getUserConfirmation(prompt: string): boolean {
    let confirmation: boolean = window.confirm(prompt);
    return confirmation;
  }

  // hide error message after some time
  autoHideErrorMsg(): void {
    setTimeout(() => {
      this.errorMsg = '';
    }, 3000);
  }

  logoutUser(showPrompt: boolean = false): void {
    // show prompt if required and wait for user confirmation
    if (showPrompt) {
      if (!this.getUserConfirmation("Are yo sure you want to log out?")) {
        return;
      }
    } 

    // logs the user google account out
    this.googleService.signOut(true);
    this.isLoggedIn = false;
    this.idToken = '';
  }
}

