import { useRef, useState, useCallback } from 'react'
import { Camera, X, ZoomIn, RefreshCw, Image as ImageIcon } from 'lucide-react'

interface PhotoUploadProps {
  photos: string[]
  onAdd: (photoDataUrl: string) => void
  onRemove: (index: number) => void
  maxPhotos?: number
  label?: string
  hint?: string
}

export default function PhotoUpload({
  photos,
  onAdd,
  onRemove,
  maxPhotos = 3,
  label = '拍摄照片',
  hint,
}: PhotoUploadProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const albumInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)

  const remaining = Math.max(0, maxPhotos - photos.length)

  const isValidDataUrl = (url: string): boolean => {
    return url.startsWith('data:image/')
  }

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let { width, height } = img
          const maxDim = 800

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = (height / width) * maxDim
              width = maxDim
            } else {
              width = (width / height) * maxDim
              height = maxDim
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Canvas context not available'))
            return
          }
          ctx.drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL('image/jpeg', 0.85))
        }
        img.onerror = () => reject(new Error('Image load failed'))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('File read failed'))
      reader.readAsDataURL(file)
    })
  }

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      e.target.value = ''
      return
    }

    if (photos.length >= maxPhotos) {
      alert(`最多只能上传 ${maxPhotos} 张照片`)
      e.target.value = ''
      return
    }

    setLoading(true)
    try {
      const dataUrl = await compressImage(file)
      onAdd(dataUrl)
    } catch (err) {
      console.error('Image processing failed:', err)
      alert('图片处理失败，请重试')
    } finally {
      setLoading(false)
      e.target.value = ''
    }
  }, [maxPhotos, onAdd, photos.length])

  const handleCameraClick = () => {
    if (photos.length >= maxPhotos) {
      alert(`最多只能上传 ${maxPhotos} 张照片`)
      return
    }
    cameraInputRef.current?.click()
  }

  const handleAlbumClick = () => {
    if (photos.length >= maxPhotos) {
      alert(`最多只能上传 ${maxPhotos} 张照片`)
      return
    }
    albumInputRef.current?.click()
  }

  const handleRetake = () => {
    if (previewIndex !== null) {
      onRemove(previewIndex)
      setPreviewIndex(null)
      setTimeout(() => {
        cameraInputRef.current?.click()
      }, 100)
    }
  }

  const handleDeleteFromPreview = () => {
    if (previewIndex !== null) {
      onRemove(previewIndex)
      setPreviewIndex(null)
    }
  }

  return (
    <div className="w-full">
      <label className="flex items-center gap-2 text-cool-100 text-sm font-medium mb-3">
        <Camera className="w-4 h-4 text-ice-500" />
        {label}
      </label>

      {photos.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-3">
          {photos.map((photo, idx) => (
            <div
              key={idx}
              className="w-20 h-20 rounded-lg overflow-hidden relative group"
            >
              {isValidDataUrl(photo) ? (
                <img
                  src={photo}
                  alt={`照片 ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-navy-800 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-navy-600" />
                </div>
              )}
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="absolute top-1 right-1 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity min-h-[44px]"
                aria-label={`删除照片 ${idx + 1}`}
              >
                <X className="w-4 h-4 text-white" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewIndex(idx)}
                className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 flex items-center justify-center min-h-[44px]"
                aria-label={`预览照片 ${idx + 1}`}
              >
                <ZoomIn className="w-6 h-6 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {photos.length < maxPhotos && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCameraClick}
            disabled={loading}
            className="flex-1 h-20 border-2 border-dashed border-navy-600 rounded-lg flex flex-col items-center justify-center gap-1 text-navy-600 transition-colors hover:border-ice-500/50 hover:text-ice-400 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Camera className="w-5 h-5" />
            )}
            <span className="text-xs">拍照</span>
          </button>
          <button
            type="button"
            onClick={handleAlbumClick}
            disabled={loading}
            className="flex-1 h-20 border-2 border-dashed border-navy-600 rounded-lg flex flex-col items-center justify-center gap-1 text-navy-600 transition-colors hover:border-ice-500/50 hover:text-ice-400 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ImageIcon className="w-5 h-5" />
            <span className="text-xs">从相册选择</span>
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        {hint ? (
          <p className="text-navy-600 text-xs">{hint}</p>
        ) : (
          <span />
        )}
        <p className="text-navy-600 text-xs">还可上传 {remaining} 张</p>
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={albumInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {previewIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-fade-in"
          onClick={() => setPreviewIndex(null)}
        >
          <button
            type="button"
            onClick={() => setPreviewIndex(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-navy-800/80 rounded-full flex items-center justify-center min-h-[44px]"
            aria-label="关闭预览"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="max-w-full max-h-full p-4" onClick={(e) => e.stopPropagation()}>
            {isValidDataUrl(photos[previewIndex]) ? (
              <img
                src={photos[previewIndex]}
                alt="预览"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            ) : (
              <div className="w-64 h-64 bg-navy-800 flex items-center justify-center rounded-lg">
                <Camera className="w-12 h-12 text-navy-600" />
              </div>
            )}

            <div className="flex gap-3 mt-6 justify-center">
              <button
                type="button"
                onClick={handleRetake}
                className="px-6 py-3 bg-ice-500 text-navy-900 rounded-xl font-semibold flex items-center gap-2 min-h-[44px] active:scale-[0.98] transition-transform"
              >
                <RefreshCw className="w-5 h-5" />
                重拍
              </button>
              <button
                type="button"
                onClick={handleDeleteFromPreview}
                className="px-6 py-3 bg-warn-500 text-white rounded-xl font-semibold flex items-center gap-2 min-h-[44px] active:scale-[0.98] transition-transform"
              >
                <X className="w-5 h-5" />
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
