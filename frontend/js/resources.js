const resourceContainer =
    document.getElementById(
        "resourceContainer"
    );

let selectedCategory = "All Resources";


/* ==========================================
   LOAD RESOURCES
========================================== */

async function loadResources() {

    try {

        const searchInput =
            document.getElementById(
                "searchInput"
            );

        const distanceInput =
            document.getElementById(
                "distanceInput"
            );


        const search =
            searchInput
                ? searchInput.value.trim()
                : "";


        const distance =
            distanceInput
                ? distanceInput.value.trim()
                : "";


        let url =
            `/resources?search=${encodeURIComponent(search)}`;


        if (
            selectedCategory !==
            "All Resources"
        ) {

            url +=
                `&category=${encodeURIComponent(
                    selectedCategory
                )}`;

        }


        /*
         * Send distance to backend
         *
         * Backend can use it if implemented.
         */

        if (distance !== "") {

            url +=
                `&distance=${encodeURIComponent(
                    distance
                )}`;

        }


        const resources =
            await apiRequest(url);


        displayResources(resources);


    } catch (error) {

        console.error(
            "Loading resources error:",
            error
        );

        resourceContainer.innerHTML = `
            <div class="resource-message">
                <h3>Unable to load resources</h3>
                <p>Please try again.</p>
            </div>
        `;

    }

}


/* ==========================================
   GET USER
========================================== */

function getCurrentUser() {

    try {

        return JSON.parse(
            localStorage.getItem("user")
        );

    } catch (error) {

        return null;

    }

}


/* ==========================================
   GET USER COORDINATES
========================================== */

function getUserCoordinates() {

    const user =
        getCurrentUser();


    if (!user) {
        return null;
    }


    if (
        user.location &&
        typeof user.location === "object" &&
        user.location.latitude != null &&
        user.location.longitude != null
    ) {

        return {

            latitude:
                Number(
                    user.location.latitude
                ),

            longitude:
                Number(
                    user.location.longitude
                )

        };

    }


    return null;

}


/* ==========================================
   GET RESOURCE COORDINATES
========================================== */

function getResourceCoordinates(
    resource
) {

    if (
        !resource.location ||
        typeof resource.location !== "object"
    ) {

        return null;

    }


    if (
        resource.location.latitude == null ||
        resource.location.longitude == null
    ) {

        return null;

    }


    return {

        latitude:
            Number(
                resource.location.latitude
            ),

        longitude:
            Number(
                resource.location.longitude
            )

    };

}


/* ==========================================
   DISTANCE CALCULATION
========================================== */

function calculateDistance(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const earthRadius = 6371;


    const dLat =
        toRadians(lat2 - lat1);

    const dLon =
        toRadians(lon2 - lon1);


    const a =
        Math.sin(dLat / 2) *
        Math.sin(dLat / 2)

        +

        Math.cos(
            toRadians(lat1)
        )

        *

        Math.cos(
            toRadians(lat2)
        )

        *

        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);


    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );


    return earthRadius * c;

}


function toRadians(value) {

    return value *
        Math.PI /
        180;

}


/* ==========================================
   RESOURCE DISTANCE
========================================== */

function getResourceDistance(
    resource
) {

    const userCoordinates =
        getUserCoordinates();


    const resourceCoordinates =
        getResourceCoordinates(
            resource
        );


    if (
        !userCoordinates ||
        !resourceCoordinates
    ) {

        return null;

    }


    return calculateDistance(

        userCoordinates.latitude,

        userCoordinates.longitude,

        resourceCoordinates.latitude,

        resourceCoordinates.longitude

    );

}


/* ==========================================
   DISPLAY RESOURCES
========================================== */

