import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import dayjs from 'dayjs';
import { BehaviorSubject, Subject } from 'rxjs';
import { LoginResponse, User } from 'src/generated/graphql';
import { LocalStorageService } from '../services/local-storage.service';
import { GuardedActionOptions } from '../types/guarded-action-options';
import { LoginRequest } from '../types/login-request';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    public currentUser: BehaviorSubject<User> = new BehaviorSubject<User>(null);

    public openLogin$ = new Subject<LoginRequest>();

    constructor(
        private apollo: Apollo,
        private localStorageService: LocalStorageService<LoginResponse>
    ) {}

    public initialize(): void {
        const authData = this.localStorageService.getItem('auth');

        if (authData !== undefined && authData.user) {
            this.currentUser.next(authData.user);
        }
    }

    async logout() {
        await this.apollo.client.clearStore(); // need to clear the cache first, because some queries get fetched right after logout completes
        this.localStorageService.removeItem('auth');
        this.currentUser.next(null); // only after cache is finished clearing can we emmit new user (because it might trigger some refetches)
    }

    async login(loginResponse: LoginResponse): Promise<void> {
        await this.apollo.client.clearStore();
        this.localStorageService.setItem('auth', loginResponse, dayjs().add(1, 'year').toISOString());

        this.currentUser.next(loginResponse.user);
    }

    getToken(): string {
        const authData = this.localStorageService.getItem('auth');

        if (authData !== undefined && authData.user) {
            return authData.token;
        }

        return null;
    }

    async guardedAction(options: GuardedActionOptions): Promise<boolean> {
        console.log('AuthService: guardedAction called with options:', options);
        return new Promise((resolve, _reject) => {
            if (this.currentUser.value !== null) {
                resolve(true);
                return;
            }

            const success = new Subject<boolean>();

            this.openLogin$.next({
                success: success,
                ...options
            });

            success.subscribe((data) => {
                resolve(data ? true : false);
            });
        });
    }
}
