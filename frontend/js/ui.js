document.addEventListener(
    "DOMContentLoaded",
    function () {


        /* ==========================================
           PROFILE PANEL
        ========================================== */

        const profileBtn =
            document.getElementById(
                "profileBtn"
            );


        const profilePanel =
            document.getElementById(
                "profilePanel"
            );


        const closeProfile =
            document.getElementById(
                "closeProfile"
            );


        /*
         * Profile opening is handled by authGuard.js.
         *
         * Here we only handle closing.
         */

        if (
            closeProfile &&
            profilePanel
        ) {

            closeProfile.addEventListener(
                "click",
                function () {

                    profilePanel.classList.remove(
                        "active"
                    );

                }
            );

        }


        /* ==========================================
           CLOSE PROFILE WHEN CLICKING OUTSIDE
        ========================================== */

        document.addEventListener(
            "click",
            function (event) {

                if (
                    profilePanel &&
                    profilePanel.classList.contains(
                        "active"
                    ) &&
                    profileBtn &&
                    !profilePanel.contains(event.target) &&
                    !profileBtn.contains(event.target)
                ) {

                    profilePanel.classList.remove(
                        "active"
                    );

                }

            }
        );


        /* ==========================================
           LOGIN / REGISTER MODALS
        ========================================== */

        const loginModal =
            document.getElementById(
                "loginModal"
            );


        const registerModal =
            document.getElementById(
                "registerModal"
            );


        const showRegister =
            document.getElementById(
                "showRegister"
            );


        const showLogin =
            document.getElementById(
                "showLogin"
            );


        /*
         * These buttons are handled by auth.js.
         *
         * We DON'T add another event listener here.
         *
         * This prevents duplicate behavior.
         */


        /* ==========================================
           CLICK OUTSIDE NORMAL MODALS
        ========================================== */

        document
            .querySelectorAll(".modal")
            .forEach(function (modal) {

                modal.addEventListener(
                    "click",
                    function (event) {

                        /*
                         * Don't allow logged-out user
                         * to close Login modal on
                         * Resources page.
                         */

                        if (
                            modal.id === "loginModal" &&
                            !AuthGuard.isLoggedIn() &&
                            AuthGuard.getCurrentPage() ===
                                "resources.html"
                        ) {

                            return;

                        }


                        if (
                            event.target === modal
                        ) {

                            modal.classList.add(
                                "hidden"
                            );

                        }

                    }
                );

            });


        /* ==========================================
           NAVBAR ACTIVE PAGE
        ========================================== */

        let currentPage =
            window.location.pathname
                .split("/")
                .pop();


        if (!currentPage) {

            currentPage =
                "resources.html";

        }


        document
            .querySelectorAll(
                ".navbar nav a"
            )
            .forEach(function (link) {

                const href =
                    link.getAttribute("href");


                if (
                    href === currentPage
                ) {

                    link.classList.add(
                        "active"
                    );

                } else {

                    link.classList.remove(
                        "active"
                    );

                }

            });


        /* ==========================================
           SIDEBAR CATEGORY
        ========================================== */

        const categories =
            document.querySelectorAll(
                ".category"
            );


        categories.forEach(
            function (category) {

                category.addEventListener(
                    "click",
                    function () {


                        categories.forEach(
                            function (item) {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );


                        category.classList.add(
                            "active"
                        );


                        /*
                         * Send selected category
                         * to resources.js if available.
                         */

                        const selectedCategory =
                            category.textContent.trim();


                        document.dispatchEvent(
                            new CustomEvent(
                                "categorySelected",
                                {
                                    detail: {
                                        category:
                                            selectedCategory
                                    }
                                }
                            )
                        );

                    }
                );

            }
        );


        /* ==========================================
           ESC KEY
        ========================================== */

        document.addEventListener(
            "keydown",
            function (event) {

                if (event.key !== "Escape") {

                    return;

                }


                /*
                 * Profile can always be closed
                 * if user is logged in.
                 */

                if (profilePanel) {

                    profilePanel.classList.remove(
                        "active"
                    );

                }


                const resourceModal =
                    document.getElementById(
                        "resourceModal"
                    );


                if (resourceModal) {

                    resourceModal.classList.add(
                        "hidden"
                    );

                }


                /*
                 * Register can be closed.
                 */

                if (registerModal) {

                    registerModal.classList.add(
                        "hidden"
                    );

                }


                /*
                 * Login:
                 * Don't close if user is logged out
                 * on Resources page.
                 */

                if (
                    loginModal &&
                    (
                        AuthGuard.isLoggedIn() ||
                        AuthGuard.getCurrentPage() !==
                            "resources.html"
                    )
                ) {

                    loginModal.classList.add(
                        "hidden"
                    );

                }

            }
        );


    }
);