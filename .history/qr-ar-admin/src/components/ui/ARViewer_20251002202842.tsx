/* ========================================
   AR VIEWER - MODERN STYLES
   ======================================== */

/* Container Principal */
.ar-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

/* Preview Area */
.ar-preview {
  width: 100%;
  height: 400px;
  background: linear-gradient(135deg, #0F1C2E 0%, #1a2942 100%);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(61, 216, 182, 0.15);
  border: 2px solid #1a2942;
  position: relative;
  transition: all 0.3s ease;
}

.ar-preview:hover {
  transform: translateY(-4px);
  box-shadow: 0 25px 70px rgba(61, 216, 182, 0.25);
  border-color: rgba(61, 216, 182, 0.5);
}

/* Controls */
.ar-controls {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

/* Buttons Base */
.ar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 700;
  border-radius: 16px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-width: 200px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.ar-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s;
}

.ar-btn:hover::before {
  transform: translateX(100%);
}

.ar-btn-icon {
  font-size: 1.5rem;
  transition: transform 0.3s ease;
}

.ar-btn:hover .ar-btn-icon {
  transform: scale(1.2) rotate(5deg);
}

/* Button Variants */
.ar-btn-primary {
  background: linear-gradient(135deg, #3DD8B6 0%, #00D4FF 100%);
  color: #0F1C2E;
}

.ar-btn-primary:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 30px rgba(61, 216, 182, 0.4);
}

.ar-btn-purple {
  background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
  color: white;
}

.ar-btn-purple:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 30px rgba(139, 92, 246, 0.4);
}

.ar-btn-green {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  color: white;
}

.ar-btn-green:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 30px rgba(16, 185, 129, 0.4);
}

.ar-btn-blue {
  background: linear-gradient(135deg, #00D4FF 0%, #0EA5E9 100%);
  color: #0F1C2E;
}

.ar-btn-blue:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 30px rgba(0, 212, 255, 0.4);
}

.ar-btn-secondary {
  background: #1a2942;
  color: white;
  border: 2px solid rgba(61, 216, 182, 0.3);
}

.ar-btn-secondary:hover {
  background: #243a5e;
  border-color: #3DD8B6;
  transform: translateY(-2px);
}

.ar-btn-disabled {
  background: #4B5563;
  color: #9CA3AF;
  cursor: not-allowed;
  opacity: 0.6;
}

.ar-btn-disabled:hover {
  transform: none;
}

/* Error Messages */
.ar-error {
  text-align: center;
  padding: 1.5rem;
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

/* ========================================
   FULLSCREEN AR VIEW
   ======================================== */

.ar-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #000;
  display: flex;
  flex-direction: column;
}

.ar-camera-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

/* Header */
.ar-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: linear-gradient(180deg, rgba(15, 28, 46, 0.95) 0%, transparent 100%);
  backdrop-filter: blur(10px);
  padding: 1rem;
}

.ar-header-no-events {
  pointer-events: none;
}

.ar-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
}

.ar-header-content-auto * {
  pointer-events: auto;
}

.ar-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  margin: 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.ar-close-btn {
  padding: 0.75rem 1.5rem;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
}

.ar-close-btn:hover {
  background: rgb(220, 38, 38);
  transform: scale(1.05);
}

/* Overlay Content */
.ar-overlay {
  position: absolute;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.ar-content-wrapper {
  max-width: 90%;
  max-height: 70%;
  transition: all 0.3s ease;
}

.ar-content-wrapper.no-transition {
  transition: none;
}

.ar-interactive {
  pointer-events: auto;
  cursor: grab;
}

.ar-interactive:active {
  cursor: grabbing;
}

.ar-interactive-dynamic {
  transform: translate(var(--gesture-x, 0), var(--gesture-y, 0))
             scale(var(--gesture-scale, 1))
             rotate(var(--gesture-rotation, 0));
}

/* Bounce Animation */
@keyframes bounce {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.05); }
}

.ar-bouncing {
  animation: bounce 0.6s ease-in-out;
}

/* Message Content */
.ar-message-content {
  display: flex;
  align-items: center;
  justify-center;
  padding: 2rem;
}

.ar-message-bubble {
  background: linear-gradient(135deg, rgba(61, 216, 182, 0.95) 0%, rgba(0, 212, 255, 0.95) 100%);
  padding: 2rem;
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(61, 216, 182, 0.3);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  max-width: 500px;
}

