import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { RequestOptionsArgs, Response, ResponseOptions, Headers } from '@angular/http';
import { environment } from '@environments/environment';
import * as urljoin from 'url-join';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/catch';
import { ConnectionService } from '@core/services/connection.service';
import { User } from '@security/user/model/user';
import { UserService } from '@security/user/services/user.service';
import { Constants } from '@core/utils/constants';

@Injectable()
export class AuthService {
  private logged: BehaviorSubject<boolean>;
  private currentUser$: BehaviorSubject<User>;

  constructor(private connectionService: ConnectionService,
            private userService: UserService) {
    const loggedIn = localStorage.getItem('token') ? true : false;
    const user: User = new User(JSON.parse(localStorage.getItem('user')));
    this.logged = new BehaviorSubject(loggedIn);
    this.currentUser$ = new BehaviorSubject(user);
  }

  private login = ({ token, user }) => {
    this.currentUser$.next(new User(user));
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.logged.next(true);
  }

  private logout() {
    this.currentUser$.next(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.logged.next(false);
  }

  signin(user: User): Observable<any> {
    const url = urljoin(environment.apiUrl, 'auth/signin'); 
    const body = JSON.stringify(user);
    return this.connectionService.post(url, body)
      .map((response: any) => {
        this.login(response);
        return response;
      });
  }

  signout(): Observable<any> {
    const url = urljoin(environment.apiUrl, 'auth/signout');
    const body = {};
    return this.connectionService.post(url, body)
      .map((response: any) => {
        this.logout();
        return response;
      })
      .catch(error => {
        this.logout();
        return Observable.throw(error);
      })
  }

  signup(user: User): Observable<any> {
    return this.userService.createUser(user)
      .map((response: any) => {
        if (Constants.LOGIN_ON_SIGNUP) {
          this.login(response);
        }
        return response;
      });
  }

  validateToken() {
    const url = urljoin(environment.apiUrl, 'auth/token');
    return this.connectionService.get(url)
      .map(value => value.isValid)
      .catch(error => {
        this.logout();
        return Observable.create(observer => observer.next(false));
      });
  }

  isLogged(): Observable<boolean> {
    return this.logged;
  }

  currentUser(): BehaviorSubject<User> {
    return this.currentUser$;
  }

  activateAccount(hash) {
    const url = urljoin(environment.apiUrl, 'user/activate', hash);
    console.log(url);
    return this.connectionService.get(url)
      .map(response => {
        console.log(response);
        return response;
      })
      .catch(error => Observable.throw(error));
  }
}
