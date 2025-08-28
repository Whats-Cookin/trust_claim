declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | [number, number, number, number]
    filename?: string
    image?: {
      type?: string
      quality?: number
    }
    html2canvas?: {
      scale?: number
      useCORS?: boolean
      dpi?: number
      letterRendering?: boolean
    }
    jsPDF?: {
      unit?: string
      format?: string | number[]
      orientation?: string
    }
    pagebreak?: {
      mode?: string | string[]
      before?: string | string[]
      after?: string | string[]
      avoid?: string | string[]
    }
  }

  interface Html2Pdf {
    set(options: Html2PdfOptions): Html2Pdf
    from(element: HTMLElement | string): Html2Pdf
    save(): Promise<void>
    output(type?: string, options?: any): any
    outputPdf(type?: string): any
    outputImg(type?: string): any
    then(onFulfilled?: (value: any) => any, onRejected?: (reason: any) => any): Promise<any>
  }

  function html2pdf(): Html2Pdf
  function html2pdf(element: HTMLElement | string, options?: Html2PdfOptions): Html2Pdf

  export = html2pdf
} 