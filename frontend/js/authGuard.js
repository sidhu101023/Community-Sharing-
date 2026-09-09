const AuthGuard = {

    /* ==========================================
       CHECK LOGIN
    ========================================== */

    isLoggedIn() {

        return !!localStorage.getItem("token");

    },


    /* ==========================================
       GET CURRENT PAGE
    ========================================== */

    getCurrentPage() {

        let page =
            window.location.pathname
                .split("/")
                .pop();

        // If opening root folder
        if (!page) {

            page = "resources.html";

        }

        return page;

    },


    /* ==========================================
       SHOW LOGIN
    ========================================== */

    showLogin() {

        const loginModal =
            document.getElementById("loginModal");

        const registerModal =
            document.getElementById("registerModal");


        if (registerModal) {

            registerModal.classList.add("hidden");

        }


        if (loginModal) {

            loginModal.classList.remove("hidden");

        }

    },


    /* ==========================================
       HIDE LOGIN
    ========================================== */

    hideLogin() {

        const loginModal =
            document.getElementById("loginModal");

        if (loginModal) {

            loginModal.classList.add("hidden");

        }

    },


    /* ==========================================
       PROTECT ACTION
    ========================================== */

    requireLogin() {

        if (!this.isLoggedIn()) {

            this.showLogin();

            return false;

        }

        return true;

    },


    /* ==========================================
       PROTECT NAVIGATION
    ========================================== */

    protectNavigation(event) {

        if (!this.isLoggedIn()) {

            event.preventDefault();

            this.showLogin();

            return false;

        }

        return true;

    },


    /* ==========================================
       INITIAL LOGIN CHECK
    ========================================== */

    init() {

        const currentPage =
            this.getCurrentPage();


        /*
         * Only Resources page automatically
         * opens Login after 1.5 seconds.
         *
         * We DO NOT show Login automatically
         * on Transactions page.
         */

        if (
            currentPage === "resources.html" &&
            !this.isLoggedIn()
        ) {

            setTimeout(() => {

                // Check again after 1.5 seconds
                if (!this.isLoggedIn()) {

                    this.showLogin();

                }

            }, 1500);

        }


        /* ======================================
           TRANSACTIONS LINK
        ====================================== */

        const transactionLink =
            document.querySelector(
                'a[href="transactions.html"]'
            );


        if (transactionLink) {

            transactionLink.addEventListener(
                "click",
                (event) => {

                    this.protectNavigation(event);

                }
            );

        }


        /* ======================================
           ADD RESOURCE
        ====================================== */

        const addResourceBtn =
            document.getElementById(
                "addResourceBtn"
            );


        if (addResourceBtn) {

            addResourceBtn.addEventListener(
                "click",
                (event) => {

                    event.preventDefault();


                    if (!this.requireLogin()) {

                        return;

                    }


                    const resourceModal =
                        document.getElementById(
                            "resourceModal"
                        );


                    if (resourceModal) {

                        resourceModal.classList.remove(
                            "hidden"
                        );

                    }

                }
            );

        }


        /* ======================================
           PROFILE BUTTON
        ====================================== */

        const profileBtn =
            document.getElementById(
                "profileBtn"
            );


        if (profileBtn) {

            profileBtn.addEventListener(
                "click",
                (event) => {

                    event.preventDefault();


                    if (!this.requireLogin()) {

                        return;

                    }


                    const profilePanel =
                        document.getElementById(
                            "profilePanel"
                        );


                    if (profilePanel) {

                        profilePanel.classList.add(
                            "active"
                        );

                    }

                }
            );

        }

    }

};


/* ==========================================
   START AUTH GUARD
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        AuthGuard.init();

    }
);