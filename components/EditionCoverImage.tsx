type EditionCoverImageProps = {
  src: string;
  alt: string;
  srcSet?: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
};

export function EditionCoverImage({
  src,
  alt,
  srcSet,
  sizes = "(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 320px",
  className = "",
  priority = false,
}: EditionCoverImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      className={`h-full w-full object-cover ${className}`}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "low"}
      draggable={false}
    />
  );
}
