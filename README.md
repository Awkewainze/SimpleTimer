# SimpleTimer

A simple wrapper around [setTimeout](https://nodejs.org/api/timers.html#timers_class_timeout) because I like awaitables and I hate rewriting the exact same wrapper for every time.

## Example usages

Callback style

```typescript
function test(): void {
    Timer.for(Duration.fromSeconds(10))
        .addCallback(() => console.log("10 seconds later!"))
        .addCallback(doSomething)
        .start();
}
```

Awaitable style

```typescript
async function test(): Promise<void> {
    await Timer.for(Duration.fromSeconds(10)).start().asAwaitable();
    console.log("10 seconds later!");
}
```

Or shortcut awaitable

```typescript
async function test(): Promise<void> {
    await Timer.immediateAwaitable(Duration.fromSeconds(10));
    console.log("10 seconds later!");
}
```
