/** Optional project video. Never autoplays; external players load only when present. */
export function VideoEmbed({ url, title }: { url: string; title: string }) {
  const youtube = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/)
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  const src = youtube
    ? `https://www.youtube-nocookie.com/embed/${youtube[1]}`
    : vimeo
      ? `https://player.vimeo.com/video/${vimeo[1]}?dnt=1`
      : null

  if (src) {
    return (
      <div className="aspect-video bg-navy-900">
        <iframe
          src={src}
          title={`Video: ${title}`}
          className="h-full w-full"
          loading="lazy"
          allow="encrypted-media; picture-in-picture; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    )
  }
  if (/^https?:\/\/.+\.mp4(\?.*)?$/i.test(url)) {
    return (
      <video controls preload="metadata" className="aspect-video w-full bg-navy-900">
        <source src={url} type="video/mp4" />
        <a href={url}>Download the video</a>
      </video>
    )
  }
  return null
}
