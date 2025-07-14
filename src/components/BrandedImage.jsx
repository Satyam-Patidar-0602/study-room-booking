import { useState } from 'react'

const BrandedImage = ({ src, alt, className, fallbackText = "Study Point Library Jiran" }) => {
  const [imageError, setImageError] = useState(false)

  const handleError = () => {
    setImageError(true)
  }

  if (imageError || !src) {
    return (
      <div className={`${className} bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white text-center p-4`}>
        <div>
          <div className="text-2xl font-bold mb-2">📚</div>
          <div className="text-sm font-semibold leading-tight">{fallbackText}</div>
          <div className="text-xs opacity-80 mt-1">Est. July 10th, 2023</div>
        </div>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleError}
    />
  )
}

export default BrandedImage 