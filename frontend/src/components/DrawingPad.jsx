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
    }, []);

    const startDrawing = (e) => {
        setDrawing(true);
        ctx.beginPath();
        ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    };

    const draw = (e) => {
        if (!drawing) return;
        ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        ctx.stroke();
    };

    const stopDrawing = () => {
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
            const response = await axios.post(`${API_BASE_URL}/api/process-drawing`, { // Updated URL
                src: image,
                formats: ['latex_styled'],
                data_options: { include_asciimath: true }
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
                height={200}
                className="border border-gray-700 bg-white"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                touchstart={startDrawing}
                touchmove={draw}
                touchend={stopDrawing}
                touchcancel={stopDrawing}
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
