"use client";

import React, { useEffect, useRef, useState } from "react";
import { NormalizedContent, DeviceMotion } from "../ARViewer";

interface TextRendererProps {
  content: NormalizedContent;
  gestures: any;
  deviceMotion: DeviceMotion;
  onTrackEvent: (event: string, data?: string) => void;
}

const TextRenderer: React.FC<TextRendererProps> = ({
  content,
  gestures,
  deviceMotion,
  onTrackEvent
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string>("");
  const [renderMode, setRenderMode] = useState<'plain' | 'html' | 'markdown'>('plain');

  // Load and process text content
  useEffect(() => {
    const loadTextContent = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let text = "";
        
        // Get text content from various sources
        if (content.data) {
          text = content.data;
        } else if (content.url) {
          const response = await fetch(content.url);
          if (!response.ok) {
            throw new Error(`Error al cargar el texto: ${response.statusText}`);
          }
          text = await response.text();
        } else {
          throw new Error("No se encontró contenido de texto para mostrar");
        }

        // Determine render mode based on content type and extension
        let mode: 'plain' | 'html' | 'markdown' = 'plain';
        
        if (content.mime?.includes('html') || content.ext === 'html') {
          mode = 'html';
        } else if (content.ext === 'md' || content.ext === 'markdown') {
          mode = 'markdown';
        } else if (content.mime?.includes('text/plain') || content.ext === 'txt') {
          mode = 'plain';
        } else {
          // Try to detect if it's HTML or Markdown
          if (text.includes('<') && text.includes('>')) {
            mode = 'html';
          } else if (text.includes('#') || text.includes('*') || text.includes('[')) {
            mode = 'markdown';
          }
        }

        setTextContent(text);
        setRenderMode(mode);
        setIsLoading(false);
        
        onTrackEvent("text_loaded", `${content.name}_${mode}`);
      } catch (err) {
        console.error('Error loading text content:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido al cargar el texto');
        setIsLoading(false);
        onTrackEvent("text_error", content.name);
      }
    };

    loadTextContent();
  }, [content, onTrackEvent]);

  // Sanitize HTML content for safe rendering
  const sanitizeHTML = (html: string): string => {
    // Simple HTML sanitization - remove script tags and dangerous attributes
    return html
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/javascript:/gi, '');
  };

  // Convert markdown to HTML (basic implementation)
  const markdownToHTML = (markdown: string): string => {
    return markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank">$1</a>')
      // Line breaks
      .replace(/\n/gim, '<br>');
  };

  // Apply device motion effects (placeholder)
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Apply subtle parallax effect based on device motion
    if (deviceMotion.x !== 0 || deviceMotion.y !== 0) {
      const parallaxX = deviceMotion.x * 0.1;
      const parallaxY = deviceMotion.y * 0.1;
      
      containerRef.current.style.transform = `translate(${parallaxX}px, ${parallaxY}px)`;
    }
  }, [deviceMotion]);

  // Apply gesture effects
  useEffect(() => {
    if (!containerRef.current || !gestures) return;
    
    // Apply scale and rotation from gestures
    const transform = `
      scale(${gestures.scale || 1})
      rotate(${gestures.rotation || 0}deg)
      translate(${gestures.position?.x || 0}px, ${gestures.position?.y || 0}px)
    `;
    
    containerRef.current.style.transform = transform;
  }, [gestures]);

  if (isLoading) {
    return (
      <div className="ar-loading">
        <div className="ar-loading-spinner"></div>
        <p>Cargando contenido de texto...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ar-error">
        <div className="text-center">
          <div className="text-4xl mb-4">📄</div>
          <h3 className="text-lg font-semibold mb-2">Error de Texto</h3>
          <p className="text-sm mb-4">{error}</p>
          <div className="space-y-2 text-xs">
            <p>• Verifica que el archivo de texto sea accesible</p>
            <p>• Revisa la conexión de red</p>
            <p>• Asegúrate de que el contenido sea texto válido</p>
          </div>
        </div>
      </div>
    );
  }

  const renderTextContent = () => {
    switch (renderMode) {
      case 'html':
        return (
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(textContent) }}
          />
        );
      
      case 'markdown':
        return (
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: markdownToHTML(textContent) }}
          />
        );
      
      default: // plain text
        return (
          <div className="whitespace-pre-wrap font-mono text-sm">
            {textContent}
          </div>
        );
    }
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative text-renderer-container"
    >
      {/* Text content area */}
      <div className="w-full h-full overflow-auto bg-white bg-opacity-90 rounded-lg p-4">
        {renderTextContent()}
      </div>

      {/* Overlay controls */}
      <div className="absolute top-2 right-2 z-10">
        <div className="flex gap-2">
          {/* Mode toggle button */}
          <button 
            className="ar-toggle-btn"
            onClick={() => {
              const modes: Array<'plain' | 'html' | 'markdown'> = ['plain', 'html', 'markdown'];
              const currentIndex = modes.indexOf(renderMode);
              const nextMode = modes[(currentIndex + 1) % modes.length];
              setRenderMode(nextMode);
              onTrackEvent("text_mode_change", nextMode);
            }}
            title={`Modo actual: ${renderMode}`}
          >
            {renderMode === 'html' ? '🌐' : renderMode === 'markdown' ? '📝' : '📄'}
          </button>

          {/* Copy content button */}
          <button 
            className="ar-toggle-btn"
            onClick={() => {
              navigator.clipboard.writeText(textContent).then(() => {
                onTrackEvent("text_copied", content.name);
                alert('Texto copiado al portapapeles');
              }).catch(() => {
                onTrackEvent("text_copy_error", content.name);
                alert('Error al copiar el texto');
              });
            }}
            title="Copiar texto"
          >
            📋
          </button>

          {/* Text info button */}
          <button 
            className="ar-toggle-btn"
            onClick={() => {
              const wordCount = textContent.split(/\s+/).length;
              const charCount = textContent.length;
              onTrackEvent("text_info_requested", content.name);
              alert(`Información del texto:\nArchivo: ${content.name}\nModo: ${renderMode}\nPalabras: ${wordCount}\nCaracteres: ${charCount}`);
            }}
            title="Información del texto"
          >
            ℹ️
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextRenderer;