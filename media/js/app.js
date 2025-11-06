

class MenuBar {
    constructor(id, menu) {
        this.id = id;
        this.menu = menu;

        // This is actually the menu Container, must rename this to be accurate
        this.menuNode = document.getElementById(this.id);

        console.log(menu)

        let menuBarNode = document.createElement("ul");
        menuBarNode.classList.add("menubar");

        this.createMenuHelper(menuBarNode, menu);

        this.menuNode.appendChild(menuBarNode);
    }

    createMenuHelper(menuContainer, menuItems) {
        if (!menuItems) { return; }

        menuItems.forEach(menuItem => {
            console.log(menuItem);

            let menuItemNode = document.createElement("li");
            let menuBtn = document.createElement("button");

            menuBtn.textContent = menuItem.label;

            menuItemNode.appendChild(menuBtn);
            menuContainer.appendChild(menuItemNode);

            if (menuItem.action) {
                menuItemNode.addEventListener("click", menuItem.action);
            }

            if (menuItem.items) {
                let menuBarNode = document.createElement("ul");
                menuBarNode.classList.add("menu");
                this.createMenuHelper(menuBarNode, menuItem.items);
                menuContainer.appendChild(menuBarNode);

                menuItemNode.addEventListener("click", () => {
                    let boundingRect = menuItemNode.getBoundingClientRect();
                    menuBarNode.classList.toggle("show");

                    menuBarNode.style.transform = `translate(${boundingRect.x}px, ${boundingRect.bottom}px)`;
                });
            }

        });
    }
}

class ContextMenu {
    constructor(id, menu, x, y) {
        this.container = document.getElementById(id);
        this.menuNode = document.createElement("div");
        this.menuNode.classList.add("menu");
        this.menuNode.style.display = "block";
        this.menuNode.style.transform = `translate(${x}px, ${y}px)`;

        this.menu = menu;

        let menuBarNode = document.createElement("ul");
        menuBarNode.classList.add("menu");

        this.createMenuHelper(this.menuNode, menu);

        this.container.appendChild(this.menuNode);

        this.closeMenu = this.closeMenu.bind(this);

        setTimeout(() => {
            window.addEventListener("click", this.closeMenu);
            window.addEventListener("blur", this.closeMenu);
            window.addEventListener("keydown", this.closeMenu);
            window.addEventListener("contextmenu", this.closeMenu);
        }, 0);
    }

    closeMenu(e) {
        if (e?.key && e.key !== "Escape") return;

        console.log("close")

        window.removeEventListener("click", this.closeMenu);
        window.removeEventListener("blur", this.closeMenu);
        window.removeEventListener("keydown", this.closeMenu);
        window.removeEventListener("contextmenu", this.closeMenu);

        this.container.removeChild(this.menuNode);

    }

    createMenuHelper(menuContainer, menuItems) {
        if (!menuItems) { return; }

        menuItems.forEach(menuItem => {
            console.log(menuItem);

            let menuItemNode = document.createElement("li");
            let menuBtn = document.createElement("button");

            menuBtn.textContent = menuItem.label;

            menuItemNode.appendChild(menuBtn);
            menuContainer.appendChild(menuItemNode);

            if (menuItem.action) {
                menuItemNode.addEventListener("click", menuItem.action);
            }

            if (menuItem.items) {
                let menuBarNode = document.createElement("ul");
                menuBarNode.classList.add("menu");
                this.createMenuHelper(menuBarNode, menuItem.items);
                menuContainer.appendChild(menuBarNode);

                menuItemNode.addEventListener("click", () => {
                    let boundingRect = menuItemNode.getBoundingClientRect();
                    menuBarNode.classList.toggle("show");

                    menuBarNode.style.transform = `translate(${boundingRect.x}px, ${boundingRect.bottom}px)`;
                });
            }

        });
    }
}



function createContextMenu(id, x, y, menu) {
    new ContextMenu(id, menu, x, y);
}

class Modal {

}