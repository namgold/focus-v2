import React, { useEffect, useState } from 'react'

const Favicon = ({ src }: { src: string }) => {
  const [icoStrategyIndex, setIcoStrategyIndex] = useState(0)
  const [aHref, setAHref] = useState(src)

  const icoStrategy = [
    (url: string) =>
      (url.startsWith('https://') || url.startsWith('http://') ? url : 'https://' + url) + '/favicon.ico',
    (url: string) => 'https://favicon.yandex.net/favicon/' + url,
  ]

  useEffect(() => {
    setIcoStrategyIndex(0)
    setAHref(src.startsWith('https://') || src.startsWith('http://') ? src : 'https://' + src)
  }, [src])

  const handleError = (e: any) => {
    console.warn('Favicon HandleError', e)
    if (icoStrategyIndex < icoStrategy.length - 1) setIcoStrategyIndex(icoStrategyIndex + 1)
  }

  return (
    <a href={aHref} target="_blank" rel="noreferrer">
      {/* <div style={{ overflow: 'hidden', width: '32px', height: '32px' }}> */}
      <img src={icoStrategy[icoStrategyIndex](src)} width="32px" alt={src} onError={handleError} />
      {/* </div> */}
    </a>
  )
}

export default React.memo(Favicon)
