let uploadedImages = [];
let scene, camera, renderer, model, controls;
let isProcessing = false;
let autoRotate = false;
let wireframeMode = false;

// Initialize particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
        particlesContainer.appendChild(particle);
    }
}

// File upload handling
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const imageGrid = document.getElementById('imageGrid');
const imageCount = document.getElementById('imageCount');
const progressFill = document.getElementById('progressFill');
const progressPercent = document.getElementById('progressPercent');
const uploadBtn = document.getElementById('uploadBtn');
const viewModelBtn = document.getElementById('viewModelBtn');

uploadArea.addEventListener('click', () => {
    if (!isProcessing) fileInput.click();
});

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (!isProcessing) uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    if (!isProcessing) handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

function handleFiles(files) {
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    imageFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedImages.push({
                file: file,
                url: e.target.result,
                name: file.name
            });
            updateDisplay();
        };
        reader.readAsDataURL(file);
    });
}

function updateDisplay() {
    const count = uploadedImages.length;
    imageCount.textContent = count;
    
    const progress = Math.min((count / 50) * 100, 100);
    progressFill.style.width = progress + '%';
    progressPercent.textContent = Math.round(progress) + '%';
    
    uploadBtn.disabled = count < 50;
    
    imageGrid.innerHTML = '';
    uploadedImages.forEach((img, index) => {
        const imgItem = document.createElement('div');
        imgItem.className = 'image-item';
        imgItem.innerHTML = `
            <img src="${img.url}" alt="Image ${index + 1}">
            <div class="image-counter">${index + 1}</div>
        `;
        imageGrid.appendChild(imgItem);
    });
}

// Photography animation and reconstruction process
uploadBtn.addEventListener('click', () => {
    if (uploadedImages.length >= 50) {
        // Reset the upload image canvas and remove all previews
        uploadedImages = [];
        updateDisplay();
        startReconstructionProcess();
    }
});

