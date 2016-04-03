export function getTimestamp() {
    return String(new Date());
}

export function log(...args: any[]) {
    if (console && console.log) {
        args.unshift(getTimestamp());
        console.log.apply(console, args);
    }
}
