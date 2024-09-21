// Event Listeners for the UI
document.getElementById('roomForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const length = parseFloat(document.getElementById('length').value);
    const width = parseFloat(document.getElementById('width').value);
    const height = parseFloat(document.getElementById('height').value);

    // Call the function to create the room
    createRoom(length, width, height);

    // Add a class to the body or parent container to move buttons to the top
    document.body.classList.add('room-created');
    
    // Optionally hide the title after room creation if needed
    document.getElementById('title').style.display = 'none';
});

document.getElementById('createObject').addEventListener('click', function() {
    createObject();
    closeModal('objectModal');
});

document.getElementById('placeDoor').addEventListener('click', function() {
    placeDoor();
    closeModal('doorModal');
});

document.getElementById('openRoomModal').addEventListener('click', function() {
    openModal('roomModal');
});

document.getElementById('openObjectModal').addEventListener('click', function() {
    openModal('objectModal');
});

document.getElementById('openDoorModal').addEventListener('click', function() {
    openModal('doorModal');
});

document.getElementById('closeRoomModal').addEventListener('click', function() {
    closeModal('roomModal');
});

document.getElementById('closeObjectModal').addEventListener('click', function() {
    closeModal('objectModal');
});

document.getElementById('closeDoorModal').addEventListener('click', function() {
    closeModal('doorModal');
});

document.getElementById('roomForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const length = parseFloat(document.getElementById('length').value);
    const width = parseFloat(document.getElementById('width').value);
    const height = parseFloat(document.getElementById('height').value);

    // Call the function to create the room
    createRoom(length, width, height);

    // Hide the title
    document.getElementById('title').style.display = 'none';

    // Increase button size by adding a class
    document.querySelector('.container').classList.add('large-buttons');
    
    closeModal('roomModal');
});

window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        closeModal(event.target.id);
    }
});

// Three.js variables
let scene, camera, renderer, controls;
let objects = [];
let selectedObject = null;
let isModalOpen = false;
let roomWidth, roomHeight, roomLength;


function createRoom(length, width, height) {
    // Store the dimensions of the room in global variables
    roomWidth = width;
    roomHeight = height;
    roomLength = length;

    // Three.js setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    scene.background = null;
    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true; // Enable shadows
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('3d-container').innerHTML = '';
    document.getElementById('3d-container').appendChild(renderer.domElement);

    // Stationary Pointlight in the center of the room
    const pointLight = new THREE.PointLight(0xeeeeff, 1, 100);
    pointLight.position.set(0, height - 0.5, 0);
    pointLight.castShadow = true;
    pointLight.shadow.mapSize.width = 2048;
    pointLight.shadow.mapSize.height = 2048;
    pointLight.shadow.camera.near = 0.5;
    pointLight.shadow.camera.far = 1000;
    scene.add(pointLight);

    // Add Ambient Light to soften shadows
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    // Visible light source (small sphere)
    const lightSphereGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const lightSphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const lightSphere = new THREE.Mesh(lightSphereGeometry, lightSphereMaterial);
    lightSphere.position.copy(pointLight.position);
    scene.add(lightSphere);

    // OrbitControls for rotating the room via mouse
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;

    // Room materials without the roof
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xAAAAAA, side: THREE.DoubleSide, opacity: 0.5, transparent: true });
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xDDDDDD });

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(width, length);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Back wall
    const backWallGeometry = new THREE.PlaneGeometry(width, height);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.z = -length / 2;
    backWall.position.y = height / 2;
    backWall.receiveShadow = true;
    scene.add(backWall);

    // Front wall
    const frontWallGeometry = new THREE.PlaneGeometry(width, height);
    const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
    frontWall.position.z = length / 2;
    frontWall.position.y = height / 2;
    frontWall.rotation.y = Math.PI;
    frontWall.receiveShadow = true;
    scene.add(frontWall);

    // Left wall
    const leftWallGeometry = new THREE.PlaneGeometry(length, height);
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    leftWall.position.x = -width / 2;
    leftWall.position.y = height / 2;
    leftWall.rotation.y = Math.PI / 2;
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    // Right wall
    const rightWallGeometry = new THREE.PlaneGeometry(length, height);
    const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
    rightWall.position.x = width / 2;
    rightWall.position.y = height / 2;
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.receiveShadow = true;
    scene.add(rightWall);

    // Camera position
    camera.position.set(width * 0.7, height * 2, length * 0.7);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    animate();
}


