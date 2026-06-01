export interface Point {
  x: number;
  y: number;
}

export interface Quad {
  topLeft: Point;
  topRight: Point;
  bottomRight: Point;
  bottomLeft: Point;
}

/**
 * Solves a system of linear equations Ax = B using Gaussian elimination.
 * @param A Coeffs matrix (N x N)
 * @param B Target vector (N)
 */
export function solveLinearSystem(A: number[][], B: number[]): number[] {
  const n = B.length;
  
  // Forward elimination
  for (let i = 0; i < n; i++) {
    // Search for maximum element in current column
    let maxEl = Math.abs(A[i][i]);
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > maxEl) {
        maxEl = Math.abs(A[k][i]);
        maxRow = k;
      }
    }

    // Swap maximum row with current row
    const tempRow = A[maxRow];
    A[maxRow] = A[i];
    A[i] = tempRow;
    
    const tempB = B[maxRow];
    B[maxRow] = B[i];
    B[i] = tempB;

    // Singular matrix check
    if (Math.abs(A[i][i]) < 1e-12) {
      throw new Error('Linear system is singular or poorly conditioned.');
    }

      // Eliminate column elements below pivot
      for (let k = i + 1; k < n; k++) {
        const c = -A[k][i] / A[i][i];
        for (let j = i; j < n; j++) {
          if (i === j) {
            A[k][j] = 0;
          } else {
            A[k][j] += c * A[i][j];
          }
        }
        B[k] += c * B[i];
      }
  }

  // Back substitution
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = B[i] / A[i][i];
    for (let k = i - 1; k >= 0; k--) {
      B[k] -= A[k][i] * x[i];
    }
  }
  return x;
}

/**
 * Computes the 3x3 homography matrix H mapping src points to dst points.
 * H maps: (u_i, v_i) -> (x_i, y_i)
 * The returned matrix contains 9 elements: [h00, h01, h02, h10, h11, h12, h20, h21, 1]
 */
export function getHomographyMatrix(src: Point[], dst: Point[]): number[] {
  const A: number[][] = [];
  const B: number[] = [];

  for (let i = 0; i < 4; i++) {
    const u = src[i].x;
    const v = src[i].y;
    const x = dst[i].x;
    const y = dst[i].y;

    A.push([u, v, 1, 0, 0, 0, -u * x, -v * x]);
    B.push(x);

    A.push([0, 0, 0, u, v, 1, -u * y, -v * y]);
    B.push(y);
  }

  const h = solveLinearSystem(A, B);
  return [...h, 1]; // h22 is normalized to 1
}

/**
 * Returns a CSS matrix3d string mapping a source box of srcWidth x srcHeight
 * to the given destination quadrilateral (targetQuad).
 */
export function getCssMatrix3D(srcWidth: number, srcHeight: number, dstQuad: Quad): string {
  const srcPoints: Point[] = [
    { x: 0, y: 0 },
    { x: srcWidth, y: 0 },
    { x: srcWidth, y: srcHeight },
    { x: 0, y: srcHeight },
  ];
  
  const dstPoints: Point[] = [
    dstQuad.topLeft,
    dstQuad.topRight,
    dstQuad.bottomRight,
    dstQuad.bottomLeft,
  ];

  try {
    const h = getHomographyMatrix(srcPoints, dstPoints);
    
    // CSS matrix3d is column-major order:
    // [ h00, h10,  0 , h20 ]
    // [ h01, h11,  0 , h21 ]
    // [  0 ,  0 ,  1 ,  0  ]
    // [ h02, h12,  0 ,  1  ]
    //
    // values: m00, m10, m20, m30, m01, m11, m21, m31, m02, m12, m22, m32, m03, m13, m23, m33
    const m00 = h[0];
    const m10 = h[3];
    const m20 = 0;
    const m30 = h[6];

    const m01 = h[1];
    const m11 = h[4];
    const m21 = 0;
    const m31 = h[7];

    const m02 = 0;
    const m12 = 0;
    const m22 = 1;
    const m32 = 0;

    const m03 = h[2];
    const m13 = h[5];
    const m23 = 0;
    const m33 = h[8];

    return `matrix3d(${m00}, ${m10}, ${m20}, ${m30}, ${m01}, ${m11}, ${m21}, ${m31}, ${m02}, ${m12}, ${m22}, ${m32}, ${m03}, ${m13}, ${m23}, ${m33})`;
  } catch (error) {
    console.error('Failed to calculate homography matrix for CSS:', error);
    return 'none';
  }
}

/**
 * Warps a source ImageData onto a destination ImageData quadrilateral region
 * using inverse homography and bilinear interpolation.
 */
