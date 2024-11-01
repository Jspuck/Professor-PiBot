import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';

const DrawingPad = ({ setResponse, setLatexPreview }) => {
    const canvasRef = useRef(null);
    const [ctx, setCtx] = useState(null);
    const [drawing, setDrawing] = useState(false);

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
    };

    const submitDrawing = async () => {
        const image = canvasRef.current.toDataURL('image/png');
        try {
            const response = await axios.post('http://127.0.0.1:5000/api/process-drawing', {
                src: image,
                formats: ['text', 'latex_styled'],
                data_options: { include_asciimath: true }
            });

            const latexOutput = response.data.latex_styled;
            setLatexPreview(latexOutput);  // Update LaTeX preview in Input
            const aiResponse = await axios.post('http://127.0.0.1:5000/api/process', {
                input: latexOutput,
                submissionType: 'drawing'
            });

            displayResult(aiResponse.data);
        } catch (error) {
            console.error('Error submitting the drawing:', error);
            setResponse('Error processing your drawing');
        }
    };

    const displayResult = (result) => {
        if (result.response) {
            setResponse(result.response);
        } else {
            setResponse('No output received from AI.');
        }
    };

    return (
        <div>
            <canvas
                ref={canvasRef}
                width={400}
                height={400}
                style={{ border: '1px solid #000000' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
            />
            <br />
            <button onClick={clearCanvas}>Clear Drawing</button>
            <button onClick={submitDrawing}>Submit Drawing</button>
        </div>
    );
};

export default DrawingPad;

