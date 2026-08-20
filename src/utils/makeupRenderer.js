/**
 * makeupRenderer.js
 *
 * WebGL makeup compositor. Ported from auramatchgenz (frontend/src/lib/makeupGL.ts).
 *
 * Why a shader instead of canvas `multiply`: a flat multiply tint erases the
 * skin's own shading — lips go poster-flat. The fragment shader recolors
 * instead: it keeps the photo's LUMINANCE (texture, shadows, highlights) and
 * takes hue/chroma from the product shade (an overlay-on-luma curve), then
 * feathers the mask edge with a 13-tap ring blur IN the shader. A subtle
 * gloss term brightens only the lips' existing specular highlights so shine
 * lands where the photo already has it.
 *
 * Masks ride ONE texture: lips in the RED channel, blush bloom in GREEN,
 * eyeshadow bands in BLUE (painted additively — the channels never mix).
 * Display/compositing ONLY.
 */

import { LIPS_OUTER, LIPS_INNER, toStagePoints, blushPlacements, eyeshadowRegions } from "./makeupGeometry";

/** Mask resolution cap — soft alpha upsamples fine, and it bounds texture memory. */
const MAX_MASK_DIM = 2048;
/** Photo texture / export cap; also clamped to the device's GL limits. */
const MAX_PHOTO_DIM = 4096;
/** Fixed specular sheen on lips (applied only where the photo already highlights). */
const LIP_GLOSS = 0.22;

const VERT_SRC = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG_SRC = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_photo;
uniform sampler2D u_mask;
uniform vec2 u_maskTexel;
uniform float u_feather;
uniform vec3 u_lipColor;
uniform float u_lipA;
uniform vec3 u_blushColor;
uniform float u_blushA;
uniform vec3 u_shadowColor;
uniform float u_shadowA;
uniform float u_gloss;

vec3 recolor(vec3 c, float luma) {
  vec3 lo = 2.0 * luma * c;
  vec3 hi = 1.0 - 2.0 * (1.0 - luma) * (1.0 - c);
  return mix(lo, hi, step(0.5, luma));
}

