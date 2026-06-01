'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Upload, ArrowDown, Crop, ChevronLeft, ChevronRight } from 'lucide-react';
import { mockupsRegistry, MockupModel } from '@/lib/mockupsConfig';
import { getCssMatrix3D, warpImageBilinear, Point } from '@/lib/homography';

export default function MockupsPage() {
  const [selectedMockup, setSelectedMockup] = useState<MockupModel>(mockupsRegistry[0]);
  const [uploadedImage, setUploadedImage] = useState<string>('/tools/mockups/Design.png');
  const [designDimensions, setDesignDimensions] = useState<{ width: number; height: number }>({
    width: 1206,
    height: 2571,
  });
  
  const [isWarping, setIsWarping] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Calibration mode state
  const [calibrateMode, setCalibrateMode] = useState(false);
  
  // Interactive points
  const [points, setPoints] = useState<Point[]>([]);
  const [customBorderRadius, setCustomBorderRadius] = useState<number[]>([0, 0, 0, 0]);

  const [draggingPoint, setDraggingPoint] = useState<number | null>(null);

  // Sync state when mockup changes
  useEffect(() => {
    setPoints([
      { ...selectedMockup.targetQuad.topLeft },
      { ...selectedMockup.targetQuad.topRight },
      { ...selectedMockup.targetQuad.bottomRight },
      { ...selectedMockup.targetQuad.bottomLeft },
    ]);
    
    if (selectedMockup.borderRadius) {
      setCustomBorderRadius([
        selectedMockup.borderRadius.topLeft,
        selectedMockup.borderRadius.topRight,
        selectedMockup.borderRadius.bottomRight,
        selectedMockup.borderRadius.bottomLeft
      ]);
    } else {
      setCustomBorderRadius([0, 0, 0, 0]);
    }
  }, [selectedMockup]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      setContainerSize({
        width: entries[0].contentRect.width,
        height: entries[0].contentRect.height,
      });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Handle Dragging of calibration points
  useEffect(() => {
    if (draggingPoint === null) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      
      const containerRatio = rect.width / rect.height;
      const mockupRatio = selectedMockup.width / selectedMockup.height;
      
      let scale = 1;
      if (containerRatio > mockupRatio) {
        scale = rect.height / selectedMockup.height;
      } else {
        scale = rect.width / selectedMockup.width;
      }
      
      const imageWidth = selectedMockup.width * scale;
      const imageHeight = selectedMockup.height * scale;
      
      // Calculate offset of the image within the container (flex items-center justify-center)
      const offsetX = rect.left + (rect.width - imageWidth) / 2;
      const offsetY = rect.top + (rect.height - imageHeight) / 2;
      
      let x = (e.clientX - offsetX) / scale;
      let y = (e.clientY - offsetY) / scale;

      // Bound within image
      x = Math.max(0, Math.min(selectedMockup.width, x));
      y = Math.max(0, Math.min(selectedMockup.height, y));

      setPoints(prev => {
        const newPts = [...prev];
        newPts[draggingPoint] = { x: Math.round(x), y: Math.round(y) };
        return newPts;
      });
    };

    const handleMouseUp = () => {
      setDraggingPoint(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingPoint, selectedMockup.width, selectedMockup.height]);

  // Handle image upload
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setDesignDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        setUploadedImage(result);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const loadImageElement = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(new Error('Erro ao carregar a imagem: ' + src));
      img.src = src;
    });
  };

  const handleDownload = async () => {
    if (!uploadedImage || points.length < 4) return;
    setIsWarping(true);
    setErrorMessage(null);
    try {
      const [mockupImg, designImg] = await Promise.all([
        loadImageElement(selectedMockup.imagePath),
        loadImageElement(uploadedImage),
      ]);

      const mw = selectedMockup.width;
      const mh = selectedMockup.height;

      const dstCanvas = document.createElement('canvas');
      dstCanvas.width = mw;
      dstCanvas.height = mh;
      const dstCtx = dstCanvas.getContext('2d');
      if (!dstCtx) throw new Error('Context error');

      dstCtx.drawImage(mockupImg, 0, 0);
      const dstImageData = dstCtx.getImageData(0, 0, mw, mh);

      const srcCanvas = document.createElement('canvas');
      srcCanvas.width = designImg.naturalWidth;
      srcCanvas.height = designImg.naturalHeight;
      const srcCtx = srcCanvas.getContext('2d');
      if (!srcCtx) throw new Error('Context error');
      srcCtx.drawImage(designImg, 0, 0);
      const srcImageData = srcCtx.getImageData(0, 0, designImg.naturalWidth, designImg.naturalHeight);

      const quad = {
        topLeft: points[0],
        topRight: points[1],
        bottomRight: points[2],
        bottomLeft: points[3],
      };

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = mw;
      tempCanvas.height = mh;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) throw new Error('Context error');

      const tempImageData = tempCtx.createImageData(mw, mh);
      warpImageBilinear(srcImageData, tempImageData, quad, customBorderRadius);
      tempCtx.putImageData(tempImageData, 0, 0);

      if (selectedMockup.clipPath) {
        dstCtx.save();
        const path = new Path2D(selectedMockup.clipPath);
        dstCtx.clip(path);
        dstCtx.drawImage(tempCanvas, 0, 0);
        dstCtx.restore();
      } else {
        dstCtx.drawImage(tempCanvas, 0, 0);
      }

      const dataUrl = dstCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `mockup-${selectedMockup.id}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao gerar mockup');
    } finally {
      setIsWarping(false);
    }
  };

  // Safe quad for CSS 3D
  const currentQuad = points.length === 4 ? {
    topLeft: points[0],
    topRight: points[1],
    bottomRight: points[2],
    bottomLeft: points[3],
  } : selectedMockup.targetQuad;

  const cssMatrix = getCssMatrix3D(designDimensions.width, designDimensions.height, currentQuad);

  // Layout sizing logic
  // The user wants full screen feel, but we need to match mouse coordinates.
  // We can center a container that maintains the aspect ratio of the mockup and scales to fit the viewport.
  let scale = 1;
  if (containerSize.width > 0 && containerSize.height > 0) {
    const containerRatio = containerSize.width / containerSize.height;
    const mockupRatio = selectedMockup.width / selectedMockup.height;
    if (containerRatio > mockupRatio) {
      scale = containerSize.height / selectedMockup.height;
    } else {
      scale = containerSize.width / selectedMockup.width;
    }
  }

  // Update corner radius value
  const handleRadiusChange = (index: number, val: string) => {
    const num = parseInt(val) || 0;
    const newRadii = [...customBorderRadius];
    newRadii[index] = num;
    setCustomBorderRadius(newRadii);
  };

  return (
    <main className="w-screen h-screen bg-[#111] overflow-hidden relative flex items-center justify-center font-sans text-neutral-800">
      
      {/* Hidden file input */}
      <input type="file" id="file-upload" accept="image/*" onChange={handleFileInput} className="hidden" />

      {/* SVG Clip Path Definitions */}
      <svg width="0" height="0" className="absolute">
        <defs>
          {mockupsRegistry.map(m => m.clipPath && (
            <clipPath id={`mockupClip-${m.id}`} key={m.id}>
              <path d={m.clipPath} />
            </clipPath>
          ))}
        </defs>
      </svg>

      {/* Main Image Area - Scaling to fit */}
      <div 
        ref={containerRef}
        className="w-full h-full flex items-center justify-center"
      >
        <div 
          className="relative select-none"
          style={{
            width: selectedMockup.width * scale,
            height: selectedMockup.height * scale,
          }}
        >
          {/* Mockup Background */}
          <img 
            src={selectedMockup.imagePath} 
            alt="Mockup"
            className="w-full h-full block pointer-events-none"
          />

          {/* Warped Design Preview */}
          {uploadedImage && (
            <div 
              className="absolute pointer-events-none"
              style={{
                left: 0,
                top: 0,
                width: selectedMockup.width,
                height: selectedMockup.height,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                clipPath: selectedMockup.clipPath ? `url(#mockupClip-${selectedMockup.id})` : undefined,
                overflow: selectedMockup.clipPath ? 'visible' : 'hidden',
              }}
            >
              <img
                src={uploadedImage}
                alt="Design"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: designDimensions.width,
                  height: designDimensions.height,
                  transform: cssMatrix,
                  transformOrigin: '0 0 0',
                }}
              />
            </div>
          )}

          {/* Calibration Draggable Points */}
          {calibrateMode && points.map((pt, idx) => (
            <div
              key={idx}
              onMouseDown={() => setDraggingPoint(idx)}
              className="absolute w-4 h-4 bg-[#00FFAA] rounded-full shadow-sm cursor-move pointer-events-auto"
              style={{
                left: pt.x * scale,
                top: pt.y * scale,
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Top Right Badge */}
      <div className="absolute top-6 right-6 bg-[#00FFAA] text-black font-semibold px-4 py-2 rounded-full text-sm shadow-md z-50">
        Faça upload de imagem com {selectedMockup.width}x{selectedMockup.height} pixels ({selectedMockup.recommendedRatio || '16:9'})
      </div>

      {/* Error Toast */}
      {errorMessage && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-xl z-50">
          {errorMessage}
        </div>
      )}

      {/* Right Widget: Border Radius Calibration */}
      {calibrateMode && (
        <div className="absolute top-1/2 right-12 -translate-y-1/2 w-[220px] h-[160px] border border-white/40 flex items-center justify-center z-50">
          <span className="text-white/60 text-sm pointer-events-none">border-radius</span>
          
          {/* Border Radius Inputs */}
          <input 
            type="text" 
            value={customBorderRadius[0]} 
            onChange={(e) => handleRadiusChange(0, e.target.value)}
            className="absolute -top-3 -left-3 w-8 bg-transparent text-white text-xs text-center outline-none" 
          />
          <input 
            type="text" 
            value={customBorderRadius[1]} 
            onChange={(e) => handleRadiusChange(1, e.target.value)}
            className="absolute -top-3 -right-3 w-8 bg-transparent text-white text-xs text-center outline-none" 
          />
          <input 
            type="text" 
            value={customBorderRadius[3]} 
            onChange={(e) => handleRadiusChange(3, e.target.value)}
            className="absolute -bottom-3 -left-3 w-8 bg-transparent text-white text-xs text-center outline-none" 
          />
          <input 
            type="text" 
            value={customBorderRadius[2]} 
            onChange={(e) => handleRadiusChange(2, e.target.value)}
            className="absolute -bottom-3 -right-3 w-8 bg-transparent text-white text-xs text-center outline-none" 
          />

          {/* Dots */}
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#00FFAA] rounded-full" />
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#00FFAA] rounded-full" />
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#00FFAA] rounded-full" />
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#00FFAA] rounded-full" />

          {/* JSON copy snippet at bottom */}
          <div className="absolute -bottom-12 right-0 bg-black/80 text-[#00FFAA] text-[9px] p-2 rounded shadow-xl whitespace-pre text-right pointer-events-none">
            {`borderRadius: { topLeft: ${customBorderRadius[0]}, topRight: ${customBorderRadius[1]}, bottomRight: ${customBorderRadius[2]}, bottomLeft: ${customBorderRadius[3]} }`}
          </div>
        </div>
      )}

      {/* Bottom Floating Toolbar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-2xl flex items-center p-2 gap-4 z-50">
        
        {/* Logo */}
        <div className="flex items-center gap-1.5 pl-4 shrink-0">
          <div className="font-bold text-2xl italic tracking-tighter">fx</div>
          <span className="text-lg text-neutral-600 font-medium">Mockups</span>
        </div>
        
        {/* Carousel */}
        <div className="flex items-center gap-2 px-4 border-x border-neutral-200">
          <button className="w-8 h-8 flex items-center justify-center rounded-full border border-neutral-200 hover:bg-neutral-50 text-neutral-500">
            <ChevronLeft size={16} />
          </button>
          
          <div className="flex gap-2 w-[280px] overflow-x-auto custom-scrollbar items-center py-1">
            {mockupsRegistry.map((m) => (
              <button 
                key={m.id}
                onClick={() => setSelectedMockup(m)} 
                className={`shrink-0 w-[50px] h-[50px] rounded-lg overflow-hidden border-2 transition-all ${selectedMockup.id === m.id ? 'border-black' : 'border-transparent opacity-80 hover:opacity-100'}`}
              >
                <img src={m.imagePath} alt={m.name} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          <button className="w-8 h-8 flex items-center justify-center rounded-full border border-neutral-200 hover:bg-neutral-50 text-neutral-500">
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pr-2 shrink-0">
          <button 
            onClick={() => document.getElementById('file-upload')?.click()} 
            className="w-11 h-11 flex items-center justify-center rounded-full border border-neutral-200 hover:bg-neutral-50"
            title="Fazer Upload de Design"
          >
            <Upload size={18} className="text-neutral-700" />
          </button>
          
          <button 
            onClick={() => setCalibrateMode(!calibrateMode)} 
            className={`w-11 h-11 flex items-center justify-center rounded-full transition-colors ${calibrateMode ? 'bg-[#00FFAA] text-black' : 'border border-neutral-200 hover:bg-neutral-50 text-neutral-700'}`}
            title="Modo Calibração"
          >
            <Crop size={18} />
          </button>
          
          <button 
            onClick={isWarping ? undefined : handleDownload} 
            className={`w-11 h-11 flex items-center justify-center rounded-full bg-black text-white hover:bg-neutral-800 transition-colors ${isWarping ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Baixar Mockup Digital"
          >
            <ArrowDown size={18} />
          </button>
        </div>
      </div>
      
    </main>
  );
}
