import React, { useEffect, useRef } from 'react';

export const ThreeDBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse interactive coordinates
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0.002;
    let targetRotationY = 0.003;
    let rotationX = 0.002;
    let rotationY = 0.003;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX - width / 2) / (width / 2);
      mouseY = (e.clientY - height / 2) / (height / 2);
      
      // Update target rotation speeds based on mouse position
      targetRotationY = mouseX * 0.008;
      targetRotationX = mouseY * 0.008;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // 3D Point class
    interface Point3D {
      x: number;
      y: number;
      z: number;
      ox: number; // original coords for wave calculations
      oy: number;
      oz: number;
    }

    // Create a beautiful 3D mesh (either a sphere, wave, or grid)
    // We'll create a 3D grid surface (wave) that looks like a high-tech topography, plus a rotating wireframe torus/sphere.
    const points: Point3D[] = [];
    const rows = 14;
    const cols = 14;
    const spacing = 75;

    // Generate terrain grid
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = (c - cols / 2) * spacing;
        const z = (r - rows / 2) * spacing;
        const y = 0; // modulated in the animation loop
        points.push({ x, y, z, ox: x, oy: y, oz: z });
      }
    }

    // Generate a beautiful floating wireframe geometric object (icosahedron or torus knot)
    const floatPoints: Point3D[] = [];
    const sphereRadius = 180;
    const latCount = 8;
    const lonCount = 12;

    for (let i = 0; i < latCount; i++) {
      const lat = (Math.PI * i) / (latCount - 1) - Math.PI / 2;
      for (let j = 0; j < lonCount; j++) {
        const lon = (2 * Math.PI * j) / lonCount;
        const x = sphereRadius * Math.cos(lat) * Math.cos(lon) + width * 0.25; // Offset to side
        const y = sphereRadius * Math.sin(lat);
        const z = sphereRadius * Math.cos(lat) * Math.sin(lon);
        floatPoints.push({ x, y, z, ox: x, oy: y, oz: z });
      }
    }

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smoothly interpolate rotation to prevent sudden jumps
      rotationX += (targetRotationX - rotationX) * 0.05;
      rotationY += (targetRotationY - rotationY) * 0.05;

      time += 0.008;

      // 1. Draw Waving Topography Grid
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.06)'; // Subtle blue grid lines
      ctx.lineWidth = 1;

      // Wave physics & Projection
      const projected: { x: number; y: number; opacity: number }[] = [];

      points.forEach((p) => {
        // Create wave motion
        const dist = Math.sqrt(p.ox * p.ox + p.oz * p.oz);
        p.y = Math.sin(dist * 0.01 - time * 2) * 40 + Math.cos(p.ox * 0.005 + time) * 20;

        // 3D rotation calculations (Y and X axis)
        // Y-axis rotation
        let x1 = p.ox * Math.cos(rotationY * 5) - p.oz * Math.sin(rotationY * 5);
        let z1 = p.ox * Math.sin(rotationY * 5) + p.oz * Math.cos(rotationY * 5);
        // X-axis rotation
        let y2 = p.y * Math.cos(rotationX * 5) - z1 * Math.sin(rotationX * 5);
        let z2 = p.y * Math.sin(rotationX * 5) + z1 * Math.cos(rotationX * 5);

        // Perspective projection
        const cameraDistance = 1000;
        const perspective = cameraDistance / (cameraDistance + z2);
        
        // Center of screen translation + slight tilt downwards
        const projX = width / 2 + x1 * perspective;
        const projY = height * 0.7 + y2 * perspective; // pushed down a bit
        
        // Depth-based opacity
        const opacity = Math.max(0, Math.min(1, (600 - z2) / 1000)) * 0.25;

        projected.push({ x: projX, y: projY, opacity });
      });

      // Draw horizontal and vertical grid lines
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          const current = projected[idx];

          if (!current) continue;

          // Connect horizontal (right)
          if (c < cols - 1) {
            const right = projected[idx + 1];
            if (right) {
              ctx.beginPath();
              ctx.strokeStyle = `rgba(37, 99, 235, ${Math.min(current.opacity, right.opacity) * 0.15})`;
              ctx.moveTo(current.x, current.y);
              ctx.lineTo(right.x, right.y);
              ctx.stroke();
            }
          }

          // Connect vertical (down)
          if (r < rows - 1) {
            const down = projected[idx + cols];
            if (down) {
              ctx.beginPath();
              ctx.strokeStyle = `rgba(37, 99, 235, ${Math.min(current.opacity, down.opacity) * 0.15})`;
              ctx.moveTo(current.x, current.y);
              ctx.lineTo(down.x, down.y);
              ctx.stroke();
            }
          }

          // Draw node points
          ctx.beginPath();
          ctx.arc(current.x, current.y, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(59, 130, 246, ${current.opacity * 0.4})`;
          ctx.fill();
        }
      }

      // 2. Draw Floating Wireframe 3D Sphere/Globe on the top right
      const centerSphereX = width * 0.85;
      const centerSphereY = height * 0.3;
      const globeProjected: { x: number; y: number; z: number }[] = [];

      floatPoints.forEach((p) => {
        // Rotation around sphere center
        const sTime = time * 0.5;
        let x1 = p.ox - width * 0.25; // restore original local offsets
        let y1 = p.oy;
        let z1 = p.oz;

        // Auto rotation + User drag inertia
        const cosY = Math.cos(sTime + rotationY);
        const sinY = Math.sin(sTime + rotationY);
        const cosX = Math.cos(sTime * 0.7 + rotationX);
        const sinX = Math.sin(sTime * 0.7 + rotationX);

        // Rotate Y
        let rx1 = x1 * cosY - z1 * sinY;
        let rz1 = x1 * sinY + z1 * cosY;
        // Rotate X
        let ry2 = y1 * cosX - rz1 * sinX;
        let rz2 = y1 * sinX + rz1 * cosX;

        // Add 3D wave wobble to the globe points
        const wobble = Math.sin(p.ox * 0.05 + time * 4) * 5;
        rx1 += (rx1 / sphereRadius) * wobble;
        ry2 += (ry2 / sphereRadius) * wobble;

        // Projection
        const d = 500;
        const scale = d / (d + rz2);
        const px = centerSphereX + rx1 * scale;
        const py = centerSphereY + ry2 * scale;

        globeProjected.push({ x: px, y: py, z: rz2 });
      });

      // Draw Globe Connections
      ctx.lineWidth = 0.8;
      for (let i = 0; i < latCount; i++) {
        for (let j = 0; j < lonCount; j++) {
          const idx = i * lonCount + j;
          const current = globeProjected[idx];
          if (!current) continue;

          // Connect longitude lines (horizontal ring wraps)
          const nextLonIdx = i * lonCount + ((j + 1) % lonCount);
          const nextLon = globeProjected[nextLonIdx];
          if (nextLon) {
            const zAvg = (current.z + nextLon.z) / 2;
            const opacity = Math.max(0.01, Math.min(0.2, (180 - zAvg) / 360)) * 0.5;
            ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(current.x, current.y);
            ctx.lineTo(nextLon.x, nextLon.y);
            ctx.stroke();
          }

          // Connect latitude lines (vertical lines)
          if (i < latCount - 1) {
            const nextLatIdx = (i + 1) * lonCount + j;
            const nextLat = globeProjected[nextLatIdx];
            if (nextLat) {
              const zAvg = (current.z + nextLat.z) / 2;
              const opacity = Math.max(0.01, Math.min(0.2, (180 - zAvg) / 360)) * 0.5;
              ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
              ctx.beginPath();
              ctx.moveTo(current.x, current.y);
              ctx.lineTo(nextLat.x, nextLat.y);
              ctx.stroke();
            }
          }
        }
      }

      // Draw subtle nodes for Globe
      globeProjected.forEach((p) => {
        const opacity = Math.max(0.02, Math.min(0.4, (180 - p.z) / 360)) * 0.6;
        ctx.fillStyle = `rgba(139, 92, 246, ${opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Texture Overlay: Draw highly realistic micro-noise/sand grain pattern texture to make the 3G graphic incredibly elegant and printed-like
      const textSpacing = 4;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.015)'; // extremely light texture noise
      for (let x = 0; x < width; x += textSpacing + Math.random() * 4) {
        if (Math.random() > 0.4) {
          ctx.fillRect(x, Math.random() * height, 1, 1);
        }
      }

      // Draw an ambient background radial light
      const grad = ctx.createRadialGradient(width * 0.8, height * 0.2, 0, width * 0.8, height * 0.2, 500);
      grad.addColorStop(0, 'rgba(59, 130, 246, 0.04)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 w-full h-full mix-blend-multiply dark:mix-blend-screen opacity-70"
      style={{ backfaceVisibility: 'hidden' }}
    />
  );
};