void main() {
  vec4 base = texture2D(u_photo, v_uv);
  vec3 m = texture2D(u_mask, v_uv).rgb;
  for (int i = 0; i < 12; i++) {
    float a = 0.5235988 * float(i);
    m += texture2D(u_mask, v_uv + vec2(cos(a), sin(a)) * u_maskTexel * u_feather).rgb;
  }
  m /= 13.0;

  float luma = dot(base.rgb, vec3(0.299, 0.587, 0.114));
  vec3 col = base.rgb;

  vec3 shadow = recolor(u_shadowColor, luma);
  col = mix(col, shadow, m.b * u_shadowA);

  vec3 lip = recolor(u_lipColor, luma) + u_gloss * smoothstep(0.72, 0.95, luma);
  col = mix(col, clamp(lip, 0.0, 1.0), m.r * u_lipA);

  vec3 blush = recolor(u_blushColor, luma);
  col = mix(col, blush, m.g * u_blushA);

  gl_FragColor = vec4(col, 1.0);
}
`;

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1, 7), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/**
 * Paint the coverage masks at photo aspect: lips (nonzero fill, inner ring
 * reversed so an open mouth stays untinted) into RED, blush radial blooms into
 * GREEN, eyeshadow lid bands into BLUE. Returns the shader feather radius too.
 */
export function paintMasks(landmarks, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d_unavailable");

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = "lighter";

  const outer = toStagePoints(landmarks, LIPS_OUTER, width, height);
  const inner = [...toStagePoints(landmarks, LIPS_INNER, width, height)].reverse();
  ctx.fillStyle = "#f00";
  ctx.beginPath();
  outer.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.closePath();
  inner.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.closePath();
  ctx.fill("nonzero");

  for (const b of blushPlacements(landmarks, width, height)) {
    const grad = ctx.createRadialGradient(b.center.x, b.center.y, 0, b.center.x, b.center.y, b.radius);
    grad.addColorStop(0, "rgba(0,255,0,1)");
    grad.addColorStop(1, "rgba(0,255,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(b.center.x, b.center.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const region of eyeshadowRegions(landmarks, width, height)) {
    const mid = (pts) => pts[Math.floor(pts.length / 2)];
    const from = mid(region.lower);
    const to = mid(region.upper);
    const grad = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
    grad.addColorStop(0, "rgba(0,0,255,0.95)");
    grad.addColorStop(1, "rgba(0,0,255,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    region.lower.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    [...region.upper].reverse().forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fill();
  }

  const faceWidth = Math.hypot(
    (landmarks[454].x - landmarks[234].x) * width,
    (landmarks[454].y - landmarks[234].y) * height
  );
  const featherPx = Math.min(14, Math.max(2, faceWidth * 0.015));
  return { canvas, featherPx };
}

export class MakeupRenderer {
  /** Throws when WebGL is unavailable — caller falls back to the 2D stage. */
  constructor(canvas) {
    const gl = canvas.getContext("webgl", {
      alpha: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: true, // required: toDataURL export after the draw call
    });
    if (!gl) throw new Error("webgl_unavailable");
    this.gl = gl;
    this.canvas = canvas;
    this.u = {};
    this.photoTex = null;
    this.maskTex = null;
    this.photoW = 0;
    this.photoH = 0;
    this.maskW = 1;
    this.maskH = 1;
    this.featherPx = 6;
    this.last = null;
    this.prog = this.buildProgram();

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(this.prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    for (const name of [
      "u_photo", "u_mask", "u_maskTexel", "u_feather", "u_lipColor", "u_lipA",
      "u_blushColor", "u_blushA", "u_shadowColor", "u_shadowA", "u_gloss",
    ]) {
      this.u[name] = gl.getUniformLocation(this.prog, name);
    }
  }

  buildProgram() {
    const gl = this.gl;
    const compile = (type, src) => {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("shader_alloc");
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(`shader_compile: ${gl.getShaderInfoLog(shader) ?? ""}`);
      }
      return shader;
    };
    const prog = gl.createProgram();
    if (!prog) throw new Error("program_alloc");
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT_SRC));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG_SRC));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error(`program_link: ${gl.getProgramInfoLog(prog) ?? ""}`);
    }
    gl.useProgram(prog);
    return prog;
  }

  /** NPOT-safe upload (CLAMP_TO_EDGE + LINEAR, no mips), y-flipped to match clip space. */
  upload(src) {
    const gl = this.gl;
    const tex = gl.createTexture();
    if (!tex) throw new Error("texture_alloc");
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return tex;
  }

  /** Upload the photo + paint/upload the landmark masks. Call once per capture. */
  setScene(image, landmarks) {
    const gl = this.gl;
    const viewport = gl.getParameter(gl.MAX_VIEWPORT_DIMS);
    const cap = Math.min(gl.getParameter(gl.MAX_TEXTURE_SIZE), viewport[0], viewport[1], MAX_PHOTO_DIM);

    let source = image;
    // image.naturalWidth/Height only exist on <img> — the source here can also
    // be a <canvas> (foundationTint.js's baked-in output), which uses width/height.
    let w = image.naturalWidth || image.width;
    let h = image.naturalHeight || image.height;
    const scale = Math.min(1, cap / Math.max(w, h));
    if (scale < 1) {
      const scaled = document.createElement("canvas");
      w = Math.round(w * scale);
      h = Math.round(h * scale);
      scaled.width = w;
      scaled.height = h;
      scaled.getContext("2d")?.drawImage(image, 0, 0, w, h);
      source = scaled;
    }
    this.photoW = w;
    this.photoH = h;
    if (this.photoTex) gl.deleteTexture(this.photoTex);
    this.photoTex = this.upload(source);

    const mScale = Math.min(1, MAX_MASK_DIM / Math.max(w, h));
    this.maskW = Math.max(1, Math.round(w * mScale));
    this.maskH = Math.max(1, Math.round(h * mScale));
    const { canvas: maskCanvas, featherPx } = paintMasks(landmarks, this.maskW, this.maskH);
    this.featherPx = featherPx;
    if (this.maskTex) gl.deleteTexture(this.maskTex);
    this.maskTex = this.upload(maskCanvas);
  }

  /** Composite with the given layer params into the canvas at its current size. */
  render(params) {
    this.last = params;
    this.draw();
  }

  /** Re-render at the photo's full (capped) resolution and export a PNG data URL. */
  exportPNG() {
    if (!this.last || !this.photoW) return null;
    const { canvas } = this;
    const prevW = canvas.width;
    const prevH = canvas.height;
    canvas.width = this.photoW;
    canvas.height = this.photoH;
    this.draw();
    const url = canvas.toDataURL("image/png");
    canvas.width = prevW;
    canvas.height = prevH;
    this.draw();
    return url;
  }

  dispose() {
    const gl = this.gl;
    if (this.photoTex) gl.deleteTexture(this.photoTex);
    if (this.maskTex) gl.deleteTexture(this.maskTex);
    gl.deleteProgram(this.prog);
  }

  draw() {
    const gl = this.gl;
    const p = this.last;
    if (!p || !this.photoTex || !this.maskTex) return;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.useProgram(this.prog);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.photoTex);
    gl.uniform1i(this.u.u_photo, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.maskTex);
    gl.uniform1i(this.u.u_mask, 1);

    gl.uniform2f(this.u.u_maskTexel, 1 / this.maskW, 1 / this.maskH);
    gl.uniform1f(this.u.u_feather, this.featherPx);
    gl.uniform3fv(this.u.u_lipColor, hexToRgb(p.lips.color));
    gl.uniform1f(this.u.u_lipA, p.lips.enabled ? p.lips.intensity : 0);
    gl.uniform3fv(this.u.u_blushColor, hexToRgb(p.blush.color));
    gl.uniform1f(this.u.u_blushA, p.blush.enabled ? p.blush.intensity : 0);
    gl.uniform3fv(this.u.u_shadowColor, hexToRgb(p.eyeshadow.color));
    gl.uniform1f(this.u.u_shadowA, p.eyeshadow.enabled ? p.eyeshadow.intensity : 0);
    gl.uniform1f(this.u.u_gloss, LIP_GLOSS);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}