function displayResources(
    resources
) {

    resourceContainer.innerHTML = "";


    if (
        !resources ||
        resources.length === 0
    ) {

        resourceContainer.innerHTML = `
            <div class="resource-message">

                <h3>
                    No resources found
                </h3>

                <p>
                    Try another resource,
                    category or distance.
                </p>

            </div>
        `;

        return;

    }


    /*
     * Sort resources by distance
     * if user coordinates are available.
     */

    resources.sort(
        (a, b) => {

            const distanceA =
                getResourceDistance(a);

            const distanceB =
                getResourceDistance(b);


            if (
                distanceA === null &&
                distanceB === null
            ) {

                return 0;

            }


            if (distanceA === null) {
                return 1;
            }


            if (distanceB === null) {
                return -1;
            }


            return distanceA - distanceB;

        }
    );


    /*
     * TWO HORIZONTAL ROWS ONLY
     */

    const row1 =
        document.createElement("div");

    const row2 =
        document.createElement("div");


    row1.className =
        "resource-row";

    row2.className =
        "resource-row";


    resources.forEach(
        (resource, index) => {

            const card =
                createResourceCard(
                    resource
                );


            /*
             * Odd/even distribution
             */

            if (index % 2 === 0) {

                row1.appendChild(card);

            } else {

                row2.appendChild(card);

            }

        }
    );


    resourceContainer.appendChild(row1);

    /*
     * Only add second row if required.
     */

    if (row2.children.length > 0) {

        resourceContainer.appendChild(row2);

    }

}


/* ==========================================
   CREATE CARD
========================================== */

function createResourceCard(
    resource
) {

    const card =
        document.createElement("div");


    card.className =
        "resource-card";


    const name =
        resource.name ||
        "Unnamed Resource";


    const category =
        resource.category ||
        "Other";


    const description =
        resource.description ||
        "";


    const image =
        resource.image ||
        "https://via.placeholder.com/400x250?text=No+Image";


    const distance = Number.isFinite(resource.distance)
        ? resource.distance
        : getResourceDistance(resource);


    let distanceText =
        "Distance unavailable";


    if (distance !== null) {

        distanceText =
            `${distance.toFixed(1)} km away`;

    }


    /*
     * Current logged-in user
     */

    const user =
        getCurrentUser();


    const currentUserId =
        user?._id ||
        user?.id;


    /*
     * Resource owner
     */

    const ownerId =
        resource.owner?._id ||
        resource.owner?.id ||
        resource.owner;


    const isOwner =
        currentUserId &&
        ownerId &&
        String(currentUserId) ===
        String(ownerId);


    card.innerHTML = `

        <div class="resource-image-wrapper">

            <img
                class="resource-image"
                src="${escapeHTML(image)}"
                alt="${escapeHTML(name)}"
                onerror="
                    this.src='https://via.placeholder.com/400x250?text=No+Image'
                "
            >

        </div>


        <div class="resource-content">

            <h3>
                ${escapeHTML(name)}
            </h3>

            <div class="category-text">

                ${escapeHTML(category)}

            </div>


            <p class="distance-text">

                📍 ${escapeHTML(distanceText)}

            </p>


            ${
                isOwner

                ?

                `
                <button
                    class="request-btn disabled"
                    disabled
                >
                    Your Resource
                </button>
                `

                : resource.availability !== "Available"

                ? `
                <button class="request-btn disabled" disabled>
                    Unavailable
                </button>`

                :

                `
                <button
                    class="request-btn"
                    data-resource-id="${resource._id}"
                >
                    Request Resource
                </button>
                `
            }

        </div>

    `;


    /*
     * Request button
     */

    const requestButton =
        card.querySelector(
            ".request-btn:not(.disabled)"
        );


    if (requestButton) {

        requestButton.addEventListener(
            "click",
            () => {

                requestResource(
                    resource._id
                );

            }
        );

    }


    return card;

}


/* ==========================================
   REQUEST RESOURCE
========================================== */

async function requestResource(
    resourceId
) {

    const token =
        localStorage.getItem(
            "token"
        );


    if (!token) {

        const loginModal =
            document.getElementById(
                "loginModal"
            );


        if (loginModal) {

            loginModal.classList.remove(
                "hidden"
            );

        }

        return;

    }


    try {

        await apiRequest(
            "/transactions/request",
            {

                method: "POST",

                body: JSON.stringify({

                    resourceId:
                        resourceId

                })

            }
        );


        alert(
            "Resource request sent!"
        );


    } catch (error) {

        alert(
            error.message
        );

    }

}


/* ==========================================
   CATEGORY FILTER
========================================== */

