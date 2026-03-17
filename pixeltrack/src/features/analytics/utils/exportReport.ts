import jsPDF from 'jspdf'

import type { ClientReportData } from '@/types'

function formatDateRange(range?: { from: string; to: string }) {
    if (!range) return 'All time'
    const from = new Date(range.from).toLocaleDateString()
    const to = new Date(range.to).toLocaleDateString()
    return `${from} – ${to}`
}

function downloadBlob(content: BlobPart, filename: string, mime: string) {
    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
}

export function exportClientReportToPdf(report: ClientReportData) {
    const doc = new jsPDF('p', 'pt')
    const startX = 40
    let cursorY = 50

    const addLine = (text: string, options?: { bold?: boolean }) => {
        doc.setFont('helvetica', options?.bold ? 'bold' : 'normal')
        doc.text(text, startX, cursorY)
        cursorY += 18
    }

    addLine(report.client?.name ?? 'Client Report', { bold: true })
    addLine(`Date Range: ${formatDateRange(report.range)}`)
    cursorY += 10

    addLine('Summary', { bold: true })
    addLine(`Projects: ${report.summary.projects}`)
    addLine(`Tasks: ${report.summary.tasks}`)
    addLine(`Completed: ${report.summary.completed}`)
    addLine(`In Progress: ${report.summary.inProgress}`)
    addLine(`Overdue: ${report.summary.overdue}`)
    cursorY += 10

    addLine('Project Breakdown', { bold: true })
    report.projectBreakdown.forEach((project) => {
        addLine(`${project.project.title} — ${project.progressPercent}% complete`)
        addLine(
            `Tasks: ${project.totals.tasks}, Completed: ${project.totals.completed}, Overdue: ${project.totals.overdue}`,
        )
        cursorY += 6
    })
    cursorY += 6

    addLine('Deliverables', { bold: true })
    report.deliverables.slice(0, 15).forEach((deliverable) => {
        addLine(`${deliverable.taskTitle} — v${deliverable.latestVersion}`)
    })
    cursorY += 6

    addLine('Feedback', { bold: true })
    report.feedback.slice(0, 15).forEach((feedback) => {
        addLine(`${feedback.taskTitle} — ${feedback.commentCount} comments`)
    })

    const filename = `${report.client?.name ?? 'client'}-report.pdf`
    doc.save(filename)
}

function makeCsvRow(values: Array<string | number>) {
    return values
        .map((value) => {
            const str = String(value ?? '')
            if (/[",\n]/.test(str)) {
                return `"${str.replace(/"/g, '""')}"`
            }
            return str
        })
        .join(',')
}

export function exportClientReportToCsv(report: ClientReportData) {
    const rows: string[] = []
    rows.push('Section,Item,Details')
    rows.push(makeCsvRow(['Summary', 'Projects', report.summary.projects]))
    rows.push(makeCsvRow(['Summary', 'Tasks', report.summary.tasks]))
    rows.push(makeCsvRow(['Summary', 'Completed', report.summary.completed]))
    rows.push(makeCsvRow(['Summary', 'In Progress', report.summary.inProgress]))
    rows.push(makeCsvRow(['Summary', 'Overdue', report.summary.overdue]))

    rows.push(makeCsvRow(['Projects', 'Name,Progress,Completed,Overdue']))
    report.projectBreakdown.forEach((project) => {
        rows.push(
            makeCsvRow([
                'Project',
                project.project.title,
                `${project.progressPercent}%`,
                project.totals.completed,
                project.totals.overdue,
            ]),
        )
    })

    report.deliverables.forEach((deliverable) => {
        rows.push(makeCsvRow(['Deliverable', deliverable.taskTitle, `Version ${deliverable.latestVersion}`]))
    })

    report.feedback.forEach((feedback) => {
        rows.push(makeCsvRow(['Feedback', feedback.taskTitle, `${feedback.commentCount} comments`]))
    })

    const csvContent = rows.join('\n')
    const filename = `${report.client?.name ?? 'client'}-report.csv`
    downloadBlob(csvContent, filename, 'text/csv;charset=utf-8;')
}
