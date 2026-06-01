type Props = {
  message: string
}

export default function EmptyChartState({ message }: Props) {
  return (
    <div className="flex items-center justify-center h-full text-sm text-gray-400">
      {message}
    </div>
  )
}
