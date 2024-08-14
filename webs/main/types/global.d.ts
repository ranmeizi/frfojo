type AsyncProcessFn = (next?: () => void) => Promise<void>;

interface Window {
    ffj_loaded(): void
}