/* Model Overlay */
.ar-model-overlay {
  width: 600px;
  height: 600px;
  max-width: 90vw;
  max-height: 70vh;
}

.ar-overlay-model {
  width: 100%;
  height: 100%;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(61, 216, 182, 0.3);
}

.ar-model-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(26, 41, 66, 0.95) 0%, rgba(15, 28, 46, 0.95) 100%);
  border-radius: 20px;
  border: 2px solid rgba(61, 216, 182, 0.3);
  padding: 2rem;
}

.ar-overlay-image {
  max-width: 100%;
  max-height: 100%;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(61, 216, 182, 0.3);
}

/* Particles */
.ar-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 200;
}

.ar-particle {
  position: absolute;
  font-size: 2rem;
  animation: particle-float 2s ease-out forwards;
}

@keyframes particle-float {
  0% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(var(--tx), var(--ty)) scale(2);
  }
}

.ar-particle-1 {
  top: 50%;
  left: 50%;
  --tx: -100px;
  --ty: -100px;
}

.ar-particle-2 {
  top: 50%;
  left: 50%;
  --tx: 100px;
  --ty: -100px;
  animation-delay: 0.1s;
}

.ar-particle-3 {
  top: 50%;
  left: 50%;
  --tx: -100px;
  --ty: 100px;
  animation-delay: 0.2s;
}

.ar-particle-4 {
  top: 50%;
  left: 50%;
  --tx: 100px;
  --ty: 100px;
  animation-delay: 0.3s;
}

/* Footer */
.ar-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: linear-gradient(0deg, rgba(15, 28, 46, 0.95) 0%, transparent 100%);
  backdrop-filter: blur(10px);
  padding: 1.5rem 1rem;
}

.ar-footer-no-events {
  pointer-events: none;
}

.ar-footer-content {
  max-width: 1200px;
  margin: 0 auto;
}

.ar-footer-content-auto * {
  pointer-events: auto;
}

/* Controls Grid */
.ar-controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.ar-toggle-btn {
  padding: 0.75rem 1rem;
  background: rgba(26, 41, 66, 0.9);
  color: white;
  border: 2px solid rgba(61, 216, 182, 0.3);
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.ar-toggle-btn:hover {
  background: rgba(36, 58, 94, 0.9);
  border-color: #3DD8B6;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(61, 216, 182, 0.3);
}

.ar-fun-btn {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.8) 0%, rgba(236, 72, 153, 0.8) 100%);
  border-color: rgba(139, 92, 246, 0.5);
}

.ar-fun-btn:hover {
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.5);
}

.ar-active-btn {
  background: linear-gradient(135deg, rgba(61, 216, 182, 0.8) 0%, rgba(0, 212, 255, 0.8) 100%);
  border-color: #3DD8B6;
  color: #0F1C2E;
  font-weight: 700;
}

.ar-inactive-btn {
  background: rgba(75, 85, 99, 0.8);
  border-color: rgba(156, 163, 175, 0.3);
}

.ar-sound-on {
  border-color: rgba(34, 197, 94, 0.5);
}

.ar-sound-off {
  border-color: rgba(239, 68, 68, 0.5);
}

.ar-reset-btn {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.8) 0%, rgba(234, 88, 12, 0.8) 100%);
  border-color: rgba(249, 115, 22, 0.5);
}

/* Instructions */
.ar-instructions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.ar-expanded {
  background: rgba(26, 41, 66, 0.7);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(61, 216, 182, 0.2);
}

.ar-instructions > div {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
  padding: 0.25rem 0.5rem;
}

/* Status Indicators */
.ar-status-indicators {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  padding: 0.75rem;
  background: rgba(26, 41, 66, 0.7);
  border-radius: 12px;
  border: 1px solid rgba(61, 216, 182, 0.2);
}

.ar-status-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #3DD8B6;
}

/* Loading States */
.ar-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #3DD8B6;
  font-weight: 600;
}

.ar-loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 28, 46, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
}

.ar-loading-content {
  text-align: center;
  color: white;
}

.ar-loading-spinner {
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
  border: 4px solid rgba(61, 216, 182, 0.2);
  border-top-color: #3DD8B6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Model Viewer Specific */
.ar-model-viewer {
  --poster-color: transparent;
}

/* Responsive */
@media (max-width: 768px) {
  .ar-controls-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .ar-status-indicators {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .ar-model-overlay {
    width: 90vw;
    height: 60vh;
  }
}