function createObject() {
    // Get dimensions on the object
    const name = document.getElementById('objName').value;
    const furnitureType = document.getElementById('furnitureType').value;
    const width = parseFloat(document.getElementById('objWidth').value);
    const height = parseFloat(document.getElementById('objHeight').value);
    const depth = parseFloat(document.getElementById('objDepth').value);

    if (furnitureType === 'door') {
        placeDoor(); // Handle door creation separately
    } else {
        loadModel(furnitureType, name, width, height, depth); // Handle general furniture objects
    }
}

function loadModel(type, name, width, height, depth) {
    const loader = new THREE.GLTFLoader();
    let modelPath = `./models/${type}.glb`;

    loader.load(modelPath, function(gltf) {
        const model = gltf.scene;

        // Set user data to store the name
        model.userData.name = name;

        // traverse for different types of furniture
        model.traverse(function(node) {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;

                const textureLoader = new THREE.TextureLoader();
                const exrLoader = new THREE.EXRLoader();

                // Correctly set the texture paths based on the current directory structure and type
                let texturePrefix = `textures/${type}/`;

                if (type === 'chair') {
                    // Load textures for the chair
                    textureLoader.load(`${texturePrefix}painted_wooden_chair_01_diff_1k.jpg`, function(texture) {
                        node.material.map = texture;
                        node.material.needsUpdate = true;
                    }, undefined, function(error) {
                        console.warn(`Diffuse map not found for ${type}: ${error}`);
                    });

                    exrLoader.load(`${texturePrefix}painted_wooden_chair_01_nor_gl_1k.exr`, function(texture) {
                        node.material.normalMap = texture;
                        node.material.needsUpdate = true;
                    }, undefined, function(error) {
                        console.warn(`Normal map not found for ${type}, using default material properties.`);
                    });

                    exrLoader.load(`${texturePrefix}painted_wooden_chair_01_metal_1k.exr`, function(texture) {
                        node.material.metalnessMap = texture;
                        node.material.needsUpdate = true;
                    }, undefined, function(error) {
                        console.warn(`Metalness map not found for ${type}, using default material properties.`);
                    });

                } else if (type === 'table') {
                    // Load textures for the table
                    textureLoader.load(`${texturePrefix}wooden_table_02_diff_1k.jpg`, function(texture) {
                        node.material.map = texture;
                        node.material.needsUpdate = true;
                    }, undefined, function(error) {
                        console.warn(`Diffuse map not found for ${type}: ${error}`);
                    });

                    textureLoader.load(`${texturePrefix}wooden_table_02_rough_1k.jpg`, function(texture) {
                        node.material.roughnessMap = texture;
                        node.material.needsUpdate = true;
                    }, undefined, function(error) {
                        console.warn(`Roughness map not found for ${type}, using default material properties.`);
                    });

                } else if (type === 'bed') {
                    // Load textures for the bed
                    textureLoader.load(`${texturePrefix}GothicBed_01_diff_1k.jpg`, function(texture) {
                        node.material.map = texture;
                        node.material.needsUpdate = true;
                    }, undefined, function(error) {
                        console.warn(`Diffuse map not found for ${type}: ${error}`);
                    });

                    exrLoader.load(`${texturePrefix}GothicBed_01_nor_gl_1k.exr`, function(texture) {
                        node.material.normalMap = texture;
                        node.material.needsUpdate = true;
                    }, undefined, function(error) {
                        console.warn(`Normal map not found for ${type}, using default material properties.`);
                    });

                    exrLoader.load(`${texturePrefix}GothicBed_01_metallic_1k.exr`, function(texture) {
                        node.material.metalnessMap = texture;
                        node.material.needsUpdate = true;
                    }, undefined, function(error) {
                        console.warn(`Metalness map not found for ${type}, using default material properties.`);
                    });

                    textureLoader.load(`${texturePrefix}GothicBed_01_roughness_1k.jpg`, function(texture) {
                        node.material.roughnessMap = texture;
                        node.material.needsUpdate = true;
                    }, undefined, function(error) {
                        console.warn(`Roughness map not found for ${type}, using default material properties.`);
                    });
                } else if (type === 'drawer') {
                    // Load textures for the drawer
                    textureLoader.load(`${texturePrefix}vintage_wooden_drawer_01_diff_1k.jpg`, function(texture) {
                        node.material.map = texture;
                        node.material.needsUpdate = true;
                    }, undefined, function(error) {
                        console.warn(`Diffuse map not found for ${type}: ${error}`);
                    });

                    exrLoader.load(`${texturePrefix}vintage_wooden_drawer_01_nor_gl_1k.exr`, function(texture) {
                        node.material.normalMap = texture;
                        node.material.needsUpdate = true;
                    }, undefined, function(error) {
                        console.warn(`Normal map not found for ${type}, using default material properties.`);
                    });

                    exrLoader.load(`${texturePrefix}vintage_wooden_drawer_01_metal_1k.exr`, function(texture) {
                        node.material.metalnessMap = texture;
                        node.material.needsUpdate = true;
                    }, undefined, function(error) {
                        console.warn(`Metalness map not found for ${type}, using default material properties.`);
                    });

                    textureLoader.load(`${texturePrefix}vintage_wooden_drawer_01_rough_1k.jpg`, function(texture) {
                        node.material.roughnessMap = texture;
                        node.material.needsUpdate = true;
                    }, undefined, function(error) {
                        console.warn(`Roughness map not found for ${type}, using default material properties.`);
                    });
                }

                // Set default material properties for roughness and metalness if textures are not available
                node.material.roughness = 0.5;  // Default value, adjust as needed
                node.material.metalness = 0.5;  // Default value, adjust as needed

                node.material.needsUpdate = true;
            }
        });

        model.scale.set(width, height, depth);
        scene.add(model);
        objects.push(model);

        // Create and attach a label to the object
        createLabelForObject(name, model);

        // Ensure buttons are created for the object
        createButtons(model, name);  // Add this line to ensure buttons are created
    });
}

