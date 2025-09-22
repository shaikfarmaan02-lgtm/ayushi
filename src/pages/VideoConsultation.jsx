import React from 'react';
import { useParams } from 'react-router-dom';
import VideoCall from '../components/VideoCall';

function VideoConsultation() {
  const { appointmentId } = useParams();
  
  return <VideoCall />;
}

export default VideoConsultation;