const ResponsiveImage = ({ 
  src, 
  alt, 
  mobileWidth = 400, 
  desktopWidth = 800,
  height,
  className = '' 
}) => {
  return (
    <img
      src={src}
      alt={alt}
      width={desktopWidth}
      height={height}
      loading="lazy"
      decoding="async"
      className={`w-full h-auto max-w-[${mobileWidth}px] md:max-w-[${desktopWidth}px] ${className}`}
      style={{
        maxWidth: `${mobileWidth}px`
      }}
      onError={(e) => {
        e.target.style.display = 'none'
      }}
    />
  )
}

export default ResponsiveImage