const RippleFilter = () => {
  return (
    <svg width="0" height="0" className="absolute top-0 left-0">
      <filter id="ripple" x="0" y="0" width="100%" height="100%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.1"
          numOctaves="1"
          result="turbulence"
        >
          <animate
            attributeName="baseFrequency"
            values="0.08; 0.1; 0.08"
            dur="4s"
            repeatCount="indefinite"
          />
        </feTurbulence>

        <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="2" />
      </filter>
    </svg>
  )
}

export default RippleFilter
