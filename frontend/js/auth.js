/* ==========================================
   MODALS
========================================== */

const loginModal =
    document.getElementById("loginModal");

const registerModal =
    document.getElementById("registerModal");


/* ==========================================
   LOGIN
========================================== */

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();


            const email =
                document.getElementById(
                    "loginEmail"
                ).value.trim();


            const password =
                document.getElementById(
                    "loginPassword"
                ).value;


            if (!email || !password) {

                alert("Please enter email and password.");

                return;

            }


            try {

                const data =
                    await apiRequest(
                        "/auth/login",
                        {
                            method: "POST",

                            body: JSON.stringify({
                                email: email,
                                password: password
                            })
                        }
                    );


                /* ==============================
                   SAVE LOGIN INFORMATION
                ============================== */

                localStorage.setItem(
                    "token",
                    data.token
                );


                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );


                /* ==============================
                   CLOSE LOGIN
                ============================== */

                if (loginModal) {

                    loginModal.classList.add(
                        "hidden"
                    );

                }


                alert("Login successful!");


                /* ==============================
                   GO TO RESOURCES
                ============================== */

                window.location.href =
                    "resources.html";

            } catch (error) {

                alert(error.message);

            }

        }
    );

}


/* ==========================================
   SHOW REGISTER
========================================== */

const showRegister =
    document.getElementById(
        "showRegister"
    );


if (showRegister) {

    showRegister.addEventListener(
        "click",
        () => {

            if (loginModal) {

                loginModal.classList.add(
                    "hidden"
                );

            }


            if (registerModal) {

                registerModal.classList.remove(
                    "hidden"
                );

            }

        }
    );

}


/* ==========================================
   SHOW LOGIN FROM REGISTER
========================================== */

const showLogin =
    document.getElementById(
        "showLogin"
    );


if (showLogin) {

    showLogin.addEventListener(
        "click",
        () => {

            if (registerModal) {

                registerModal.classList.add(
                    "hidden"
                );

            }


            if (loginModal) {

                loginModal.classList.remove(
                    "hidden"
                );

            }

        }
    );

}


/* ==========================================
   REGISTER
========================================== */

const registerForm =
    document.getElementById(
        "registerForm"
    );


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();


            const name =
                document.getElementById(
                    "registerName"
                ).value.trim();


            const email =
                document.getElementById(
                    "registerEmail"
                ).value.trim();


            const password =
                document.getElementById(
                    "registerPassword"
                ).value;


            const confirmPassword =
                document.getElementById(
                    "registerConfirmPassword"
                ).value;


            const locationAddress = document.getElementById("registerLocation").value.trim();


            const latitude =
                document.getElementById(
                    "registerLatitude"
                )?.value;


            const longitude =
                document.getElementById(
                    "registerLongitude"
                )?.value;


            /* ==============================
               VALIDATION
            ============================== */

            if (
                !name ||
                !email ||
                !password ||
                !confirmPassword
            ) {

                alert(
                    "Please fill all required fields."
                );

                return;

            }


            if (password !== confirmPassword) {

                alert(
                    "Passwords do not match."
                );

                return;

            }


            if (password.length < 6) {

                alert(
                    "Password must be at least 6 characters."
                );

                return;

            }


            if (!locationAddress || !latitude || !longitude) {

                alert(
                    "Please select your location."
                );

                return;

            }


            try {

                const registerData = {
                    name,
                    email,
                    password,
                    location: {
                        address: locationAddress,
                        latitude: Number(latitude),
                        longitude: Number(longitude)
                    }
                };


                await apiRequest(
                    "/auth/register",
                    {
                        method: "POST",

                        body: JSON.stringify(
                            registerData
                        )
                    }
                );


                alert(
                    "Registration successful. Please login."
                );


                /* ==============================
                   CLEAR REGISTER FORM
                ============================== */

                registerForm.reset();


                /* ==============================
                   SHOW LOGIN
                ============================== */

                if (registerModal) {

                    registerModal.classList.add(
                        "hidden"
                    );

                }


                if (loginModal) {

                    loginModal.classList.remove(
                        "hidden"
                    );

                }

            } catch (error) {

                alert(error.message);

            }

        }
    );

}


/* ==========================================
   LOGIN MODAL CLOSE BUTTON
========================================== */

const closeLoginModal =
    document.getElementById(
        "closeLoginModal"
    );


if (closeLoginModal && loginModal) {

    closeLoginModal.addEventListener(
        "click",
        () => {

            /*
             * If user is logged out,
             * don't allow closing login
             * on Resources page.
             */

            if (
                !AuthGuard.isLoggedIn() &&
                AuthGuard.getCurrentPage() ===
                    "resources.html"
            ) {

                return;

            }


            loginModal.classList.add(
                "hidden"
            );

        }
    );

}


/* ==========================================
   REGISTER MODAL CLOSE BUTTON
========================================== */

const closeRegisterModal =
    document.getElementById(
        "closeRegisterModal"
    );


if (closeRegisterModal && registerModal) {

    closeRegisterModal.addEventListener(
        "click",
        () => {

            registerModal.classList.add(
                "hidden"
            );

        }
    );

}
