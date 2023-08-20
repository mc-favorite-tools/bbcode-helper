/*
 * The MIT License (MIT)
 * Copyright (c) 2023 hans000
 */
export function bindEvent<
    T extends Window | Document | HTMLElement,
    K extends (T extends Document ? keyof DocumentEventMap : T extends Window ? keyof WindowEventMap : string)
>(
    target: T,
    type: K,
    handle: K extends keyof DocumentEventMap
        ? ((ev: DocumentEventMap[K]) => any)
        : K extends keyof WindowEventMap
        ? ((ev: WindowEventMap[K]) => any)
        : EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions | undefined
) {
    target.addEventListener(type, handle, options)
    return () => target.removeEventListener(type, handle, options)
}

export function mergeEvent(...handles: Function[]) {
    return () => handles.forEach(handle => handle())
}

export function getParentNode(node: HTMLElement, tagName: string) {
    let tmp = node
    while (tmp.parentElement) {
        tmp = tmp.parentElement
        if (tmp.tagName.toLowerCase() === tagName) {
            return tmp
        }
    }
    return null
}

export function createScript(url: string) {
    const script = document.createElement('script')
    script.setAttribute('type', 'text/javascript')
    script.setAttribute('src', url)
    document.documentElement.appendChild(script)
    return new Promise(resolve => script.addEventListener('load', () => {
        script.remove()
        resolve(void 0)
    }))
}