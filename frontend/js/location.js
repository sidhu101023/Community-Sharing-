/* ==========================================
   LOCATION PICKER
   Handles:
   1. Registration location
   2. Resource location
========================================== */


/* ==========================================
   REGISTER MAP VARIABLES
========================================== */

let registerMap = null;
let registerMarker = null;

let registerLatitude = null;
let registerLongitude = null;
let registerAddress = "";


/* ==========================================
   RESOURCE MAP VARIABLES
========================================== */

let resourceMap = null;
let resourceMarker = null;

let resourceLatitude = null;
let resourceLongitude = null;
let resourceAddress = "";


/* ==========================================
   REGISTER ELEMENTS
========================================== */

const locationModal =
    document.getElementById("locationModal");

const registerMapBtn =
    document.getElementById("registerMapBtn");

const closeLocationModal =
    document.getElementById("closeLocationModal");

const confirmLocationBtn =
    document.getElementById("confirmLocationBtn");

const registerSelectedLocation =
    document.getElementById(
        "registerSelectedLocation"
    );

const mapAddress =
    document.getElementById("mapAddress");


/* ==========================================
   RESOURCE ELEMENTS
========================================== */

const resourceLocationModal =
    document.getElementById(
        "resourceLocationModal"
    );

const resourceMapBtn =
    document.getElementById(
        "resourceMapBtn"
    );

const closeResourceLocationModal =
    document.getElementById(
        "closeResourceLocationModal"
    );

const confirmResourceLocationBtn =
    document.getElementById(
        "confirmResourceLocationBtn"
    );

const resourceSelectedLocation =
    document.getElementById(
        "resourceSelectedLocation"
    );

const resourceMapAddress =
    document.getElementById(
        "resourceMapAddress"
    );


/* =========================================================
   REGISTER LOCATION
========================================================= */


/* ==========================================
   OPEN REGISTER MAP
========================================== */

if (registerMapBtn) {

    registerMapBtn.addEventListener(
        "click",
        function () {

            locationModal.classList.remove(
                "hidden"
            );


            setTimeout(() => {

                initializeRegisterMap();

            }, 100);

        }
    );

}


/* ==========================================
   INITIALIZE REGISTER MAP
========================================== */

function initializeRegisterMap() {

    if (registerMap) {

        registerMap.invalidateSize();

        return;

    }


    /*
     * Default location = Pune
     */

    const defaultLatitude = 18.5204;
    const defaultLongitude = 73.8567;


    registerMap =
        L.map("registerMap").setView(
            [
                defaultLatitude,
                defaultLongitude
            ],
            13
        );


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,

            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(registerMap);


    registerMap.on(
        "click",
        async function (event) {

            registerLatitude =
                event.latlng.lat;

            registerLongitude =
                event.latlng.lng;


            /* Remove previous marker */

            if (registerMarker) {

                registerMap.removeLayer(
                    registerMarker
                );

            }


            /* Create new marker */

            registerMarker =
                L.marker([
                    registerLatitude,
                    registerLongitude
                ])
                .addTo(registerMap);


            registerMarker
                .bindPopup(
                    "Selected Location"
                )
                .openPopup();


            mapAddress.textContent =
                "Getting address...";


            /* Get address */

            await getRegisterAddress(
                registerLatitude,
                registerLongitude
            );

        }
    );

}


/* ==========================================
   REGISTER REVERSE GEOCODING
========================================== */

async function getRegisterAddress(
    latitude,
    longitude
) {

    try {

        const response =
            await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to get address"
            );

        }


        const data =
            await response.json();


        registerAddress =
            data.display_name ||
            "Selected location";


        mapAddress.textContent =
            registerAddress;

    } catch (error) {

        console.error(
            "Register location error:",
            error
        );


        registerAddress =
            `Latitude: ${latitude.toFixed(6)}, Longitude: ${longitude.toFixed(6)}`;


        mapAddress.textContent =
            registerAddress;

    }

}


/* ==========================================
   CONFIRM REGISTER LOCATION
========================================== */

if (confirmLocationBtn) {

    confirmLocationBtn.addEventListener(
        "click",
        function () {

            if (
                registerLatitude === null ||
                registerLongitude === null
            ) {

                alert(
                    "Please select your location on the map."
                );

                return;

            }


            document.getElementById(
                "registerLatitude"
            ).value =
                registerLatitude;


            document.getElementById(
                "registerLongitude"
            ).value =
                registerLongitude;


            document.getElementById(
                "registerLocation"
            ).value =
                registerAddress;


            registerSelectedLocation.textContent =
                registerAddress;


            locationModal.classList.add(
                "hidden"
            );

        }
    );

}


