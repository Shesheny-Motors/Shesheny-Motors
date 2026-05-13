const fs = require('fs');
const file = 'c:\\\\Web projects\\\\Motor Hub\\\\Motor-Hub-website\\\\details\\\\index.html';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix the main image container and image tags
// Replace the relative container and its contents.
let newContainer = `
            <div class="relative w-full bg-surface-container-low overflow-hidden flex items-center justify-center rounded-xl border border-outline-variant/30" style="min-height: 250px;">
                <img id="main-image" src="" alt="Vehicle Image" class="w-full max-h-[60vh] object-contain cursor-pointer hover:opacity-90 transition-opacity" onclick="openLightbox(currentLightboxIndex)" />
                <video id="main-video" class="w-full max-h-[60vh] object-contain hidden" controls playsinline></video>
                <button id="fav-btn" class="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur p-3 rounded-full text-white hover:text-red-500 transition-colors">
                    <span class="material-symbols-outlined" id="fav-icon">favorite_border</span>
                </button>
            </div>
`;

// Replace the previous container. It started with:
// <div class="relative aspect-[4/3] sm:aspect-video md:aspect-[4/3] bg-surface-container-low overflow-hidden">
content = content.replace(/<div class="relative aspect-\[4\/3\] sm:aspect-video md:aspect-\[4\/3\] bg-surface-container-low overflow-hidden">[\s\S]*?<\/button>\s*<\/div>/, newContainer);


// 2. Fix the thumbnail rendering and add setActiveThumbnail
// Find the thumbsContainer.innerHTML assignment
content = content.replace(/thumbsContainer\.innerHTML = allMedia\.map\(\(m\) => \{[\s\S]*?\}\)\.join\(''\);/, `
                thumbsContainer.innerHTML = allMedia.map((m) => {
                    if (m.type === 'image') {
                        return \`
                            <div id="thumb-\${m.lbIdx}" class="w-24 h-16 flex-shrink-0 cursor-pointer border-2 border-transparent hover:border-primary transition-colors relative" onclick="window.setMainMedia('image', '\${escapeHTML(m.url)}', \${m.lbIdx})">
                                <img src="\${escapeHTML(m.url)}" class="w-full h-full object-cover" />
                            </div>
                        \`;
                    } else {
                        return \`
                            <div id="thumb-video" class="w-24 h-16 flex-shrink-0 cursor-pointer border-2 border-transparent hover:border-primary transition-colors relative bg-neutral-900 flex items-center justify-center group" onclick="window.setMainMedia('video', '\${escapeHTML(m.url)}')">
                                <span class="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">play_circle</span>
                            </div>
                        \`;
                    }
                }).join('');
`);

// 3. Update window.setMainMedia to handle thumbnail active state
content = content.replace(/window\.setMainMedia = \(type, url, lbIdx\) => \{/, `
            window.setMainMedia = (type, url, lbIdx) => {
                if(typeof lbIdx !== 'undefined') currentLightboxIndex = lbIdx;
                if(window.updateActiveThumbnail) window.updateActiveThumbnail();
`);

// 4. Inject updateActiveThumbnail function and expose it
content = content.replace(/function renderDetails\(\) \{/, `
        window.updateActiveThumbnail = function() {
            const thumbs = document.getElementById('thumbnails').children;
            for(let i=0; i<thumbs.length; i++) {
                thumbs[i].classList.remove('border-primary');
                thumbs[i].classList.add('border-transparent');
            }
            let activeThumb = document.getElementById('thumb-' + currentLightboxIndex);
            if(activeThumb) {
                activeThumb.classList.remove('border-transparent');
                activeThumb.classList.add('border-primary');
                activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        };
        function renderDetails() {
`);

// 5. Make updateLightboxView call updateActiveThumbnail
content = content.replace(/document\.getElementById\('main-image'\)\.src = lightboxImages\[currentLightboxIndex\];/, `
            document.getElementById('main-image').src = lightboxImages[currentLightboxIndex];
            if(window.updateActiveThumbnail) window.updateActiveThumbnail();
`);

// 6. Make initial load call updateActiveThumbnail
content = content.replace(/window\.setMainMedia\('image', images\[0\], 0\);/, `
                window.setMainMedia('image', images[0], 0);
`);


fs.writeFileSync(file, content);
console.log('Update Complete');
