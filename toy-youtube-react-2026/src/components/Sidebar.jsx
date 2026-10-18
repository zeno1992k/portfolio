import { NavLink } from 'react-router';
import { Home, SquarePlay, History, ListVideo } from 'lucide-react';


function Sidebar({ onNavigate }){
  return (
    <aside className="[grid-area:sidebar] px-3 py-2">
      <nav aria-label="주요 메뉴">
        <ul className="space-y-1">
          <li>
            <NavLink to="/" className="sidebar-item" onClick={onNavigate}>
              <Home size={22} aria-hidden="true" />
              <span>홈</span>
            </NavLink>
          </li>
          <li>
            <button type="button" className="sidebar-item" disabled>
              <SquarePlay size={22} aria-hidden="true" />
              <span>구독</span>
              <span className="ml-auto text-xs">준비 중</span>
            </button>
          </li>
        </ul>
      </nav>

      <nav aria-label="마이 페이지" className="mt-3 border-t border-gray-200 pt-3">
        <h2 className="px-3 py-2 text-sm font-semibold">마이 페이지</h2>
        <ul className="space-y-1">
          <li>
            <button type="button" className="sidebar-item" disabled>
              <History size={22} aria-hidden="true" />
              <span>기록</span>
              <span className="ml-auto text-xs">준비 중</span>
            </button>
          </li>
          <li>
            <button type="button" className="sidebar-item" disabled>
              <ListVideo size={22} aria-hidden="true" />
              <span>재생목록</span>
              <span className="ml-auto text-xs">준비 중</span>
            </button>
          </li>
        </ul>
      </nav>

    </aside>
  );
}
export default Sidebar;
