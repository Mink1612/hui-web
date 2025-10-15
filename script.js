// Thiết lập cơ bản của Three.js
const canvas = document.getElementById('valentine-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000); 
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
scene.fog = new THREE.Fog(0x000000, 10, 150); 
camera.position.z = 50; 
camera.position.y = 10; 

const entities = []; 
const STARS_COUNT = 500; 

// TÙY CHỈNH LỜI CHÚC CỦA BẠN TẠI ĐÂY
const messages = [
    "Em ị húi",
    "Chúc em húi càng ngày càng húi",
    "Em là mèo con húi thum thủm",
    "Khải Minh yêu em húi nhiều",
    "Em pẹc pẹc húi"
];
const PARTICLE_COUNT = 80; 
const Y_START = 150; 

// Các màu Neon có thể thay đổi
const NEON_COLORS = [
    { text: '#CCFFFF', glow: '#0099FF' }, // Xanh dương
    { text: '#FFCCFF', glow: '#FF00FF' }, // Hồng/Tím
    { text: '#CCFFCC', glow: '#00FF00' }, // Xanh lá
    { text: '#FFCCCC', glow: '#FF3300' }  // Đỏ cam
];

// Biến cho hiệu ứng đổi màu
let lastColorChangeTime = Date.now();
const COLOR_CHANGE_INTERVAL = 2000; // Đổi màu mỗi 2000ms (2 giây)

// =========================================================
// 1. Logic Phát Nhạc (Đã thêm giảm âm lượng)
// =========================================================

const music = document.getElementById('background-music');
const musicBtn = document.getElementById('music-btn');
let userInteracted = false;

function tryPlayMusic() {
    music.volume = 0.25; // GIẢM ÂM LƯỢNG XUỐNG 1 NỬA
    music.play()
        .then(() => {
            musicBtn.textContent = "⏸️";
        })
        .catch((err) => {
            console.warn("⚠️ KHÔNG THỂ PHÁT NHẠC. Vui lòng kiểm tra file 'your_song.mp3'.", err);
            musicBtn.textContent = "▶️";
        });
}

document.addEventListener('click', () => {
    if (!userInteracted) {
        userInteracted = true;
        tryPlayMusic();
    }
});

musicBtn.addEventListener("click", () => {
    if (music.paused) {
        tryPlayMusic();
    } else {
        music.pause();
        musicBtn.textContent = "▶️";
    }
});

// =========================================================
// 2. Thêm Ngôi Sao (Background) - Giữ nguyên
// =========================================================

function createStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starVertices = [];
    const starMaterial = new THREE.PointsMaterial({
        size: 0.5,
        color: 0x999999, 
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending 
    });

    for (let i = 0; i < STARS_COUNT; i++) {
        const x = (Math.random() - 0.5) * 500;
        const y = (Math.random() - 0.5) * 500;
        const z = (Math.random() - 0.5) * 500;
        starVertices.push(x, y, z);
    }
    
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}

// =========================================================
// 3. Tạo Chữ và Trái Tim (Sử dụng Sprite/Canvas cho Tiếng Việt & Glow)
// =========================================================

