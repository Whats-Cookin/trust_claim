import React, { useState, useEffect } from 'react'
import { toPng } from 'html-to-image'
import jsPDF from 'jspdf'
import { Button, Menu, MenuItem, CircularProgress, Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import Logo from '../../assets/logolinkedtrust.svg'

interface ExportComponentProps {
  elementId: string
}

const ExportComponent: React.FC<ExportComponentProps> = ({ elementId }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [loadingImage, setLoadingImage] = useState(false)
  const [loadingPdf, setLoadingPdf] = useState(false)
  const [watermark, setWatermark] = useState<HTMLImageElement | null>(null)
  const theme = useTheme()

  useEffect(() => {
    const img = new Image()
    img.src = Logo
    img.onload = () => setWatermark(img)
  }, [])

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleShareLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    alert('Link copied to clipboard!')
    handleClose()
  }

  const addWatermark = (dataUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.src = dataUrl
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Failed to get canvas context'))

        canvas.width = img.width
        canvas.height = img.height

        ctx.drawImage(img, 0, 0)
        if (watermark) {
          const scale = 0.6
          const watermarkWidth = watermark.width * scale
          const watermarkHeight = watermark.height * scale
          ctx.globalAlpha = 0.7
          ctx.drawImage(
            watermark,
            canvas.width - watermarkWidth - 10,
            canvas.height - watermarkHeight - 10,
            watermarkWidth,
            watermarkHeight
          )
        }

        resolve(canvas.toDataURL())
      }
      img.onerror = () => reject(new Error('Failed to load image'))
    })
  }

  const exportAsImage = async () => {
    const node = document.getElementById(elementId)
    if (node) {
      setLoadingImage(true)
      try {
        let dataUrl = await toPng(node, { cacheBust: true })
        dataUrl = await addWatermark(dataUrl)
        const link = document.createElement('a')
        link.download = 'report.png'
        link.href = dataUrl
        link.click()
      } catch (error) {
        console.error('Failed to export as image:', error)
      } finally {
        setLoadingImage(false)
        handleClose()
      }
    } else {
      console.error('Element not found for export as image')
      handleClose()
    }
  }

  const exportAsPdf = async () => {
    const node = document.getElementById(elementId)
    if (node) {
      setLoadingPdf(true)
      try {
        let dataUrl = await toPng(node, { cacheBust: true })
        dataUrl = await addWatermark(dataUrl)
        const pdf = new jsPDF('p', 'mm', 'a4')
        const imgProps = pdf.getImageProperties(dataUrl)
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

        let yOffset = 0
        const pageHeight = pdf.internal.pageSize.getHeight()

        while (yOffset < pdfHeight) {
          pdf.addImage(dataUrl, 'PNG', 0, -yOffset, pdfWidth, pdfHeight)
          yOffset += pageHeight
          if (yOffset < pdfHeight) {
            pdf.addPage()
          }
        }

        pdf.save('report.pdf')
      } catch (error) {
        console.error('Failed to export as PDF:', error)
      } finally {
        setLoadingPdf(false)
        handleClose()
      }
    } else {
      console.error('Element not found for export as PDF')
      handleClose()
    }
  }

  const printDocument = () => {
    const printContents = document.getElementById(elementId)?.innerHTML
    if (printContents) {
      const originalContents = document.body.innerHTML
      document.body.innerHTML = printContents
      window.print()
      document.body.innerHTML = originalContents
      window.location.reload()
    } else {
      console.error('Element not found for print')
    }
    handleClose()
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
      <Button
        variant='contained'
        sx={{
          color: theme.palette.buttontext,
          backgroundColor: theme.palette.buttons,
          '&:hover': { backgroundColor: theme.palette.buttonHover }
        }}
        onClick={handleClick}
      >
        Export Report
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={exportAsImage} disabled={loadingImage || loadingPdf}>
          {loadingImage ? <CircularProgress size={24} /> : 'Export as Image'}
        </MenuItem>
        <MenuItem onClick={exportAsPdf} disabled={loadingImage || loadingPdf}>
          {loadingPdf ? <CircularProgress size={24} /> : 'Export as PDF'}
        </MenuItem>
        <MenuItem onClick={printDocument}>Print to PDF</MenuItem>
        <MenuItem onClick={handleShareLink}>Copy Link</MenuItem>
      </Menu>
    </Box>
  )
}

export default ExportComponent