// This function is a GPT-made solution
function toScreenPosition(obj, camera) {
    let vector = new THREE.Vector3();

    // Get object's position in world coordinates
    vector.setFromMatrixPosition(obj.matrixWorld);

    // Project the 3D position to 2D screen coordinates
    vector.project(camera);

    let x = (vector.x * 0.5 + 0.5) * window.innerWidth;
    let y = -(vector.y * 0.5 - 0.5) * window.innerHeight;

    return { x: x, y: y };
}


function createLabelForObject(name, object) {
    // Labels for objects to see which is which
    const labelDiv = document.createElement('div');
    labelDiv.className = 'object-label';
    labelDiv.innerText = name;
    labelDiv.style.position = 'absolute';
    labelDiv.style.color = 'white';
    labelDiv.style.padding = '2px 5px';
    labelDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    labelDiv.style.fontSize = '12px';
    labelDiv.style.borderRadius = '3px';
    
    document.getElementById('labels-container').appendChild(labelDiv);

    // Store label div on the object for later use
    object.userData.labelDiv = labelDiv;
}


function updateLabelPosition(object) {
    // Update the labels position upon allowed object movement
    const labelDiv = object.userData.labelDiv;
    const position = toScreenPosition(object, camera);
    // Align the label to the objects new coordinates
    labelDiv.style.left = `${position.x}px`;
    labelDiv.style.top = `${position.y}px`;
}


function placeDoor() {
    // Take dimensions of the door object and create an instance
    const width = parseFloat(document.getElementById('doorWidth').value);
    const height = parseFloat(document.getElementById('doorHeight').value);
    const depth = 0.1;
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const door = new THREE.Mesh(geometry, material);

    // Actually place the door and flush it against the back wall
    door.position.set(0, height / 2, -roomLength / 2 + depth / 2);
    door.castShadow = true;
    door.receiveShadow = true;
    scene.add(door);
    objects.push(door);

    // Add label to the object (always named "Door") and create Buttons to control positioning manually
    createLabelForObject("Door", door);
    createButtons(door, "Door");
}


