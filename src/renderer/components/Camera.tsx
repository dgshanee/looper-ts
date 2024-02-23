import React, { useEffect, useRef, useState } from 'react';
const Camera = () => {
    const camRef = useRef<HTMLVideoElement | null>(null);
    const [camera, setCamera] = useState<MediaStream | null>(null);
    const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
    const [isRecording, setRecording] = useState<boolean>(false);
    const [videoData, setVideoData] = useState<Blob[]>([]);

    useEffect(() => {
        const getCamera = () => {
            navigator.mediaDevices.getUserMedia({ video : true })
            .then((stream) => {
                setCamera(stream);
                const recorder = new MediaRecorder(stream);
                recorder.ondataavailable = (e) => {
                    setVideoData((prev) => [...prev, e.data]);
                }

                setRecorder(recorder);
            })
            .catch((e) => {return <div>{e}</div>});
        }

        getCamera();
        if(camRef.current && camera){
            camRef.current.srcObject = camera;
        }

        return () => {
            videoData.forEach((blob) => URL.revokeObjectURL(URL.createObjectURL(blob)));
            if(camera){
                const tracks = camera?.getTracks();
                tracks.forEach((track) => {track.stop()});
            }
        }
    }, []);

    // useEffect(() => {
    //     if(recorder){
    //         recorder.ondataavailable = (blobEvent) => {
    //             console.log("logging");
    //             setVideoData((prev) => [...prev, blobEvent.data]);
    //         }
    //     }
    // }, []);

    const handleStart = () => {
        console.log("starting");
        setRecording(true);
        if(recorder){
            recorder.start();
            console.log(recorder.state);
        }
    }

    const handleStop = () => {
        console.log("stopping");
        setRecording(false);
        recorder!.stop();
        console.log(recorder!.state);
    }

    const handlePlayBack = () => {
        console.log(videoData.length);
        if(videoData.length > 0){
            console.log("playing back...");
            const videoBlob = new Blob(videoData, {
                type: 'video/webm',
            });
            const videoURL = URL.createObjectURL(videoBlob);

            if(camRef.current){
                camRef.current.srcObject = null;
                camRef.current.src = videoURL;
                camRef.current.loop = true;
                camRef.current.play();
            }
        }
    }

    return(
        <div>
            <video ref = {camRef} autoPlay></video>
            <button onClick = {handleStart} disabled = {isRecording}>Start recording</button>
            <button onClick={handleStop} disabled = {!isRecording}>Stop recording</button>
            <button onClick = {handlePlayBack} disabled = {isRecording}>Play loop</button>
        </div>
    )
}

export default Camera;