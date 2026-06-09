import { TEXT_MUTED } from '../../theme'

type Props = {
  message: string
}

export default function EmptyChartState({ message }: Props) {
  return (
    <div
      className={`flex items-center justify-center h-full text-sm ${TEXT_MUTED}`}
    >
      {message}
    </div>
  )
}
