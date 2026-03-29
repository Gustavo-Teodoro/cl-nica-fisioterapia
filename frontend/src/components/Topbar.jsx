export default function Topbar({ title }) {
  const dataFormatada = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  }).replace(/^\w/, c => c.toUpperCase())

  return (
    <div className="h-14 bg-surface border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
      <span className="font-semibold text-text text-base">{title}</span>
      <span className="text-text-3 text-sm hidden md:block">{dataFormatada}</span>
    </div>
  )
}
