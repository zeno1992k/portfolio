function VideoCardSkeleton(){
  return(
    <div className="motion-safe:animate-pulse">
      <div className="aspect-video bg-gray-200"></div>
      <div className="mt-2 h-6 w-2/3 bg-gray-200 bg-gray-200"></div>
      <div className="mt-2 h-4 w-1/3 bg-gray-200 bg-gray-200"></div>
    </div>
  )
}
export default VideoCardSkeleton;
