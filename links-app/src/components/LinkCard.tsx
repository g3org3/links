interface Props {
  link: any
  cardRef?: React.Ref<HTMLAnchorElement>
}
export default function LinkCard(props: Props) {
  const { link, cardRef } = props

  return (
    <a
      ref={cardRef}
      className="
      group
      flex
      w-full
      flex-col
      items-center
      rounded-lg
      bg-white
      p-6
      shadow-lg
      transition-all
      duration-300
      hover:bg-slate-50
      dark:bg-slate-700
      dark:hover:bg-slate-600
      md:max-w-sm
      "
      target="_blank"
      href={link.url}
      rel="noreferrer"
    >
      <img
        alt="logo"
        className="h-36 rounded-lg"
        src={link.image || 'https://api.dicebear.com/6.x/shapes/svg?seed=' + link.url}
      />
      <div className="line-clamp-2 pt-2 font-semibold text-slate-700 dark:text-slate-300">
        {link.desc || link.url}
      </div>
      <div className="flex-1"></div>
      <div className="font-mono text-xs text-gray-400 dark:text-slate-400">{link.url}</div>
    </a>
  )
}