document
    .querySelectorAll(".category")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".category")
                    .forEach(btn => {

                        btn.classList.remove(
                            "active"
                        );

                    });


                button.classList.add(
                    "active"
                );


                selectedCategory =
                    button.textContent.trim();


                loadResources();

            }
        );

    });


/* ==========================================
   SEARCH BUTTON
========================================== */

const searchBtn =
    document.getElementById(
        "searchBtn"
    );


if (searchBtn) {

    searchBtn.addEventListener(
        "click",
        loadResources
    );

}


/* ==========================================
   ENTER KEY SEARCH
========================================== */

const searchInput =
    document.getElementById(
        "searchInput"
    );


const distanceInput =
    document.getElementById(
        "distanceInput"
    );


if (searchInput) {

    searchInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                loadResources();

            }

        }
    );

}


if (distanceInput) {

    distanceInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                loadResources();

            }

        }
    );

}


/* ==========================================
   ADD RESOURCE MODAL
========================================== */

const resourceModal =
    document.getElementById(
        "resourceModal"
    );


const addResourceBtn =
    document.getElementById(
        "addResourceBtn"
    );


const closeResourceModal =
    document.getElementById(
        "closeResourceModal"
    );


if (addResourceBtn) {

    addResourceBtn.addEventListener(
        "click",
        () => {

            const token =
                localStorage.getItem(
                    "token"
                );


            if (!token) {

                const loginModal =
                    document.getElementById(
                        "loginModal"
                    );


                if (loginModal) {

                    loginModal.classList.remove(
                        "hidden"
                    );

                }

                return;

            }


            resourceModal.classList.remove(
                "hidden"
            );

        }
    );

}


if (closeResourceModal) {

    closeResourceModal.addEventListener(
        "click",
        () => {

            resourceModal.classList.add(
                "hidden"
            );

        }
    );

}


/* ==========================================
   ADD RESOURCE
========================================== */

const resourceForm =
    document.getElementById(
        "resourceForm"
    );


if (resourceForm) {

    resourceForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            try {

                const locationAddress =
                    document.getElementById(
                        "resourceLocation"
                    ).value;


                const latitudeElement =
                    document.getElementById(
                        "resourceLatitude"
                    );


                const longitudeElement =
                    document.getElementById(
                        "resourceLongitude"
                    );


                const latitude =
                    latitudeElement
                        ? Number(
                            latitudeElement.value
                        )
                        : null;


                const longitude =
                    longitudeElement
                        ? Number(
                            longitudeElement.value
                        )
                        : null;


                if (
                    latitude === null ||
                    longitude === null ||
                    Number.isNaN(latitude) ||
                    Number.isNaN(longitude)
                ) {

                    alert(
                        "Please select the resource location on the map."
                    );

                    return;

                }


                await apiRequest(
                    "/resources",
                    {

                        method: "POST",

                        body:
                            JSON.stringify({

                                name:
                                    document.getElementById(
                                        "resourceName"
                                    ).value,

                                category:
                                    document.getElementById(
                                        "resourceCategory"
                                    ).value,

                                description:
                                    document.getElementById(
                                        "resourceDescription"
                                    ).value,

                                condition:
                                    document.getElementById(
                                        "resourceCondition"
                                    ).value,

                                location: {

                                    address:
                                        locationAddress,

                                    latitude:
                                        latitude,

                                    longitude:
                                        longitude

                                },

                                image: await imageToDataUrl(document.getElementById("resourceImage")),

                                availability:
                                    document.getElementById(
                                        "resourceAvailability"
                                    ).value

                            })

                    }
                );


                alert(
                    "Resource added successfully!"
                );


                resourceModal.classList.add(
                    "hidden"
                );


                resourceForm.reset();


                /*
                 * Reload cards
                 */

                loadResources();


            } catch (error) {

                alert(
                    error.message
                );

            }

        }
    );


}


/* ==========================================
   ESCAPE HTML
========================================== */

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}

function imageToDataUrl(input) {
    const file = input?.files?.[0];
    if (!file) return Promise.resolve("");
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Unable to read the selected image."));
        reader.readAsDataURL(file);
    });
}


/* ==========================================
   INITIAL LOAD
========================================== */

loadResources();
