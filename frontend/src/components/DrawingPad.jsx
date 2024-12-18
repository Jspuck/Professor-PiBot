import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import { MathJax } from 'better-react-mathjax';
import API_BASE_URL from '../apiConfig'; // Import API base URL

const DrawingPad = ({ setResponse, setLatexPreview, onInputChange }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [ctx, setCtx] = useState(null);
    const [drawing, setDrawing] = useState(false);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        const updateCanvasSize = () => {
            const containerWidth = containerRef.current?.offsetWidth || 800;
            const devicePixelRatio = window.devicePixelRatio || 1;

            const width = Math.min(containerWidth, 800); // Max width of 800px
            const height = 200;

            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            canvas.width = width * devicePixelRatio;
            canvas.height = height * devicePixelRatio;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            context.scale(devicePixelRatio, devicePixelRatio);

            // Set drawing styles
            context.lineWidth = 2;
            context.lineCap = 'round';
            context.strokeStyle = 'black';

            setCtx(context);
        };

        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);

        return () => {
            window.removeEventListener('resize', updateCanvasSize);
        };
    }, []);

    const getPosition = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        if (e.touches) {
            const touch = e.touches[0];
            return {
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top,
            };
        }
        return {
            x: e.nativeEvent.offsetX,
            y: e.nativeEvent.offsetY,
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
            console.log('DrawingPad latex output:', latexOutput);

            onInputChange(latexOutput);
            setLatexPreview(latexOutput);
            setPreview(latexOutput);
        } catch (error) {
            console.error('Error processing drawing:', error);
            setResponse('Error processing your drawing');
        }
    };

    return (
        <div ref={containerRef} className="w-full max-w-3xl mx-auto flex flex-col items-center gap-4">
            <canvas
                ref={canvasRef}
                className="border border-gray-700 bg-white touch-none"
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
                    <div className="flex gap-4">
                        <div className="px-4 py-2 border border-gray-300 rounded-lg bg-blue-100 text-blue-700">
                            <span>Detected: {preview}</span>
                        </div>
                        <div className="px-4 py-2 border border-gray-300 rounded-lg bg-blue-100 text-blue-700">
                            <MathJax>{`$$${preview}$$`}</MathJax>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DrawingPad;
