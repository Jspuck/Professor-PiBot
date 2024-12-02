import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import API_BASE_URL from '../apiConfig'; // Import API base URL

const DrawingPad = ({ setResponse, setLatexPreview, onInputChange }) => {
    const canvasRef = useRef(null);
    const [ctx, setCtx] = useState(null);
    const [drawing, setDrawing] = useState(false);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        setCtx(context);

        // Set up canvas for better touch experience
        const devicePixelRatio = window.devicePixelRatio || 1;
        canvas.width = canvas.offsetWidth * devicePixelRatio;
        canvas.height = canvas.offsetHeight * devicePixelRatio;
        context.scale(devicePixelRatio, devicePixelRatio);
        context.lineWidth = 2;
        context.lineCap = 'round';
        context.strokeStyle = 'black';
    }, []);

    const getTouchPos = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const touch = e.touches[0];
        return {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top,
        };
    };

    const startDrawing = (e) => {
        e.preventDefault();
        setDrawing(true);

        const { x, y } = e.touches ? getTouchPos(e) : { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e) => {
        if (!drawing) return;

        e.preventDefault();
        const { x, y } = e.touches ? getTouchPos(e) : { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
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
        <div className="flex flex-col items-center gap-4">
            <canvas
                ref={canvasRef}
                width={800}
                height={400}
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
