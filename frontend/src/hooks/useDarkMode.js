import { useState, useEffect } from 'react'

export function useDarkMode() {
    const [dark, setDark] = useState(() => {
        return localStorage.getItem('invoiceai_theme') === 'dark'
    })

    useEffect(() => {
        const root = document.documentElement
        if (dark) {
            root.setAttribute('data-theme', 'dark')
            localStorage.setItem('invoiceai_theme', 'dark')
        } else {
            root.removeAttribute('data-theme')
            localStorage.setItem('invoiceai_theme', 'light')
        }
    }, [dark])

    const toggle = () => setDark(d => !d)
    return { dark, toggle }
}