export function warpImageBilinear(
  srcData: ImageData,
  dstData: ImageData,
  dstQuad: Quad,
  borderRadius: number[] = [0, 0, 0, 0]
): void {
  const sw = srcData.width;
  const sh = srcData.height;
  const dw = dstData.width;
  const dh = dstData.height;

  // Destination points
  const dstPoints: Point[] = [
    dstQuad.topLeft,
    dstQuad.topRight,
    dstQuad.bottomRight,
    dstQuad.bottomLeft,
  ];

  // Source points corresponding to design corners
  const srcPoints: Point[] = [
    { x: 0, y: 0 },
    { x: sw - 1, y: 0 },
    { x: sw - 1, y: sh - 1 },
    { x: 0, y: sh - 1 },
  ];

  // Solve homography dst -> src (inverse mapping matrix)
  // Maps: (x, y)_dst -> (u, v)_src
  let a: number[];
  try {
    a = getHomographyMatrix(dstPoints, srcPoints);
  } catch (error) {
    console.error('Failed to calculate inverse homography for warp:', error);
    return;
  }

  // Bounding box of target quadrilateral on the mockup
  const xs = [dstQuad.topLeft.x, dstQuad.topRight.x, dstQuad.bottomRight.x, dstQuad.bottomLeft.x];
  const ys = [dstQuad.topLeft.y, dstQuad.topRight.y, dstQuad.bottomRight.y, dstQuad.bottomLeft.y];

  const minX = Math.max(0, Math.floor(Math.min(...xs)));
  const maxX = Math.min(dw - 1, Math.ceil(Math.max(...xs)));
  const minY = Math.max(0, Math.floor(Math.min(...ys)));
  const maxY = Math.min(dh - 1, Math.ceil(Math.max(...ys)));

  const srcPixels = srcData.data;
  const dstPixels = dstData.data;

  const [rTL, rTR, rBR, rBL] = borderRadius;

  // Helper to check if a point is inside a rounded corner
  const isInsideCorner = (u: number, v: number, cx: number, cy: number, r: number) => {
    return (u - cx) * (u - cx) + (v - cy) * (v - cy) <= r * r;
  };

  // Warp pixel-by-pixel
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const den = a[6] * x + a[7] * y + 1;
      if (Math.abs(den) < 1e-10) continue;

      const u = (a[0] * x + a[1] * y + a[2]) / den;
      const v = (a[3] * x + a[4] * y + a[5]) / den;

      // Inside source image check
      if (u >= 0 && u <= sw - 1 && v >= 0 && v <= sh - 1) {
        
        // Corner clipping check
        let clipped = false;
        if (rTL > 0 && u < rTL && v < rTL && !isInsideCorner(u, v, rTL, rTL, rTL)) clipped = true;
        else if (rTR > 0 && u > sw - 1 - rTR && v < rTR && !isInsideCorner(u, v, sw - 1 - rTR, rTR, rTR)) clipped = true;
        else if (rBR > 0 && u > sw - 1 - rBR && v > sh - 1 - rBR && !isInsideCorner(u, v, sw - 1 - rBR, sh - 1 - rBR, rBR)) clipped = true;
        else if (rBL > 0 && u < rBL && v > sh - 1 - rBL && !isInsideCorner(u, v, rBL, sh - 1 - rBL, rBL)) clipped = true;

        if (clipped) continue;

        const uf = Math.floor(u);
        const vf = Math.floor(v);
        const uc = Math.min(sw - 1, uf + 1);
        const vc = Math.min(sh - 1, vf + 1);

        const wx = u - uf;
        const wy = v - vf;

        // Pixel indices in source data (R, G, B, A)
        const i00 = (vf * sw + uf) * 4;
        const i10 = (vf * sw + uc) * 4;
        const i01 = (vc * sw + uf) * 4;
        const i11 = (vc * sw + uc) * 4;

        // Bilinear interpolation for each channel
        for (let ch = 0; ch < 4; ch++) {
          const c00 = srcPixels[i00 + ch];
          const c10 = srcPixels[i10 + ch];
          const c01 = srcPixels[i01 + ch];
          const c11 = srcPixels[i11 + ch];

          const cTop = c00 * (1 - wx) + c10 * wx;
          const cBot = c01 * (1 - wx) + c11 * wx;
          const cFinal = cTop * (1 - wy) + cBot * wy;

          const dstIdx = (y * dw + x) * 4;
          
          // Simple alpha blending to handle semi-transparent corners or edges
          if (ch === 3) {
            dstPixels[dstIdx + ch] = Math.round(cFinal);
          } else {
            // Apply source color
            dstPixels[dstIdx + ch] = Math.round(cFinal);
          }
        }
      }
    }
  }
}
