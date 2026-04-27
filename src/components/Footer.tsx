export default function Footer({ className = '' }: { className?: string }) {
  return (
    <footer className={`text-center text-xs text-gray-500 px-4 ${className}`}>
      Made by{' '}
      <a
        href="https://www.linkedin.com/in/tiberius-gh/"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-gray-700"
      >
        Tiberius Gherac
      </a>{' '}
      for course 1DV027 at Linnaeus University · Source code on{' '}
      <a
        href="https://github.com/Medistat-Tiberiusgh"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-gray-700"
      >
        GitHub
      </a>
    </footer>
  )
}
