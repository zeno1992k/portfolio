function VideoPlayer({videoId, title}){
  return(
    <section className="mb-6 max-w-4xl">
      <iframe className="aspect-video min-h-[200px] w-full" src={`https://www.youtube.com/embed/${videoId}`} title={title} allowFullScreen />
      <h2>{title}</h2>
    </section>

  )
}
export default VideoPlayer;
