import { type DocumentProps, pdf } from '@react-pdf/renderer'
import type { ReactElement } from 'react'

export const printJob = async (doc: ReactElement<DocumentProps>) => {
  const asBlob = await pdf(doc).toBlob()
  const url = URL.createObjectURL(asBlob)

  const printJS = (await import('print-js-updated')).default

  printJS({
    printable: url,
    type: 'pdf',
    onPrintDialogClose: () => {
      URL.revokeObjectURL(url)
    },
    onError: err => {
      console.error('Print failed:', err)
      URL.revokeObjectURL(url)
    },
  })
}
