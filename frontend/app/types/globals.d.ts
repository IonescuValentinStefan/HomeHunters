/// <reference types="@types/google.maps" />

export {};

declare global {
    let google: typeof globalThis.google;
}
