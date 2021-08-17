import { Check } from "@awkewainze/checkverify";
import { Duration } from "@awkewainze/simpleduration";

/** A simple wrapper around [NodeJS.Timeout]{@link https://nodejs.org/api/timers.html#timers_class_timeout} because I like awaitables and I hate rewriting the exact same wrapper for setTimeout every time. */
export class Timer {
    private timeout?: NodeJS.Timeout;
    private callbacks: Array<() => void> = [];

    /**
     * Creates a new timer, does not start until {@link start} method is called.
     * @param duration {@link Duration} this {@link Timer} will wait for.
     */
    protected constructor(private readonly durationMs: number) {
        this.resetPromise();
    }

    /**
     * Creates a new timer, does not start until {@link start} method is called.
     * @param duration {@link Duration} this {@link Timer} will wait for.
     */
    public static for(duration: Duration): Timer {
        Check.verifyNotNullOrUndefined(duration, "Duration is null");
        Check.verify(duration instanceof Duration, "duration is not a Duration");
        return new Timer(duration.toMilliseconds());
    }

    /**
     * Creates a new promise that resolve in the specific {@link Duration} provided.
     * @param duration {@link Duration} before promise will resolve.
     * @returns Promise that will resolve when {@link duration} elapses.
     */
    public static immediateAwaitable(duration: Duration): Promise<void> {
        Check.verifyNotNullOrUndefined(duration, "Duration is null");
        Check.verify(duration instanceof Duration, "duration is not a Duration");
        Check.verify(!duration.isForever(), "Duration is forever, cannot await it");

        return new Promise(resolve => setTimeout(resolve, duration.toMilliseconds()));
    }

    /**
     * Starts the {@link Timer} from the beginning if it's not running, or does nothing if already running.
     * @returns This currently running {@link Timer}.
     */
    public start(): this {
        if (this.timeout) return this;
        this.timeout = setTimeout(() => this.timeReached(), this.durationMs);
        return this;
    }

    /**
     * Stops the {@link Timer}, or does nothing if {@link Timer} is already stopped.
     * @returns This currently stopped {@link Timer}.
     */
    public stop(): this {
        if (!this.timeout) return this;
        clearTimeout(this.timeout);
        delete this.timeout;
        return this;
    }

    /**
     * Resets the {@link Timer} and starts it.
     * *(WARNING) This method cannot be used in tests as Jest mocks `timeout`s based on browser specs. They claim changing the testEnv to node fixes it, but it still doesn't recognize the `timeout.refresh()` as a method that exists.
     * @returns This currently running {@link Timer}.
     */
    public reset(): this {
        if (this.timeout) {
            this.timeout.refresh();
            return this;
        }
        return this.start();
    }

    /**
     * Add a callback for when this {@link Timer} reaches end.
     * @param callback Method to be executed on {@link Timer} end.
     * @returns This {@link Timer}.
     */
    public addCallback(callback: () => void): this {
        this.callbacks.push(callback);
        return this;
    }

    /**
     * Returns the awaitable so you can use this {@link Timer} more asynchronously.
     * !(DANGER) This will not make the timer start!
     * @returns Promise that will resolve when {@link Timer} reaches end.
     */
    public asAwaitable(): Promise<void> {
        return this.promise;
    }

    private timeReached(): void {
        this.callbacks.forEach(x => x());
        this.promiseResolvable();
        this.resetPromise();
    }

    private promiseResolvable: () => void = () => {};
    private promise: Promise<void> = Promise.resolve();
    private resetPromise(): void {
        this.promise = new Promise(resolve => (this.promiseResolvable = resolve));
    }
}