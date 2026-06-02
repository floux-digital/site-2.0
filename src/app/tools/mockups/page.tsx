'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpFromDot, ArrowDownToDot, VectorSquare, ChevronLeft, ChevronRight, TextSearch } from 'lucide-react';
import { mockupsRegistry, MockupModel } from '@/lib/mockupsConfig';
import { getCssMatrix3D, warpImageBilinear, Point } from '@/lib/homography';
import Image from 'next/image';

export default function MockupsPage() {
  const [selectedMockup, setSelectedMockup] = useState<MockupModel>(mockupsRegistry[0]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const carouselRef = useRef<HTMLDivElement>(null);

  const allNames = Array.from(new Set(mockupsRegistry.map(m => m.name)));
  const [selectedNames, setSelectedNames] = useState<string[]>(allNames);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const filteredMockups = mockupsRegistry.filter(m => selectedNames.includes(m.name));

  useEffect(() => {
    if (filteredMockups.length > 0 && !filteredMockups.some(m => m.id === selectedMockup.id)) {
      setSelectedMockup(filteredMockups[0]);
    }
  }, [selectedNames]);

  const toggleNameFilter = (name: string) => {
    setSelectedNames(prev => {
      if (prev.includes(name)) {
        if (prev.length === 1) return prev; // Prevent unselecting all
        return prev.filter(n => n !== name);
      } else {
        return [...prev, name];
      }
    });
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 200;
      carouselRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const activeImage = uploadedImage || selectedMockup.designPath;

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

  const [draggingPoint, setDraggingPoint] = useState<number | null>(null);

  // Toolbar dragging state
  const [toolbarPos, setToolbarPos] = useState({ x: 0, y: 0 });
  const [isDraggingToolbar, setIsDraggingToolbar] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, startX: 0, startY: 0 });

  useEffect(() => {
    setPoints([
      { ...selectedMockup.targetQuad.topLeft },
      { ...selectedMockup.targetQuad.topRight },
      { ...selectedMockup.targetQuad.bottomRight },
      { ...selectedMockup.targetQuad.bottomLeft },
    ]);
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

  // Handle Dragging of Toolbar
  useEffect(() => {
    if (!isDraggingToolbar) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setToolbarPos({
        x: dragStart.current.startX + dx,
        y: dragStart.current.startY + dy,
      });
    };

    const handleMouseUp = () => {
      setIsDraggingToolbar(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingToolbar]);

  const handleToolbarDragStart = (e: React.MouseEvent) => {
    setIsDraggingToolbar(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      startX: toolbarPos.x,
      startY: toolbarPos.y
    };
  };

  // Handle image upload
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const img = new window.Image();
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
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(new Error('Erro ao carregar a imagem: ' + src));
      img.src = src;
    });
  };

  const handleDownload = async () => {
    if (!activeImage || points.length < 4) return;
    setIsWarping(true);
    setErrorMessage(null);
    try {
      const [mockupImg, designImg] = await Promise.all([
        loadImageElement(selectedMockup.imagePath),
        loadImageElement(activeImage),
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
      warpImageBilinear(srcImageData, tempImageData, quad);
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

  const toggleCalibrateMode = () => {
    if (calibrateMode && points.length === 4) {
      console.log('--- Coordenadas Atualizadas (Copie para mockupsConfig.ts) ---');
      console.log(`
    targetQuad: {
      topLeft: { x: ${points[0].x}, y: ${points[0].y} },
      topRight: { x: ${points[1].x}, y: ${points[1].y} },
      bottomRight: { x: ${points[2].x}, y: ${points[2].y} },
      bottomLeft: { x: ${points[3].x}, y: ${points[3].y} },
    },
      `.trim());
    }
    setCalibrateMode(!calibrateMode);
  };

  return (
    <main className="w-screen h-screen bg-[#111] overflow-hidden relative flex items-center justify-center">

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
          {activeImage && (
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
                src={activeImage}
                alt="Design"
                onLoad={(e) => {
                  if (!uploadedImage) {
                    setDesignDimensions({
                      width: e.currentTarget.naturalWidth,
                      height: e.currentTarget.naturalHeight
                    });
                  }
                }}
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

      {/* Error Toast */}
      {errorMessage && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-xl z-50">
          {errorMessage}
        </div>
      )}

      {/* Bottom Floating Toolbar */}
      <div
        className="absolute bottom-6 left-1/2 bg-white rounded-full shadow-2xl flex w-max items-center py-2 px-4 gap-4 z-50"
        style={{
          transform: `translate(calc(-50% + ${toolbarPos.x}px), ${toolbarPos.y}px)`,
          transition: isDraggingToolbar ? 'none' : 'transform 0.1s ease-out',
        }}
      >

        {/* Logo */}
        <div
          className="flex items-center gap-1.5 pl-4 shrink-0 cursor-grab active:cursor-grabbing"
          onMouseDown={handleToolbarDragStart}
        >
          <Image
            src="/fx-black.svg"
            alt="Floux"
            width={34}
            height={29}
            style={{ width: '34px', height: 'auto' }}
          />
          <span className="text-lg tracking-tight font-light">Mockups</span>
        </div>

        {/* Carousel */}
        <div className="flex items-center gap-2 px-4 border-x border-neutral-200">
          <button
            onClick={() => scrollCarousel('left')}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-neutral-200 hover:bg-neutral-50 text-neutral-500"
          >
            <ChevronLeft size={16} />
          </button>

          <div ref={carouselRef} className="flex gap-2 w-[280px] overflow-x-auto scroll-smooth custom-scrollbar items-center py-1">
            {filteredMockups.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMockup(m)}
                className={`shrink-0 w-[50px] h-[50px] rounded-lg overflow-hidden border-2 transition-all ${selectedMockup.id === m.id ? 'border-black' : 'border-transparent opacity-80 hover:opacity-100'}`}
              >
                <img src={m.imagePath} alt={m.name} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          <button
            onClick={() => scrollCarousel('right')}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-neutral-200 hover:bg-neutral-50 text-neutral-500"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pr-2 shrink-0 relative">

          {/* Filter Menu Popup */}
          {showFilterMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowFilterMenu(false)}
              />
              <div className="absolute bottom-[calc(100%+24px)] right-0 bg-white rounded-[24px] rounded-bl-none shadow-2xl p-2 flex flex-col w-48 z-50">
                {allNames.map((name, idx) => {
                  const isSelected = selectedNames.includes(name);
                  return (
                    <div key={name} className="flex flex-col">
                      <button
                        onClick={() => toggleNameFilter(name)}
                        className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50 rounded-xl transition-colors"
                      >
                        <span className="text-[13px] font-medium text-neutral-800">{name}</span>
                        <div className={`w-5 h-5 rounded-full border-2 transition-colors ${isSelected ? 'bg-[#00FFAA] border-[#00FFAA]' : 'border-neutral-300'}`} />
                      </button>
                      {idx < allNames.length - 1 && <div className="h-px bg-neutral-100 mx-4" />}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className={`w-11 h-11 flex items-center justify-center rounded-full transition-colors ${showFilterMenu || selectedNames.length < allNames.length ? 'bg-[#00FFAA] text-black border-transparent' : 'border border-neutral-200 hover:bg-neutral-50 text-neutral-700'}`}
            title="Filtrar Mockups"
          >
            <TextSearch size={18} />
          </button>
          <button
            onClick={() => document.getElementById('file-upload')?.click()}
            className="w-11 h-11 flex items-center justify-center rounded-full border border-neutral-200 hover:bg-neutral-50"
            title="Fazer Upload de Design"
          >
            <ArrowUpFromDot size={18} className="text-neutral-700" />
          </button>

          <button
            onClick={toggleCalibrateMode}
            className={`w-11 h-11 flex items-center justify-center rounded-full transition-colors ${calibrateMode ? 'bg-[#00FFAA] text-black' : 'border border-neutral-200 hover:bg-neutral-50 text-neutral-700'}`}
            title="Modo Calibração"
          >
            <VectorSquare size={18} />
          </button>

          <button
            onClick={isWarping ? undefined : handleDownload}
            className={`w-11 h-11 flex items-center justify-center rounded-full bg-black text-white hover:bg-neutral-800 transition-colors ${isWarping ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Baixar Mockup Digital"
          >
            <ArrowDownToDot size={18} />
          </button>
        </div>
      </div>

    </main>
  );
}