/* ==========================================
   CLOSE REGISTER MAP
========================================== */

if (closeLocationModal) {

    closeLocationModal.addEventListener(
        "click",
        function () {

            locationModal.classList.add(
                "hidden"
            );

        }
    );

}


/* =========================================================
   RESOURCE LOCATION
========================================================= */


/* ==========================================
   OPEN RESOURCE MAP
========================================== */

if (resourceMapBtn) {

    resourceMapBtn.addEventListener(
        "click",
        function () {

            resourceLocationModal.classList.remove(
                "hidden"
            );


            setTimeout(() => {

                initializeResourceMap();

            }, 100);

        }
    );

}


/* ==========================================
   INITIALIZE RESOURCE MAP
========================================== */

function initializeResourceMap() {

    if (resourceMap) {

        resourceMap.invalidateSize();

        return;

    }


    /*
     * Default location = Pune
     */

    const defaultLatitude = 18.5204;
    const defaultLongitude = 73.8567;


    resourceMap =
        L.map("resourceMap").setView(
            [
                defaultLatitude,
                defaultLongitude
            ],
            13
        );


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,

            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(resourceMap);


    resourceMap.on(
        "click",
        async function (event) {

            resourceLatitude =
                event.latlng.lat;

            resourceLongitude =
                event.latlng.lng;


            /* Remove old marker */

            if (resourceMarker) {

                resourceMap.removeLayer(
                    resourceMarker
                );

            }


            /* Create new marker */

            resourceMarker =
                L.marker([
                    resourceLatitude,
                    resourceLongitude
                ])
                .addTo(resourceMap);


            resourceMarker
                .bindPopup(
                    "Resource Location"
                )
                .openPopup();


            resourceMapAddress.textContent =
                "Getting address...";


            /* Reverse geocoding */

            await getResourceAddress(
                resourceLatitude,
                resourceLongitude
            );

        }
    );

}


/* ==========================================
   RESOURCE REVERSE GEOCODING
========================================== */

async function getResourceAddress(
    latitude,
    longitude
) {

    try {

        const response =
            await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to get address"
            );

        }


        const data =
            await response.json();


        resourceAddress =
            data.display_name ||
            "Selected location";


        resourceMapAddress.textContent =
            resourceAddress;

    } catch (error) {

        console.error(
            "Resource location error:",
            error
        );


        resourceAddress =
            `Latitude: ${latitude.toFixed(6)}, Longitude: ${longitude.toFixed(6)}`;


        resourceMapAddress.textContent =
            resourceAddress;

    }

}


/* ==========================================
   CONFIRM RESOURCE LOCATION
========================================== */

if (confirmResourceLocationBtn) {

    confirmResourceLocationBtn.addEventListener(
        "click",
        function () {

            if (
                resourceLatitude === null ||
                resourceLongitude === null
            ) {

                alert(
                    "Please select resource location on the map."
                );

                return;

            }


            document.getElementById(
                "resourceLatitude"
            ).value =
                resourceLatitude;


            document.getElementById(
                "resourceLongitude"
            ).value =
                resourceLongitude;


            document.getElementById(
                "resourceLocation"
            ).value =
                resourceAddress;


            resourceSelectedLocation.textContent =
                resourceAddress;


            resourceLocationModal.classList.add(
                "hidden"
            );

        }
    );

}


/* ==========================================
   CLOSE RESOURCE MAP
========================================== */

if (closeResourceLocationModal) {

    closeResourceLocationModal.addEventListener(
        "click",
        function () {

            resourceLocationModal.classList.add(
                "hidden"
            );

        }
    );

}


/* ==========================================
   CLICK OUTSIDE RESOURCE MAP
========================================== */

if (resourceLocationModal) {

    resourceLocationModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                resourceLocationModal
            ) {

                resourceLocationModal.classList.add(
                    "hidden"
                );

            }

        }
    );

}


/* ==========================================
   CLICK OUTSIDE REGISTER MAP
========================================== */

if (locationModal) {

    locationModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                locationModal
            ) {

                locationModal.classList.add(
                    "hidden"
                );

            }

        }
    );

}