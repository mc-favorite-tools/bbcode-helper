/// <reference types="vite/client" />

declare const html2bbcode: (str: string) => string
declare const bbcode2html: (str: string) => string
declare const showPrompt: (ctrlId: any, evt: any, tpl: string, delay: number) => void

interface Window {
    declare allowhtml: boolean
    declare allowbbcode: boolean
}