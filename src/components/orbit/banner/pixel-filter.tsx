export const PixelFilter = () => {
  return (
    <svg width="0" height="0" className="absolute top-0 left-0">
      <defs>
        <filter id="pixelate" x="0%" y="0%" width="100%" height="100%">
          <feGaussianBlur
            stdDeviation="0"
            in="SourceGraphic"
            result="smoothed"
          />
          <feImage
            width="10"
            height="10"
            xlinkHref="/pixel-grid.svg"
            result="displacement-map"
          />
          <feTile in="displacement-map" result="pixelate-map" />
          <feDisplacementMap
            in="smoothed"
            in2="pixelate-map"
            xChannelSelector="R"
            yChannelSelector="G"
            scale="5"
            result="pre-final"
          >
            <animate
              attributeName="scale"
              values="2; 0; 2"
              dur="1s"
              repeatCount="indefinite"
            />
          </feDisplacementMap>
          <feComposite operator="in" in2="SourceGraphic" />
        </filter>
      </defs>
    </svg>
  )
}
