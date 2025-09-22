// WebRTC service for video consultation
// This is a simplified implementation for demonstration purposes

// Configuration for STUN servers (helps with NAT traversal)
const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

// Store active connections
let peerConnection = null;
let localStream = null;
let remoteStream = null;

/**
 * Initialize local media stream with audio and video
 * @param {Object} constraints - Media constraints
 * @returns {Promise<MediaStream>} - Local media stream
 */
export const initLocalStream = async (constraints = { video: true, audio: true }) => {
  try {
    localStream = await navigator.mediaDevices.getUserMedia(constraints);
    return localStream;
  } catch (error) {
    console.error('Error accessing media devices:', error);
    throw error;
  }
};

/**
 * Create a new RTCPeerConnection
 * @returns {RTCPeerConnection} - The created peer connection
 */
export const createPeerConnection = () => {
  if (peerConnection) {
    console.warn('Peer connection already exists');
    return peerConnection;
  }

  peerConnection = new RTCPeerConnection(configuration);
  
  // Add local tracks to the peer connection
  if (localStream) {
    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });
  }

  // Set up remote stream
  remoteStream = new MediaStream();
  
  // Handle incoming tracks
  peerConnection.ontrack = (event) => {
    event.streams[0].getTracks().forEach(track => {
      remoteStream.addTrack(track);
    });
  };

  // Handle ICE candidates
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      // In a real app, you would send this candidate to the remote peer
      console.log('New ICE candidate:', event.candidate);
    }
  };

  // Connection state changes
  peerConnection.onconnectionstatechange = () => {
    console.log('Connection state:', peerConnection.connectionState);
  };

  return peerConnection;
};

/**
 * Create an offer to initiate a connection
 * @returns {Promise<RTCSessionDescription>} - The created offer
 */
export const createOffer = async () => {
  if (!peerConnection) {
    throw new Error('Peer connection not initialized');
  }

  try {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    return offer;
  } catch (error) {
    console.error('Error creating offer:', error);
    throw error;
  }
};

/**
 * Handle an incoming offer
 * @param {RTCSessionDescription} offer - The received offer
 * @returns {Promise<RTCSessionDescription>} - The created answer
 */
export const handleOffer = async (offer) => {
  if (!peerConnection) {
    throw new Error('Peer connection not initialized');
  }

  try {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    return answer;
  } catch (error) {
    console.error('Error handling offer:', error);
    throw error;
  }
};

/**
 * Handle an incoming answer
 * @param {RTCSessionDescription} answer - The received answer
 */
export const handleAnswer = async (answer) => {
  if (!peerConnection) {
    throw new Error('Peer connection not initialized');
  }

  try {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  } catch (error) {
    console.error('Error handling answer:', error);
    throw error;
  }
};

/**
 * Handle an incoming ICE candidate
 * @param {RTCIceCandidate} candidate - The received ICE candidate
 */
export const handleIceCandidate = async (candidate) => {
  if (!peerConnection) {
    throw new Error('Peer connection not initialized');
  }

  try {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (error) {
    console.error('Error handling ICE candidate:', error);
    throw error;
  }
};

/**
 * Get the remote stream
 * @returns {MediaStream} - The remote media stream
 */
export const getRemoteStream = () => {
  return remoteStream;
};

/**
 * Toggle audio mute state
 * @returns {boolean} - New mute state
 */
export const toggleAudio = () => {
  if (!localStream) return false;
  
  const audioTrack = localStream.getAudioTracks()[0];
  if (!audioTrack) return false;
  
  audioTrack.enabled = !audioTrack.enabled;
  return audioTrack.enabled;
};

/**
 * Toggle video mute state
 * @returns {boolean} - New video state
 */
export const toggleVideo = () => {
  if (!localStream) return false;
  
  const videoTrack = localStream.getVideoTracks()[0];
  if (!videoTrack) return false;
  
  videoTrack.enabled = !videoTrack.enabled;
  return videoTrack.enabled;
};

/**
 * Share screen instead of camera
 * @returns {Promise<void>}
 */
export const toggleScreenShare = async () => {
  if (!peerConnection) {
    throw new Error('Peer connection not initialized');
  }

  // Check if we're currently sharing screen
  const isScreenSharing = localStream.getVideoTracks()[0]?.label.includes('screen');

  // Remove all existing senders
  const senders = peerConnection.getSenders();
  senders.forEach(sender => {
    peerConnection.removeTrack(sender);
  });

  // Stop all tracks
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
  }

  try {
    if (isScreenSharing) {
      // Switch back to camera
      localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } else {
      // Switch to screen sharing
      localStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      
      // Add audio from user media
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      audioStream.getAudioTracks().forEach(track => {
        localStream.addTrack(track);
      });
    }

    // Add new tracks to peer connection
    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });

    return !isScreenSharing;
  } catch (error) {
    console.error('Error toggling screen share:', error);
    throw error;
  }
};

/**
 * End the call and clean up resources
 */
export const endCall = () => {
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }

  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }

  remoteStream = null;
};