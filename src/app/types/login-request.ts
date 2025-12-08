import { Subject } from 'rxjs';

export interface LoginRequest {
    returnUrl?: string;
    success?: Subject<boolean>;
    message?: string;
}
