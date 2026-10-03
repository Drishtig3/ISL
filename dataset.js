/**
 * PRE-TRAINED ISL BENCHMARK DATASET & FEATURE EXTRACTOR
 * Scale-invariant, translation-invariant landmark coordinates and joint angles.
 */

// Function to extract normalized 63D vector + finger extension ratios from 21 MediaPipe landmarks
function extractLandmarkFeatures(landmarks) {
  if (!landmarks || landmarks.length < 21) return null;

  const wrist = landmarks[0];
  const middleMcp = landmarks[9];
  
  // Base scale is distance between wrist (0) and middle finger MCP (9)
  const palmScale = Math.hypot(middleMcp.x - wrist.x, middleMcp.y - wrist.y, (middleMcp.z || 0) - (wrist.z || 0)) || 0.1;

  const normalizedVector = [];
  
  // 1. Normalized Relative Coordinates (21 points * 3 = 63 features)
  for (let i = 0; i < 21; i++) {
    normalizedVector.push(
      (landmarks[i].x - wrist.x) / palmScale,
      (landmarks[i].y - wrist.y) / palmScale,
      ((landmarks[i].z || 0) - (wrist.z || 0)) / palmScale
    );
  }

  // 2. Compute fingertip to wrist distance ratios
  const thumbTipDist = Math.hypot(landmarks[4].x - wrist.x, landmarks[4].y - wrist.y) / palmScale;
  const indexTipDist = Math.hypot(landmarks[8].x - wrist.x, landmarks[8].y - wrist.y) / palmScale;
  const middleTipDist = Math.hypot(landmarks[12].x - wrist.x, landmarks[12].y - wrist.y) / palmScale;
  const ringTipDist = Math.hypot(landmarks[16].x - wrist.x, landmarks[16].y - wrist.y) / palmScale;
  const pinkyTipDist = Math.hypot(landmarks[20].x - wrist.x, landmarks[20].y - wrist.y) / palmScale;

  // 3. Fingertip elevation relative to respective MCP joint (negative in screen coordinates means higher up)
  const isIndexUp = landmarks[8].y < landmarks[6].y;
  const isMiddleUp = landmarks[12].y < landmarks[10].y;
  const isRingUp = landmarks[16].y < landmarks[14].y;
  const isPinkyUp = landmarks[20].y < landmarks[18].y;
  const isThumbUp = landmarks[4].y < landmarks[2].y;

  // 4. Inter-finger distances
  const thumbIndexDist = Math.hypot(landmarks[4].x - landmarks[8].x, landmarks[4].y - landmarks[8].y) / palmScale;
  const indexMiddleDist = Math.hypot(landmarks[8].x - landmarks[12].x, landmarks[8].y - landmarks[12].y) / palmScale;

  return {
    vector: normalizedVector,
    dists: [thumbTipDist, indexTipDist, middleTipDist, ringTipDist, pinkyTipDist],
    ups: [isThumbUp, isIndexUp, isMiddleUp, isRingUp, isPinkyUp],
    interDists: [thumbIndexDist, indexMiddleDist]
  };
}

