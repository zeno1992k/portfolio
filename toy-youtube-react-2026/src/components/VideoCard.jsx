import { Link } from 'react-router';

function VideoCard({video}){

  return(
    <Link to={`/watch/${video.id}`} className="block">
      <article className="flex flex-col gap-3">
        <img className="aspect-video w-full rounded-xl object-cover" src={video.snippet.thumbnails.medium.url} alt="" loading="lazy"/>
        <div className="flex flex-col gap-1">
          <h2 className="line-clamp-2 text-base font-semibold leading-6">{video.snippet.title}</h2>
          <p className="text-sm text-gray-600">{video.snippet.channelTitle}</p>
        </div>
      </article>
    </Link>

  );
}

export default VideoCard;
