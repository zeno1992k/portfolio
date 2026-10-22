import { useState, useRef, useEffect } from 'react';
import { ArrowLeft , Menu, Search } from 'lucide-react';
function Header({ keyword, onSearch, onMenuToggle, isSidebarOpen }) {
  const [searchText, setSearchText] = useState(keyword);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);
  useEffect(()=>{
    if(isSearchOpen){
      searchInputRef.current?.focus();
    }
  },[isSearchOpen]);
  function openSearch() {setIsSearchOpen(true);}
  function closeSearch() {setIsSearchOpen(false);}

  function handleSubmit(event){
    event.preventDefault();
    const query = searchText.trim();
    onSearch(query);
  }

  return (
    <header
      className={`[grid-area:header] flex min-w-0 flex-nowrap items-center gap-2 border-b border-gray-200 px-4 py-2 ${isSearchOpen ? 'is-search-open' : ''}`}
      onKeyDown={(event)=>{if(event.key === 'Escape' && isSearchOpen){closeSearch();}}}
    >
    <h1 className="shrink-0">
      <a className="flex items-center gap-2 whitespace-nowrap" href="/">
        <img src="/icon.png" alt="" width="30" height="30" />
        <span>zenotube</span>
      </a>
    </h1>
    <button type="button" className="mobile-search-back h-10 w-10 shrink-0 items-center justify-center" onClick={closeSearch} aria-label="검색 닫기">
      <ArrowLeft size={24} aria-hidden="true" />
    </button>

    <form
      id="HEADER_SEARCH_FORM"
      className={`header-search min-w-0 items-center rounded-full border border-gray-300`}
      onSubmit={handleSubmit}
    >
      <label htmlFor="VIDEO_SEARCH" className="sr-only">검색어</label>
      <input
        ref={searchInputRef}
        id="VIDEO_SEARCH"
        className="h-10 min-w-0 flex-1 bg-transparent px-2"
        value={searchText}
        onChange={(event) => setSearchText(event.target.value)}
        type="text"
        placeholder="검색어"
      />
      <button
        type="submit"
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-r-full border-l border-gray-300 bg-gray-50"
        aria-label="검색"
      >
        <Search size={20} aria-hidden="true" />
      </button>
    </form>

    <button type="button" className="mobile-search-open ml-auto h-10 w-10 shrink-0 items-center justify-center" onClick={openSearch} aria-label="검색 열기" aria-expanded={isSearchOpen} aria-controls="HEADER_SEARCH_FORM">
      <Search size={24} aria-hidden="true" />
    </button>
    <div className="header-actions ml-auto shrink-0 items-center gap-1">
      <button
        type="button"
        className="menu-toggle h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
        onClick={onMenuToggle}
        aria-label="메뉴 열기"
        aria-expanded={isSidebarOpen}
        aria-controls="SIDEBAR_DIALOG"
      >
        <Menu size={20} aria-hidden="true" />
      </button>
    </div>
  </header>
  );
}

export default Header;
