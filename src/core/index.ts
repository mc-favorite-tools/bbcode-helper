/*
 * The MIT License (MIT)
 * Copyright (c) 2023 hans000
 */
export function createRowElement(node: HTMLElement | null, prev = false) {
    if (! node) return

    const body = node.parentElement!.parentElement!
    const row = document.createElement('tr')
    Array.from({ length: node.parentElement!.children.length }, (_, i) => i + 1).forEach(v => {
        const tr = document.createElement('td')
        tr.innerText = v + ''
        row.appendChild(tr)
    })
    if (prev) {
        body.insertBefore(row, node.parentElement)
    } else {
        body.insertBefore(row, node.parentElement!.nextSibling)
    }
}

export function findLastCell(node: HTMLElement) {
    let root = node
    while (root && root.tagName.toLowerCase() !== 'td') {
        root = root.parentElement!
    }
    return root as HTMLTableCellElement
}