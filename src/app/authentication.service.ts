import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { User } from './User';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private apiBaseUrl:string = "http://127.0.0.1:8000";

  constructor(private http: HttpClient) { }

  // sending id token to the backend server
  loginUser(idToken: string): Observable<User> {
    const endpointUrl = `${this.apiBaseUrl}/accounts/login/`;
    return this.http.post<User>(endpointUrl, {"idToken": idToken})
      .pipe(
        retry(3),
        catchError(this.httpErrorHandler)
      );
  }

  registerUser(idToken: string): Observable<User> {
    const endpointUrl = `${this.apiBaseUrl}/accounts/register/`;
    return this.http.post<User>(endpointUrl, {"idToken": idToken})
      .pipe(
        retry(3),
        catchError(this.httpErrorHandler)
      );
  }

  // error handler for http client
  private httpErrorHandler(error: HttpErrorResponse) {   
    return throwError(error.error);
  }
}