function startReconstructionProcess() {
    isProcessing = true;
    uploadBtn.disabled = true;
    uploadArea.style.pointerEvents = 'none';
    uploadArea.style.opacity = '0.5';
    
    const animationDiv = document.getElementById('photographyAnimation');
    animationDiv.style.display = 'block';
    
    // Start photo counting animation
    let photoCount = 0;
    const photoCounter = document.getElementById('photoCounter');
    const reconstructionProgressBar = document.getElementById('reconstructionProgress');
    
    const photoInterval = setInterval(() => {
        photoCount += Math.floor(Math.random() * 8) + 2;
        if (photoCount > 360) photoCount = 360;
        
        photoCounter.textContent = `Photos taken: ${photoCount}/360`;
        
        const progress = (photoCount / 360) * 100;
        reconstructionProgressBar.style.width = progress + '%';
        
        if (photoCount >= 360) {
            clearInterval(photoInterval);
            
            setTimeout(() => {
                animationDiv.style.display = 'none';
                viewModelBtn.disabled = false;
                isProcessing = false;
                
                // Show success message
                const successMsg = document.createElement('div');
                successMsg.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: linear-gradient(45deg, #00d4ff, #ff00ff);
                    padding: 20px 40px;
                    border-radius: 15px;
                    color: white;
                    font-size: 1.2rem;
                    font-weight: bold;
                    z-index: 1000;
                    animation: successPulse 1s ease-in-out;
                `;
                successMsg.textContent = '✅ 3D Reconstruction Complete!';
                document.body.appendChild(successMsg);
                
                setTimeout(() => {
                    document.body.removeChild(successMsg);
                }, 3000);
            }, 1000);
        }
    }, 100);
}

// 3D Model Viewer with advanced controls
viewModelBtn.addEventListener('click', () => {
    document.getElementById('viewerSection').style.display = 'block';
    // Re-enable upload area and button
    uploadArea.style.pointerEvents = 'auto';
    uploadArea.style.opacity = '1';
    uploadBtn.disabled = uploadedImages.length < 50;
    // Restore upload functionality
    fileInput.disabled = false;
    setTimeout(() => {
        initAdvanced3DViewer();
    }, 100);
});

function initAdvanced3DViewer() {
    const container = document.getElementById('plyViewer');
    container.innerHTML = '<div class="viewer-overlay"><div>🖱️ Mouse: Rotate model</div><div>🔍 Scroll: Zoom in/out</div><div>📱 Touch: Pinch to zoom, drag to rotate</div></div>';
    
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(5, 5, 5);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCSShadowMap;
    renderer.setClearColor(0x000000, 1);
    container.appendChild(renderer.domElement);
    
    // Advanced lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    // Multiple colored lights for dramatic effect
    const lights = [
        { color: 0x00d4ff, position: [10, 0, 0] },
        { color: 0xff00ff, position: [-10, 0, 0] },
        { color: 0xffff00, position: [0, 10, 0] },
        { color: 0x00ff00, position: [0, -10, 0] }
    ];
    
    lights.forEach(light => {
        const pointLight = new THREE.PointLight(light.color, 0.3);
        pointLight.position.set(...light.position);
        scene.add(pointLight);
    });
    
    // Create realistic PLY-style model
    createRealisticPLYModel();
    
    // Advanced mouse controls
    setupAdvancedControls(container);
    
    // Control buttons
    setupControlButtons();
    
    // Animation loop
    animate();
    
    // Handle resize
    window.addEventListener('resize', handleResize);
}

function createRealisticPLYModel() {
    const group = new THREE.Group();
    
    // Generate point cloud effect (simulating PLY data)
    const pointsGeometry = new THREE.BufferGeometry();
    const pointsCount = 5000;
    const positions = new Float32Array(pointsCount * 3);
    const colors = new Float32Array(pointsCount * 3);
    
    for (let i = 0; i < pointsCount; i++) {
        // Create sphere-like distribution
        const radius = Math.random() * 2 + 1;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);
        
        // Color based on position
        colors[i * 3] = Math.abs(positions[i * 3]) / 3;
        colors[i * 3 + 1] = Math.abs(positions[i * 3 + 1]) / 3;
        colors[i * 3 + 2] = Math.abs(positions[i * 3 + 2]) / 3;
    }
    
    pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pointsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const pointsMaterial = new THREE.PointsMaterial({
        size: 0.02,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
    });
    
    const pointCloud = new THREE.Points(pointsGeometry, pointsMaterial);
    group.add(pointCloud);
    
    // Add mesh surface
    const meshGeometry = new THREE.IcosahedronGeometry(2, 3);
    const meshMaterial = new THREE.MeshPhongMaterial({
        color: 0x00d4ff,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(meshGeometry, meshMaterial);
    group.add(mesh);
    
    // Add wireframe
    const wireframeGeometry = new THREE.IcosahedronGeometry(2.1, 2);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0xff00ff,
        wireframe: true,
        transparent: true,
        opacity: 0.2
    });
    const wireframeMesh = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    group.add(wireframeMesh);
    
    model = group;
    scene.add(model);
}

function setupAdvancedControls(container) {
    let mouseDown = false;
    let mouseX = 0, mouseY = 0;
    let targetRotationX = 0, targetRotationY = 0;
    let currentRotationX = 0, currentRotationY = 0;
    let zoom = 1;
    
    // Mouse controls
    container.addEventListener('mousedown', (e) => {
        mouseDown = true;
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    container.addEventListener('mousemove', (e) => {
        if (!mouseDown) return;
        
        const deltaX = e.clientX - mouseX;
        const deltaY = e.clientY - mouseY;
        
        targetRotationY += deltaX * 0.01;
        targetRotationX += deltaY * 0.01;
        
        // Clamp X rotation
        targetRotationX = Math.max(-Math.PI/2, Math.min(Math.PI/2, targetRotationX));
        
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    container.addEventListener('mouseup', () => {
        mouseDown = false;
    });
    
    container.addEventListener('mouseleave', () => {
        mouseDown = false;
    });
    
    // Zoom with mouse wheel
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        zoom += e.deltaY * -0.001;
        zoom = Math.max(0.5, Math.min(3, zoom));
        camera.position.setLength(5 / zoom);
    });
    
    // Touch controls for mobile
    let touches = [];
    let lastTouchDistance = 0;
    
    container.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touches = Array.from(e.touches);
        
        if (touches.length === 2) {
            const dx = touches[0].clientX - touches[1].clientX;
            const dy = touches[0].clientY - touches[1].clientY;
            lastTouchDistance = Math.sqrt(dx * dx + dy * dy);
        }
    });
    
    container.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const currentTouches = Array.from(e.touches);
        
        if (currentTouches.length === 1 && touches.length === 1) {
            // Single touch - rotate
            const deltaX = currentTouches[0].clientX - touches[0].clientX;
            const deltaY = currentTouches[0].clientY - touches[0].clientY;
            
            targetRotationY += deltaX * 0.01;
            targetRotationX += deltaY * 0.01;
            targetRotationX = Math.max(-Math.PI/2, Math.min(Math.PI/2, targetRotationX));
            
        } else if (currentTouches.length === 2 && touches.length === 2) {
            // Pinch to zoom
            const dx = currentTouches[0].clientX - currentTouches[1].clientX;
            const dy = currentTouches[0].clientY - currentTouches[1].clientY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            const scale = distance / lastTouchDistance;
            zoom *= scale;
            zoom = Math.max(0.5, Math.min(3, zoom));
            camera.position.setLength(5 / zoom);
            
            lastTouchDistance = distance;
        }
        
        touches = currentTouches;
    });
    
    container.addEventListener('touchend', (e) => {
        e.preventDefault();
        touches = Array.from(e.touches);
    });
    
    // Update rotations smoothly
    function updateRotations() {
        currentRotationX += (targetRotationX - currentRotationX) * 0.1;
        currentRotationY += (targetRotationY - currentRotationY) * 0.1;
        
        if (model) {
            model.rotation.x = currentRotationX;
            model.rotation.y = currentRotationY;
            
            if (autoRotate) {
                model.rotation.y += 0.01;
                targetRotationY = model.rotation.y;
            }
        }
        
        requestAnimationFrame(updateRotations);
    }
    updateRotations();
}

function setupControlButtons() {
    // Reset View
    document.getElementById('resetViewBtn').addEventListener('click', () => {
        targetRotationX = 0;
        targetRotationY = 0;
        zoom = 1;
        camera.position.set(5, 5, 5);
        autoRotate = false;
        document.getElementById('autoRotateBtn').classList.remove('active');
    });
    
    // Wireframe toggle
    document.getElementById('wireframeBtn').addEventListener('click', (e) => {
        wireframeMode = !wireframeMode;
        e.target.classList.toggle('active', wireframeMode);
        
        if (model) {
            model.children.forEach(child => {
                if (child.material) {
                    child.material.wireframe = wireframeMode;
                }
            });
        }
    });
    
    // Auto rotate toggle
    document.getElementById('autoRotateBtn').addEventListener('click', (e) => {
        autoRotate = !autoRotate;
        e.target.classList.toggle('active', autoRotate);
    });
    
    // Fullscreen toggle
    document.getElementById('fullscreenBtn').addEventListener('click', () => {
        const viewer = document.getElementById('plyViewer');
        if (!document.fullscreenElement) {
            viewer.requestFullscreen().catch(err => {
                console.log('Fullscreen not supported');
            });
        } else {
            document.exitFullscreen();
        }
    });
}

function animate() {
    requestAnimationFrame(animate);
    
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

function handleResize() {
    if (renderer && camera) {
        const container = document.getElementById('plyViewer');
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }
}

// PLY File Loader (Enhanced simulation)
function loadPLYFile(filename) {
    // In a real implementation, this would load an actual PLY file
    // For now, we simulate loading the "model.ply" file you mentioned
    console.log(`Loading PLY file: ${filename}`);
    
    // Simulate PLY parsing and create more realistic geometry
    return new Promise((resolve) => {
        setTimeout(() => {
            createAdvancedPLYModel();
            resolve();
        }, 1000);
    });
}

function createAdvancedPLYModel() {
    if (model) {
        scene.remove(model);
    }
    
    const group = new THREE.Group();
    
    // Simulate PLY vertex data with more complex geometry
    const vertices = [];
    const faces = [];
    const colors = [];
    
    // Generate realistic mesh data (simulating PLY structure)
    const segments = 32;
    const rings = 16;
    
    for (let i = 0; i <= rings; i++) {
        const v = i / rings;
        const phi = v * Math.PI;
        
        for (let j = 0; j <= segments; j++) {
            const u = j / segments;
            const theta = u * Math.PI * 2;
            
            const radius = 2 + Math.sin(phi * 3) * 0.3 + Math.cos(theta * 5) * 0.2;
            
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.cos(phi);
            const z = radius * Math.sin(phi) * Math.sin(theta);
            
            vertices.push(x, y, z);
            
            // Color based on position
            colors.push(
                (Math.sin(theta * 2) + 1) * 0.5,
                (Math.sin(phi * 2) + 1) * 0.5,
                (Math.cos(theta + phi) + 1) * 0.5
            );
        }
    }
    
    // Create faces
    for (let i = 0; i < rings; i++) {
        for (let j = 0; j < segments; j++) {
            const a = i * (segments + 1) + j;
            const b = a + segments + 1;
            const c = a + 1;
            const d = b + 1;
            
            faces.push(a, b, c);
            faces.push(b, d, c);
        }
    }
    
    // Create geometry from PLY-like data
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(faces);
    geometry.computeVertexNormals();
    
    // Main mesh with PLY-style material
    const material = new THREE.MeshPhongMaterial({
        vertexColors: true,
        shininess: 100,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    
    // Add point cloud overlay (common in PLY files)
    const pointGeometry = geometry.clone();
    const pointMaterial = new THREE.PointsMaterial({
        vertexColors: true,
        size: 0.05,
        transparent: true,
        opacity: 0.6
    });
    const points = new THREE.Points(pointGeometry, pointMaterial);
    group.add(points);
    
    // Add wireframe (toggleable)
    const wireGeometry = geometry.clone();
    const wireMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.1
    });
    const wireframe = new THREE.Mesh(wireGeometry, wireMaterial);
    group.add(wireframe);
    
    model = group;
    scene.add(model);
    
    console.log('PLY model loaded successfully');
}

// Initialize everything
createParticles();

// Add CSS animation for success message
const style = document.createElement('style');
style.textContent = `
    @keyframes successPulse {
        0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
        50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    }
`;
document.head.appendChild(style);

// Simulate loading model.ply when viewer starts
setTimeout(() => {
    console.log('3D Reconstruction app initialized');
    console.log('Ready to load model.ply file');
}, 1000);

function getApplicationStatus() {
    return {
        uploadedImages: uploadedImages.length,
        isProcessing: isProcessing,
        autoRotate: autoRotate,
        wireframeMode: wireframeMode
    };
}