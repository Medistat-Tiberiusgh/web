import { TEXT_SECONDARY, TEXT_BODY_HOVER } from '../theme'

export default function Footer({ className = '' }: { className?: string }) {
  return (
    <footer
      className={`text-center text-xs px-4 ${TEXT_SECONDARY} ${className}`}
    >
      Made by{' '}
      <a
        href="https://www.linkedin.com/in/tiberius-gh/"
        target="_blank"
        rel="noopener noreferrer"
        className={`underline ${TEXT_BODY_HOVER}`}
      >
        Tiberius Gherac
      </a>{' '}
      for course 1DV027 at Linnaeus University · Source code on{' '}
      <a
        href="https://github.com/Medistat-Tiberiusgh"
        target="_blank"
        rel="noopener noreferrer"
        className={`underline ${TEXT_BODY_HOVER}`}
      >
        GitHub
      </a>
    </footer>
  )
}
