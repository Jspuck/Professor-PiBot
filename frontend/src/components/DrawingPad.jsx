import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import { MathJax} from 'better-react-mathjax';
import API_BASE_URL from '../apiConfig';

const DrawingPad = ({ setResponse, setLatexPreview, onInputChange }) => {
  const canvasRef = useRef(null);
  const [ctx, setCtx] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    setCtx(context);

    const devicePixelRatio = window.devicePixelRatio || 1;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      const canvasWidth = parent.offsetWidth;
      const canvasHeight = parent.offsetHeight * 0.5;

      canvas.width = canvasWidth * devicePixelRatio;
      canvas.height = canvasHeight * devicePixelRatio;
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;

      context.scale(devicePixelRatio, devicePixelRatio);
      context.lineWidth = 2;
      context.lineCap = 'round';
      context.strokeStyle = 'black';
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const getPosition = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width; // Calculate horizontal scale factor
    const scaleY = canvasRef.current.height / rect.height; // Calculate vertical scale factor
  
    if (e.touches) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
  
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };
  

  const startDrawing = (e) => {
    e.preventDefault();
    setDrawing(true);

    const { x, y } = getPosition(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!drawing) return;
    e.preventDefault();

    const { x, y } = getPosition(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e) => {
    e.preventDefault();
    setDrawing(false);
    ctx.closePath();
  };

  const clearCanvas = () => {
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    onInputChange('');
    setPreview(null);
  };

  const previewDrawing = async () => {
    const image = canvasRef.current.toDataURL('image/png');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/process-drawing`, {
        src: image,
        formats: ['latex_styled'],
        data_options: { include_asciimath: true },
      });

      const latexOutput = response.data.latex_styled;
      onInputChange(latexOutput);
      setLatexPreview(latexOutput);
      setPreview(latexOutput);
    } catch (error) {
      console.error('Error processing drawing:', error);
      setResponse('Error processing your drawing');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4">
      <canvas
        ref={canvasRef}
        className="border border-gray-700 bg-white w-full h-auto max-w-full"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        onTouchCancel={stopDrawing}
      />
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={clearCanvas}
          className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
        >
          Clear Drawing
        </button>
        <button
          type="button"
          onClick={previewDrawing}
          className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600"
        >
          Preview
        </button>
        {preview && (
          <div className="px-4 py-2 border border-gray-300 rounded-lg bg-blue-100 text-blue-700">
            <MathJax>{`$$${preview}$$`}</MathJax>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrawingPad;