// Compute Euclidean distance between two 63D normalized vectors
function calculateVectorDistance(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < vecA.length; i++) {
    const diff = vecA[i] - vecB[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

// Built-in Seed Benchmark Sign Templates
const DEFAULT_PRETRAINED_SAMPLES = [
  // Namaste (Open Palm / Greeting)
  {
    label: 'Namaste',
    hindi: 'नमस्ते',
    english: 'Hello / Greeting',
    category: 'common',
    ups: [true, true, true, true, true],
    dists: [1.3, 2.1, 2.3, 2.1, 1.8],
    interDists: [0.6, 0.2]
  },
  // Haan (Thumbs Up / Yes)
  {
    label: 'Haan',
    hindi: 'हाँ',
    english: 'Yes / Agree',
    category: 'common',
    ups: [true, false, false, false, false],
    dists: [1.4, 0.9, 0.9, 0.8, 0.8],
    interDists: [0.8, 0.15]
  },
  // Nahi (Thumbs Down / No)
  {
    label: 'Nahi',
    hindi: 'नहीं',
    english: 'No / Disagree',
    category: 'common',
    ups: [false, false, false, false, false],
    dists: [0.7, 0.9, 0.9, 0.8, 0.8],
    interDists: [0.8, 0.15]
  },
  // 1 (Index Finger / One)
  {
    label: '1 (Index Finger)',
    hindi: 'एक / यह',
    english: 'One / Pointing',
    category: 'numbers',
    ups: [false, true, false, false, false],
    dists: [0.8, 2.1, 0.9, 0.8, 0.8],
    interDists: [0.9, 1.2]
  },
  // Peace / Two
  {
    label: 'Peace / Two',
    hindi: 'दो / शांति',
    english: 'Two (2) / Peace',
    category: 'numbers',
    ups: [false, true, true, false, false],
    dists: [0.8, 2.1, 2.2, 0.8, 0.8],
    interDists: [0.9, 0.6]
  },
  // Three (3)
  {
    label: 'Three (3)',
    hindi: 'तीन',
    english: 'Three',
    category: 'numbers',
    ups: [false, true, true, true, false],
    dists: [0.8, 2.1, 2.2, 2.0, 0.8],
    interDists: [0.9, 0.3]
  },
  // Four (4)
  {
    label: 'Four (4)',
    hindi: 'चार',
    english: 'Four',
    category: 'numbers',
    ups: [false, true, true, true, true],
    dists: [0.7, 2.1, 2.2, 2.0, 1.8],
    interDists: [0.9, 0.3]
  },
  // Five (5)
  {
    label: 'Five (5)',
    hindi: 'पाँच',
    english: 'Five',
    category: 'numbers',
    ups: [true, true, true, true, true],
    dists: [1.6, 2.1, 2.3, 2.1, 1.9],
    interDists: [0.9, 0.5]
  },
  // OK / Perfect
  {
    label: 'OK / Perfect',
    hindi: 'बढ़िया / उत्तम',
    english: 'Superb / OK',
    category: 'common',
    ups: [false, false, true, true, true],
    dists: [1.1, 1.1, 2.2, 2.1, 1.9],
    interDists: [0.12, 1.1]
  },
  // I Love You
  {
    label: 'I Love You',
    hindi: 'प्यार',
    english: 'I Love You',
    category: 'common',
    ups: [true, true, false, false, true],
    dists: [1.5, 2.1, 0.9, 0.8, 1.8],
    interDists: [0.9, 1.3]
  },
  // Call Me / Phone
  {
    label: 'Call Me',
    hindi: 'फोन करो',
    english: 'Call Me',
    category: 'common',
    ups: [true, false, false, false, true],
    dists: [1.5, 0.9, 0.9, 0.8, 1.8],
    interDists: [1.4, 0.15]
  },
  // Fist / Mutthi
  {
    label: 'Fist / Mutthi',
    hindi: 'मुट्ठी',
    english: 'Fist / Power',
    category: 'alphabets',
    ups: [false, false, false, false, false],
    dists: [0.8, 0.9, 0.9, 0.8, 0.7],
    interDists: [0.3, 0.15]
  },
  // Madad / Help
  {
    label: 'Madad / Help',
    hindi: 'मदद',
    english: 'Help / Emergency',
    category: 'emergency',
    ups: [true, false, false, false, false],
    dists: [1.4, 0.9, 0.9, 0.8, 0.8],
    interDists: [0.6, 0.15]
  },
  // Dhanyawad / Thanks
  {
    label: 'Dhanyawad',
    hindi: 'धन्यवाद',
    english: 'Thank You',
    category: 'common',
    ups: [true, true, true, true, true],
    dists: [1.2, 2.0, 2.1, 2.0, 1.7],
    interDists: [0.4, 0.15]
  },
  // Paani / Water
  {
    label: 'Paani / Water',
    hindi: 'पानी',
    english: 'Water',
    category: 'emergency',
    ups: [false, true, true, true, false],
    dists: [0.8, 2.0, 2.1, 2.0, 0.8],
    interDists: [0.8, 0.4]
  },
  // Khana / Food
  {
    label: 'Khana / Food',
    hindi: 'खाना',
    english: 'Food',
    category: 'common',
    ups: [false, false, false, false, false],
    dists: [0.9, 1.0, 1.0, 0.9, 0.8],
    interDists: [0.15, 0.1]
  }
];

if (typeof window !== 'undefined') {
  window.extractLandmarkFeatures = extractLandmarkFeatures;
  window.calculateVectorDistance = calculateVectorDistance;
  window.DEFAULT_PRETRAINED_SAMPLES = DEFAULT_PRETRAINED_SAMPLES;
}
