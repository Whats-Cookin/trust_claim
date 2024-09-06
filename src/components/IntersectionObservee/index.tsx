import { useRef, useEffect } from 'react'

type Props = {
  onIntersection: () => void
}

export default function IntersectionObservee(props: Props) {
  const observee = useRef<HTMLDivElement>(null)
  let observer: IntersectionObserver

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '400px',
      threshold: 1.0
    }

    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          props.onIntersection()
        }
      })
    }, options)

    if (!observee.current) throw new Error("Can't find the observee")

    observer.observe(observee.current)

    return () => {
      observer.disconnect()
    }
  }, [])

  return <div ref={observee} style={{ width: 0, height: 0, clipPath: 'circle(0)', overflow: 'hidden' }}></div>
}
