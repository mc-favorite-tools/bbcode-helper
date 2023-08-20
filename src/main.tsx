/*
 * The MIT License (MIT)
 * Copyright (c) 2023 hans000
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import EIFrame from './EIframe'

export const root = document.createElement('div')
root.classList.add('hs-bbcode-helper-root')
document.body.appendChild(root)
ReactDOM.createRoot(root).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)

const iframe = document.getElementById('e_iframe') as HTMLIFrameElement

if (iframe) {
    const document = iframe.contentWindow!.document
    const head = document.head
    const style = document.createElement('style')
    style.innerText = `
    body {
        background-color: #fff;
    }
    table td {
        border: 1px solid #E3EDF5;
    }
    .t_table:not([width]) {
        width: 100%;
    }
    div.quote {
        background: #F9F9F9 url(https://www.mcbbs.net/template/mcbbs/image/icon_quote_s.gif) no-repeat 20px 6px;
    }
    div.quote blockquote:last-child {
        background: url(https://www.mcbbs.net/template/mcbbs/image/icon_quote_e.gif) no-repeat 100% 100%;
    }
    br[style] {
        display: none;
    }
    blockquote {
        display: inline-block;
    }
    tr.dragover {
        border: 8px dashed #ffae00;
    }
    `
    head.appendChild(style)
    const eiframeRoot = document.createElement('div')
    eiframeRoot.classList.add('hs-bbcode-helper-eiframe-root')
    document.body.appendChild(eiframeRoot)
    ReactDOM.createRoot(eiframeRoot).render(
        <React.StrictMode>
            <EIFrame />
        </React.StrictMode>
    )
}
