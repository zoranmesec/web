import { Pipe, PipeTransform, Signal } from '@angular/core';

/**
 * Outputs the value of a signal. Pipe is needed to use signals in templates to avoid no call expression error.
 *
 * @example
 */
@Pipe({
    name: 'signalPipe',
    standalone: true
})
export class SignalPipe implements PipeTransform {
    transform<T>(value: Signal<T>): T {
        return value();
    }
}
