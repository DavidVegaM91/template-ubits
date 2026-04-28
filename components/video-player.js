/**
 * Video player — envoltorio para reproductores de video (YouTube, Vimeo, Google Drive, OneDrive, MP4 nativo).
 *
 * API: videoPlayerHtml({ type, src, className? })
 *   type: 'youtube' | 'vimeo' | 'google-drive' | 'onedrive' | 'html5'
 *   src: URL fuente del video
 */
(function (global) {
    'use strict';

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function escapeAttr(s) {
        return escapeHtml(s).replace(/'/g, '&#039;');
    }

    /**
     * Devuelve el HTML para un reproductor de video.
     * @param {{ type?: string, src?: string, className?: string }} opts 
     * @returns {string}
     */
    function videoPlayerHtml(opts) {
        opts = opts || {};
        var type = opts.type || 'html5';
        var src = opts.src || '';
        var extra = opts.className ? ' ' + String(opts.className).trim().replace(/\s+/g, ' ') : '';
        
        var baseClass = 'ubits-video-player';
        var fullClass = baseClass + extra;

        if (type === 'html5') {
            return (
                '<video class="' + escapeAttr(fullClass) + '" src="' + escapeAttr(src) + '" controls playsinline>' +
                'Tu navegador no soporta el elemento de video.' +
                '</video>'
            );
        } else {
            // Para iframe (YouTube, Vimeo, Google Drive, OneDrive)
            return (
                '<iframe class="' + escapeAttr(fullClass) + '" src="' + escapeAttr(src) + '" ' +
                'frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen>' +
                '</iframe>'
            );
        }
    }

    global.videoPlayerHtml = videoPlayerHtml;
})(typeof window !== 'undefined' ? window : this);
