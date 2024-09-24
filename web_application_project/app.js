// Event Listeners for the UI
document.getElementById('roomForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const length = parseFloat(document.getElementById('length').value);
    const width = parseFloat(document.getElementById('width').value);
    const height = parseFloat(document.getElementById('height').value);

    // Call the function to create the room
    createRoom(length, width, height);

    // Add a class to the body to move buttons to the top
    document.body.classList.add('room-created');
    
    // Hide the main title after the room is created
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

// For the case that a room is created, after the inital room was created (there is no need to now hide the main title again etc as this isnt the first room that is created in this runtime)
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
    // Remove all previous objects from the scene
    objects.forEach(object => {
        // Remove object from scene
        scene.remove(object);

        // Remove the objects associated label from DOM
        if (object.userData.labelDiv) {
            object.userData.labelDiv.remove();
        }
    });

    objects = [];

    // Clear buttons from the UI
    const cubeButtons = document.getElementById('cubeButtons');
    while (cubeButtons.firstChild) {
        cubeButtons.removeChild(cubeButtons.firstChild);
    }
    // Store the dimensions of the room in global variables for other functions to access and compare against
    roomWidth = width;
    roomHeight = height;
    roomLength = length;

    // Intializing the Three.js scene and renderer
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    scene.background = null;
    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true; // Enable shadows!!!
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('3d-container').innerHTML = '';
    document.getElementById('3d-container').appendChild(renderer.domElement);

    // Setup lighting in the room
    const pointLight = new THREE.PointLight(0xeeeeff, 1, 100);
    pointLight.position.set(0, height - 0.5, 0);
    pointLight.castShadow = true;
    pointLight.shadow.mapSize.width = 2048;
    pointLight.shadow.mapSize.height = 2048;
    pointLight.shadow.camera.near = 0.5;
    pointLight.shadow.camera.far = 1000;
    scene.add(pointLight);

    // Ambient Light to soften shadows which would be pitch black otherwise (which would be unrealistic)
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    // Visible light source (small sphere) so the user can see where the light is coming from
    const lightSphereGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const lightSphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const lightSphere = new THREE.Mesh(lightSphereGeometry, lightSphereMaterial);
    lightSphere.position.copy(pointLight.position);
    scene.add(lightSphere);

    // Mouse controls for rotating the room
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;

    // Room walls and floor material with slight transparency for walls
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xAAAAAA, side: THREE.DoubleSide, opacity: 0.5, transparent: true });
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xDDDDDD });

    // Creating the floor and adding it to the scene
    const floorGeometry = new THREE.PlaneGeometry(width, length);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Creating the walls and adding them to the scene
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

    // Initial camera position for when a room is created
    camera.position.set(width * 0.7, height * 2, length * 0.7);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    animate(); // Start the rendering loop of the scene
}

// Function for creating a furniture object based on user input
function createObject() {
    const name = document.getElementById('objName').value;
    const furnitureType = document.getElementById('furnitureType').value;
    const width = parseFloat(document.getElementById('objWidth').value);
    const height = parseFloat(document.getElementById('objHeight').value);
    const depth = parseFloat(document.getElementById('objDepth').value);

    if (furnitureType === 'door') {
        placeDoor(); // Handle door creation separately with placeDoor
    } else {
        loadModel(furnitureType, name, width, height, depth); // Handle general (chair, table, bed and drawer) furniture objects with loadModel
    }
}

// Function to load the 3D models of the funriture objects using the textures and meshes provided in the traverse
function loadModel(type, name, width, height, depth) {
    const loader = new THREE.GLTFLoader();
    let modelPath = `./models/${type}.glb`;

    loader.load(modelPath, function(gltf) {
        const model = gltf.scene;
        model.userData.name = name; // Store the name for later use

        model.traverse(function(node) { // Structured by Chat-GPT4o to have a better overview over the if-else statements
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;

                 // Load textures based on the object type (e.g., chair, table, etc.)
                const textureLoader = new THREE.TextureLoader();
                const exrLoader = new THREE.EXRLoader();
                let texturePrefix = `textures/${type}/`;

                // Load textures for each type of furniture
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

                // Set default material properties for roughness and metalness if textures are not available (shouldnt happen but if the Live Server isnt properly setup this can occur)
                node.material.roughness = 0.5;
                node.material.metalness = 0.5;

                node.material.needsUpdate = true;
            }
        });

        model.scale.set(width, height, depth);
        scene.add(model);
        objects.push(model);

        createLabelForObject(name, model); // Create and attach a label to the object
        createButtons(model, name); // Create interaction (select, rotate, delete) buttons for the object
    });
}

