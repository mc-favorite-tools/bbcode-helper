/*
 * The MIT License (MIT)
 * Copyright (c) 2023 hans000
 */
import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'

export default function Dropdown(props: {
    children: React.ReactNode
    className?: string
    style?: React.CSSProperties
    visible?: boolean
    onVisibleChange?: (visible: boolean) => void
    overlay?: React.ReactNode
}) {
    const [open, setOpen] = useState(false)
    const nodeRef = useRef<HTMLSpanElement | null>(null)
    const containerRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const node = document.createElement('div')
        containerRef.current = node
        const { top, left, height } = nodeRef.current!.getBoundingClientRect();
        node.style.cssText = `
            z-index: 999;
            position: fixed;
            top: ${top + height }px;
            left: ${left}px;
        `

        document.body.appendChild(node)
        return () => {
            document.body.removeChild(node)
        }
    }, [])
    
    return (
        <div style={props.style} className={props.className}>
            <span ref={nodeRef} onMouseEnter={() => setOpen(true)}>{props.children}</span>
            {
                open && (
                    ReactDOM.createPortal(<span>{props.overlay}</span>, containerRef.current!)
                )
            }
        </div>
    )
}
