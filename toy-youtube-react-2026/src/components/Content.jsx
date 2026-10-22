// Header.jsx
import VideoCard from './VideoCard';
import VideoCardSkeleton from './VideoCardSkeleton';
import { useRef ,useEffect } from 'react';


function Content({category,onCategoryChange,keyword, videos, listLoading, listError, nextPageToken, moreLoading, moreError, onLoadMore, }){
  const loadMoreRef = useRef(null);
  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || listLoading || listError !== '' || moreLoading || moreError !== '' || nextPageToken === '') return;

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];

      if (entry.isIntersecting) { onLoadMore(); }
    });

    observer.observe(target);

    return () => observer.disconnect();
  }, [ listLoading,listError,moreLoading,moreError,nextPageToken,onLoadMore,]);

  return(
    <main className="[grid-area:content] min-w-0 p-6">
      {keyword !=='' && <p>검색어: {keyword}</p>}
      <div role="group" aria-label="영상 카테고리" className="mb-6 flex gap-2">
        {[{ id: 'all', label: '전체' },{ id: 'music', label: '음악' },{ id: 'gaming', label: '게임' },].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onCategoryChange(item.id)}
            aria-pressed={category === item.id}
            className={`rounded-lg px-3 py-2 text-sm ${
              category === item.id
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {listLoading && (
        <div>
          <p role="status" className="sr-only">영상 목록을 불러오는 중입니다.</p>
          <ul aria-hidden="true" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {Array.from({ length: 24 }, (_, index) => (
            <li key={index}>
              <VideoCardSkeleton />
            </li>
          ))}
          </ul>
        </div>


      )}
      {!listLoading && listError !=='' && (<p role="alert">{listError}</p>)}
      {!listLoading && listError === '' && videos.length === 0 && (<p>표시할 영상이 없습니다.</p>)}

      {!listLoading && listError === '' && videos.length > 0 && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <li key={video.id}>
              <VideoCard video={video} />
            </li>
          ))}
        </ul>
      )}
      {!listLoading && listError === '' && videos.length > 0 && (
        <div ref={loadMoreRef} className="mt-6 flex flex-col items-center gap-3">
          <p role="status" className="sr-only">
            {moreLoading ? '추가 영상을 불러오는 중입니다.' : ''}
          </p>
          {moreError !== '' && (<p role="alert">{moreError}</p>)}
          {nextPageToken !=='' &&(
            <button
              type="button"
              onClick={onLoadMore}
              disabled={moreLoading}
              className={`inline-flex h-11 min-w-28 items-center justify-center rounded-full border px-6 ${
                moreLoading ? 'border-transparent' : 'border-gray-300'
              }`}
            >
              {moreLoading ? (
                <>
                  <span
                    className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                  <span className="sr-only">추가 영상 불러오는 중</span>
                </>
              ) : (
                '더 보기'
              )}
            </button>
          )}
        </div>
      )}
    </main>
  )
}
export default Content;