// Label creation for objects in the 3D space, called for upon any object creation, even when no name is given (it will create an empty label)
function createLabelForObject(name, object) {
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
    object.userData.labelDiv = labelDiv;
}

// Update the label position on the screen to match the object’s position in the 3D space (the scene the user sees)
function updateLabelPosition(object) {
    const labelDiv = object.userData.labelDiv;
    const position = toScreenPosition(object, camera);
    labelDiv.style.left = `${position.x}px`;
    labelDiv.style.top = `${position.y}px`;
}

// This function is a GPT4o-made solution, https://stackoverflow.com/questions/73180530/how-to-visualize-vector3-in-three-js didn't answer all my questions but helped a lot in understanding vectors in Three.js
// More info on use of GPT in this project in the documentation
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

// Special function (other that the placement of the textured objects) for creating a door object
function placeDoor() {
    const width = parseFloat(document.getElementById('doorWidth').value);
    const height = parseFloat(document.getElementById('doorHeight').value);
    const depth = 0.1; // Preset depth as it isn't usuall to have way thicker doors, so no option for user input is needed here
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const door = new THREE.Mesh(geometry, material);

    // Position the door and flush it against the back wall
    door.position.set(0, height / 2, -roomLength / 2 + depth / 2);
    door.castShadow = true;
    door.receiveShadow = true;
    scene.add(door);
    objects.push(door);

    // Add label to the object (always named "Door") and create Buttons to manually control its positioning
    createLabelForObject("Door", door);
    createButtons(door, "Door");
}

// This function renders the actual 3D Scene the user sees
function animate() {
    requestAnimationFrame(animate);
    
    objects.forEach(object => {
        updateLabelPosition(object); // Update Label position for each Object
    });
    // Render the current scene with current camera view
    controls.update(); 
    renderer.render(scene, camera);
}

// Function to create buttons for interacting with objects
function createButtons(obj, name, colorHex = '#ffffff') {
    // Styling happens in .js file for Buttons because of adjustments that have to happen when a user interacts with it (I didn't get it to work in .css for this function)
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.marginTop = '5px';
    
    // Create Select button to interact with the selected object
    const selectButton = document.createElement('button');
    selectButton.innerText = `Select ${name || `Object ${objects.length}`}`;
    selectButton.style.backgroundColor = colorHex;
    selectButton.style.color = 'black'; // Has to be set to black manually, so the text is visible on white background of button (#ffffff)
    selectButton.style.padding = '10px';
    selectButton.style.marginRight = '5px';
    selectButton.style.minWidth = '100px'; // Testing showed this to always be enough for reasonable button names
    selectButton.className = 'button-17';
    selectButton.addEventListener('click', () => selectObject(obj));

    // Create Rotate button to rotate the object by 45 degrees
    const rotateButton = document.createElement('button');
    rotateButton.innerText = 'Rotate';
    rotateButton.className = 'button-17';
    rotateButton.style.marginRight = '5px';
    rotateButton.addEventListener('click', () => rotateObject(obj));

    // Create Delete button to remove the object from the scene
    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'Delete';
    deleteButton.className = 'button-17';
    deleteButton.addEventListener('click', () => deleteObject(obj, buttonContainer));

    // Append buttons to the container and container to the DOM
    buttonContainer.appendChild(selectButton);
    buttonContainer.appendChild(rotateButton);
    buttonContainer.appendChild(deleteButton);
    document.getElementById('cubeButtons').appendChild(buttonContainer);
}

// Selecting logic so user input only influence thes currently selected object
function selectObject(object) {
    selectedObject = object;
}

// Function to rotate an object by 45 degrees, ensuring it doesn't collide with walls
function rotateObject(object) {
    const movementStep = 0.5; // Step per object movement
    const boundingBox = new THREE.Box3().setFromObject(object);
    const objectWidth = boundingBox.max.x - boundingBox.min.x;
    const objectDepth = boundingBox.max.z - boundingBox.min.z;
    const halfRoomWidth = roomWidth / 2;
    const halfRoomLength = roomLength / 2;
    
    // Check if the object is too close to any walls
    const isNearLeftWall = object.position.x - objectWidth / 2 <= -halfRoomWidth + movementStep;
    const isNearRightWall = object.position.x + objectWidth / 2 >= halfRoomWidth - movementStep;
    const isNearBackWall = object.position.z - objectDepth / 2 <= -halfRoomLength + movementStep;
    const isNearFrontWall = object.position.z + objectDepth / 2 >= halfRoomLength - movementStep;

    // If so, block the rotation
    if (isNearLeftWall || isNearRightWall || isNearBackWall || isNearFrontWall) {
        console.log("Rotation blocked: Object is too close to a wall.");
        return;
    }
    // Otherwise, allow the rotation
    object.rotation.y += Math.PI / 4;
}

