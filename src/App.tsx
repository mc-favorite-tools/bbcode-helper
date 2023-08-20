/*
 * The MIT License (MIT)
 * Copyright (c) 2023 hans000
 */
import { useEffect, useRef, useState } from 'react'
import './App.less'
import { bindEvent, createScript, getParentNode, mergeEvent } from './utils'
import ColorPicker from './components/ColorPicker'

const defaultRect = {
    height: 0,
    width: 0,
    x: 0,
    y: 0,
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    toJSON: function () {}
}

function copyTemplate(node: HTMLElement) {
    const result = html2bbcode(node.outerHTML)
    navigator.clipboard.writeText(result)
    showPrompt(null, null, `<span>${'模板已复制到剪贴板'}</span>`, 1500)
}

export default function App() {
    const [type, setType] = useState('')
    const [colRect, setColRect] = useState<DOMRect | null>(null)
    const [rowRect, setRowRect] = useState<DOMRect | null>(null)
    const [, setForceUpdate] = useState(false)
    const nodeRef = useRef<HTMLElement | null>(null)
    const [colInsertIndex, setColInsertIndex] = useState(-1)
    const [rowInsertIndex, setRowInsertIndex] = useState(-1)
    const [rowIndex, setRowIndex] = useState(-1)
    const [colDelta, setColDelta] = useState(0)
    const [rowDelta, setRowDelta] = useState(0)
    const iframeRectRef = useRef<DOMRect>(defaultRect)
    const [colIndex, setColIndex] = useState<number | null>(null)
    const activeNodeRef = useRef<HTMLElement | null>(null)
    const maskRef = useRef<HTMLDivElement | null>(null)
    const pickedRef = useRef(false)

    useEffect(() => {
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    const input1 = document.querySelector('#e_tbl_param_1') as HTMLInputElement
                    const input2 = document.querySelector('#e_tbl_param_2') as HTMLInputElement
                    const input3 = document.querySelector('#e_tbl_param_3') as HTMLInputElement
                    input1.value = '1'
                    input2.value = '1'
                    input3.value = '100%'
                }
            }
        })
        const node = document.querySelector('#e_menus')
        if (node) {
            observer.observe(node, {
                childList: true,
                subtree: true,
            })
            return () => {
                return observer.disconnect()
            }
        }
    }, [])

    useEffect(() => {
        return mergeEvent(
            bindEvent(window, 'load', (e) => {
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
            
                    document.addEventListener('click', (e) => {
                        const node = e.target as HTMLElement
                        iframeRectRef.current = iframe.getBoundingClientRect()
                        nodeRef.current = getParentNode(node, 'table')
                        if (nodeRef.current) {
                            setType('table')
                            setForceUpdate(f => !f)
                            setRowRect(null)
                            setColRect(null)
                        } else {
                            setType('')
                            setColIndex(null)
                            setRowIndex(-1)
                        }
                    })
                    document.addEventListener('scroll', () => {
                        setType('')
                        setColIndex(null)
                        setRowIndex(-1)
                    })
                    document.addEventListener('mouseover', (e) => {
                        activeNodeRef.current = e.target as HTMLElement
                    })
                    document.addEventListener('drop', (e) => {
                        e.preventDefault();
                        const type = e.dataTransfer!.getData('text/plain')
                        const currentTable = nodeRef.current as HTMLTableElement
                        if (type === 'table') {
                            const container = e.target as HTMLElement
                            container.appendChild(currentTable)
                        } else if (type.startsWith('row')) {
                            const index = parseInt(type.match(/(\d+)$/)![1])
                            const targetNode = e.target as HTMLElement
                            const targetTrNode = targetNode.parentElement!
                            const tbodyNode = targetTrNode.parentElement!
                            if (targetNode.tagName === 'TD' && tbodyNode!.parentElement === nodeRef.current) {
                                tbodyNode.insertBefore(tbodyNode.children.item(index)!, targetTrNode)
                            }
                        } else if (type.startsWith('col')) {
                            const index = parseInt(type.match(/(\d+)$/)![1])
                            const targetNode = e.target as HTMLElement
                            const targetTrNode = targetNode.parentElement!
                            const tbodyNode = targetTrNode.parentElement!
                            const trList = Array.from(tbodyNode.children)
                            const targetTdList = Array.from(targetTrNode.children!)
                            if (targetNode.tagName === 'TD' && tbodyNode!.parentElement === nodeRef.current) {
                                const targetIndex = targetTdList.findIndex(td => td === targetNode)
                                trList.forEach(tr => {
                                    const tdList = tr.children
                                    tr.insertBefore(tdList.item(index)!, tdList.item(targetIndex + (index < targetIndex ? 1 : 0)))
                                })
                            }
                        }
                        setType('')
                    })
                    document.addEventListener('keydown', (e) => {
                        if (e.key === 'Escape') {
                            setType('')
                        }
                    })
                }
            }),
            bindEvent(window, 'scroll', () => {
                setType('')
                setColIndex(null)
                setRowIndex(-1)
            }),
            bindEvent(window, 'keydown', (e) => {
                if (e.key === 'Escape') {
                    setType('')
                }
            }),
        )
    }, [])

    useEffect(() => {
        const container = document.querySelector('.vwthd')
        if (container) {
            window.allowhtml = true;
            window.allowbbcode  = true;
            createScript('https://static.mcbbs.net/data/cache/bbcode.js').then(() => {
                const tplNode = document.createElement('span')
                tplNode.innerHTML = '<a href="javascript:;">[生成模板] </a>'
                tplNode.classList.add('xg1')
                tplNode.addEventListener('click', () => {
                    const node = document.querySelector('.t_table') as HTMLElement
                    if (node) {
                        copyTemplate(node)
                    } else {
                        showPrompt(null, null, `<span>${'模板生成失败，可尝试使用选区功能'}</span>`, 1500)
                    }
                })
                container.appendChild(tplNode)

                const pickNode = document.createElement('span')
                pickNode.innerHTML = '<a href="javascript:;">[使用选区] </a>'
                pickNode.classList.add('xg1')
                pickNode.addEventListener('click', (e) => {
                    e.stopPropagation()
                    showPrompt(null, null, `<span>${'鼠标移动选取需要的区域，然后点击'}</span>`, 1000)
                    pickedRef.current = true
                })
                container.appendChild(pickNode)
            })
        }
    }, [])

    useEffect(() => {
        let node: HTMLElement
        return mergeEvent(
            bindEvent(window, 'mousemove', (e) => {
                if (pickedRef.current) {
                    node = e.target as HTMLElement
                    const rect = node.getBoundingClientRect()
                    maskRef.current!.style.setProperty('top', rect.top + 'px')
                    maskRef.current!.style.setProperty('left', rect.left + 'px')
                    maskRef.current!.style.setProperty('width', rect.width + 'px')
                    maskRef.current!.style.setProperty('height', rect.height + 'px')
                }
            }),
            bindEvent(window, 'click', () => {
                if (pickedRef.current) {
                    copyTemplate(node)
                    pickedRef.current = false
                    maskRef.current!.style.setProperty('width', '0')
                    maskRef.current!.style.setProperty('height', '0')
                }
            })
        )
    }, [])

    function renderBar(type: string) {
        if (type === 'table') {
            const tableRect = nodeRef.current!.getBoundingClientRect()
            const tbody = nodeRef.current!.children[0]
            const trList = tbody.children
            if (! trList.length) {
                return null
            }
            const match = nodeRef.current!.style.backgroundColor.match(/(\d+)+/g)
            const bgColor = (nodeRef.current as HTMLTableElement)!.bgColor
            const backgroundColor = match
                ? { r: match[0], g: match[1], b: match[2] }
                : bgColor
            return (
                <div style={{
                    top: iframeRectRef.current.top + Math.max(tableRect.top, 0),
                    left: iframeRectRef.current.left + tableRect.left,
                    width: tableRect.width,
                    height: 0,
                }} className='hs-toolbar'>
                    <div draggable className='col-all' onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", 'table')
                    }} onClick={() => {
                        setColIndex(-1)
                    }} onMouseLeave={() => {
                        setColIndex(null)
                    }} onMouseEnter={() => {
                        setColRect(null)
                    }}>
                        {
                            colIndex === -1 && (
                                <div className='col-btn-group'>
                                    <div title='拷贝' onClick={(e) => {
                                        e.stopPropagation()
                                        const tableElement = nodeRef.current as HTMLTableElement
                                        if (tableElement.nextElementSibling) {
                                            tableElement.parentElement!.insertBefore(tableElement.cloneNode(true), tableElement.nextElementSibling)
                                        } else {
                                            tableElement.parentElement!.appendChild(tableElement.cloneNode(true))
                                        }
                                    }}>⇊</div>
                                    <div title='居中' onClick={(e) => {
                                        e.stopPropagation()
                                        const tableElement = nodeRef.current as HTMLTableElement
                                        const container = document.createElement('div')
                                        container.align = 'center'
                                        const parentNode = tableElement.parentElement
                                        const nextSibling = tableElement.nextElementSibling 
                                        container.appendChild(tableElement)
                                        if (nextSibling) {
                                            parentNode!.insertBefore(container, nextSibling)
                                        } else {
                                            parentNode!.appendChild(container)
                                        }
                                        setType('')
                                    }}>≡</div>
                                    <ColorPicker defaultColor={backgroundColor as any} onChange={(color) => {
                                        const tableElement = nodeRef.current as HTMLTableElement
                                        tableElement.style.backgroundColor = ''
                                        tableElement.bgColor = color
                                    }}>
                                        <div title='设置颜色'>#</div>
                                    </ColorPicker>
                                    <div title='设置宽度' className='btn-resize' onClick={(e) => {
                                        e.stopPropagation()
                                        const tableElement = nodeRef.current as HTMLTableElement
                                        const value = parseInt(prompt('请输入表格宽度', tableElement.width || '98') || tableElement.width)
                                        if (value) {
                                            const width = Math.max(Math.min(98, value), 0)
                                            tableElement.style.width = ''
                                            tableElement.width = width + '%'
                                        }
                                    }}>Η</div>
                                    <div title='删除' className='btn-delete' onClick={(e) => {
                                        e.stopPropagation()
                                        nodeRef.current!.remove()
                                        setColRect(null)
                                        setColIndex(null)
                                    }}>╳</div>
                                </div>
                            )
                        }
                    </div>
                    <div className='col'>
                        {
                            Array.from(trList[0].children).map((node, index, array) => (
                                <span draggable onDragStart={(e) => {
                                    e.dataTransfer.setData("text/plain", `col-${index}`)
                                }} onClick={() => {
                                    setColIndex(index)
                                }} onMouseLeave={() => {
                                    setColIndex(null)
                                }} onMouseMove={(e) => {
                                    if ((e.target as HTMLElement).tagName === 'SPAN') {
                                        const colRect = (e.target as HTMLElement).getBoundingClientRect()
                                        setColRect(colRect)
                                        setRowRect(null)
                                        const delta = e.nativeEvent.offsetX / colRect.width > 0.5 ? 1 : 0
                                        setColDelta(delta)
                                        setColInsertIndex(index + delta)
                                    }
                                }} key={index} className={'col-item'} style={{ flex: `0 0 ${node.clientWidth + 1}px` }}>
                                    {
                                        index === colIndex && (
                                            <div className='col-btn-group'>
                                                {
                                                    index !== 0 && (
                                                        <div title='移动到左侧列' onClick={(e) => {
                                                            e.stopPropagation()
                                                            Array.from(trList).forEach(tr => {
                                                                const tdList = tr.children
                                                                tr.insertBefore(tdList.item(index)!, tdList.item(index - 1))
                                                            })
                                                            setColRect(null)
                                                            setColIndex(null)
                                                            setType('')
                                                        }}>↤</div>
                                                    )
                                                }
                                                {
                                                    index !== array.length - 1&& (
                                                        <div title='移动到右侧列' onClick={(e) => {
                                                            e.stopPropagation()
                                                            Array.from(trList).forEach(tr => {
                                                                const tdList = tr.children
                                                                tr.insertBefore(tdList.item(index)!, tdList.item(index + 2))
                                                            })
                                                            setColRect(null)
                                                            setColIndex(null)
                                                            setType('')
                                                        }}>↦</div>
                                                    )
                                                }
                                                <div title='设置列宽' className='btn-resize' onClick={(e) => {
                                                    e.stopPropagation()
                                                    const tdElement = node as HTMLTableCellElement
                                                    const value = parseInt(prompt('请输入此列宽度', tdElement.width || '98') || tdElement.width)
                                                    if (value) {
                                                        const width = Math.max(Math.min(98, value), 0)
                                                        tdElement.width = width + '%'
                                                    }
                                                    setType('')
                                                }}>Η</div>
                                                <div title='删除' className='btn-delete' onClick={(e) => {
                                                    e.stopPropagation()
                                                    Array.from(trList).forEach(tr => tr.children.item(colIndex)!.remove())
                                                    setColRect(null)
                                                    setColIndex(null)
                                                    setType('')
                                                }}>╳</div>
                                            </div>
                                        )
                                    }
                                </span>
                            ))
                        }
                    </div>
                    <div style={{
                        height: Math.min(iframeRectRef.current.height, tableRect.height + Math.min(0, tableRect.top))
                    }} className='row'>
                        {
                            Array.from(trList).map((node, index, array) => {
                                const rect = node.getBoundingClientRect()
                                const top = Math.max(0, rect.top)
                                const bottom = Math.min(iframeRectRef.current.height, rect.bottom)
                                const rowHeight = Math.max(0, bottom - top)
                                return (
                                    <span draggable onDragStart={(e) => {
                                        e.dataTransfer.setData("text/plain", `row-${index}`)
                                    }} onClick={() => {
                                        setRowIndex(index)
                                    }} onMouseLeave={() => {
                                        setRowIndex(-1)
                                    }} onMouseMove={e => {
                                        if ((e.target as HTMLElement).tagName === 'SPAN') {
                                            const rowRect = (e.target as HTMLElement).getBoundingClientRect()
                                            setRowRect(rowRect)
                                            setColRect(null)
                                            const delta = e.nativeEvent.offsetY / rowRect.height > 0.5 ? 1 : 0
                                            setRowDelta(delta)
                                            setRowInsertIndex(index + delta)
                                        }
                                    }}
                                    style={{ flex: `0 0 ${rowHeight}px` }}
                                    key={index} className='row-item'>
                                        {
                                            rowIndex === index && (
                                                <div className='row-btn-group'>
                                                    {
                                                        index !== 0 && (
                                                            <div title='移动到上一行' onClick={(e) => {
                                                                e.stopPropagation()
                                                                tbody.insertBefore(node, tbody.children.item(index - 1))
                                                                setRowRect(null)
                                                                setRowIndex(-1)
                                                                setType('')
                                                            }}>↥</div>
                                                        )
                                                    }
                                                    {
                                                        index !== array.length - 1&& (
                                                            <div title='移动到下一行' onClick={(e) => {
                                                                e.stopPropagation()
                                                                tbody.insertBefore(node, tbody.children.item(index + 2))
                                                                setRowRect(null)
                                                                setRowIndex(-1)
                                                                setType('')
                                                            }}>↧</div>
                                                        )
                                                    }
                                                    <div title='删除' className='btn-delete' onClick={(e) => {
                                                        e.stopPropagation()
                                                        node.remove()
                                                        setRowRect(null)
                                                        setRowIndex(-1)
                                                    }}>╳</div>
                                                </div>
                                            )
                                        }
                                    </span>
                                )
                            })
                        }
                    </div>
                    {
                        colRect && (
                            <div onClick={() => {
                                const table = nodeRef.current! as HTMLTableElement
                                const tbody = table.children[0]
                                const trList = tbody.children
                                Array.from(trList).forEach(tr => {
                                    const tdList = tr.children
                                    const newTd = document.createElement('td')
                                    tr.insertBefore(newTd, tdList.item(colInsertIndex))
                                })
                                setColRect(null)
                            }} style={{
                                top: colRect.top,
                                left: colRect.left + colDelta * colRect.width,
                                height: Math.min(tableRect.height, iframeRectRef.current.height) + 10
                            }} className="col-cursor"></div>
                        )
                    }
                    {
                        rowRect && (
                            <div onClick={() => {
                                const table = nodeRef.current! as HTMLTableElement
                                const tbody = table.children[0]
                                const trList = tbody.children
                                if (trList.length === rowInsertIndex) {
                                    const tr = trList[0]
                                    const newTr = document.createElement('tr')
                                    newTr.innerHTML = `<td>&nbsp;</td>`.repeat(tr.children.length)
                                    tbody.append(newTr)
                                } else {
                                    const tr = trList[rowInsertIndex]
                                    const newTr = document.createElement('tr')
                                    newTr.innerHTML = `<td>&nbsp;</td>`.repeat(tr.children.length)
                                    tbody.insertBefore(newTr, tr)
                                }
                                setRowRect(null)
                            }} style={{
                                top: rowRect.top + rowDelta * rowRect.height,
                                left: rowRect.left,
                                width: tableRect.width + 10
                            }} className="row-cursor"></div>
                        )
                    }
                </div>
            )
        }
        return null
    }
    
    return (
        <div>
            <div ref={maskRef} style={{
                position: 'fixed',
                zIndex: 999,
                top: 0,
                left: 0,
                width: 0,
                height: 0,
                backgroundColor: '#00a6ff',
                opacity: .5,
                pointerEvents: 'none',
            }}></div>
            {renderBar(type)}
        </div>
    )
}