function createButtons(obj, name, colorHex = '#ffffff') {
    // Styling happens in .js file for Buttons because of adjustments that have to happen when a user interacts with it (I didn't get it to work in .css for this function)
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.marginTop = '5px';
    // Select button to interact with selected object
    const selectButton = document.createElement('button');
    selectButton.innerText = `Select ${name || `Object ${objects.length}`}`;
    selectButton.style.backgroundColor = colorHex;
    selectButton.style.color = 'black'; // Has to be set to black manually, so the text is visible on white background of button (#ffffff)
    selectButton.style.padding = '10px';
    selectButton.style.marginRight = '5px';
    selectButton.style.minWidth = '100px'; // Testing showed this to always be enough for reasonable button names
    selectButton.className = 'button-17';
    selectButton.addEventListener('click', () => selectObject(obj));
    // Rotate Button to rotate it by 45° per click
    const rotateButton = document.createElement('button');
    rotateButton.innerText = 'Rotate';
    rotateButton.className = 'button-17';
    rotateButton.style.marginRight = '5px';
    rotateButton.addEventListener('click', () => rotateObject(obj));
    // Delete Button to delete the object, its label and its buttons
    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'Delete';
    deleteButton.className = 'button-17';
    deleteButton.addEventListener('click', () => deleteObject(obj, buttonContainer));

    buttonContainer.appendChild(selectButton);
    buttonContainer.appendChild(rotateButton);
    buttonContainer.appendChild(deleteButton);

    document.getElementById('cubeButtons').appendChild(buttonContainer);
}


function selectObject(object) {
    selectedObject = object;
}


function rotateObject(object) {
    // Any movement would be in 0.5 (meter) steps
    const movementStep = 0.5; 
    // Calculate the potential new boundaries after rotation
    const boundingBox = new THREE.Box3().setFromObject(object);
    const objectWidth = boundingBox.max.x - boundingBox.min.x;
    const objectDepth = boundingBox.max.z - boundingBox.min.z;
    const halfRoomWidth = roomWidth / 2;
    const halfRoomLength = roomLength / 2;
    // Check if the object is too close to the boundaries
    const isNearLeftWall = object.position.x - objectWidth / 2 <= -halfRoomWidth + movementStep;
    const isNearRightWall = object.position.x + objectWidth / 2 >= halfRoomWidth - movementStep;
    const isNearBackWall = object.position.z - objectDepth / 2 <= -halfRoomLength + movementStep;
    const isNearFrontWall = object.position.z + objectDepth / 2 >= halfRoomLength - movementStep;
    // If the object is too close to any wall, disallow rotation
    if (isNearLeftWall || isNearRightWall || isNearBackWall || isNearFrontWall) {
        console.log("Rotation blocked: Object is too close to a wall.");
        return;
    }
    // Otherwise, allow the rotation
    object.rotation.y += Math.PI / 4;
}


function deleteObject(object, buttonContainer) {
    // Remove the object from the scene
    scene.remove(object);
    // Remove the button container (Select, Rotate and Delete option)
    buttonContainer.remove();
    // Remove the object's label from the DOM
    if (object.userData.labelDiv) {
        object.userData.labelDiv.remove();
    }
    // Remove the object from the objects array
    const index = objects.indexOf(object);
    if (index > -1) {
        objects.splice(index, 1);
    }
    // Reset selectedObject if it's the one being deleted
    // When this wasn't implemented, you could try to move an object after its deletion, which would brick the entire Webpage
    if (selectedObject === object) {
        selectedObject = null;
    }
}


function onKeyPress(event) {
    // Don't allow movent by user input to happen when typing in a menu etc.
    if (isModalOpen) return;

    if (selectedObject) {
        const movementStep = 0.5;
        // Calculate the potential new position
        let newPosition = selectedObject.position.clone();
        // Switch case for different user inputs (w, a, s, d, space bar, shift)
        switch (event.key) {
            case 'w':
                newPosition.z -= movementStep;
                break;
            case 's':
                newPosition.z += movementStep;
                break;
            case 'a':
                newPosition.x -= movementStep;
                break;
            case 'd':
                newPosition.x += movementStep;
                break;
            case ' ':
                newPosition.y += movementStep;
                break;
            case 'Shift':
                newPosition.y -= movementStep;
                break;
        }
        // Handle movement with the general movement function for all objects (meaning doors aswell as all textured objects)
        handleGeneralObjectMovement(newPosition);
    }
}


