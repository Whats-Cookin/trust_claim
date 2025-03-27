declare module 'html2pdf.js' {
  function html2pdf(): html2pdf.Html2PdfWrapper

  namespace html2pdf {
    interface Html2PdfWrapper {
      from(element: HTMLElement | string): Html2PdfWrapper
      set(options: any): Html2PdfWrapper
      save(filename?: string): Promise<void>
      toPdf(): any
      output(type: string, options?: any): Promise<any>
    }

    function worker(): any
  }

  export = html2pdf
}
