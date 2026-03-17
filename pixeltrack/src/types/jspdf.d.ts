declare module 'jspdf' {
    export default class jsPDF {
        constructor(orientation?: string, unit?: string, format?: string | number[])
        text(text: string, x: number, y: number): void
        setFont(fontName: string, fontStyle?: string): void
        save(filename: string): void
    }
}