function handleGeneralObjectMovement(newPosition) {
    // Get the bounding box of the object to calculate its half-width, half-depth, and half-height
    const boundingBox = new THREE.Box3().setFromObject(selectedObject);
    const objectHalfWidth = (boundingBox.max.x - boundingBox.min.x) / 2;
    const objectHalfDepth = (boundingBox.max.z - boundingBox.min.z) / 2;
    const objectHeight = boundingBox.max.y - boundingBox.min.y; // Full height
    // Calculate wall boundaries
    const minX = -roomWidth / 2 + objectHalfWidth;  // Left wall
    const maxX = roomWidth / 2 - objectHalfWidth;   // Right wall
    const minZ = -roomLength / 2 + objectHalfDepth; // Back wall
    const maxZ = roomLength / 2 - objectHalfDepth;  // Front wall
    // For all objects, restrict the top (roof) by subtracting the full object height
    const maxY = roomHeight - objectHeight;
    // Ensure object stays above the floor (y >= 0) and below the roof (y <= maxY)
    newPosition.y = Math.max(0, Math.min(newPosition.y, maxY));
        // Restrict X movement (left and right walls)
        if (newPosition.x < minX) {
            selectedObject.position.x = minX;
        } else if (newPosition.x > maxX) {
            selectedObject.position.x = maxX;
        } else {
            selectedObject.position.x = newPosition.x;
        }
        // Restrict Z movement (back and front walls)
        if (newPosition.z < minZ) {
            selectedObject.position.z = minZ;
        } else if (newPosition.z > maxZ) {
            selectedObject.position.z = maxZ;
        } else {
            selectedObject.position.z = newPosition.z;
        }
        
    
}


function handleDoorMovement(newPosition) {
    // Function to handle door movement logic (somewhat of a copy of handleGeneralObjectMovement, but for doors only)
    // Checking the potential new position after movement or rotation for collision with walls
    if (newPosition.z < -roomLength / 2) {
        newPosition.z = -roomLength / 2 + selectedObject.geometry.parameters.depth / 2;
        if (selectedObject.rotation.y !== 0) {
            selectedObject.rotation.y = 0;
        }
    } else if (newPosition.z > roomLength / 2) {
        newPosition.z = roomLength / 2 - selectedObject.geometry.parameters.depth / 2;
        if (selectedObject.rotation.y !== Math.PI) {
            selectedObject.rotation.y = Math.PI;
        }
    } else if (newPosition.x < -roomWidth / 2) {
        newPosition.x = -roomWidth / 2 + selectedObject.geometry.parameters.depth / 2;
        if (selectedObject.rotation.y !== Math.PI / 2) {
            selectedObject.rotation.y = Math.PI / 2;
        }
    } else if (newPosition.x > roomWidth / 2) {
        newPosition.x = roomWidth / 2 - selectedObject.geometry.parameters.depth / 2;
        if (selectedObject.rotation.y !== -Math.PI / 2) {
            selectedObject.rotation.y = -Math.PI / 2;
        }
    }
    if (
        newPosition.y >= selectedObject.geometry.parameters.height / 2 &&
        newPosition.y <= roomHeight - selectedObject.geometry.parameters.height / 2
    ) {
        selectedObject.position.copy(newPosition);
    }
}


function openModal(modalId) {
    console.log('Opening modal:', modalId); // This line is for Testing to see if user input through mouse (left click) is recognized. Used when there were issues with visual Feedback
    document.getElementById(modalId).style.display = 'block';
    isModalOpen = true;
}


function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    isModalOpen = false;
}

// This function renders the actual 3D Scene the user sees
function animate() {
    requestAnimationFrame(animate);
    // Actually update Label position for each Object
    objects.forEach(object => {
        updateLabelPosition(object);
    });
    // Update camera controls
    controls.update();
    // Render the current scene with current camera view
    renderer.render(scene, camera);
}

// Event listener for user input
window.addEventListener('keydown', onKeyPress);

// Solution to the following eventListener was inspired by GPTs Code Wizard
// Hides the initially created modals on page loading, found no other solution
window.addEventListener('DOMContentLoaded', (event) => {
    document.querySelectorAll('.modal').forEach(function(modal) {
        modal.style.display = 'none';
    });
});