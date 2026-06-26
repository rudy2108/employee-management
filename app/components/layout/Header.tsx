import { useSearchParams } from 'react-router'

function Header(){
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchParams((prev) => {
      if (value) {
        prev.set('q', value)
      } else {
        prev.delete('q')
      }
      return prev
    }, { replace: true })
  }

  return (
     <header className="sticky top-0 z-40 bg-surface shadow-sm flex justify-between items-center h-12 px-4">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-1.5 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h1 className="text-headline-md font-headline-md text-primary font-bold">HRMS Portal</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block focus-within:ring-2 focus-within:ring-primary rounded-full transition-all">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
              <input
                className="pl-9 pr-3 py-1.5 bg-surface-container-high border-none rounded-full text-body-md font-body-md text-on-surface w-56 focus:outline-none focus:ring-0 placeholder:text-on-surface-variant/70"
                placeholder="Search employees, documents..."
                type="text"
                value={query}
                onChange={handleSearch}
              />
            </div>
            <button className="p-1.5 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface" />
            </button>
          </div>
        </header>
  );
}

export default Header;
