import { Link, useParams } from 'react-router';
import VideoPlayer from './VideoPlayer';
import { useState, useEffect} from 'react';
import VideoCardSkeleton from './VideoCardSkeleton';

function VideoDetail(){
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    async function loadVideo(){
      setLoading(true);
      setError('');
      setVideo(null);
      try{
        const response = await fetch(`/api/videos?id=${videoId}`,{signal:controller.signal});
        const data = await response.json();
        if(!response.ok){
          throw new Error(data.error?.message ?? '영상 요청 실패');
        }
        if(!controller.signal.aborted){setVideo(data.items[0] ?? null);}

      }catch(err){
        if(!controller.signal.aborted && err.name !== 'AbortError'){ setError(err.message); }

      }finally{
         if(!controller.signal.aborted){ setLoading(false); }
      }
    }
    loadVideo();

    return () => controller.abort();
  }, [videoId]);

  return(
    <main className="[grid-area:content] min-w-0 p-6">
      <Link to="/" className="mb-4 inline-block">목록으로</Link>
      <p>영상 ID : {videoId}</p>
      {loading && (
        <div className="max-w-4xl">
          <p role="status" className="sr-only">영상을 불러오는 중입니다.</p>
        <div aria-hidden="true">
          <VideoCardSkeleton />
        </div>
        </div>
      )}

      {!loading && error !== '' && (
        <p role="alert">{error}</p>
      )}

      {!loading && error === '' && video === null && (
        <p>영상을 찾을 수 없습니다.</p>
      )}

      {!loading && error === '' && video !== null && (
        <>
          <VideoPlayer videoId={videoId} title={video.snippet.title} />
          <p>{video.snippet.channelTitle}</p>
        </>
      )}
    </main>
  )
}
export default VideoDetail;
