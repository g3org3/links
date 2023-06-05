import { clx } from 'utils/clx'

export default function Loading({ isFull }: { isFull?: boolean }) {
  return (
    <a
      className={clx(
        { 'md:max-w-sm': !isFull },
        'group flex w-full flex-col items-center rounded-lg bg-slate-200 p-4 shadow-lg transition-colors duration-300 dark:bg-slate-700'
      )}
      target="_blank"
      rel="noreferrer"
    >
      <div className="h-36 w-40 animate-pulse rounded-lg bg-slate-400 dark:bg-slate-600" />
      <div className="m-2 line-clamp-2 w-full animate-pulse bg-slate-400 font-semibold text-slate-400 dark:bg-slate-600 dark:text-slate-600">
        text
        <br />
        text
      </div>
      <div className="animate-pluse m-1 w-full bg-gray-400 text-xs text-gray-400 dark:bg-slate-600 dark:text-slate-600">
        url
      </div>
    </a>
  )
}
