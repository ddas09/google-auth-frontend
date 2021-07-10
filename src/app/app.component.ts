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

  constructor(
    private googleService: SocialAuthService,
    private authService: AuthenticationService
  ) { }

  // when sign in button clicked
  async onSignIn() {
    await this.getIdToken();
    this.loginUser();
  }

  // when sign up button clicked
  async onSignUp() {
    await this.getIdToken();
    this.registerUser();
  }

  // get id token from google 
  async getIdToken() {
    await this.googleService.signIn(GoogleLoginProvider.PROVIDER_ID);
    await this.googleService.authState.pipe(first()).toPromise()
      .then((user) => this.idToken = user.idToken)
      .catch((err) => console.log(err))
  }

  // verify id token in the backend to authenticate user
  loginUser(): void {
    this.authService.loginUser(this.idToken).subscribe(
      (user: User) => {
        this.user = user
        this.isLoggedIn = true;
      },
      (err) => {
        if ("errorCode" in err) {
          if (err.errorCode === 606) {
            const promptMsg: string = `
            Your google account is not registered with us!\n
            Do you want to sign up for a new account?`;
            let confirmation = window.confirm(promptMsg);
            if (confirmation) {
              this.registerUser();
            } else {
              this.logoutUser();
            }
          } else {
            this.errorMsg = `${err.errorCode}: ${err.message}`.toUpperCase();
          }
        } else {
          this.errorMsg = "500: INTERNAL SERVER ERROR";
        }
        setTimeout(() => {
          this.errorMsg = '';
        }, 3000)
      }
    );
  }

  registerUser(): void {
    this.authService.registerUser(this.idToken).subscribe(
      (user: User) => {
        this.user = user
        this.isLoggedIn = true;
      },
      (err) => {
        if ("errorCode" in err) {
          if (err.errorCode === 606) {
            const promptMsg: string = `
            Your google account is already registered with us!\n
            Do you want to log in to your exsisting account?`;
            let confirmation = window.confirm(promptMsg);
            if (confirmation) {
              this.loginUser();
            } else {
              this.logoutUser();
            }
          } else {
            this.errorMsg = `${err.errorCode}: ${err.message}`.toUpperCase();
          }
        } else {
          this.errorMsg = "500: INTERNAL SERVER ERROR";
        }
        setTimeout(() => {
          this.errorMsg = '';
        }, 3000)
      }
    );
  }

  // logout user profile
  logoutUser(prompt: boolean = false): void {
    // show prompt if required and wait for user confirmation
    if (prompt) {
      let confirmation = window.confirm("Are you sure you want to logout?");
      if (!confirmation) {
        return;
      }  
    } 

    // logs the user google account out
    this.googleService.signOut(true);
    this.isLoggedIn = false;
    this.idToken = '';
  }
}