// Function to delete an object and its buttons and label
function deleteObject(object, buttonContainer) {
    // Remove the object and all its buttons (Select, Rotate and Delete option) from the scene
    scene.remove(object);
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
    // Reset selectedObject if the deleted object was selected
    // When this wasn't implemented, you could try to move an object after its deletion, which would brick the entire Webpage
    if (selectedObject === object) {
        selectedObject = null;
    }
}

// Function to handle user keyboard input for moving objects
function onKeyPress(event) {
    // Don't allow movent by user input to happen when a modal is open
    if (isModalOpen) return;

    
    if (selectedObject) {
        const movementStep = 0.5;
        let newPosition = selectedObject.position.clone();
        // Handle keyboard input for moving the object (w, a, s, d, Space, Shift)
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
            // Y-directional movement is implemented in most of the functions that handle object movement but is disabled here, because there shouldn't be furniture or doors that can stay in mid-air
            // Y-directional movement was mainly used in testing when objects used to be created at the wrong place and moved throug hany and all sides of the bounding box
            // case ' ':
            //     newPosition.y += movementStep;
            //     break;
            // case 'Shift':
            //     newPosition.y -= movementStep;
            //     break;
        }
        // To move the object based on the calculated new position
        handleGeneralObjectMovement(newPosition); // Handle movement with the general movement function for all objects (meaning doors aswell as all textured objects)
    }
}

// Function to move objects while restricting movement within room boundaries
function handleGeneralObjectMovement(newPosition) {
    const boundingBox = new THREE.Box3().setFromObject(selectedObject);
    const objectHalfWidth = (boundingBox.max.x - boundingBox.min.x) / 2;
    const objectHalfDepth = (boundingBox.max.z - boundingBox.min.z) / 2;
    const objectHeight = boundingBox.max.y - boundingBox.min.y;

    // Calculate the boundaries of the room to restrict movement
    const minX = -roomWidth / 2 + objectHalfWidth;  // Left wall
    const maxX = roomWidth / 2 - objectHalfWidth;   // Right wall
    const minZ = -roomLength / 2 + objectHalfDepth; // Back wall
    const maxZ = roomLength / 2 - objectHalfDepth;  // Front wall
    const maxY = roomHeight - objectHeight; // Roof restriction follows from this (maxY)

    // Ensure object stays above the floor (y >= 0) and below the roof (y <= maxY)
    newPosition.y = Math.max(0, Math.min(newPosition.y, maxY));
        // Restrict X movement (left and right walls) to the rooms boundaries
        if (newPosition.x < minX) {
            selectedObject.position.x = minX;
        } else if (newPosition.x > maxX) {
            selectedObject.position.x = maxX;
        } else {
            selectedObject.position.x = newPosition.x;
        }
        // Restrict Z movement (back and front walls) to the rooms boundaries
        if (newPosition.z < minZ) {
            selectedObject.position.z = minZ;
        } else if (newPosition.z > maxZ) {
            selectedObject.position.z = maxZ;
        } else {
            selectedObject.position.z = newPosition.z;
        }
}

// Function to open Modal, also used in testing for console feedback
function openModal(modalId) {
    console.log('Opening modal:', modalId); // Was used for Testing to see if user input through mouse (left click) is recognizedy when there were issues with visual Feedback
    document.getElementById(modalId).style.display = 'block';
    isModalOpen = true;
}

// Function to close Modal by displaying 'none' (nothing) instead of the previously opened modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    isModalOpen = false;
}

// Event listener for user input (keystrokes of w, a, s or d)
window.addEventListener('keydown', onKeyPress);

// Solution to the following eventListener was inspired by GPTs Code Wizard
// Hides the initially created modals on page loading, found no other solution
window.addEventListener('DOMContentLoaded', (event) => {
    document.querySelectorAll('.modal').forEach(function(modal) {
        modal.style.display = 'none';
    });
});