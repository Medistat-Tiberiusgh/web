import { TEXT_LINK } from '../theme'

const PORTFOLIO_URL = 'https://tiberiusgh.com'

export default function PortfolioLink() {
  return (
    <a
      href={PORTFOLIO_URL}
      className={`inline-flex items-center gap-1.5 text-[0.95rem] font-medium ${TEXT_LINK} hover:underline underline-offset-[3px]`}
    >
      <BackChevron /> tiberiusgh.com
    </a>
  )
}

function BackChevron() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}
