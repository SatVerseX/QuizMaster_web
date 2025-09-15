import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FiRefreshCw,
  FiDownload,
  FiCopy,
  FiCheck,
  FiMove
} from 'react-icons/fi';

const ImageAdjustment = ({ 
  imageUrl, 
  onUrlChange, 
  className = "",
  showPreview = true,
  showDownload = true,
  showCopy = true
}) => {
  const { isDark } = useTheme();
  const [adjustments, setAdjustments] = useState({
    width: 400,
    height: 300,
    crop: 'fill',
    gravity: 'center',
    x: 0,
    y: 0,
    quality: 'auto',
    format: 'auto',
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0,
    blur: 0,
    sharpen: 0,
    rotate: 0,
    flip: false,
    flop: false,
    // New position-related adjustments
    zoom: 1.0,
    angle: 0,
    background: 'transparent'
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPositioning, setShowPositioning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isValidUrl, setIsValidUrl] = useState(true);

  // Validate Cloudinary URL
  const validateCloudinaryUrl = (url) => {
    if (!url) return false;
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(part => part);
      
      return urlObj.hostname.includes('cloudinary.com') && 
             pathParts.includes('image') && 
             pathParts.includes('upload') &&
             pathParts.length >= 4;
    } catch {
      return false;
    }
  };

  // Generate Cloudinary URL with transformations
  const generateTransformedUrl = (baseUrl, adjustments) => {
    if (!baseUrl || !validateCloudinaryUrl(baseUrl)) {
      return baseUrl;
    }

    try {
      const url = new URL(baseUrl);
      const pathParts = url.pathname.split('/').filter(part => part);
      
      const cloudNameIndex = pathParts.findIndex(part => part && !['image', 'upload'].includes(part));
      const uploadIndex = pathParts.findIndex(part => part === 'upload');
      
      if (cloudNameIndex === -1 || uploadIndex === -1) {
        return baseUrl;
      }
      
      const cloudName = pathParts[cloudNameIndex];
      const publicId = pathParts[pathParts.length - 1].split('.')[0];
      
      const transformations = [];
      
      // Size transformations
      if (adjustments.width || adjustments.height) {
        const size = adjustments.width && adjustments.height 
          ? `w_${adjustments.width},h_${adjustments.height}`
          : adjustments.width 
            ? `w_${adjustments.width}` 
            : `h_${adjustments.height}`;
        transformations.push(size);
      }
      
      // Crop and positioning
      if (adjustments.crop && adjustments.crop !== 'fill') {
        transformations.push(`c_${adjustments.crop}`);
      }
      
      if (adjustments.gravity && adjustments.gravity !== 'center') {
        transformations.push(`g_${adjustments.gravity}`);
      }
      
      // X and Y positioning
      if (adjustments.x !== 0) {
        transformations.push(`x_${adjustments.x}`);
      }
      
      if (adjustments.y !== 0) {
        transformations.push(`y_${adjustments.y}`);
      }
      
      // Zoom
      if (adjustments.zoom !== 1.0) {
        transformations.push(`z_${adjustments.zoom}`);
      }
      
      // Background (for padding)
      if (adjustments.background && adjustments.background !== 'transparent' && adjustments.crop === 'pad') {
        const bgColor = adjustments.background.replace('#', 'rgb:');
        transformations.push(`b_${bgColor}`);
      }
      
      // Quality and format
      if (adjustments.quality && adjustments.quality !== 'auto') {
        transformations.push(`q_${adjustments.quality}`);
      }
      
      if (adjustments.format && adjustments.format !== 'auto') {
        transformations.push(`f_${adjustments.format}`);
      }
      
      // Effects
      if (adjustments.brightness !== 0) {
        transformations.push(`e_brightness:${adjustments.brightness}`);
      }
      
      if (adjustments.contrast !== 0) {
        transformations.push(`e_contrast:${adjustments.contrast}`);
      }
      
      if (adjustments.saturation !== 0) {
        transformations.push(`e_saturation:${adjustments.saturation}`);
      }
      
      if (adjustments.hue !== 0) {
        transformations.push(`e_hue:${adjustments.hue}`);
      }
      
      if (adjustments.blur > 0) {
        transformations.push(`e_blur:${adjustments.blur}`);
      }
      
      if (adjustments.sharpen > 0) {
        transformations.push(`e_sharpen:${adjustments.sharpen}`);
      }
      
      // Rotation and flips
      if (adjustments.rotate !== 0) {
        transformations.push(`a_${adjustments.rotate}`);
      }
      
      if (adjustments.angle !== 0 && adjustments.angle !== adjustments.rotate) {
        transformations.push(`a_${adjustments.angle}`);
      }
      
      if (adjustments.flip) {
        transformations.push('fl_vertical');
      }
      
      if (adjustments.flop) {
        transformations.push('fl_horizontal');
      }
      
      // Reconstruct URL
      const newPath = transformations.length > 0 
        ? `/${cloudName}/image/upload/${transformations.join(',')}/${publicId}`
        : `/${cloudName}/image/upload/${publicId}`;
      
      return `${url.protocol}//${url.host}${newPath}`;
    } catch (error) {
      console.error('Error generating transformed URL:', error);
      return baseUrl;
    }
  };

  const transformedUrl = generateTransformedUrl(imageUrl, adjustments);

  const handleAdjustmentChange = (key, value) => {
    setAdjustments(prev => ({ ...prev, [key]: value }));
  };

  const resetAdjustments = () => {
    setAdjustments({
      width: 400,
      height: 300,
      crop: 'fill',
      gravity: 'center',
      x: 0,
      y: 0,
      quality: 'auto',
      format: 'auto',
      brightness: 0,
      contrast: 0,
      saturation: 0,
      hue: 0,
      blur: 0,
      sharpen: 0,
      rotate: 0,
      flip: false,
      flop: false,
      zoom: 1.0,
      angle: 0,
      background: 'transparent'
    });
  };

  const copyTransformedUrl = async () => {
    try {
      await navigator.clipboard.writeText(transformedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = transformedUrl;
    link.download = 'adjusted-image';
    link.click();
  };

  useEffect(() => {
    if (onUrlChange) {
      onUrlChange(transformedUrl);
    }
  }, [transformedUrl, onUrlChange]);

  useEffect(() => {
    setIsValidUrl(validateCloudinaryUrl(imageUrl));
  }, [imageUrl]);

  if (!imageUrl) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* URL Validation Warning */}
      {!isValidUrl && (
        <div className={`p-3 rounded-lg border-2 border-dashed ${
          isDark ? 'border-red-500/50 bg-red-900/20' : 'border-red-300 bg-red-50'
        }`}>
          <p className={`text-sm font-medium ${
            isDark ? 'text-red-300' : 'text-red-700'
          }`}>
            ⚠️ Invalid Cloudinary URL format. Please ensure the URL follows the format: 
            <code className="ml-1 px-1 py-0.5 rounded text-xs bg-gray-200 dark:bg-gray-700">
              https://res.cloudinary.com/your-cloud/image/upload/...
            </code>
          </p>
        </div>
      )}

      {/* Preview */}
      {showPreview && (
        <div className="space-y-2">
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
            Preview
          </label>
          <div className={`relative rounded-lg border-2 overflow-hidden ${
            isDark ? 'border-gray-600' : 'border-slate-300'
          }`}>
            <img
              src={transformedUrl}
              alt="Adjusted preview"
              className="w-full h-48 object-contain bg-gray-50 dark:bg-gray-800"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className={`hidden w-full h-48 rounded-lg flex items-center justify-center ${
              isDark ? 'bg-gray-700 text-gray-400' : 'bg-slate-100 text-slate-500'
            }`}>
              Invalid image URL
            </div>
          </div>
        </div>
      )}

      {/* Basic Adjustments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Image Adjustments
          </h3>
          <button
            onClick={resetAdjustments}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              isDark 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FiRefreshCw className="w-4 h-4" />
            Reset
          </button>
        </div>

        {/* Size Controls */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
              Width
            </label>
            <input
              type="number"
              value={adjustments.width}
              onChange={(e) => handleAdjustmentChange('width', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark 
                  ? 'bg-gray-800 border-gray-600 text-white' 
                  : 'bg-white border-slate-300 text-slate-800'
              }`}
              min="1"
              max="2000"
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
              Height
            </label>
            <input
              type="number"
              value={adjustments.height}
              onChange={(e) => handleAdjustmentChange('height', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark 
                  ? 'bg-gray-800 border-gray-600 text-white' 
                  : 'bg-white border-slate-300 text-slate-800'
              }`}
              min="1"
              max="2000"
            />
          </div>
        </div>

        {/* Crop and Quality */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
              Crop Mode
            </label>
            <select
              value={adjustments.crop}
              onChange={(e) => handleAdjustmentChange('crop', e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark 
                  ? 'bg-gray-800 border-gray-600 text-white' 
                  : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              <option value="fill">Fill</option>
              <option value="fit">Fit</option>
              <option value="crop">Crop</option>
              <option value="scale">Scale</option>
              <option value="pad">Pad</option>
              <option value="limit">Limit</option>
              <option value="mfit">Minimum Fit</option>
              <option value="lfill">Limit Fill</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
              Quality
            </label>
            <select
              value={adjustments.quality}
              onChange={(e) => handleAdjustmentChange('quality', e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark 
                  ? 'bg-gray-800 border-gray-600 text-white' 
                  : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              <option value="auto">Auto</option>
              <option value="10">10 (Lowest)</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="40">40</option>
              <option value="50">50</option>
              <option value="60">60</option>
              <option value="70">70</option>
              <option value="80">80</option>
              <option value="90">90</option>
              <option value="100">100 (Highest)</option>
            </select>
          </div>
        </div>

        {/* Rotation */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
            Rotation: {adjustments.rotate}°
          </label>
          <input
            type="range"
            min="0"
            max="360"
            value={adjustments.rotate}
            onChange={(e) => handleAdjustmentChange('rotate', parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Flip/Flop */}
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={adjustments.flip}
              onChange={(e) => handleAdjustmentChange('flip', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
              Flip (Vertical)
            </span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={adjustments.flop}
              onChange={(e) => handleAdjustmentChange('flop', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
              Flop (Horizontal)
            </span>
          </label>
        </div>

        {/* Position Adjustments Toggle */}
        <button
          onClick={() => setShowPositioning(!showPositioning)}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
            isDark 
              ? 'bg-indigo-700 text-indigo-300 hover:bg-indigo-600' 
              : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
          }`}
        >
          <FiMove className="w-4 h-4" />
          {showPositioning ? 'Hide' : 'Show'} Position Controls
        </button>

        {/* Position Adjustments */}
        {showPositioning && (
          <div className="space-y-4 p-4 rounded-lg border-2 border-dashed border-indigo-300 dark:border-indigo-600">
            <h4 className={`text-md font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Position & Gravity Controls
            </h4>
            
            {/* Gravity */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                Gravity (Focal Point)
              </label>
              <select
                value={adjustments.gravity}
                onChange={(e) => handleAdjustmentChange('gravity', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark 
                    ? 'bg-gray-800 border-gray-600 text-white' 
                    : 'bg-white border-slate-300 text-slate-800'
                }`}
              >
                <option value="center">Center</option>
                <option value="north">North (Top)</option>
                <option value="northeast">Northeast</option>
                <option value="east">East (Right)</option>
                <option value="southeast">Southeast</option>
                <option value="south">South (Bottom)</option>
                <option value="southwest">Southwest</option>
                <option value="west">West (Left)</option>
                <option value="northwest">Northwest</option>
                <option value="face">Face Detection</option>
                <option value="faces">Multiple Faces</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            {/* X and Y Offset */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  X Offset: {adjustments.x}px
                </label>
                <input
                  type="range"
                  min="-500"
                  max="500"
                  value={adjustments.x}
                  onChange={(e) => handleAdjustmentChange('x', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  Y Offset: {adjustments.y}px
                </label>
                <input
                  type="range"
                  min="-500"
                  max="500"
                  value={adjustments.y}
                  onChange={(e) => handleAdjustmentChange('y', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Zoom */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                Zoom: {adjustments.zoom}x
              </label>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.1"
                value={adjustments.zoom}
                onChange={(e) => handleAdjustmentChange('zoom', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Background Color (for padding) */}
            {adjustments.crop === 'pad' && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                  Background Color (for padding)
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={adjustments.background === 'transparent' ? '#ffffff' : adjustments.background}
                    onChange={(e) => handleAdjustmentChange('background', e.target.value)}
                    className="w-16 h-10 rounded border"
                  />
                  <select
                    value={adjustments.background}
                    onChange={(e) => handleAdjustmentChange('background', e.target.value)}
                    className={`flex-1 px-3 py-2 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark 
                        ? 'bg-gray-800 border-gray-600 text-white' 
                        : 'bg-white border-slate-300 text-slate-800'
                    }`}
                  >
                    <option value="transparent">Transparent</option>
                    <option value="#ffffff">White</option>
                    <option value="#000000">Black</option>
                    <option value="#f3f4f6">Light Gray</option>
                    <option value="#6b7280">Gray</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Advanced Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
            isDark 
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced Effects
        </button>

        {/* Advanced Adjustments */}
        {showAdvanced && (
          <div className="space-y-4 p-4 rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-600">
            <h4 className={`text-md font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Advanced Effects
            </h4>
            
            {/* Brightness */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                Brightness: {adjustments.brightness}
              </label>
              <input
                type="range"
                min="-100"
                max="100"
                value={adjustments.brightness}
                onChange={(e) => handleAdjustmentChange('brightness', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Contrast */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                Contrast: {adjustments.contrast}
              </label>
              <input
                type="range"
                min="-100"
                max="100"
                value={adjustments.contrast}
                onChange={(e) => handleAdjustmentChange('contrast', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Saturation */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                Saturation: {adjustments.saturation}
              </label>
              <input
                type="range"
                min="-100"
                max="100"
                value={adjustments.saturation}
                onChange={(e) => handleAdjustmentChange('saturation', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Hue */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                Hue: {adjustments.hue}°
              </label>
              <input
                type="range"
                min="-180"
                max="180"
                value={adjustments.hue}
                onChange={(e) => handleAdjustmentChange('hue', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Blur */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                Blur: {adjustments.blur}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={adjustments.blur}
                onChange={(e) => handleAdjustmentChange('blur', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Sharpen */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
                Sharpen: {adjustments.sharpen}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={adjustments.sharpen}
                onChange={(e) => handleAdjustmentChange('sharpen', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {showCopy && (
            <button
              onClick={copyTransformedUrl}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                copied
                  ? 'bg-green-500 text-white'
                  : isDark 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {copied ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy URL'}
            </button>
          )}
          
          {showDownload && (
            <button
              onClick={downloadImage}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                isDark 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FiDownload className="w-4 h-4" />
              Download
            </button>
          )}
        </div>

        {/* Generated URL Display */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
            Generated URL
          </label>
          <div className={`p-3 rounded-lg border text-xs font-mono break-all ${
            isDark 
              ? 'bg-gray-800 border-gray-600 text-gray-300' 
              : 'bg-slate-50 border-slate-300 text-slate-600'
          }`}>
            {transformedUrl}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageAdjustment;