function createTextSprite(message, color, glowColor) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    const fontSize = 100;
    context.font = `${fontSize}px Arial, sans-serif`;
    const textWidth = context.measureText(message).width;
    
    canvas.width = textWidth + 40; 
    canvas.height = fontSize * 1.5;
    
    context.font = `${fontSize}px Arial, sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Hiệu ứng Glow (Neon)
    context.shadowColor = glowColor;
    context.shadowBlur = 10;
    context.fillStyle = color;
    
    context.fillText(message, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ 
        map: texture, 
        transparent: true,
        blending: THREE.AdditiveBlending 
    });

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(canvas.width / 15, canvas.height / 15, 1); 

    // Lưu trữ thông tin màu sắc ban đầu để tái tạo texture dễ dàng
    sprite.userData.message = message;
    sprite.userData.currentColor = { text: color, glow: glowColor };
    
    return sprite;
}

// Hàm cập nhật màu chữ
function updateTextSpriteColor(sprite, newColors) {
    // Chỉ cập nhật nếu là Sprite (chữ)
    if (sprite.material.map && sprite.userData.message) {
        const message = sprite.userData.message;
        const canvas = sprite.material.map.image;
        const context = canvas.getContext('2d');
        
        // Xóa canvas cũ
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Vẽ lại với màu mới
        context.shadowColor = newColors.glow;
        context.shadowBlur = 10;
        context.fillStyle = newColors.text;
        
        const fontSize = 100;
        context.font = `${fontSize}px Arial, sans-serif`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(message, canvas.width / 2, canvas.height / 2);

        // Cập nhật texture
        sprite.material.map.needsUpdate = true;
        sprite.userData.currentColor = newColors;
    }
}


const createHeart = () => {
    // ... (Giữ nguyên logic tạo Heart) ...
    const heartShape = new THREE.Shape();
    const x = 0, y = 0;
    heartShape.moveTo(x + 0.5, y + 0.5);
    heartShape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
    heartShape.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
    heartShape.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9);
    heartShape.bezierCurveTo(x + 1.3, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7);
    heartShape.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1.0, y);
    heartShape.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);

    const geometry = new THREE.ShapeGeometry(heartShape);
    geometry.scale(1, 1, 1); 
    geometry.center();

    const material = new THREE.MeshBasicMaterial({ 
        color: 0xFF0000, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.z = Math.PI;
    return mesh;
};

// Thêm Ánh sáng
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); 
scene.add(ambientLight);

// Tạo và phân bố các đối tượng
for (let i = 0; i < PARTICLE_COUNT; i++) {
    let object;
    const isHeart = Math.random() < 0.25; 
    
    if (isHeart) {
        object = createHeart();
        object.scale.setScalar(Math.random() * 2 + 1); 
    } else {
        const message = messages[Math.floor(Math.random() * messages.length)];
        const initialColor = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
        object = createTextSprite(message.trim(), initialColor.text, initialColor.glow); 
        const scaleFactor = Math.random() * 0.8 + 0.4;
        object.scale.multiplyScalar(scaleFactor);
    }

    // Vị trí ngẫu nhiên ở phía trên
    object.position.x = (Math.random() - 0.5) * 100;
    object.position.y = Y_START + Math.random() * 100; 
    object.position.z = (Math.random() - 0.5) * 50; 
    
    object.userData.fallSpeed = Math.random() * 0.2 + 0.4; 

    scene.add(object);
    entities.push(object);
}

createStars();

// =========================================================
// 4. Tương tác Camera (Đã thêm giới hạn Zoom)
// =========================================================

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; 
controls.dampingFactor = 0.05;
controls.enableZoom = true;
controls.enablePan = true; 
controls.autoRotate = false; 

// GIỚI HẠN ZOOM
controls.minDistance = 20; // Khoảng cách tối thiểu (không zoom quá gần)
controls.maxDistance = 120; // Khoảng cách tối đa (không zoom quá xa)

// =========================================================
// 5. Vòng Lặp Hoạt Hình (Logic Rơi Xuống & Đổi Màu)
// =========================================================

function animate() {
    requestAnimationFrame(animate);

    controls.update(); 
    
    const now = Date.now();
    let shouldChangeColor = false;
    
    // Kiểm tra xem đã đến lúc đổi màu chưa
    if (now - lastColorChangeTime > COLOR_CHANGE_INTERVAL) {
        shouldChangeColor = true;
        lastColorChangeTime = now;
    }

    entities.forEach(entity => {
        // Logic Rơi xuống
        entity.position.y -= entity.userData.fallSpeed; 
        
        // Quay nhẹ
        entity.rotation.x += (Math.random() - 0.5) * 0.005;
        entity.rotation.z += (Math.random() - 0.5) * 0.005;
        
        // Reset vị trí khi rơi quá thấp
        if (entity.position.y < -50) { 
            entity.position.y = Y_START; 
            entity.position.x = (Math.random() - 0.5) * 100;
            entity.position.z = (Math.random() - 0.5) * 50;
        }

        // Logic Đổi màu (chỉ áp dụng cho chữ)
        if (shouldChangeColor && entity.userData.message) {
            const newColor = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
            updateTextSpriteColor(entity, newColor);
        }
    });
    
    renderer.render(scene, camera);
}
animate();


// =========================================================
// 6. Responsive - Giữ nguyên
// =========================================================

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

}, false);

